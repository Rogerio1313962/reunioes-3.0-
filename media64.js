/* Prévia 64: biblioteca local de vídeos, fotos e PDFs. */
(()=>{'use strict';
const app=document.getElementById('media64App');if(!app)return;
const body=document.getElementById('m64Body'),crumb=document.getElementById('m64Crumb');
const categories=[{id:'video',label:'Vídeos',single:'vídeo',symbol:'▣',accept:'.mp4,.mov,.m4v,video/mp4,video/quicktime,video/x-m4v'},
{id:'imagem',label:'Fotos',single:'foto',symbol:'▧',accept:'.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'},
{id:'pdf',label:'PDFs',single:'PDF',symbol:'▤',accept:'.pdf,application/pdf'}];
const days=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
let cat=null,day=null,selected=null,mode='preview',search='',rows=[],url=null,modal=null;
const cardUrls=[];
function orderedFiles(){return rows.filter(f=>f.type===cat&&(day==='Todos'||f.day===day)).sort((a,b)=>(Number(b.addedAt)||0)-(Number(a.addedAt)||0)||((b._fallbackIndex||0)-(a._fallbackIndex||0)))}
function orderedAll(all){return all.map((f,i)=>({...f,_fallbackIndex:i}))}
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function dbOpen(){return new Promise((ok,no)=>{const r=indexedDB.open('reunioes3-midias-v64',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('files'))r.result.createObjectStore('files',{keyPath:'id'})};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function dbAll(){const db=await dbOpen();return new Promise((ok,no)=>{const tx=db.transaction('files');const r=tx.objectStore('files').getAll();r.onsuccess=()=>{db.close();ok(r.result)};r.onerror=()=>{db.close();no(r.error)}})}
async function dbGet(id){const db=await dbOpen();return new Promise((ok,no)=>{const r=db.transaction('files').objectStore('files').get(id);r.onsuccess=()=>{db.close();ok(r.result)};r.onerror=()=>{db.close();no(r.error)}})}
async function dbChange(operation,val){const db=await dbOpen();return new Promise((ok,no)=>{const tx=db.transaction('files','readwrite');const store=tx.objectStore('files');if(operation==='put')store.put(val);else store.delete(val);tx.oncomplete=()=>{db.close();ok()};tx.onerror=()=>{db.close();no(tx.error)}})}
function release(){if(url){URL.revokeObjectURL(url);url=null}for(const u of cardUrls.splice(0))URL.revokeObjectURL(u)}
function config(){return categories.find(c=>c.id===cat)}
// API local: permite ao cronograma escolher arquivos já guardados na biblioteca, sem copiar blobs para localStorage.
window.ReunioesMediaLibrary={all:dbAll,get:dbGet,put:record=>dbChange('put',record)};

// Validar arquivos antes de gravar no IndexedDB; a Preview 67 invocava validFile sem defini-la.
function validFile(file){
 if(!file||!file.name||!file.size)return false;
 const extension=file.name.split('.').pop().toLowerCase();
 const mime=(file.type||'').toLowerCase();
 if(cat==='video')return ['mp4','mov','m4v'].includes(extension)||(mime==='video/mp4'||mime==='video/quicktime'||mime==='video/x-m4v');
 if(cat==='imagem')return ['jpg','jpeg','png','webp'].includes(extension)||['image/jpeg','image/png','image/webp'].includes(mime);
 if(cat==='pdf')return extension==='pdf'||mime==='application/pdf';
 return false;
}
function counter(c,d){return rows.filter(f=>f.type===c&&(!d||f.day===d)).length}
function crumbs(){crumb.innerHTML='<button type="button" data-go="home">Mídias</button>'+(cat?' <span>›</span> <strong>'+esc(config().label)+'</strong>':'');crumb.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{if(b.dataset.go==='home'){cat=null;day=null}else {cat=null;day=null}selected=null;search='';mode='preview';release();render()})}
function magnify(){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="10.8" cy="10.8" r="7.2"/><path d="m16 16 5 5"/></svg>'}
function searchBar(){return '<label class="m64searchwrap">'+magnify()+'<input class="m64search" id="m64Search" placeholder="Pesquisar" autocomplete="off" aria-label="Pesquisar arquivos"></label>'}
function hookSearch(){const input=document.getElementById('m64Search');if(input){input.value=search;input.oninput=()=>{search=input.value;renderListOnly()}}}
function categoriesView(){body.innerHTML='<h2 class="m64heading">Biblioteca de Mídias</h2><div class="m64grid m64categories">'+categories.map(c=>'<button type="button" class="m64tile" data-cat="'+c.id+'"><span class="m64ico">'+c.symbol+'</span><strong>'+c.label+'</strong><small>'+counter(c.id)+' arquivo(s)</small></button>').join('')+'</div>';body.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{cat=b.dataset.cat;day='Todos';search='';render()})}
function daysView(){const c=config();body.innerHTML='<div class="m64titlebar"><h2 class="m64heading">'+c.label+'</h2></div><div class="m64toolbar">'+searchBar()+'<div class="m67navbuttons"><button type="button" class="m64back" id="m64HomeBack">← Voltar</button><button class="m64add" id="m64Add">+ Adicionar '+c.single+'</button></div></div><div class="m64grid" id="m64Days"></div>';hookSearch();document.getElementById('m64HomeBack').onclick=()=>{cat=null;day=null;search='';render()};document.getElementById('m64Add').onclick=()=>{day='Domingo';mode='add';selected=null;search='';render()};renderDays();document.getElementById('m64Search').oninput=e=>{search=e.target.value;renderDays()}}
function renderDays(){const root=document.getElementById('m64Days');if(!root)return;root.innerHTML=days.filter(d=>!search||d.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))||rows.some(f=>f.type===cat&&f.day===d&&f.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')))).map(d=>'<button type="button" class="m64tile" data-day="'+esc(d)+'"><span class="m64ico">▣</span><strong>'+esc(d.toUpperCase())+'</strong><small>'+counter(cat,d)+' arquivo(s)</small></button>').join('');root.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{day=b.dataset.day;mode='preview';search='';const first=orderedFiles()[0];selected=first?first.id:null;render()})}
function listRows(){return orderedFiles()}
function cardHTML(f){
 const typeIcon=cat==='video'?'▶':cat==='imagem'?'▧':'▤';
 return '<article class="m66card" data-card="'+esc(f.id)+'">'+
 '<div class="m66thumb" data-thumb="'+esc(f.id)+'" aria-label="Prévia de '+esc(f.name)+'"><span class="m66placeholder">'+typeIcon+'</span></div>'+
 '<div class="m66filebody"><div class="m66filetitle" title="'+esc(f.name)+'">'+esc(f.name)+'</div>'+
 '<div class="m66actions">'+
 '<a class="m66btn m69open" data-open="'+esc(f.id)+'" href="#" target="_blank" rel="noopener" title="Abrir arquivo">Abrir</a>'+
 '<button type="button" class="m66btn m66schedule" data-schedule="'+esc(f.id)+'" title="Usar no cronograma">+ Cronograma</button>'+
 '<button type="button" class="m66icon" data-edit="'+esc(f.id)+'" title="Editar nome" aria-label="Editar nome">✎</button>'+
 '<button type="button" class="m66icon m66danger" data-delete="'+esc(f.id)+'" title="Excluir" aria-label="Excluir arquivo">✕</button>'+
 '</div></div></article>'
}
function renderListOnly(){
 release();const root=document.getElementById('m64List');if(!root)return;
 const list=listRows();root.innerHTML=list.map(cardHTML).join('');
 root.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editName(b.dataset.edit));
 root.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>deleteItem(b.dataset.delete));
 root.querySelectorAll('[data-schedule]').forEach(b=>b.onclick=()=>{const f=rows.find(x=>x.id===b.dataset.schedule);if(f)addToSchedule(f)});
 // Links recebem a URL antes do toque: Safari bloqueia window.open após operações assíncronas.
 root.querySelectorAll('[data-open]').forEach(a=>a.addEventListener('click',e=>{if(a.getAttribute('href')==='#'){e.preventDefault();alert('Aguarde o carregamento da prévia e tente novamente.')}}));
 document.getElementById('m64Count').textContent=list.length+' arquivo(s)';
 void loadCardPreviews(list);
}
async function loadCardPreviews(list){
 const cards=await Promise.all(list.map(async f=>({id:f.id,record:await dbGet(f.id).catch(()=>null)})));
 for(const {id,record} of cards){const slot=document.querySelector('#m64List [data-thumb="'+CSS.escape(id)+'"]');if(!slot||!record?.blob)continue;
 const pdfBlob=cat==='pdf' && record.blob.type!=='application/pdf'?new Blob([record.blob],{type:'application/pdf'}):record.blob;
  const objectURL=URL.createObjectURL(pdfBlob);cardUrls.push(objectURL);
  const openLink=document.querySelector('#m64List [data-open="'+CSS.escape(id)+'"]');if(openLink)openLink.href=objectURL;
  slot.replaceChildren();
 if(cat==='video'){
   const video=document.createElement('video');video.src=objectURL;video.controls=true;video.playsInline=true;video.preload='metadata';video.setAttribute('aria-label','Reproduzir '+record.name);video.addEventListener('loadedmetadata',()=>{if(Number.isFinite(video.duration)&&video.duration>0){try{video.currentTime=Math.min(0.1,video.duration/4)}catch(e){}}},{once:true});slot.append(video);
 }else if(cat==='imagem'){
   const link=document.createElement('a');link.href=objectURL;link.target='_blank';link.rel='noopener';link.className='m69photoLink';const img=document.createElement('img');img.src=objectURL;img.alt='Abrir foto: '+record.name;img.loading='lazy';link.append(img);slot.append(link);
 }else{
   const frame=document.createElement('iframe');frame.src=objectURL+'#page=1&toolbar=0&navpanes=0';frame.title='Miniatura da primeira página de '+record.name;frame.loading='lazy';frame.tabIndex=-1;slot.append(frame);const open=document.createElement('a');open.href=objectURL;open.target='_blank';open.rel='noopener';open.className='m69pdfCover';open.setAttribute('aria-label','Abrir PDF '+record.name);open.textContent='Abrir PDF';slot.append(open);
 }
 }
}
function folderView(){
 body.innerHTML='<div class="m66folderpage"><div class="m66folderhead"><h3>'+esc(config().label.toUpperCase())+'</h3></div>'+
 '<div class="m66tools"><button class="m64back" id="m64Back">← Voltar</button><button class="m64add" id="m64Add">+ Adicionar '+esc(config().single)+'</button></div>'+
 '<div class="m66formhost" id="m64FormHost" hidden></div><div class="m66gallery" id="m64List"></div><small class="m66count" id="m64Count"></small></div>';
 document.getElementById('m64Back').onclick=()=>{cat=null;day=null;mode='preview';selected=null;search='';release();render()};
 document.getElementById('m64Add').onclick=()=>{mode=mode==='add'?'preview':'add';renderRight()};
 renderRight();renderListOnly();
}
function renderRight(){
 const host=document.getElementById('m64FormHost');if(!host)return;
 host.hidden=mode!=='add';if(mode!=='add'){host.innerHTML='';return}
 host.innerHTML='<form class="m66form" id="m64Form"><h3>Adicionar '+esc(config().single)+'</h3><div class="m66formfields"><label>Pasta<select id="m64Dest">'+days.map(d=>'<option '+(d===day?'selected':'')+'>'+esc(d)+'</option>').join('')+'</select></label><label>Escolher arquivo<input id="m64File" type="file" accept="'+config().accept+'" required></label><label>Nome (opcional)<input type="text" id="m64Name" placeholder="Usar nome do arquivo"></label></div><p class="m64error" id="m64Error" role="status"></p><div class="m64footer"><button type="button" class="m64back" id="m64Cancel">Cancelar</button><button class="m64gold" type="submit" id="m64Save">Salvar arquivo</button></div></form>';
 document.getElementById('m64Cancel').onclick=()=>{mode='preview';renderRight()};document.getElementById('m64Form').onsubmit=saveFile;
}
async function saveFile(e){
 e.preventDefault();
 const input=document.getElementById('m64File'),msg=document.getElementById('m64Error'),saveBtn=document.getElementById('m64Save');
 const file=input?.files?.[0];
 if(!file||!validFile(file)){msg.textContent='Selecione um arquivo válido para esta categoria.';return}
 const dest='Todos';
 const name=document.getElementById('m64Name').value.trim()||file.name;
 saveBtn.disabled=true;saveBtn.textContent='Salvando…';msg.textContent='Gravando arquivo neste iPad…';
 try{
   const id=(typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function'?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2));
   await dbChange('put',{id,name,type:cat,day:dest,blob:file,size:file.size,addedAt:Date.now()});
   const saved=await dbGet(id);
   if(!saved||!saved.blob)throw new Error('O arquivo não foi encontrado após salvar.');
   rows=orderedAll(await dbAll());day=dest;selected=id;mode='preview';search='';render();
 }catch(err){
   msg.textContent=err?.name==='QuotaExceededError'?'Sem espaço de armazenamento neste iPad. Libere espaço e tente novamente.':'Não foi possível salvar o arquivo no Safari. '+(err?.message||'Tente novamente.');
   saveBtn.disabled=false;saveBtn.textContent='Salvar arquivo';
 }
}
function popup(title,inner,confirmLabel,onConfirm){if(modal)modal.remove();modal=document.createElement('div');modal.className='m64modal';modal.innerHTML='<div class="m64modalbox"><strong>'+title+'</strong>'+inner+'<footer><button type="button" class="m64back" id="m64No">Cancelar</button><button type="button" class="m64gold" id="m64Yes">'+confirmLabel+'</button></footer></div>';app.append(modal);modal.querySelector('#m64No').onclick=closePopup;modal.querySelector('#m64Yes').onclick=onConfirm}
function closePopup(){if(modal){modal.remove();modal=null}}
function editName(id){const f=rows.find(x=>x.id===id);if(!f)return;popup('Editar nome','<input id="m64Rename" aria-label="Nome do arquivo" value="'+esc(f.name)+'">','Salvar',async()=>{const name=modal.querySelector('#m64Rename').value.trim();if(!name)return;const rec=await dbGet(id);rec.name=name;await dbChange('put',rec);rows=orderedAll(await dbAll());closePopup();render()})}
function deleteItem(id){const f=rows.find(x=>x.id===id);if(!f)return;popup('Excluir arquivo?','<p>'+esc(f.name)+'</p>','Excluir',async()=>{await dbChange('delete',id);rows=orderedAll(await dbAll());if(selected===id){release();selected=rows.find(r=>r.type===cat)?.id||null}closePopup();render()})}
async function addToSchedule(f){
 const index=typeof state!=='undefined'?state.day:0;if(index<0||index>6)return;
 const record=await dbGet(f.id).catch(()=>null);if(!record?.blob){alert('Arquivo não encontrado na biblioteca deste iPad.');return}
 const section=state.sections?.[index]?.[0]?.id||'default-'+index;
 const item={id:uid(),type:f.type,title:f.name,mediaLibraryId:f.id,fileUrl:null,sectionId:section,reference:'',translation:'',content:''};
 state.days[index].push(item);
 try{save()}catch(err){state.days[index].pop();alert('Não foi possível salvar o item no cronograma.');return}
 state.day=index;drawDays();drawItems();setTab('agenda');alert('Arquivo incluído no cronograma. Ele permanece guardado nesta biblioteca do iPad.');
}
function render(){release();crumbs();if(!cat)categoriesView();else if(!day)daysView();else folderView()}
(async()=>{try{rows=orderedAll(await dbAll())}catch(e){body.textContent='Este navegador não permitiu acessar o armazenamento local. Verifique o modo privado e as permissões.';return}render()})();
})();
