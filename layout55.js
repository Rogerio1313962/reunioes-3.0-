// Prévia 55 — biblioteca em duas colunas sem elementos flutuantes.
(() => {
 const $ = id => document.getElementById(id);
 const page=$('musicas'),panel=page?.querySelector('.music-panel');
 const folder=$('musicFolderDialog'), folders=$('musicFolders'), mainSearch=$('allMusicSearch');
 const folderSearch=$('folderMusicSearch'),float=$('floatingMusic'),add=$('newSongGroup');
 if(!panel||!folder||!folders||!float)return;
 const workspace=document.createElement('div');workspace.id='music55Workspace';
 const library=document.createElement('div');library.id='music55Library';
 const player=document.createElement('div');player.id='music55Player';
 const empty=document.createElement('div');empty.id='music55Empty';empty.innerHTML='<span class="music55-note">♫</span><p>Selecione uma música à esquerda.</p>';
 const actions=document.createElement('div');actions.id='music55Actions';
 const back=document.createElement('button');back.id='music55Back';back.type='button';back.textContent='← Voltar às pastas';
 const header=panel.querySelector('.panelhead');
 const mainResults=$('allMusicResults');
 workspace.append(library,player);panel.prepend(workspace);
 library.append(header,actions,mainSearch,mainResults,folders,folder);
 player.append(empty);
 actions.append(back,add);
 const anchor=document.createComment('player fora da página de músicas');float.before(anchor);
 const restore=$('floatingMusicRestore');
 const cleanSearch=()=>{[mainSearch,folderSearch].forEach(el=>{if(el){el.value='';el.dispatchEvent(new Event('input',{bubbles:false}))}})};
 let inside=false;let chosen=false;
 function update(){
   inside=folder.open&&!folder.hidden;
   workspace.classList.toggle('music55-open',inside);
   workspace.classList.toggle('music55-selected',inside&&chosen);
   if(inside&&add.parentNode!==actions)actions.append(add);
   if(!inside&&add.parentNode!==header)header.append(add);
   back.hidden=!inside;
   if(inside){
     if(float.parentElement!==player)player.append(float);
     float.hidden=false;
     empty.hidden=chosen;
   }else{
     if(float.parentElement===player&&anchor.parentNode)anchor.after(float);
     empty.hidden=false;chosen=false;
   }
 }
 const show=folder.showModal,close=folder.close;
 folder.showModal=()=>{folderSearch.value='';mainSearch.value='';chosen=false;show();update()};
 folder.close=()=>{close();cleanSearch();update()};
 back.onclick=()=>{folder.close();$('musicAudio')?.pause();};
 // Pasta aberta sempre revela player vazio; música selecionada preenche o mesmo painel.
 const originalPlay=playMusic;
 playMusic=async function(id){
    const wasInside=page.classList.contains('active')&&folder.open;
    const result=await originalPlay(id);
    if(wasInside){chosen=true;requestAnimationFrame(()=>{update();float.hidden=false;empty.hidden=true})}
    return result;
 };
 const playerClose=$('floatingMusicClose');if(playerClose)playerClose.hidden=true;
 const navMusic=document.querySelector('[data-tab="musicas"]');
 function exitMusic(){if(folder.open)folder.close();else cleanSearch();if(float.parentNode===player&&anchor.parentNode)anchor.after(float);update()}
 document.querySelectorAll('.nav[data-tab]').forEach(b=>b.addEventListener('click',()=>{if(b===navMusic){exitMusic();}else if(page.classList.contains('active'))exitMusic();},true));
 // Mudanças de pasta, inclusive durante pesquisa, não carregam filtro anterior.
 folders.addEventListener('click',e=>{if(e.target.closest('.music-folder')){mainSearch.value='';folderSearch.value='';requestAnimationFrame(update)}},true);
 // Busca da biblioteca: ao reproduzir resultado, abrir pasta corretamente sem sobreposição.
 mainResults?.addEventListener('click',e=>{if(e.target.closest('.song-row-play')){requestAnimationFrame(()=>{if(!folder.open){folder.showModal()}chosen=true;update()})}},true);
 // Reorganiza a busca: lupa dentro do campo e tamanho proporcional.
 [mainSearch,folderSearch].forEach(el=>{el?.classList.add('music55-search')});
 const observe=new MutationObserver(()=>{if(page.classList.contains('active')&&folder.open&&float.parentNode!==player)update()});
 observe.observe(folder,{attributes:true,attributeFilter:['hidden']});
 update();
})();
