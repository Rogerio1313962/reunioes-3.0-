/* Prévia 105: cabeçalho do cronograma e controles limpos */
(()=>{'use strict';
 const $=id=>document.getElementById(id);const agenda=$('agenda');if(!agenda)return;
 const panel=agenda.querySelector('.layout > .panel');const head=panel?.querySelector('.panelhead');const bar=$('r88SupportBar');const toolbar=head?.querySelector('.section-toolbar')||bar?.querySelector('.section-toolbar');
 if(head&&bar){
   const heading=head.querySelector('h2#dayTitle');if(heading){heading.style.textTransform='uppercase';heading.closest('div')?.classList.add('r105DayHeading')}
   if(toolbar&&toolbar.parentElement!==head)head.append(toolbar);
   const support=bar.querySelector('#r87Support');if(support){support.classList.add('r105Support');if(toolbar)head.insertBefore(support,toolbar);else head.append(support)}
   if(!bar.children.length)bar.remove();else bar.hidden=true;
   head.classList.add('r105AgendaHeader');
 }
 // Never draw the blue title panel for photos; keep the dedicated red Encerrar control.
 const media=$('r70MediaControls');if(media){
  const observer=new MutationObserver(()=>{if(!media.hidden){media.classList.add('r105VideoOnly')}});
  observer.observe(media,{attributes:true,attributeFilter:['hidden']});
 }
})();
