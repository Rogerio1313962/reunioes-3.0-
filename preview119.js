/* Prévia 119 — Bíblia em layout claro com a prévia compartilhada do Telão Santuário. */
(()=>{'use strict';
 const page=document.getElementById('biblia');
 const source=document.getElementById('preview');
 const mirror=document.getElementById('b119Mirror');
 const badge=document.getElementById('b119LiveBadge');
 if(!page||!source||!mirror)return;
 const book=document.getElementById('bibleBook');
 const chapter=document.getElementById('bibleChapter');
 const prev=document.getElementById('b119PrevChapter');
 const next=document.getElementById('b119NextChapter');
 let scheduled=false;
 function updateMirror(){
  scheduled=false;
  // Usa uma CÓPIA visual; nunca move a tela original do Cronograma.
  const copy=source.cloneNode(true);
  mirror.replaceChildren(...Array.from(copy.childNodes));
  const srcCanvas=[...source.querySelectorAll('canvas')];
  const clonedCanvas=[...mirror.querySelectorAll('canvas')];
  clonedCanvas.forEach((canvas,i)=>{
   const original=srcCanvas[i];if(!original)return;
   try{canvas.width=original.width;canvas.height=original.height;canvas.getContext('2d')?.drawImage(original,0,0)}catch(_e){}
  });
  // A tela da Bíblia mostra a mesma mídia, mas sem controles independentes.
  const srcVideos=[...source.querySelectorAll('video')];
  mirror.querySelectorAll('video').forEach((v,i)=>{v.removeAttribute('controls');v.muted=true;v.playsInline=true;try{v.currentTime=srcVideos[i]?.currentTime||0}catch(_e){};if(srcVideos[i]&&!srcVideos[i].paused)v.play().catch(()=>{})});
  const active=!!(source.querySelector('.verse,.b120Verse') || window.R70?.isLive?.() || source.querySelector('img:not([alt="Imagem de Apoio"]),video,canvas,iframe'));
  badge.classList.toggle('b119Active',active);
  badge.setAttribute('aria-label',active?'Conteúdo em apresentação':'Telão em espera');
 }
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(updateMirror)}
 new MutationObserver(schedule).observe(source,{childList:true,subtree:true,attributes:true,attributeFilter:['src','class','style']});
 document.addEventListener('click',schedule,true);
 document.addEventListener('change',schedule,true);
 window.addEventListener('r93-live-change',schedule);
 // Apresentar os versículos sem navegar de volta para o Cronograma.
 document.getElementById('biblePresent')?.addEventListener('click',event=>{
   event.preventDefault();event.stopImmediatePropagation();
   if(typeof bibleItem!=='function'||typeof present!=='function')return;
   const item=bibleItem();if(!item)return;
   if(window.R70?.hasActiveMedia?.())window.R70.close();
   present(item);
   schedule();
 },true);
 document.getElementById('b119Clear')?.addEventListener('click',()=>{
   if(window.R70?.hasActiveMedia?.())window.R70.close();
   if(typeof present==='function')present(null);
   schedule();
 });
 function goChapter(offset){
  const total=typeof BIBLE_BOOKS!=='undefined'?BIBLE_BOOKS[Number(book.value)]?.[1]:0;
  const current=Number(chapter.value)||1;
  const candidate=current+offset;
  if(candidate<1||candidate>total)return;
  chapter.value=String(candidate);
  if(typeof selectedVerses!=='undefined')selectedVerses=[];
  if(typeof bibleStep!=='undefined')bibleStep='verse';
  if(typeof drawBiblePicker==='function')drawBiblePicker();
  if(typeof loadBibleText==='function')loadBibleText();
  refreshChapters();
 }
 function refreshChapters(){const current=Number(chapter.value)||1;const total=typeof BIBLE_BOOKS!=='undefined'?BIBLE_BOOKS[Number(book.value)]?.[1]:0;prev.disabled=current<=1;next.disabled=current>=total;}
 prev.addEventListener('click',()=>goChapter(-1));next.addEventListener('click',()=>goChapter(1));
 document.getElementById('bibleBooksGrid')?.addEventListener('click',()=>queueMicrotask(refreshChapters));
 document.getElementById('bibleChaptersGrid')?.addEventListener('click',()=>queueMicrotask(refreshChapters));
 document.getElementById('bibleStepBook')?.addEventListener('click',refreshChapters);
 window.addEventListener('pageshow',()=>{refreshChapters();schedule()});
 refreshChapters();schedule();
})();
