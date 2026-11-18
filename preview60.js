/* Prévia 60: cadastro ocupa a própria coluna do Media Player, sem modal sobreposto. */
(()=>{'use strict';
const workspace=document.getElementById('music56Workspace');
const right=document.getElementById('music56Right');
const dialog=document.getElementById('songGroupDialog');
if(!workspace||!right||!dialog)return;
const originalParent=dialog.parentNode;
let isDocked=false;
const player=document.getElementById('floatingMusic');
const restore=()=>{
  if(!isDocked)return;
  dialog.removeAttribute('open');
  workspace.classList.remove('music60-adding');
  if(originalParent&&dialog.parentNode!==originalParent)originalParent.append(dialog);
  isDocked=false;
};
// Formulário permanece o mesmo: apenas muda o local e a apresentação visual.
dialog.showModal=function(){
  if(document.querySelector('.page.active')?.id!=='musicas')return;
  if(player&&player.parentNode===right)player.style.display='none';
  right.append(dialog);
  dialog.setAttribute('open','');
  workspace.classList.add('music60-adding');
  isDocked=true;
  dialog.scrollTop=0;
};
dialog.close=function(){restore();if(player)player.style.removeProperty('display');};
dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();dialog.close();}});
for(const button of document.querySelectorAll('.nav[data-tab]'))button.addEventListener('click',()=>{if(isDocked){dialog.close()}},true);
})();