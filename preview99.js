/* Prévia 99: a primeira etapa permanece em cabeçalho fixo, fora da lista que rola.
   Os botões da faixa fixa acionam os controles originais, preservando as funções existentes. */
(()=>{
  'use strict';
  const agenda=document.getElementById('agenda');
  const root=document.getElementById('sectionsRoot');
  if(!agenda||!root)return;
  const pinned=document.createElement('div');
  pinned.id='r99PinnedFirstStage';
  pinned.setAttribute('aria-label','Primeira etapa fixa do cronograma');
  root.before(pinned);
  let currentSource=null;
  function sync(){
    const first=root.querySelector(':scope > .meeting-section:first-child');
    const source=first?.querySelector(':scope > .meeting-section-head');
    if(!source){pinned.hidden=true;currentSource=null;return;}
    currentSource=source;
    pinned.hidden=false;
    const replica=source.cloneNode(true);
    replica.classList.add('r99PinnedHeading');
    replica.querySelector('.section-grip')?.remove();
    replica.querySelector('.color-picker')?.remove();
    const button=replica.querySelector('.section-toggle');
    if(button){button.setAttribute('aria-label','Expandir ou recolher a primeira etapa');}
    pinned.replaceChildren(replica);
  }
  pinned.addEventListener('click',event=>{
    const src=currentSource;
    if(!src||!src.isConnected)return;
    const action=event.target.closest('[data-sact]');
    if(action){src.querySelector('[data-sact="'+action.dataset.sact+'"]')?.click();return;}
    src.querySelector('.section-toggle')?.click();
  });
  // A renderização do cronograma reconstrói a lista ao mudar de dia/editar/expandir.
  // Sincronizar depois da reconstrução sem mexer na posição de rolagem.
  const observer=new MutationObserver(sync);
  observer.observe(root,{childList:true});
  sync();
})();
