/* Prévia 115: painel de cadastro dividido com pastas à esquerda e MP3 à direita. */
(()=>{'use strict';
const $=id=>document.getElementById(id),page=$('musicas'),dialog=$('songGroupDialog');
if(!page||!dialog)return;
const overlay=document.createElement('div');overlay.id='r115Overlay';overlay.hidden=true;
overlay.innerHTML='<div id="r115Panel"><div id="r115Folders"><div class="r115-folder-top"><h2>Escolher pasta</h2><p>Selecione onde a música será salva.</p></div><div id="r115FolderList"></div></div><div id="r115Form"></div></div>';
page.appendChild(overlay);
const folderList=$('r115FolderList'),form=$('r115Form');
const names=typeof MUSIC_FOLDERS!=='undefined'&&Array.isArray(MUSIC_FOLDERS)?MUSIC_FOLDERS:[];
let chosen='';
const safe=t=>String(t).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
function paint(){folderList.innerHTML=names.map(n=>'<button type="button" class="r115-folder '+(n===chosen?'active':'')+'" data-folder="'+safe(n)+'"><span class="r115-folder-icon">▰</span><span>'+safe(n).toUpperCase()+'</span>'+(n===chosen?'<span class="r115-tick">✓</span>':'')+'</button>').join('');}
folderList.addEventListener('click',e=>{const button=e.target.closest('button[data-folder]');if(!button)return;chosen=button.dataset.folder;window.__r115ChooseMusicFolder?.(chosen);paint();});
const originalParent=dialog.parentNode;let docked=false;
const originalShow=dialog.showModal?.bind(dialog),originalClose=dialog.close?.bind(dialog);
dialog.showModal=function(){
  if(document.querySelector('.page.active')?.id!=='musicas')return;
  const isEdit=!!document.querySelector('#groupMoveArea:not([hidden])');
  const current=document.getElementById('groupCurrentFolder')?.textContent?.trim();
  chosen=current||names[0]||'';
  paint();
  overlay.hidden=false;
  document.body.classList.add('r115-adding-music');
  form.append(dialog);
  dialog.setAttribute('open','');
  dialog.scrollTop=0;
  docked=true;
  // Em edições, manter a pasta da música até o usuário optar por mover.
  if(!isEdit&&chosen)window.__r115ChooseMusicFolder?.(chosen);
};
dialog.close=function(){
  if(!docked){if(originalClose)try{return originalClose()}catch(_e){}return;}
  dialog.removeAttribute('open');
  overlay.hidden=true;
  document.body.classList.remove('r115-adding-music');
  if(originalParent&&dialog.parentNode!==originalParent)originalParent.append(dialog);
  docked=false;
};
// Adicionar música: apenas botão da biblioteca, fora das pastas abertas.
const add=$('newSongGroup');
add?.addEventListener('click',e=>{
  if(document.getElementById('musicFolderDialog')?.open){
    // Botão na pasta não deve abrir o cadastro.
    e.preventDefault();e.stopImmediatePropagation();
  }
},true);
for(const nav of document.querySelectorAll('.nav[data-tab]'))nav.addEventListener('click',()=>{if(docked)dialog.close()},true);
dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();dialog.close()}});
})();
