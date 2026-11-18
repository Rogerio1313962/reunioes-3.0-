/* Prévia 56: um único player, restrito a Cronograma e à pasta aberta. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const page=$('musicas'), panel=page?.querySelector('.music-panel'), folder=$('musicFolderDialog');
 const float=$('floatingMusic'), preview=document.querySelector('#agenda .preview');
 const folders=$('musicFolders'), search=$('allMusicSearch'), localSearch=$('folderMusicSearch');
 const results=$('allMusicResults'), add=$('newSongGroup'), header=panel?.querySelector('.panelhead');
 const audio=$('musicAudio');
 if(!page||!panel||!folder||!float||!preview||!header)return;
 // The original code used a fixed-position global overlay; the new layout uses a real grid.
 const workspace=document.createElement('div');workspace.id='music56Workspace';
 const left=document.createElement('div');left.id='music56Left';
 const right=document.createElement('div');right.id='music56Right';
 const empty=document.createElement('div');empty.id='music56Empty';
 empty.innerHTML='<div class="music57-minihead"><span class="music57-note" aria-hidden="true">♫</span><strong>Media Player</strong></div><div class="music57-minicontrols"><button type="button" id="music57Play" aria-label="Reproduzir música selecionada" disabled>▶</button><span>Selecione uma música para reproduzir</span></div>';
 const actions=document.createElement('div');actions.id='music56Actions';
 const topTools=document.createElement('div');topTools.id='music57TopTools';
 const back=document.createElement('button');back.type='button';back.id='music56Back';back.textContent='← Voltar às pastas';
 actions.append(back);right.append(empty);workspace.append(left,right);panel.prepend(workspace);
 topTools.append(search,add);
 left.append(header,topTools,results,folders,folder);
 // Dentro da pasta, a pesquisa fica acima de Voltar / Adicionar música.
 localSearch?.after(actions);
 const parking=document.createElement('div');parking.id='music56Parking';parking.hidden=true;document.body.append(parking);
 parking.append(float);
 const restore=$('floatingMusicRestore');if(restore)restore.hidden=true;
 const legacyClose=$('floatingMusicClose');if(legacyClose)legacyClose.hidden=true;
 let selected=false, agendaSong=false, agendaMinimized=false;
 const minimize=document.createElement('button');minimize.type='button';minimize.id='agenda56Minimize';minimize.textContent='−';minimize.title='Minimizar player e mostrar telão';minimize.setAttribute('aria-label','Minimizar player e mostrar telão');
 float.querySelector('.floating-music-head')?.append(minimize);
 const reopen=document.createElement('button');reopen.type='button';reopen.id='agenda56Reopen';reopen.textContent='♫ Mostrar player';reopen.title='Reabrir player de música';
 preview.querySelector('.panelhead')?.append(reopen);
 minimize.onclick=()=>{agendaMinimized=true;refresh()};
 reopen.onclick=()=>{agendaMinimized=false;refresh()};
 let lastTab='';
 const activeTab=()=>document.querySelector('.page.active')?.id||'';
 function clearSearch(){for(const el of [search,localSearch]){if(el&&el.value){el.value='';el.dispatchEvent(new Event('input'))}}}
 function resetTrack(){selected=false;agendaSong=false;agendaMinimized=false;audio.pause();}
 function refresh(){
  const tab=activeTab();const open=tab==='musicas'&&!!folder.open&&!folder.hidden;const agendaVisible=tab==='agenda'&&agendaSong&&!agendaMinimized;
  document.body.dataset.player56=agendaVisible?'agenda':open?'folder':'none';
  workspace.classList.toggle('folder-open',open);
  if(open){
   if(add&&add.parentElement!==actions)actions.append(add);
   if(selected){if(float.parentElement!==right)right.append(float)}else if(float.parentElement!==parking)parking.append(float);
   empty.hidden=selected;
  }else{
   if(add&&add.parentElement!==topTools)topTools.append(add);
   if(agendaVisible){if(float.parentElement!==preview)preview.prepend(float)}
   else if(float.parentElement!==parking)parking.append(float);
   empty.hidden=false;
  }
  preview.classList.toggle('player56-on',agendaVisible);preview.classList.toggle('music-on-right',agendaVisible);minimize.hidden=!agendaVisible;reopen.hidden=!(tab==='agenda'&&agendaSong&&agendaMinimized);
  float.setAttribute('aria-hidden',String(!(agendaVisible||open&&selected)));
  if(restore)restore.hidden=true;
  if(legacyClose)legacyClose.hidden=true;
  lastTab=tab;
 }
 const originalFolderShow=folder.showModal.bind(folder);
 const originalFolderClose=folder.close.bind(folder);
 folder.showModal=function(){clearSearch();selected=false;agendaSong=false;audio.pause();originalFolderShow();refresh()};
 folder.close=function(){originalFolderClose();clearSearch();resetTrack();refresh()};
 back.onclick=()=>folder.close();
 const originalPlay=playMusic;
 playMusic=async function(id){
  const tab=activeTab();
  if(tab==='musicas'){
   if(!folder.open){
    const match=(typeof musicIndex!=='undefined'?musicIndex:[]).find(t=>t.id===id);
    if(match&&typeof musicFolder!=='undefined')musicFolder=match.folder;
    folder.showModal();if(typeof drawMusic==='function')drawMusic();
   }
   selected=true;agendaSong=false;
  }else if(tab==='agenda'){
   agendaSong=true;agendaMinimized=false;selected=false;
  }else{
   // No player allowed on Bible, media or settings.
   return;
  }
  refresh();
  try{return await originalPlay(id)}finally{refresh()}
 };
 // Navigation performed by the application may be programmatic or via sidebar clicks.
 const originalSetTab=setTab;
 setTab=function(tab){
  if(tab!==activeTab()){
   if(folder.open)folder.close();else clearSearch();
   resetTrack();
  }
  originalSetTab(tab);refresh();
 };
 document.querySelectorAll('.nav[data-tab]').forEach(nav=>nav.addEventListener('click',()=>queueMicrotask(refresh)));
 // No leftover text in either search field when switching folders or leaving music.
 folders.addEventListener('click',e=>{if(e.target.closest('.music-folder')){clearSearch();queueMicrotask(refresh)}},true);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 // Prevent the old global music overlay from returning on unrelated pages.
 ['play','pause','ended','loadedmetadata'].forEach(ev=>audio.addEventListener(ev,()=>queueMicrotask(refresh)));
 refresh();
})();
