/* Prévia 109: moldura única do Telão Santuário e da grade PDF. */
(()=>{
 function mount(){
  const right=document.querySelector('#agenda .layout>.right');
  const preview=right?.querySelector('.preview');
  if(!right||!preview)return;
  let frame=right.querySelector('.r109PresentationFrame');
  if(!frame){frame=document.createElement('div');frame.className='r109PresentationFrame';preview.before(frame)}
  if(preview.parentElement!==frame)frame.appendChild(preview);
  const grid=document.getElementById('r70PageWorkspace');
  if(grid&&grid.parentElement!==frame)frame.appendChild(grid);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
 // Reparent only after media70 initializes; catch opening PDFs if the view is rebuilt.
 const agenda=document.getElementById('agenda');
 if(agenda){new MutationObserver(()=>{
  const preview=agenda.querySelector('.right .preview');
  const grid=document.getElementById('r70PageWorkspace');
  if(preview&&grid&&preview.parentElement?.classList.contains('r109PresentationFrame')&&grid.parentElement!==preview.parentElement){preview.parentElement.appendChild(grid)}
 }).observe(agenda,{childList:true,subtree:true})}
})();
