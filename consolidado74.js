(()=>{'use strict';
const el=id=>document.getElementById(id),escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const K=['versiculo','video','imagem','pdf','musica','texto'], N=['Bíblia','Vídeo','Foto','PDF','Música','Lembrete'],I=['<svg viewBox="0 0 24 24" width="33" height="33" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7v14m0-14C10.6 5.6 8.3 5 4 5v14c4.3 0 6.6.6 8 2m0-14c1.4-1.4 3.7-2 8-2v14c-4.3 0-6.6.6-8 2"/></svg>', '<svg viewBox="0 0 24 24" width="33" height="33" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 10h18M7 5l3 5m3-5 3 5"/><path d="m10 12 5 3-5 3z"/></svg>', '<svg viewBox="0 0 24 24" width="33" height="33" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>', '<svg viewBox="0 0 24 24" width="33" height="33" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></svg>', '<svg viewBox="0 0 24 24" width="33" height="33" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13M9 9l12-2"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>', '<svg viewBox="0 0 24 24" width="33" height="33" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>'];
let chosenSection=null,kind=null,folder=null,urls=[];
// Miniaturas compartilhadas: extrai um quadro real no Safari quando possivel.
function renderVideoThumbnail(target,blob,url){
 if(!target?.isConnected)return;
 const video=document.createElement('video');
 video.src=url;video.muted=true;video.defaultMuted=true;video.playsInline=true;
 video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');
 video.preload='auto';video.controls=true;video.tabIndex=-1;
 video.style.pointerEvents='none';
 const capture=()=>{try{if(video.videoWidth<2||video.videoHeight<2)return;const c=document.createElement('canvas');c.width=320;c.height=Math.max(120,Math.round(320*video.videoHeight/video.videoWidth));c.getContext('2d').drawImage(video,0,0,c.width,c.height);const data=c.toDataURL('image/jpeg',.75);if(!target.isConnected)return;const pic=document.createElement('img');pic.src=data;pic.alt='Quadro de prévia do vídeo';target.replaceChildren(pic);if(target.classList.contains('r75image')){const mark=document.createElement('span');mark.className='r75playMark';mark.textContent='▶';target.append(mark)}}catch(e){/* Mantem video como fallback */}};
 video.addEventListener('loadedmetadata',()=>{try{video.currentTime=Math.min(.18,Number.isFinite(video.duration)&&video.duration>.18?video.duration/5:.18)}catch(_){ }},{once:true});
 video.addEventListener('seeked',capture,{once:true});video.addEventListener('loadeddata',capture,{once:true});
 target.replaceChildren(video);
 if(target.classList.contains('r75image')){const mark=document.createElement('span');mark.className='r75playMark';mark.textContent='▶';target.append(mark)}
}
function renderPdfThumbnail(target,blob,url,withMark){
 const pdf=document.createElement('iframe');pdf.title='Primeira página do PDF';pdf.loading='eager';pdf.tabIndex=-1;
 pdf.src=url+'#page=1&toolbar=0&navpanes=0&scrollbar=0&view=FitH';
 target.replaceChildren(pdf);
 if(withMark){const mark=document.createElement('span');mark.className='r75pdfMark';mark.textContent='PDF';target.append(mark)}
}

const d=document.createElement('dialog');d.id='r74AddDialog';d.className='r74modal';d.innerHTML='<div class="r74top"><h2 id="r74Title">Adicionar conteúdo</h2><button type="button" class="r74close" id="r74Close">✕</button></div><div id="r74Content"></div>';
document.body.appendChild(d);el('r74Close').onclick=()=>d.close();
function flush(){urls.forEach(u=>URL.revokeObjectURL(u));urls=[]}
function content(html){flush();el('r74Content').innerHTML=html}
function add(type,title,extras={}){const s=chosenSection||state.sections?.[state.day]?.[0]?.id;const item={id:uid(),type,title,sectionId:s,reference:'',translation:'ACF',content:'',fileUrl:null,...extras};state.days[state.day].push(item);save();drawItems();d.close();}
function choices(){el('r74Title').textContent='Adicionar conteúdo';content('<div class="r74choices">'+K.map((t,i)=>`<button type="button" class="r74choice" data-type="${t}"><span class="r74ico">${I[i]}</span>${N[i]}</button>`).join('')+'</div>');el('r74Content').querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>selectType(b.dataset.type))}
function selectType(t){kind=t;folder=null;if(t==='versiculo'){d.close();setTab('biblia');return}if(t==='texto'){el('r74Title').textContent='Lembrete';content('<button class="r74back">‹ Voltar</button><label>Nome<input id="r74MemoTitle" placeholder="Ex.: Avisos"></label><label>Lembrete<textarea id="r74Memo" rows="4" placeholder="Escreva o lembrete…"></textarea></label><button type="button" class="primary" id="r74SaveMemo">Adicionar ao cronograma</button>');el('r74Content').querySelector('.r74back').onclick=choices;el('r74SaveMemo').onclick=()=>{const title=el('r74MemoTitle').value.trim()||'Lembrete';const note=el('r74Memo').value.trim();if(!note){alert('Escreva o lembrete.');return}add('texto',title,{content:note})};return}(t==='musica'?folders():files('Todos'))}
function folders(){el('r74Title').textContent='Escolher '+({musica:'música',video:'vídeo',imagem:'foto',pdf:'PDF'}[kind]||'arquivo');const days=kind==='musica'?(typeof MUSIC_FOLDERS!=='undefined'?MUSIC_FOLDERS:[]):['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];content('<button type="button" class="r74back">‹ Tipos</button><div class="r74folders">'+days.map((day,i)=>`<button type="button" data-folder="${i}">▣ ${escape(day)}</button>`).join('')+'</div>');el('r74Content').querySelector('.r74back').onclick=choices;el('r74Content').querySelectorAll('[data-folder]').forEach(b=>b.onclick=()=>files(days[Number(b.dataset.folder)]))}
async function files(day){
 folder=day;el('r74Title').textContent=day==='Todos'?({video:'Vídeos',imagem:'Fotos',pdf:'PDFs'}[kind]||day):day;
 content('<button type="button" class="r74back">‹ Voltar</button><p class="r75helper">Toque na miniatura para adicionar ao cronograma.</p><div class="r74files r75gallery" aria-live="polite">Carregando arquivos…</div>');
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
const before=openEditor;openEditor=function(x){if(x)return before(x);const currentSection=chosenSection||el('itemSection')?.value||state.sections?.[state.day]?.[0]?.id;openPicker(currentSection);chosenSection=null;};
// Old section-add calls openEditor() then sets section select; infer from clicked parent in capture phase.
document.addEventListener('click',e=>{const btn=e.target.closest('.section-add');if(btn)chosenSection=btn.closest('.meeting-section')?.dataset.section||null},true);
// Take over item tap on media thumbnails and body, not action buttons; Bible remains direct.
document.addEventListener('click',e=>{const row=e.target.closest('#sectionsRoot .item');if(!row||e.target.closest('button,[contenteditable],input,textarea,select,.drag-handle,.content-grip'))return;const item=state.days[state.day].find(x=>x.id===row.dataset.itemId);if(!item)return;if(['video','imagem','pdf'].includes(item.type)){window.R70?.open(item)}else if(item.type==='musica'){if(window.R70?.isPdfOpen?.())window.R70.close();playMusic(item.musicId)}},false);
// Library-backed item thumbnails: each redraw retains small square preview without storing large videos in localStorage.
let thumbUrls=[];function thumbnails(){thumbUrls.forEach(u=>URL.revokeObjectURL(u));thumbUrls=[];const day=state.day;for(const row of document.querySelectorAll('#sectionsRoot .item[data-item-id]')){const item=state.days[day].find(x=>x.id===row.dataset.itemId);if(!item?.mediaLibraryId)continue;const thumb=row.querySelector('.item-thumb');if(!thumb)continue;thumb.dataset.thumbId=item.mediaLibraryId;window.ReunioesMediaLibrary?.get(item.mediaLibraryId).then(record=>{if(!record?.blob||thumb.dataset.thumbId!==record.id||!thumb.isConnected)return;const url=URL.createObjectURL(record.blob);thumbUrls.push(url);thumb.classList.add('r74loaded');if(item.type==='imagem'){const image=document.createElement('img');image.alt='Miniatura da foto';image.src=url;thumb.replaceChildren(image)}else if(item.type==='video'){renderVideoThumbnail(thumb,record.blob,url)}else if(item.type==='pdf'){renderPdfThumbnail(thumb,record.blob,url,false)}}).catch(()=>{})}}
const priorDraw=drawItems;drawItems=function(){priorDraw();thumbnails()};drawItems();
window.Reunioes74={openPicker};
})();