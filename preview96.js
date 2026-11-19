/* Prévia 96: player integrado à coluna do cronograma, sem sobreposição. */
(()=>{'use strict';
 const agenda=document.getElementById('agenda'),host=document.getElementById('r91MusicHost');
 const bar=document.getElementById('r88SupportBar'),sections=document.getElementById('sectionsRoot');
 if(host&&sections){sections.before(host);}
 const reopen=document.getElementById('agenda56Reopen');
 const dock=document.getElementById('r91MinimizedDock');
 if(reopen&&bar&&!dock){bar.append(reopen)}
 // Reduz a chance de telas antigas reaparecerem após alternar de dia.
 const observer=new MutationObserver(()=>{if(host&&sections&&host.parentElement!==sections.parentElement)sections.before(host)});
 if(agenda)observer.observe(agenda,{childList:true,subtree:false});
})();
