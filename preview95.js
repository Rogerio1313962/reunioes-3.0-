/* Previa 95 — mover os controles de edição ao lado de Imagem de Apoio.
   Apenas reorganiza a interface: nenhuma alteração nos dados. */
(()=>{
  'use strict';
  const bar=document.querySelector('#agenda #r88SupportBar');
  const toolbar=document.querySelector('#agenda .layout>.panel>.panelhead .section-toolbar');
  if(bar&&toolbar&&!bar.contains(toolbar))bar.append(toolbar);
})();
