// Prévia 29: um registro por música; versões somente no player.
(function(){
'use strict';
const $=id=>document.getElementById(id);
let groupCache=new Map(),trackMap=new Map(),currentGroup=null;let activeTrack=null;
async function scan(){const all=await musicAll();groupCache=new Map();trackMap=new Map(all.map(t=>[t.id,t]));for(const t of all){if(!t.groupId)continue;if(!groupCache.has(t.groupId))groupCache.set(t.groupId,[]);groupCache.get(t.groupId).push(t)}return all}
function representative(group){return group.find(t=>t.role==='completa')||group[0]}
function catalog(folder){const result=[];const seen=new Set();for(const m of musicIndex.filter(m=>m.folder===folder)){const t=trackMap.get(m.id);if(t?.groupId){if(seen.has(t.groupId))continue;seen.add(t.groupId);const group=groupCache.get(t.groupId);if(group)result.push({id:representative(group).id,name:group[0].groupTitle||group[0].name,groupId:t.groupId})}else result.push({id:m.id,name:m.name})}return result}
// Captura os dados atuais sem alterar o armazenamento original.
const oldLoad=loadMusic;
loadMusic=async function(){await oldLoad();await scan();refreshMusicSelect();};
const oldRefresh=refreshMusicSelect;
refreshMusicSelect=function(){oldRefresh();const sel=$('musicSelect');const previous=sel.value;sel.replaceChildren();for(const folder of MUSIC_FOLDERS){for(const entry of catalog(folder)){const option=document.createElement('option');option.value=entry.id;option.textContent=folder+' · '+entry.name;sel.append(option)}}if([...sel.options].some(o=>o.value===previous))sel.value=previous};
// No editor do cronograma, substitui a lista extensa por músicas principais.
function updatePicker(){const f=$('cronMusicFolders'),t=$('cronMusicTracks');if(!f||!t||$('type')?.value!=='musica')return;
let selected=f.querySelector('.selected')?.dataset.folder||MUSIC_FOLDERS[0];
function render(){f.replaceChildren();for(const folder of MUSIC_FOLDERS){const b=document.createElement('button');b.type='button';b.textContent=folder;b.dataset.folder=folder;b.className=folder===selected?'selected':'';b.onclick=()=>{selected=folder;render()};f.append(b)}
t.replaceChildren();const items=catalog(selected);for(const entry of items){const b=document.createElement('button');b.type='button';b.textContent='♫ '+entry.name;b.className=$('musicSelect').value===entry.id?'selected':'';b.onclick=()=>{$('musicSelect').value=entry.id;$('itemTitle').value=entry.name;render()};t.append(b)}if(!items.length)t.textContent='Nenhuma música nesta pasta.'}
render()}
// Os listeners antigos são instalados pelo aplicativo. Atualiza depois que abrem o editor.
const originalOpen=openEditor;openEditor=function(item){originalOpen(item);updatePicker()};
$('type')?.addEventListener('change',()=>{if($('type').value==='musica')queueMicrotask(updatePicker)});
// Captura os cliques do seletor para reconstruir sem listar as versões individualmente.
$('cronMusicFolders')?.addEventListener('click',()=>queueMicrotask(updatePicker));
// Player do cronograma: seleção sem autoplay, sem desmontar a janela.
const bar=document.createElement('div');bar.id='groupVersionBar';bar.className='group-version-bar';bar.hidden=true;
const heading=document.createElement('div');heading.className='group-version-heading';heading.textContent='Escolha o áudio para reproduzir';bar.append(heading);
const buttons=document.createElement('div');buttons.className='group-version-buttons';bar.append(buttons);
$('floatingMusic')?.querySelector('.floating-music-head')?.after(bar);
const oldPlay=playMusic;
async function prepareVersion(id,keepOpen){
  const t=trackMap.get(id);if(!t)return;
  activeTrack=id;
  window.__musicPrepareOnly=true;window.__musicStableSwitch=!!keepOpen;
  try{await oldPlay(id)}finally{window.__musicPrepareOnly=false;window.__musicStableSwitch=false;}
  $('musicAudio').pause();
  $('floatingMusic').hidden=false;
  $('floatingMusicTitle').textContent='♫ '+(currentGroup?.[0]?.groupTitle||t.name);
  $('musicNow').textContent='♫ '+(currentGroup?.[0]?.groupTitle||t.name);
  for(const b of buttons.querySelectorAll('button'))b.classList.toggle('selected',b.dataset.track===id);
}
playMusic=async function(id){
 await scan();const track=trackMap.get(id);const group=track?.groupId?groupCache.get(track.groupId):null;
 const inAgenda=$('agenda')?.classList.contains('active');
 currentGroup=inAgenda?group||null:null;
 if(!inAgenda){bar.hidden=true;await oldPlay(id);return}
 buttons.replaceChildren();
 if(group){for(const [role,label] of [['completa','Completa'],['trecho','Trecho'],['refrao','Refrão'],['fundo','Fundo']]){
  const versions=group.filter(t=>t.role===role);
  for(let i=0;i<versions.length;i++){
   const t=versions[i],b=document.createElement('button');b.type='button';b.dataset.track=t.id;
   b.textContent=label+(versions.length>1?' '+(i+1):'');b.title=t.name;
   b.onclick=()=>prepareVersion(t.id,true);buttons.append(b);
  }
 }}
 bar.hidden=!group;
 const initial=group?(group.find(t=>t.role==='completa')||track):track;
 await prepareVersion(initial.id,false);
 bar.hidden=!group;
};
// Biblioteca de pastas: atualiza contagens para contar músicas e não versões.
const oldDraw=drawMusic;drawMusic=function(){oldDraw();for(const b of $('musicFolders')?.querySelectorAll('[data-folder]')||[]){const folder=MUSIC_FOLDERS[Number(b.dataset.folder)];const small=b.querySelector('small');if(small)small.textContent=catalog(folder).length+' música(s)'}};
scan().then(()=>{refreshMusicSelect();drawMusic()}).catch(()=>{});
})();
