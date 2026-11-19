(()=>{'use strict';
const el=id=>document.getElementById(id),escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const K=['versiculo','video','imagem','pdf','musica','texto'], N=['Bíblia','Vídeo','Foto','PDF','Música','Lembrete'],I=['📖','🎬','🖼','📄','🎵','▤'];
let chosenSection=null,kind=null,folder=null,urls=[];
const d=document.createElement('dialog');d.id='r74AddDialog';d.className='r74modal';d.innerHTML='<div class="r74top"><h2 id="r74Title">Adicionar conteúdo</h2><button type="button" class="r74close" id="r74Close">✕</button></div><div id="r74Content"></div>';
document.body.appendChild(d);el('r74Close').onclick=()=>d.close();
function flush(){urls.forEach(u=>URL.revokeObjectURL(u));urls=[]}
function content(html){flush();el('r74Content').innerHTML=html}
function add(type,title,extras={}){const s=chosenSection||state.sections?.[state.day]?.[0]?.id;const item={id:uid(),type,title,sectionId:s,reference:'',translation:'ACF',content:'',fileUrl:null,...extras};state.days[state.day].push(item);save();drawItems();d.close();}
function choices(){el('r74Title').textContent='Adicionar conteúdo';content('<p class="r74hint">Escolha somente o tipo de conteúdo.</p><div class="r74choices">'+K.map((t,i)=>`<button type="button" class="r74choice" data-type="${t}"><span class="r74ico">${I[i]}</span>${N[i]}</button>`).join('')+'</div>');el('r74Content').querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>selectType(b.dataset.type))}
function selectType(t){kind=t;folder=null;if(t==='versiculo'){d.close();setTab('biblia');return}if(t==='texto'){el('r74Title').textContent='Lembrete';content('<button class="r74back">‹ Voltar</button><label>Nome<input id="r74MemoTitle" placeholder="Ex.: Avisos"></label><label>Lembrete<textarea id="r74Memo" rows="4" placeholder="Escreva o lembrete…"></textarea></label><button type="button" class="primary" id="r74SaveMemo">Adicionar ao cronograma</button>');el('r74Content').querySelector('.r74back').onclick=choices;el('r74SaveMemo').onclick=()=>{const title=el('r74MemoTitle').value.trim()||'Lembrete';const note=el('r74Memo').value.trim();if(!note){alert('Escreva o lembrete.');return}add('texto',title,{content:note})};return}folders()}
function folders(){el('r74Title').textContent='Escolher '+({musica:'música',video:'vídeo',imagem:'foto',pdf:'PDF'}[kind]||'arquivo');const days=kind==='musica'?(typeof MUSIC_FOLDERS!=='undefined'?MUSIC_FOLDERS:[]):['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];content('<button type="button" class="r74back">‹ Tipos</button><div class="r74folders">'+days.map((day,i)=>`<button type="button" data-folder="${i}">▣ ${escape(day)}</button>`).join('')+'</div>');el('r74Content').querySelector('.r74back').onclick=choices;el('r74Content').querySelectorAll('[data-folder]').forEach(b=>b.onclick=()=>files(days[Number(b.dataset.folder)]))}
async function files(day){
 folder=day;el('r74Title').textContent=day;
 content('<button type="button" class="r74back">‹ Pastas</button><p class="r75helper">Toque na miniatura para adicionar ao cronograma.</p><div class="r74files r75gallery" aria-live="polite">Carregando arquivos…</div>');
 el('r74Content').querySelector('.r74back').onclick=folders;
 const box=el('r74Content').querySelector('.r74files');
 try{
  if(kind==='musica'){
   const matches=musicIndex.filter(x=>x.folder===day).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
   box.innerHTML=matches.length?matches.map(m=>`<button type="button" class="r75file" data-id="${escape(m.id)}"><span class="r75image r75music"><span class="r75musicIcon">♫</span></span><span class="r75filename">${escape(m.name)}</span><span class="r75kind">Música</span></button>`).join(''):'Nenhuma música nesta pasta.';
   box.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{const m=matches.find(x=>x.id===b.dataset.id);if(m)add('musica',m.name,{musicId:m.id})});return;
  }
  const all=await window.ReunioesMediaLibrary.all();
  const list=all.filter(r=>r.type===kind&&r.day===day).sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));
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
    const v=document.createElement('video');v.src=objectURL+'#t=0.1';v.muted=true;v.playsInline=true;v.setAttribute('playsinline','');v.preload='metadata';
    v.addEventListener('loadedmetadata',()=>{try{if(v.duration>0)v.currentTime=Math.min(0.15,v.duration/5)}catch(_){}},{once:true});
    v.addEventListener('error',()=>{tile.classList.add('r75unavailable');tile.textContent='▶'}, {once:true});
    tile.replaceChildren(v);const mark=document.createElement('span');mark.className='r75playMark';mark.textContent='▶';tile.append(mark);
   }else{
    const pdf=document.createElement('iframe');pdf.title='Primeira página do PDF';pdf.loading='lazy';pdf.tabIndex=-1;pdf.src=objectURL+'#page=1&toolbar=0&navpanes=0&view=Fit';tile.replaceChildren(pdf);
    const mark=document.createElement('span');mark.className='r75pdfMark';mark.textContent='PDF';tile.append(mark);
   }
  }
 }catch(err){box.textContent='Não foi possível abrir esta pasta: '+err.message}
}
function openPicker(section){chosenSection=section||state.sections?.[state.day]?.[0]?.id;kind=null;choices();d.showModal()}
// Final loaded after all old scripts: intercept "add" only; preserve full editor for existing items.
const before=openEditor;openEditor=function(x){if(x)return before(x);const currentSection=chosenSection||el('itemSection')?.value||state.sections?.[state.day]?.[0]?.id;openPicker(currentSection);chosenSection=null;};
// Old section-add calls openEditor() then sets section select; infer from clicked parent in capture phase.
document.addEventListener('click',e=>{const btn=e.target.closest('.section-add');if(btn)chosenSection=btn.closest('.meeting-section')?.dataset.section||null},true);
// Take over item tap on media thumbnails and body, not action buttons; Bible remains direct.
document.addEventListener('click',e=>{const row=e.target.closest('#sectionsRoot .item');if(!row||e.target.closest('button,[contenteditable],input,textarea,select,.drag-handle,.content-grip'))return;const item=state.days[state.day].find(x=>x.id===row.dataset.itemId);if(!item)return;if(['video','imagem','pdf'].includes(item.type)){window.R70?.open(item)}else if(item.type==='musica'){playMusic(item.musicId)}},false);
// Library-backed item thumbnails: each redraw retains small square preview without storing large videos in localStorage.
let thumbUrls=[];function thumbnails(){thumbUrls.forEach(u=>URL.revokeObjectURL(u));thumbUrls=[];const day=state.day;for(const row of document.querySelectorAll('#sectionsRoot .item[data-item-id]')){const item=state.days[day].find(x=>x.id===row.dataset.itemId);if(!item?.mediaLibraryId)continue;const thumb=row.querySelector('.item-thumb');if(!thumb)continue;thumb.dataset.thumbId=item.mediaLibraryId;window.ReunioesMediaLibrary?.get(item.mediaLibraryId).then(record=>{if(!record?.blob||thumb.dataset.thumbId!==record.id||!thumb.isConnected)return;const url=URL.createObjectURL(record.blob);thumbUrls.push(url);thumb.classList.add('r74loaded');if(item.type==='imagem'){const image=document.createElement('img');image.alt='Miniatura da foto';image.src=url;thumb.replaceChildren(image)}else if(item.type==='video'){const video=document.createElement('video');video.src=url+'#t=0.1';video.playsInline=true;video.muted=true;video.preload='metadata';thumb.replaceChildren(video)}else if(item.type==='pdf'){const frame=document.createElement('iframe');frame.src=url+'#page=1&toolbar=0&navpanes=0';frame.title='Miniatura do PDF';frame.loading='lazy';thumb.replaceChildren(frame)}}).catch(()=>{})}}
const priorDraw=drawItems;drawItems=function(){priorDraw();thumbnails()};drawItems();
window.Reunioes74={openPicker};
})();