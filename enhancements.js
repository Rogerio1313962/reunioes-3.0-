// Prévia 13: edição protegida, etapas recolhíveis, toque-arraste sem seleção e MP3 persistente.
(function(){
const palette=['#2563eb','#0d9488','#9333ea','#d97706','#dc2626','#475569','#16a34a','#db2777'];
let editing=false,openIds=new Set(),drag=null;
function ensure(){if(!state.sections)state.sections={};for(let d=0;d<7;d++)if(!Array.isArray(state.sections[d])||!state.sections[d].length)state.sections[d]=[{id:'default-'+d,title:'Início',color:'#2563eb'}];}
ensure();save();
const sections=()=>state.sections[state.day];
const sectionOf=x=>sections().find(s=>s.id===x.sectionId)||sections()[0];
function options(){const el=$('itemSection');if(!el)return;const old=el.value;el.innerHTML=sections().map(s=>`<option value="${s.id}">${escapeHtml(s.title)}</option>`).join('');if(sections().some(s=>s.id===old))el.value=old;}
function setEdit(v){editing=v;$('editSchedule').hidden=v;$('saveSchedule').hidden=!v;$('newSection').hidden=!v;$('addItem').hidden=true;drawItems();}
$('editSchedule').onclick=()=>setEdit(true);
$('saveSchedule').onclick=()=>{save();setEdit(false)};
$('newSection').onclick=()=>{const name=prompt('Nome da nova etapa:','Nova etapa');if(!name||!name.trim())return;const s={id:uid(),title:name.trim(),color:palette[sections().length%palette.length]};sections().push(s);openIds.add(s.id);save();drawItems()};
const originalOpen=openEditor;
openEditor=function(x){originalOpen(x);options();$('itemSection').value=x?sectionOf(x).id:sections()[0].id;if($('type').value==='musica')renderMusicPicker()};
$('type').addEventListener('change',()=>{if($('type').value==='musica')renderMusicPicker()});
let folder=MUSIC_FOLDERS[0];
function renderMusicPicker(){const f=$('cronMusicFolders'),t=$('cronMusicTracks');if(!f||!t)return;f.innerHTML=MUSIC_FOLDERS.map(n=>`<button type="button" class="${n===folder?'selected':''}" data-folder="${escapeHtml(n)}">${escapeHtml(n)}</button>`).join('');f.querySelectorAll('button').forEach(b=>b.onclick=()=>{folder=b.dataset.folder;renderMusicPicker()});const tracks=musicIndex.filter(m=>m.folder===folder);t.innerHTML=tracks.length?tracks.map(m=>`<button type="button" class="${$('musicSelect').value===m.id?'selected':''}" data-id="${m.id}">♫ ${escapeHtml(m.name)}</button>`).join(''):'<p>Nenhum MP3 nesta pasta. Adicione na aba Músicas.</p>';t.querySelectorAll('button').forEach(b=>b.onclick=()=>{$('musicSelect').value=b.dataset.id;const m=musicIndex.find(v=>v.id===b.dataset.id);if(m)$('itemTitle').value=m.name;renderMusicPicker()});}
const oldRefresh=refreshMusicSelect;refreshMusicSelect=function(){oldRefresh();renderMusicPicker()};
const oldDraw=drawItems;
drawItems=function(){ensure();oldDraw();const root=$('sectionsRoot'),storage=$('items');root.innerHTML='';sections().forEach((s,index)=>{
 const items=state.days[state.day].filter(x=>sectionOf(x).id===s.id),expanded=openIds.has(s.id);
 const box=document.createElement('section');box.className='meeting-section'+(editing?' is-editing':'');box.dataset.section=s.id;
 box.innerHTML=`<div class="meeting-section-head" style="background:${s.color}"><span class="section-grip" ${editing?'':'hidden'} aria-hidden="true">⠿</span><button type="button" class="section-toggle" aria-expanded="${expanded}"><span>${expanded?'▾':'▸'}</span><strong>${escapeHtml(s.title)}</strong><small>${items.length} ${items.length===1?'item':'itens'}</small></button><div class="section-actions" ${editing?'':'hidden'}><button type="button" data-sact="rename" title="Renomear">✎</button><button type="button" data-sact="color" title="Cor">🎨</button><button type="button" data-sact="remove" title="Excluir">✕</button></div></div><div class="meeting-section-body" ${expanded?'':'hidden'}><div class="meeting-section-content"></div><button type="button" class="section-add" ${editing?'':'hidden'}>+ Adicionar conteúdo nesta etapa</button></div>`;
 const content=box.querySelector('.meeting-section-content');
 for(const x of items){const el=storage.querySelector(`.item[data-item-id="${CSS.escape(x.id)}"]`);if(el){el.draggable=false;el.querySelectorAll('[data-act="up"],[data-act="down"]').forEach(b=>b.remove());el.querySelectorAll('[data-act="edit"],[data-act="delete"]').forEach(b=>b.hidden=!editing);el.querySelector('.drag-handle')?.remove();if(editing){const grip=document.createElement('span');grip.className='content-grip';grip.textContent='⠿';el.prepend(grip);setupPointer(grip,el,'.item',id=>reorderItem(id,el.dataset.itemId));}content.appendChild(el)}}
 if(!content.children.length)content.innerHTML='<p class="section-empty">Nenhum conteúdo nesta etapa.</p>';
 box.querySelector('.section-toggle').onclick=()=>{if(openIds.has(s.id))openIds.delete(s.id);else openIds.add(s.id);drawItems()};
 box.querySelector('.section-add').onclick=()=>{openEditor();$('itemSection').value=s.id};
 box.querySelectorAll('[data-sact]').forEach(b=>b.onclick=()=>{const i=sections().findIndex(v=>v.id===s.id);switch(b.dataset.sact){case 'rename':{const n=prompt('Nome da etapa:',s.title);if(n?.trim())s.title=n.trim();break}case 'color':{const picker=document.createElement('div');picker.className='color-picker';picker.innerHTML=palette.map(c=>`<button type="button" style="background:${c}" data-color="${c}" aria-label="Cor ${c}"></button>`).join('');const prev=box.querySelector('.color-picker');if(prev){prev.remove();return}box.querySelector('.meeting-section-head').after(picker);picker.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{s.color=btn.dataset.color;save();drawItems()});return}case 'remove':if(sections().length===1){alert('É necessário manter pelo menos uma etapa.');return}if(!confirm('Excluir esta etapa? O conteúdo será movido para outra etapa.'))return;sections().splice(i,1);state.days[state.day].filter(x=>x.sectionId===s.id).forEach(x=>x.sectionId=sections()[0].id);break;}save();drawItems()});
 if(editing)setupPointer(box.querySelector('.meeting-section-head'),box,'.meeting-section',id=>reorderSection(id,s.id));
 root.appendChild(box);
 });options();};
function reorderSection(source,target){const a=sections(),from=a.findIndex(x=>x.id===source),to=a.findIndex(x=>x.id===target);if(from<0||to<0||from===to)return;const [item]=a.splice(from,1);a.splice(to,0,item);save();drawItems()}
function reorderItem(source,target){const a=state.days[state.day],from=a.findIndex(x=>x.id===source),to=a.findIndex(x=>x.id===target);if(from<0||to<0||from===to)return;const [item]=a.splice(from,1);item.sectionId=sectionOf(a.find(x=>x.id===target)).id;a.splice(to,0,item);save();drawItems()}
function setupPointer(handle,el,selector,commit){if(!handle)return;handle.style.touchAction='none';let start=null;
 handle.addEventListener('pointerdown',e=>{if(!editing||e.button!==0||e.target.closest('.section-actions'))return;e.preventDefault();start={id:el.dataset.section||el.dataset.itemId,x:e.clientX,y:e.clientY,target:null};handle.setPointerCapture(e.pointerId);el.classList.add('dragging-touch');document.body.classList.add('no-select')});
 handle.addEventListener('pointermove',e=>{if(!start)return;e.preventDefault();el.style.transform=`translateY(${e.clientY-start.y}px)`;const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest(selector);document.querySelectorAll(selector+'.drop-target').forEach(x=>x.classList.remove('drop-target'));if(hit&&hit!==el){hit.classList.add('drop-target');start.target=hit.dataset.section||hit.dataset.itemId}});
 const finish=()=>{if(!start)return;const source=start.id,target=start.target;el.style.transform='';el.classList.remove('dragging-touch');document.body.classList.remove('no-select');document.querySelectorAll(selector+'.drop-target').forEach(x=>x.classList.remove('drop-target'));start=null;if(target)commit(source,target)};
 handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);
}
// Player fixo: aparece ao tocar MP3 no cronograma e permanece visível ao navegar entre abas.
const audio=$('musicAudio'),float=$('floatingMusic');let playerCollapsed=false;const mini=document.createElement('button');mini.type='button';mini.id='floatingMusicRestore';mini.textContent='♫ Abrir player';mini.hidden=true;float.after(mini);mini.onclick=()=>{playerCollapsed=false;float.hidden=false;mini.hidden=true;syncPlayer()};
function fmt(sec){sec=Number.isFinite(sec)?Math.floor(sec):0;return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`}
function syncPlayer(){const name=$('musicNow').textContent;const active=!!audio.src&&!!audio.currentSrc;float.hidden=!active||playerCollapsed;mini.hidden=!active||!playerCollapsed;$('floatingMusicTitle').textContent=name;$('floatingPause').textContent=audio.paused?'▶ Continuar':'Ⅱ Pausar';$('floatingTime').textContent=fmt(audio.currentTime);$('floatingDuration').textContent=fmt(audio.duration);$('floatingSeek').value=audio.duration?Math.round(audio.currentTime/audio.duration*1000):0;const label=audio.loop?'↻ Repetir: ligado':'↻ Repetir: desligado';$('floatingRepeat').textContent=label;$('musicRepeatButton').textContent=label;$('floatingRepeat').setAttribute('aria-pressed',String(audio.loop));$('musicRepeatButton').setAttribute('aria-pressed',String(audio.loop));$('floatingVolume').value=Math.round(audio.volume*100);$('floatingVolumeLabel').textContent=Math.round(audio.volume*100)+'%'}
const basePlay=playMusic;playMusic=async function(id){playerCollapsed=false;mini.hidden=true;float.hidden=false;$('floatingMusicTitle').textContent='♫ Carregando MP3…';await basePlay(id);syncPlayer()};
$('floatingPause').onclick=()=>{if(audio.paused)audio.play().catch(()=>{});else audio.pause();syncPlayer()};
function stop(){audio.pause();audio.currentTime=0;syncPlayer()}
$('floatingStop').onclick=stop;$('musicStop').addEventListener('click',syncPlayer);
function repeat(){audio.loop=!audio.loop;$('musicRepeat').checked=audio.loop;syncPlayer()}
$('floatingRepeat').onclick=repeat;$('musicRepeatButton').onclick=repeat;
$('floatingSeek').oninput=e=>{if(Number.isFinite(audio.duration))audio.currentTime=audio.duration*Number(e.target.value)/1000};
$('floatingVolume').oninput=e=>{audio.volume=Number(e.target.value)/100;$('musicVolume').value=e.target.value;$('musicVolumeLabel').textContent=e.target.value+'%';syncPlayer()};
$('floatingMusicClose').onclick=()=>{playerCollapsed=!playerCollapsed;syncPlayer()};
['play','pause','timeupdate','durationchange','ended','volumechange'].forEach(ev=>audio.addEventListener(ev,syncPlayer));
$('musicRepeat').onchange=()=>{audio.loop=$('musicRepeat').checked;syncPlayer()};
$('expandPreview').onclick=()=>{const screen=$('preview');screen.classList.toggle('preview-expanded');$('expandPreview').textContent=screen.classList.contains('preview-expanded')?'✕ Reduzir prévia':'⛶ Ampliar prévia'};
$('musicUploadForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return;if([...$('musicFiles').files].some(f=>!/\.mp3$/i.test(f.name))){e.preventDefault();e.stopImmediatePropagation();alert('Selecione somente arquivos MP3.')}},true);
const videoRepeat=document.createElement('button');videoRepeat.type='button';videoRepeat.id='videoRepeat';videoRepeat.textContent='↻ Repetir vídeo: não';$('muteVideo').parentElement.appendChild(videoRepeat);let repeatVideo=false;videoRepeat.onclick=()=>{repeatVideo=!repeatVideo;videoRepeat.textContent=repeatVideo?'↻ Repetir vídeo: sim':'↻ Repetir vídeo: não';const v=$('preview').querySelector('video');if(v)v.loop=repeatVideo};const oldPresent=present;present=function(x){oldPresent(x);const v=$('preview').querySelector('video');if(v)v.loop=repeatVideo};
const oldMusicDraw=drawMusic;drawMusic=function(){oldMusicDraw();$('musicList').querySelectorAll('.music-track').forEach(row=>{const id=row.querySelector('[data-play]')?.dataset.play;if(!id)return;const b=document.createElement('button');b.textContent='Mover pasta';b.onclick=async()=>{const m=musicIndex.find(v=>v.id===id);const target=prompt('Mover para qual pasta?\n'+MUSIC_FOLDERS.map((x,i)=>`${i+1}. ${x}`).join('\n'),'1');const n=Number(target);if(!Number.isInteger(n)||n<1||n>MUSIC_FOLDERS.length)return;const tracks=await musicAll(),full=tracks.find(x=>x.id===id);if(!full)return;full.folder=MUSIC_FOLDERS[n-1];await musicPut(full);await loadMusic()};row.appendChild(b)})};
const oldLoad=loadMusic;loadMusic=async function(){await oldLoad();drawMusic()};
const originalDay=drawDays;drawDays=function(){originalDay();drawItems()};
// Adicionar MP3 pela biblioteca sempre atribui à etapa principal do dia.
$('addItem').onclick=()=>{openEditor();};$('addItem').hidden=true;
openIds.add(sections()[0].id);drawItems();
})();
// Bloqueia seleção nativa durante arraste no iOS, sem bloquear campos editáveis.
document.addEventListener('selectstart',e=>{if(e.target.closest('.meeting-section-head,.meeting-section-content')&&!e.target.closest('input,textarea,[contenteditable]'))e.preventDefault()});
document.addEventListener('contextmenu',e=>{if(e.target.closest('.meeting-section-head,.content-grip'))e.preventDefault()});
