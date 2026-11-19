/* Prévia 122: ações aparecem somente com versículos escolhidos. */
(()=>{'use strict';
 const actions=document.querySelector('#biblia .b119Actions');
 const verses=document.getElementById('bibleVersesGrid');
 if(!actions||!verses)return;
 const refresh=()=>{
  let chosen=false;
  try{chosen=typeof selectedVerses!=='undefined'&&Array.isArray(selectedVerses)&&selectedVerses.length>0}catch(_e){}
  if(!chosen)chosen=!!verses.querySelector('button.chosen,button[aria-pressed="true"]');
  actions.hidden=!chosen;
 };
 // O seletor recria os botões ao trocar livro, capítulo ou versículo.
 new MutationObserver(refresh).observe(verses,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-pressed','hidden']});
 document.getElementById('bibleBooksGrid')?.addEventListener('click',()=>queueMicrotask(refresh));
 document.getElementById('bibleChaptersGrid')?.addEventListener('click',()=>queueMicrotask(refresh));
 for(const id of ['bibleStepBook','bibleStepChapter','bibleStepVerse','bibleTranslation']){
  const element=document.getElementById(id);
  element?.addEventListener('click',()=>queueMicrotask(refresh));
  element?.addEventListener('change',()=>queueMicrotask(refresh));
 }
 window.addEventListener('pageshow',refresh);
 refresh();
})();
