(()=>{'use strict';
const el=id=>document.getElementById(id),escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const K=['versiculo','video','imagem','pdf','musica','texto'], N=['Bíblia','Vídeo','Foto','PDF','Música','Lembrete'],I=['<svg viewBox="0 0 24 24" width="33" height="33" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7v14m0-14C10.6 5.6 8.3 5 4 5v14c4.3 0 6.6.6 8 2m0-14c1.4-1.4 3.7-2 8-2v14c-4.3 0-6.6.6-8 2"/></svg>', '<svg viewBox="0 0 24 24" width="33" height="33" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 10h18M7 5l3 5m3-5 3 5"/><path d="m10 12 5 3-5 3z"/></svg>', '<svg viewBox="0 0 24 24" width="33" height="33" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>', '<svg viewBox="0 0 24 24" width="33" height="33" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></svg>', '<svg viewBox="0 0 24 24" width="33" height="33" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13M9 9l12-2"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>', '<svg viewBox="0 0 24 24" width="33" height="33" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>'];
let chosenSection=null,kind=null,folder=null,urls=[];
// Miniaturas compartilhadas: extrai um quadro real no Safari quando possivel.
function renderVideoThumbnail(target,blob,url){
 if(!target?.isConnected)return;
 target.replaceChildren();target.classList.add('r96mediaThumb');
 const fallback=document.createElement('span');fallback.className='r96VideoFallback';fallback.textContent='▶';target.append(fallback);
 const video=document.createElement('video');video.muted=true;video.defaultMuted=true;video.playsInline=true;video.preload='auto';video.src=url;
 video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');
 let done=false;
 const capture=()=>{if(done||!target.isConnected||video.videoWidth<2||video.videoHeight<2)return;try{
  const canvas=document.createElement('canvas');canvas.width=300;canvas.height=Math.max(1,Math.round(300*video.videoHeight/video.videoWidth));
  canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
  const pic=new Image();pic.alt='Quadro do vídeo';pic.src=canvas.toDataURL('image/jpeg',.78);pic.className='r96ThumbPicture';
  target.replaceChildren(pic);const mark=document.createElement('span');mark.className='r96VideoMark';mark.textContent='▶';target.append(mark);done=true;video.removeAttribute('src');video.load();
 }catch(e){/* em formatos sem quadro no Safari, usar ícone de vídeo */}};
 video.addEventListener('loadeddata',()=>{try{video.currentTime=Math.min(.5,Number.isFinite(video.duration)?Math.max(.05,video.duration/10):.2)}catch(e){};capture()});
 video.addEventListener('seeked',capture);video.addEventListener('canplay',capture);
 video.addEventListener('error',()=>{video.removeAttribute('src')},{once:true});
}
async function renderPdfThumbnail(target,blob,url,withMark){
 if(!target?.isConnected)return;target.classList.add('r96mediaThumb');target.replaceChildren();
 const fallback=document.createElement('span');fallback.className='r96PdfFallback';fallback.textContent='PDF';target.append(fallback);
 try{
  const lib=window.pdfjsLib;if(!lib)return;
  lib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const bytes=await blob.arrayBuffer();const task=lib.getDocument({data:new Uint8Array(bytes)});
  const doc=await task.promise;try{
   const page=await doc.getPage(1);const view=page.getViewport({scale:1});const scale=Math.min(1.3,300/view.width);
   const viewport=page.getViewport({scale});const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
   const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
   await page.render({canvasContext:ctx,viewport}).promise;
   if(target.isConnected){canvas.className='r96PdfCanvas';canvas.setAttribute('aria-label','Primeira página do PDF');target.replaceChildren(canvas);if(withMark){const mark=document.createElement('span');mark.className='r96PdfMark';mark.textContent='PDF';target.append(mark)}}
  }finally{await doc.destroy()}
 }catch(e){/* placeholder legível se PDF.js não estiver disponível */}
}

const d=document.createElement('dialog');d.id='r74AddDialog';d.className='r74modal';d.innerHTML='<div class="r74top"><h2 id="r74Title">Adicionar conteúdo</h2><button type="button" class="r74close" id="r74Close">✕</button></div><div id="r74Content"></div>';
document.body.appendChild(d);el('r74Close').onclick=()=>{d.close();chosenSection=null};
function flush(){urls.forEach(u=>URL.revokeObjectURL(u));urls=[]}
function content(html){flush();el('r74Content').innerHTML=html}
function add(type,title,extras={}){const s=chosenSection||state.sections?.[state.day]?.[0]?.id;const item={id:uid(),type,title,sectionId:s,reference:'',translation:'ACF',content:'',fileUrl:null,...extras};state.days[state.day].push(item);save();drawItems();d.close();chosenSection=null;}
function choices(){d.classList.remove('r105SmallGallery');el('r74Title').textContent='Adicionar conteúdo';content('<div class="r74choices">'+K.map((t,i)=>`<button type="button" class="r74choice" data-type="${t}"><span class="r74ico">${I[i]}</span>${N[i]}</button>`).join('')+'</div>');el('r74Content').querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>selectType(b.dataset.type))}
function selectType(t){kind=t;folder=null;if(t==='versiculo'){window.bibleCronogramaSelect={sectionId:chosenSection||state.sections?.[state.day]?.[0]?.id||null,day:state.day};d.close();setTab('biblia');window.dispatchEvent(new Event('bible-cronograma-mode'));return}if(t==='texto'){el('r74Title').textContent='Lembrete';content('<button class="r74back">‹ Voltar</button><label>Nome<input id="r74MemoTitle" placeholder="Ex.: Avisos"></label><label>Lembrete<textarea id="r74Memo" rows="4" placeholder="Escreva o lembrete…"></textarea></label><button type="button" class="primary" id="r74SaveMemo">Adicionar ao cronograma</button>');el('r74Content').querySelector('.r74back').onclick=choices;el('r74SaveMemo').onclick=()=>{const title=el('r74MemoTitle').value.trim()||'Lembrete';const note=el('r74Memo').value.trim();if(!note){alert('Escreva o lembrete.');return}add('texto',title,{content:note})};return}(t==='musica'?folders():files('Todos'))}
function folders(){el('r74Title').textContent='Escolher '+({musica:'música',video:'vídeo',imagem:'foto',pdf:'PDF'}[kind]||'arquivo');const days=kind==='musica'?(typeof MUSIC_FOLDERS!=='undefined'?MUSIC_FOLDERS:[]):['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];content('<button type="button" class="r74back">‹ Tipos</button><div class="r74folders">'+days.map((day,i)=>`<button type="button" data-folder="${i}">▣ ${escape(day)}</button>`).join('')+'</div>');el('r74Content').querySelector('.r74back').onclick=choices;el('r74Content').querySelectorAll('[data-folder]').forEach(b=>b.onclick=()=>files(days[Number(b.dataset.folder)]))}
async function files(day){
 folder=day;el('r74Title').textContent=day==='Todos'?({video:'Vídeos',imagem:'Fotos',pdf:'PDFs'}[kind]||day):day;
 content('<button type="button" class="r74back">‹ Voltar</button>'+ (kind==='musica'?'':'<div class="r105Import"><label class="r105ImportButton" for="r105NewFile">＋ Adicionar do iPad / celular</label><input id="r105NewFile" type="file" accept="'+(kind==='video'?'video/*,.mov,.mp4,.m4v':kind==='imagem'?'image/*,.jpg,.jpeg,.png,.webp,.heic,.heif':'.pdf,application/pdf')+'" aria-label="Escolher arquivo do aparelho"><div id="r105ImportStatus" role="status"></div></div>')+'<div class="r74files r75gallery" aria-live="polite">Carregando arquivos…</div>');
 const upload=el('r105NewFile');if(upload)upload.addEventListener('change',async()=>{
  const file=upload.files?.[0];if(!file)return;const status=el('r105ImportStatus');const allowed=kind==='video'?/\.(mov|mp4|m4v)$/i:kind==='imagem'?/\.(jpe?g|png|webp|heic|heif)$/i:/\.pdf$/i;
  if(!allowed.test(file.name)){status.textContent='Formato não aceito nesta pasta.';upload.value='';return}
  if(!file.size){status.textContent='O arquivo está vazio.';return}
  try{upload.disabled=true;status.textContent='Salvando arquivo no aplicativo…';const id=(crypto.randomUUID?.()||('media-'+Date.now()+'-'+Math.random().toString(36).slice(2)));
   await window.ReunioesMediaLibrary.put({id,name:file.name,type:kind,day:'Todos',blob:file,size:file.size,addedAt:Date.now()});
   status.textContent='Arquivo salvo e adicionado ao cronograma.';add(kind,file.name,{mediaLibraryId:id});
  }catch(error){status.textContent='Não foi possível adicionar: '+(error?.message||error);upload.disabled=false}
 });
 el('r74Content').querySelector('.r74back').onclick=kind==='musica'?folders:choices;
 const box=el('r74Content').querySelector('.r74files');
 try{
  if(kind==='musica'){
   const matches=musicIndex.filter(x=>x.folder===day).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
   box.innerHTML=matches.length?matches.map(m=>`<button type="button" class="r75file" data-id="${escape(m.id)}"><span class="r75image r75music"><span class="r75musicIcon">♫</span></span><span class="r75filename">${escape(m.name)}</span><span class="r75kind">Música</span></button>`).join(''):'Nenhuma música nesta pasta.';
   box.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{const m=matches.find(x=>x.id===b.dataset.id);if(m)add('musica',m.name,{musicId:m.id})});return;
  }
  const all=await window.ReunioesMediaLibrary.all();
  const list=all.filter(r=>r.type===kind&&(day==='Todos'||r.day===day)).sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));
  d.classList.toggle('r105SmallGallery',list.length===1);
  if(!d.open||folder!==day)return;
  box.innerHTML=list.length?list.map(r=>`<button type="button" class="r75file" data-id="${escape(r.id)}" title="Adicionar ${escape(r.name)}"><span class="r75image" data-preview="${escape(r.id)}"><span class="r75fallback">${kind==='video'?'▶':kind==='imagem'?'▧':'PDF'}</span></span><span class="r75filename">${escape(r.name)}</span><span class="r75kind">${kind==='video'?'Vídeo':kind==='imagem'?'Foto':'PDF'}</span></button>`).join(''):'Pasta vazia. Adicione arquivos na Biblioteca de Mídias.';
  box.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{const m=list.find(x=>x.id===b.dataset.id);if(m)add(kind,m.name,{mediaLibraryId:m.id})});
  for(const record of list){
   if(!record.blob)continue;
   const tile=[...box.querySelectorAll('[data-preview]')].find(n=>n.dataset.preview===record.id);
   if(!tile)continue;
   const blob=kind==='pdf'&&record.blob.type!=='application/pdf'?new Blob([record.blob],{type:'application/pdf'}):record.blob;
   const objectURL=URL.createObjectURL(blob);urls.push(objectURL);
   if(kind==='imagem'){
    const pic=document.createElement('img');pic.alt='Miniatura da foto';pic.loading='lazy';pic.src=objectURL;tile.replaceChildren(pic);
   }else if(kind==='video'){
    renderVideoThumbnail(tile,record.blob,objectURL);
   }else{
    renderPdfThumbnail(tile,record.blob,objectURL,true);
   }
  }
 }catch(err){box.textContent='Não foi possível abrir esta pasta: '+err.message}
}
function openPicker(section){chosenSection=section||state.sections?.[state.day]?.[0]?.id;kind=null;choices();d.showModal()}
// Final loaded after all old scripts: intercept "add" only; preserve full editor for existing items.
const before=openEditor;openEditor=function(x){if(x)return before(x);const currentSection=chosenSection||el('itemSection')?.value||state.sections?.[state.day]?.[0]?.id;openPicker(currentSection);};
// Old section-add calls openEditor() then sets section select; infer from clicked parent in capture phase.
document.addEventListener('click',e=>{const btn=e.target.closest('.section-add');if(btn)chosenSection=btn.closest('.meeting-section')?.dataset.section||null},true);
// Take over item tap on media thumbnails and body, not action buttons; Bible remains direct.
document.addEventListener('click',e=>{const row=e.target.closest('#sectionsRoot .item');if(!row||e.target.closest('button,[contenteditable],input,textarea,select,.drag-handle,.content-grip'))return;const item=state.days[state.day].find(x=>x.id===row.dataset.itemId);if(!item)return;if(['video','imagem','pdf'].includes(item.type)){window.R70?.open(item)}else if(item.type==='musica'){playMusic(item.musicId)}},false);
// Library-backed item thumbnails: each redraw retains small square preview without storing large videos in localStorage.
let thumbUrls=[];function thumbnails(){thumbUrls.forEach(u=>URL.revokeObjectURL(u));thumbUrls=[];const day=state.day;for(const row of document.querySelectorAll('#sectionsRoot .item[data-item-id]')){const item=state.days[day].find(x=>x.id===row.dataset.itemId);if(!item?.mediaLibraryId)continue;const thumb=row.querySelector('.item-thumb');if(!thumb)continue;thumb.dataset.thumbId=item.mediaLibraryId;window.ReunioesMediaLibrary?.get(item.mediaLibraryId).then(record=>{if(!record?.blob||thumb.dataset.thumbId!==record.id||!thumb.isConnected)return;const url=URL.createObjectURL(record.blob);thumbUrls.push(url);thumb.classList.add('r74loaded');if(item.type==='imagem'){const image=document.createElement('img');image.alt='Miniatura da foto';image.src=url;thumb.replaceChildren(image)}else if(item.type==='video'){renderVideoThumbnail(thumb,record.blob,url)}else if(item.type==='pdf'){renderPdfThumbnail(thumb,record.blob,url,false)}}).catch(()=>{})}}
const priorDraw=drawItems;drawItems=function(){priorDraw();thumbnails()};drawItems();
window.Reunioes74={openPicker};
})();