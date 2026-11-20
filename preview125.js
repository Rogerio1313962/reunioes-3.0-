/* Prévia 125 — ajustes finos da Bíblia, cronograma e controles. */
(()=>{'use strict';
const apply=()=>{
  // Mover o bloco de controle do cronograma para ficar sempre abaixo do telão.
  const agendaRight=document.querySelector('#agenda .right');
  const agendaCtrl=agendaRight?.querySelector('.b123Controller');
  const frame=agendaRight?.querySelector('.r109PresentationFrame')||agendaRight?.querySelector('.panel.preview');
  if(agendaRight&&agendaCtrl&&frame&&frame.nextElementSibling!==agendaCtrl){frame.after(agendaCtrl)}
  // Remover indicação antiga ACF · ARA, se restar.
  document.querySelectorAll('#biblia .b119Versions').forEach(el=>el.remove());
};
new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});
window.addEventListener('pageshow',apply);setTimeout(apply,0);
})();
