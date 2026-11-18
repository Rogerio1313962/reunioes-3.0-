// Prévia 26: conjuntos manuais de música, sem classificação por nome de arquivo.
(function(){
'use strict';
const $=id=>document.getElementById(id);
const roles=[['completa','Piano'],['piano_bateria','Piano com bateria'],['trecho','Trecho'],['trecho_bateria','Trecho com bateria'],['refrao','Refrão'],['refrao_bateria','Refrão com bateria'],['fundo','Fundo']];
const panel=document.createElement('section');panel.className='panel song-groups';panel.innerHTML=`<div class="panelhead"><div><div class="eyebrow">ÁUDIOS REUNIDOS</div><h2>♫ Músicas com versões</h2></div><button type="button" class="primary" id="newSongGroup">+ Nova música</button></div><p>Escolha pessoalmente a pasta e a versão de cada áudio. Os nomes dos MP3 não determinam o destino. Você pode colocar várias versões na mesma parte, sem digitar título ou artista.</p><div id="songGroupsList"></div>`;
const section=$('musicas')?.querySelector('.music-panel');if(!section)return;section.querySelector('.panelhead').appendChild(panel.querySelector('#newSongGroup'));panel.remove();
const dlg=document.createElement('dialog');dlg.id='songGroupDialog';
const folderNames=Array.isArray(MUSIC_FOLDERS)?MUSIC_FOLDERS:[];
function safe(s){return escapeHtml(String(s))}
dlg.innerHTML=`<form id="songGroupForm"><div class="dialoghead"><h2 id="groupDialogTitle">Adicionar música</h2><button type="button" id="groupClose">✕</button></div><p class="muted">1. Toque na pasta onde deseja guardar a música.</p><div id="groupFolderCards" class="group-folder-cards" role="group" aria-label="Pasta de destino"></div><p class="group-folder-confirm" id="groupFolderConfirm" aria-live="polite"></p><p class="muted">2. Escolha os MP3 de cada parte. Você decide o destino; o aplicativo não classifica pelo nome.</p><div id="groupFileSlots"></div><label class="group-lyrics-label">Letra da música (opcional)<textarea id="groupLyrics" rows="7" placeholder="Cole aqui a letra completa. O título e o refrão serão destacados automaticamente."></textarea></label><p class="muted" id="groupDetectedName">O nome será obtido automaticamente do primeiro MP3 escolhido.</p><p class="group-error" id="groupError" role="alert" hidden></p><div class="dialogactions"><button type="button" id="groupCancel">Cancelar</button><button type="submit" class="primary" id="groupSave">Conferir e salvar MP3</button></div></form>`;
document.body.appendChild(dlg);
let chosenFolder=folderNames[0]||'',editing=null;
const existing=document.createElement('div');existing.id='groupExistingTracks';$('groupFileSlots').before(existing);
function chooseFolder(folder){chosenFolder=folder;document.querySelectorAll('.group-folder-choice').forEach(b=>{const active=b.dataset.folder===folder;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active))});$('groupFolderConfirm').textContent='✓ Pasta escolhida: '+folder}
$('groupFolderCards').innerHTML=folderNames.map(f=>`<button type="button" class="group-folder-choice" data-folder="${safe(f)}" aria-pressed="false">📁 ${safe(f)}</button>`).join('');
$('groupFolderCards').querySelectorAll('button').forEach(b=>b.onclick=()=>chooseFolder(b.dataset.folder));
$('groupFileSlots').innerHTML=roles.map(([key,label])=>`<div class="group-file-slot"><div class="group-slot-head"><b>${label}</b><small>${key==='completa'?'Piano':key==='piano_bateria'?'Piano com bateria':key==='trecho'?'Parte da música':key==='trecho_bateria'?'Trecho com bateria':key==='refrao'?'Somente refrão':key==='refrao_bateria'?'Refrão com bateria':'Instrumental'}</small></div><label class="group-pick-label">+ Escolher MP3<input type="file" id="groupFile_${key}" accept=".mp3,audio/mpeg,audio/mp3" multiple></label><div class="group-file-selected" id="groupSelected_${key}">Nenhum MP3 escolhido</div></div>`).join('');
function cleanName(file){return file.name.replace(/\.mp3$/i,'')}
function guessedName(file){return cleanName(file).replace(/\s*[\(\[\{]\s*(?:PB|TB|RB|P|T|R|F|C|trecho|refr[aã]o|fundo|completa)\s*[\)\]\}]\s*$/i,'').trim()||cleanName(file)}
function selectedFiles(){return roles.map(([role])=>({role,files:[...$('groupFile_'+role).files]}))}
function updateSelected(){for(const {role,files} of selectedFiles()){$('groupSelected_'+role).textContent=files.length?files.map(f=>'✓ '+f.name).join('  |  '):'Nenhum MP3 escolhido';$('groupSelected_'+role).classList.toggle('has-files',!!files.length)}const first=selectedFiles().flatMap(x=>x.files)[0];$('groupDetectedName').textContent=editing?'Os MP3 serão adicionados ao conjunto: '+(editing.groupTitle||'Música'):(first?'Nome sugerido: '+guessedName(first):'O nome será obtido automaticamente do primeiro MP3 escolhido.');$('groupError').hidden=true}
for(const [role] of roles)$('groupFile_'+role).addEventListener('change',updateSelected);
async function openGroup(group){editing=group||null;$('songGroupForm').reset();$('groupDialogTitle').textContent=group?'Editar música e versões':'Adicionar música';$('groupLyrics').value=group?.lyrics||'';chooseFolder(group?.folder||musicFolder||folderNames[0]);updateSelected();await renderExisting();dlg.showModal()}
async function renderExisting(){existing.replaceChildren();if(!editing?.groupId)return;const all=await musicAll(),tracks=all.filter(t=>t.groupId===editing.groupId);const heading=document.createElement('h3');heading.textContent='MP3 cadastrados — remover ou substituir';existing.append(heading);for(const t of tracks){const row=document.createElement('div');row.className='group-existing-row';const label=document.createElement('span');label.textContent=(roles.find(([r])=>r===t.role)?.[1]||'Versão')+' · '+t.name+'.mp3';const remove=document.createElement('button');remove.type='button';remove.textContent='Remover MP3';remove.onclick=async()=>{if(!confirm('Excluir definitivamente este MP3 da biblioteca deste aparelho? Esta ação não pode ser desfeita.'))return;await musicRemove(t.id);await renderExisting();await loadMusic();};row.append(label,remove);existing.append(row)}if(!tracks.length){existing.textContent='Nenhum MP3 restante neste conjunto.'}}
$('newSongGroup').onclick=()=>openGroup(null);$('groupClose').onclick=$('groupCancel').onclick=()=>dlg.close();
$('songGroupForm').onsubmit=async e=>{e.preventDefault();const selections=selectedFiles(),files=selections.flatMap(s=>s.files);const err=$('groupError');if(!files.length&&!editing){err.textContent='Escolha pelo menos um MP3.';err.hidden=false;return}if(files.some(f=>!(/\.mp3$/i.test(f.name)) )){err.textContent='Somente arquivos MP3 são permitidos.';err.hidden=false;return}const title=editing?.groupTitle||guessedName(files[0]),artist=editing?.artist||'',folder=chosenFolder,groupId=editing?.groupId||uid();const summary=selections.filter(s=>s.files.length).map(s=>s.role.toUpperCase()+': '+s.files.map(f=>f.name).join(', ')).join('\n');if(!($('groupLyrics').value.trim())&&!/^(Fundos de Busca|Fundos de Clamor|Fundos de Descarrego)$/i.test(folder)){if(!confirm('Música sem letra. Deseja salvar mesmo assim?\n\nToque em Cancelar para adicionar a letra.'))return}if(!confirm('Confira antes de salvar:\n\nMúsica: '+title+'\nPasta: '+folder+'\n\n'+summary+'\n\nEstá tudo certo?'))return;const button=$('groupSave');button.disabled=true;button.textContent='Salvando MP3...';try{for(const {role,files} of selections){for(const file of files){await musicPut({id:uid(),name:cleanName(file),folder,size:file.size,blob:file,groupId,groupTitle:title,artist,role,lyrics:$('groupLyrics').value.trim()||editing?.lyrics||''})}}if(editing){const saved=await musicAll();for(const t of saved.filter(t=>t.groupId===groupId)){t.lyrics=$('groupLyrics').value.trim();t.folder=folder;await musicPut(t)}}dlg.close();musicFolder=folder;await loadMusic();await drawGroups()}catch(error){err.textContent='Não foi possível salvar todos os arquivos. Verifique o espaço disponível no iPad.';err.hidden=false}finally{button.disabled=false;button.textContent='Conferir e salvar MP3'}};
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
// Quando a letra de um áudio agrupado é salva, compartilha com todas as versões.
const originalPut=musicPut;musicPut=async function(track){await originalPut(track);if(track.groupId&&typeof track.lyrics==='string'){const all=await musicAll();for(const other of all){if(other.groupId===track.groupId&&other.id!==track.id&&other.lyrics!==track.lyrics){other.lyrics=track.lyrics;await originalPut(other)}}}};
})();
