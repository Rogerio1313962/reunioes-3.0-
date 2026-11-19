/* Prévia 100: player sobreposto à lista (não empurra etapas); dock compacto sob telão durante grade PDF. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const host=$('r91MusicHost'),panel=$('agenda')?.querySelector('.layout > .panel'),right=$('agenda')?.querySelector('.right'),preview=right?.querySelector('.preview'),grid=$('r70PageWorkspace');
if(!host||!panel||!right||!preview)return;
const leftMarker=document.createElement('span');leftMarker.id='r100PlayerAnchor';leftMarker.hidden=true;panel.insertBefore(leftMarker,$('r99PinnedFirstStage')||$('sectionsRoot'));
const rightMarker=document.createElement('span');rightMarker.id='r100RightAnchor';rightMarker.hidden=true;preview.insertAdjacentElement('afterend',rightMarker);
const expand=document.createElement('button');expand.type='button';expand.id='r100Expand';expand.textContent='⤢ Ampliar';expand.title='Ampliar Media Player sobre o cronograma';
let expanded=false,last='';
expand.onclick=()=>{expanded=true;sync()};
const head=$('floatingMusic')?.querySelector('.floating-music-head');head?.append(expand);
function gridShowing(){const el=$('r70PageWorkspace');return Boolean(el&&!el.hidden&&getComputedStyle(el).display!=='none')}
function sync(){
 const playing=document.body.dataset.player56==='agenda'&&!host.hidden;
 const pdf=gridShowing();
 if(!pdf)expanded=false;
 const compact=playing&&pdf&&!expanded;
 const target=compact?rightMarker:leftMarker;
 if(compact){if(host.parentElement!==right)rightMarker.after(host)}
 else if(host.parentElement!==panel)leftMarker.after(host);
 document.body.classList.toggle('r100CompactPlayer',compact);
 document.body.classList.toggle('r100OverlayPlayer',playing&&!compact);
 expand.hidden=!compact;
 // Quando o PDF está em grade, o botão de reabrir precisa ficar na área do telão,
 // não na barra do cronograma que a grade oculta.
 const reopen=$('agenda56Reopen');if(reopen){
  const dock=$('r91MinimizedDock');
  if(dock&&reopen.parentElement!==dock)dock.append(reopen);
 }
 if(playing&&!compact){
  const origin=$('r99PinnedFirstStage')||$('sectionsRoot');
  const top=Math.max(0,origin.getBoundingClientRect().top-panel.getBoundingClientRect().top);
  host.style.setProperty('--r100Top',top+'px');
 }
}
const watch=new MutationObserver(()=>requestAnimationFrame(sync));
watch.observe(document.body,{attributes:true,attributeFilter:['data-player56']});
watch.observe(host,{attributes:true,attributeFilter:['hidden']});
const gridWrap=$('r70PageWorkspace');if(gridWrap)watch.observe(gridWrap,{attributes:true,attributeFilter:['hidden','style']});
$('agenda56Minimize')?.addEventListener('click',()=>{expanded=false;requestAnimationFrame(sync)});
$('agenda56Reopen')?.addEventListener('click',()=>{expanded=false;requestAnimationFrame(sync)});
window.addEventListener('resize',sync);
requestAnimationFrame(sync);
})();