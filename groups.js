// Prévia 26: conjuntos manuais de música, sem classificação por nome de arquivo.
(function(){
'use strict';
const $=id=>document.getElementById(id);
const roles=[['completa','Piano'],['piano_bateria','Piano com bateria'],['trecho','Trecho'],['trecho_bateria','Trecho com bateria'],['refrao','Refrão'],['refrao_bateria','Refrão com bateria'],['fundo','Fundo']];
const panel=document.createElement('section');panel.className='panel song-groups';panel.innerHTML=`<div class="panelhead"><div><div class="eyebrow">ÁUDIOS REUNIDOS</div><h2>♫ Músicas com versões</h2></div><button type="button" class="primary" id="newSongGroup">+ Nova música</button></div><p>Escolha pessoalmente a pasta e a versão de cada áudio. Os nomes dos MP3 não determinam o destino. Cada versão pode ter apenas um MP3. O título é obtido do nome do arquivo.</p><div id="songGroupsList"></div>`;
const section=$('musicas')?.querySelector('.music-panel');if(!section)return;section.querySelector('.panelhead').appendChild(panel.querySelector('#newSongGroup'));panel.remove();
const dlg=document.createElement('dialog');dlg.id='songGroupDialog';
const folderNames=Array.isArray(MUSIC_FOLDERS)?MUSIC_FOLDERS:[];
function safe(s){return escapeHtml(String(s))}
dlg.innerHTML=`<form id="songGroupForm"><div class="dialoghead"><h2 id="groupDialogTitle">Adicionar música</h2><button type="button" id="groupClose">✕</button></div><p class="muted">1. Toque na pasta onde deseja guardar a música.</p><div id="groupFolderCards" class="group-folder-cards" role="group" aria-label="Pasta de destino"></div><p class="group-folder-confirm" id="groupFolderConfirm" aria-live="polite"></p><details id="groupAddDetails" class="group-add-details"><summary>＋ Adicionar MP3 <span id="groupAvailableCount"></span></summary><p class="muted">Escolha somente as versões ainda não cadastradas.</p><div id="groupFileSlots"></div></details><label class="group-lyrics-label">Letra da música (opcional)<textarea id="groupLyrics" rows="7" placeholder="Cole aqui a letra completa. O título e o refrão serão destacados automaticamente."></textarea></label><p class="muted" id="groupDetectedName">O nome será obtido automaticamente do primeiro MP3 escolhido.</p><p class="group-error" id="groupError" role="alert" hidden></p><div class="dialogactions"><button type="button" id="groupCancel">Cancelar</button><button type="submit" class="primary" id="groupSave">Conferir e salvar MP3</button></div></form>`;
document.body.appendChild(dlg);
let chosenFolder=folderNames[0]||'',editing=null;
const originalPut=musicPut;
const existing=document.createElement('div');existing.id='groupExistingTracks';$('groupFileSlots').before(existing);
function chooseFolder(folder){chosenFolder=folder;document.querySelectorAll('.group-folder-choice').forEach(b=>{const active=b.dataset.folder===folder;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))});$('groupFolderConfirm').textContent='✓ Pasta escolhida: '+folder}
$('groupFolderCards').innerHTML=folderNames.map(f=>`<button type="button" class="group-folder-choice" data-folder="${safe(f)}" aria-pressed="false">📁 ${safe(f)}</button>`).join('');
$('groupFolderCards').querySelectorAll('button').forEach(b=>b.onclick=()=>chooseFolder(b.dataset.folder));
$('groupFileSlots').innerHTML=roles.map(([key,label])=>`<div class="group-file-slot"><div class="group-slot-head"><b>${label}</b><small>${key==='completa'?'Piano':key==='piano_bateria'?'Piano com bateria':key==='trecho'?'Parte da música':key==='trecho_bateria'?'Trecho com bateria':key==='refrao'?'Somente refrão':key==='refrao_bateria'?'Refrão com bateria':'Instrumental'}</small></div><label class="group-pick-label">+ Escolher MP3<input type="file" id="groupFile_${key}" accept=".mp3,audio/mpeg,audio/mp3"></label><div class="group-file-selected" id="groupSelected_${key}">Nenhum MP3 escolhido</div></div>`).join('');
function cleanName(file){return file.name.replace(/\.mp3$/i,'')}
function guessedName(file){return cleanName(file).replace(/\s*[\(\[\{]\s*(?:PB|TB|RB|P|T|R|F|C|trecho|refr[aã]o|fundo|completa)\s*[\)\]\}]\s*$/i,'').trim()||cleanName(file)}
function selectedFiles(){return roles.map(([role])=>({role,files:[...$('groupFile_'+role).files]}))}
let occupiedRoles=new Set();
function updateAvailable(){let count=0;for(const [role] of roles){const slot=$('groupFile_'+role).closest('.group-file-slot');const available=!occupiedRoles.has(role);slot.hidden=!available;if(!available)$('groupFile_'+role).value='';else count++} $('groupAvailableCount').textContent='('+count+' disponível'+(count===1?'':'is')+')';$('groupAddDetails').hidden=count===0;}
function updateSelected(){for(const {role,files} of selectedFiles()){$('groupSelected_'+role).textContent=files.length?files.map(f=>'✓ '+f.name).join('  |  '):'Nenhum MP3 escolhido';$('groupSelected_'+role).classList.toggle('has-files',!!files.length)}const first=selectedFiles().flatMap(x=>x.files)[0];$('groupDetectedName').textContent=editing?'Os MP3 serão adicionados ao conjunto: '+(editing.groupTitle||'Música'):(first?'Nome sugerido: '+guessedName(first):'O nome será obtido automaticamente do primeiro MP3 escolhido.');$('groupError').hidden=true}
for(const [role] of roles)$('groupFile_'+role).addEventListener('change',updateSelected);
async function openGroup(group){editing=group||null;$('songGroupForm').reset();$('groupAddDetails').open=!group;$('groupDialogTitle').textContent=group?'Editar música e versões':'Adicionar música';$('groupLyrics').value=group?.lyrics||'';chooseFolder(group?.folder||musicFolder||folderNames[0]);await renderExisting();updateSelected();$('groupSave').textContent=group?'Salvar alterações':'Conferir e salvar música';dlg.showModal()}
async function renderExisting(){existing.replaceChildren();occupiedRoles=new Set();if(!editing?.groupId){updateAvailable();return}const all=await musicAll(),tracks=all.filter(t=>t.groupId===editing.groupId);occupiedRoles=new Set(tracks.map(t=>t.role||'completa'));const heading=document.createElement('h3');heading.textContent='MP3 cadastrados — remover ou substituir';existing.append(heading);for(const t of tracks){const row=document.createElement('div');row.className='group-existing-row';const label=document.createElement('span');label.textContent=(roles.find(([r])=>r===t.role)?.[1]||'Versão')+' · '+t.name+'.mp3';const remove=document.createElement('button');remove.type='button';remove.textContent='Remover MP3';remove.onclick=async()=>{if(!confirm('Excluir definitivamente este MP3 da biblioteca deste aparelho? Esta ação não pode ser desfeita.'))return;try{await musicRemove(t.id);await renderExisting();await loadMusic();}catch(error){$('groupError').textContent='Não foi possível remover o MP3: '+(error?.message||String(error));$('groupError').hidden=false}};row.append(label,remove);existing.append(row)}if(!tracks.length){existing.textContent='Nenhum MP3 restante neste conjunto.'}updateAvailable()}
$('newSongGroup').onclick=()=>openGroup(null);$('groupClose').onclick=$('groupCancel').onclick=()=>dlg.close();
$('songGroupForm').onsubmit=async e=>{e.preventDefault();
 const selections=selectedFiles(),files=selections.flatMap(s=>s.files),err=$('groupError');err.hidden=true;
 if(!files.length&&!editing){err.textContent='Escolha pelo menos um MP3.';err.hidden=false;return}
 if(files.some(f=>!/\.mp3$/i.test(f.name))){err.textContent='Somente arquivos MP3 são permitidos.';err.hidden=false;return}
 if(selections.some(s=>s.files.length>1||s.files.length&&occupiedRoles.has(s.role))){err.textContent='Cada versão aceita um único MP3. Remova o arquivo anterior para substituí-lo.';err.hidden=false;return}
 const title=editing?.groupTitle||guessedName(files[0]),artist=editing?.artist||'',folder=chosenFolder,groupId=editing?.groupId||uid(),lyrics=$('groupLyrics').value.trim();
 if(!lyrics&&!/^(Fundos de Busca|Fundos de Clamor|Fundos de Descarrego)$/i.test(folder)&&!confirm('Música sem letra. Deseja salvar mesmo assim?'))return;
 const summary=selections.filter(s=>s.files.length).map(s=>roles.find(r=>r[0]===s.role)[1]+': '+s.files[0].name).join('\n');
 if(files.length&&!confirm('Confira antes de salvar:\n\nMúsica: '+title+'\nPasta: '+folder+'\n\n'+summary+'\n\nEstá tudo certo?'))return;
 const button=$('groupSave');button.disabled=true;button.textContent='Salvando...';
 try{
  // Salvar apenas letra/pasta não cria novos registros nem exige selecionar MP3 novamente.
  // A gravação usa a função original de IndexedDB, evitando regravações recursivas.
  if(editing){const all=await musicAll();for(const t of all.filter(t=>t.groupId===groupId)){if(t.lyrics!==lyrics||t.folder!==folder){await originalPut({...t,lyrics,folder})}}}
  for(const {role,files:chosen} of selections){for(const file of chosen){await originalPut({id:uid(),name:cleanName(file),folder,size:file.size,blob:file,groupId,groupTitle:title,artist,role,lyrics})}}
  dlg.close();musicFolder=folder;await loadMusic();await drawGroups();
 }catch(error){const name=error?.name||'',detail=error?.message||String(error);err.textContent=name==='QuotaExceededError'?'O armazenamento de músicas do Safari está cheio. Nenhum arquivo existente foi apagado.':'Não foi possível salvar: '+detail;err.hidden=false;console.error('Erro ao salvar música',error)}
 finally{button.disabled=false;button.textContent=editing?'Salvar alterações':'Conferir e salvar música'}
};
// Biblioteca única: as pastas abrem uma janela com todos os arquivos e conjuntos.
const folderDialog=document.createElement('dialog');folderDialog.id='musicFolderDialog';folderDialog.innerHTML='<div class="folder-modal-head"><h2 id="folderModalTitle">Músicas</h2><button type="button" id="folderModalClose">✕ Fechar</button></div><div id="folderModalContent"></div>';document.body.appendChild(folderDialog);
$('folderModalClose').onclick=()=>folderDialog.close();
const nativeList=$('musicList'),nativeHead=section.querySelector('.music-list-head');
const folderContent=$('folderModalContent');folderContent.append(nativeHead,nativeList);
section.querySelector('.panelhead h2').textContent='♫ Biblioteca de Músicas';
const groupButton=$('newSongGroup');groupButton.textContent='+ Adicionar música';
$('musicManage').textContent='+ Importar MP3 avulso';
async function drawGroups(){let all;try{all=await musicAll()}catch(err){folderContent.textContent='Não foi possível carregar músicas.';return}
const groups=new Map();for(const t of all){if(!t.groupId||t.folder!==musicFolder)continue;if(!groups.has(t.groupId))groups.set(t.groupId,[]);groups.get(t.groupId).push(t)}
let target=$('folderGroups');if(!target){target=document.createElement('div');target.id='folderGroups';folderContent.insertBefore(target,nativeHead)}target.replaceChildren();
for(const [id,tracks] of groups){
 const first=tracks[0],card=document.createElement('div');card.className='song-group-card song-group-compact';
 const title=first.groupTitle||first.name||'Música';
 const head=document.createElement('div');head.className='song-group-head';
 const info=document.createElement('div');info.className='group-main-info';
 const name=document.createElement('strong');name.textContent='♫ '+title;
 const sub=document.createElement('small');sub.textContent=roles.filter(([r])=>tracks.some(t=>t.role===r)).map(([,label])=>label).join(' · ');
 info.append(name,sub);head.append(info);
 const play=document.createElement('button');play.className='primary';play.textContent='▶ Abrir';play.onclick=()=>{folderDialog.close();playMusic((tracks.find(t=>t.role==='completa')||tracks[0]).id)};
 const add=document.createElement('button');add.textContent='+ Cronograma';add.onclick=()=>{const main=tracks.find(t=>t.role==='completa')||tracks[0];state.days[state.day].push({id:uid(),type:'musica',title,musicId:main.id,groupId:id});save();drawItems();folderDialog.close();setTab('agenda')};
 const edit=document.createElement('button');edit.textContent='✎ Editar';edit.onclick=()=>openGroup(first);
 head.append(play,add,edit);card.append(head);target.append(card)
}
// Arquivos agrupados aparecem apenas no conjunto, sem duplicação na lista comum.
nativeList.querySelectorAll('.music-track').forEach(el=>{const btn=el.querySelector('[data-play]');if(btn&&all.some(t=>t.id===btn.dataset.play&&t.groupId))el.remove()});
$('folderModalTitle').textContent=musicFolder;
}
const oldDrawMusic=drawMusic;drawMusic=function(){oldDrawMusic();$('musicFolders').querySelectorAll('button').forEach(b=>b.onclick=async()=>{musicFolder=MUSIC_FOLDERS[+b.dataset.folder];oldDrawMusic();await drawGroups();folderDialog.showModal()})};
const originalLoad=loadMusic;loadMusic=async function(){await originalLoad();await drawGroups()};drawMusic();drawGroups();
// Usa gravação direta para evitar duplicação de áudios no armazenamento.

})();
