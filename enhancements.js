// Prévia 11: partes da reunião, seletor de MP3 por pasta, repetição e prévia ampliada.
(function(){
const sectionColors=['#2563eb','#0d9488','#9333ea','#d97706','#dc2626','#475569','#16a34a','#db2777'];
function ensure(){if(!state.sections)state.sections={};for(let d=0;d<7;d++){if(!Array.isArray(state.sections[d])||!state.sections[d].length)state.sections[d]=[{id:'default-'+d,title:'Parte principal',color:'#2563eb'}]};}
ensure();save();
const currentSections=()=>state.sections[state.day];
function itemSection(x){return currentSections().find(s=>s.id===x.sectionId)||currentSections()[0]}
function sectionOptions(){const sel=$('itemSection');if(!sel)return;const old=sel.value;sel.innerHTML=currentSections().map(s=>`<option value="${s.id}">${escapeHtml(s.title)}</option>`).join('');if(currentSections().some(s=>s.id===old))sel.value=old}
function renderSections(){
 const root=$('sectionsRoot');root.innerHTML='';const old=$('items');
 currentSections().forEach(s=>{
  const wrap=document.createElement('section');wrap.className='meeting-section';wrap.dataset.section=s.id;
  wrap.innerHTML=`<div class="meeting-section-head" style="background:${s.color}"><strong>▤ ${escapeHtml(s.title)}</strong><span class="section-actions"><button type="button" data-sact="color" title="Trocar cor">🎨 Cor</button><button type="button" data-sact="rename">Renomear</button><button type="button" data-sact="moveup">↑</button><button type="button" data-sact="movedown">↓</button><button type="button" data-sact="remove">✕</button></span></div><div class="meeting-section-content"></div><button type="button" class="section-add">+ Adicionar conteúdo nesta parte</button>`;
  const content=wrap.querySelector('.meeting-section-content');
  [...old.querySelectorAll('.item')].filter(el=>{const x=state.days[state.day].find(v=>v.id===el.dataset.itemId);return x&&itemSection(x).id===s.id}).forEach(el=>content.appendChild(el));
  if(!content.children.length)content.innerHTML='<p class="section-empty">Nenhum conteúdo nesta parte.</p>';
  wrap.querySelector('.section-add').onclick=()=>{openEditor();sectionOptions();$('itemSection').value=s.id};
  wrap.querySelectorAll('[data-sact]').forEach(b=>b.onclick=()=>{
   const a=currentSections(),i=a.findIndex(v=>v.id===s.id);switch(b.dataset.sact){
   case 'color': {const picker=document.createElement('div');picker.className='color-picker';picker.innerHTML=sectionColors.map(c=>`<button type="button" style="background:${c}" data-color="${c}" aria-label="Escolher cor ${c}"></button>`).join('');const old=wrap.querySelector('.color-picker');if(old){old.remove();return}wrap.querySelector('.meeting-section-head').after(picker);picker.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{s.color=btn.dataset.color;save();drawItems()});return}
   case 'rename':{const n=prompt('Nome desta parte:',s.title);if(n&&n.trim())s.title=n.trim();break}
   case 'remove':if(a.length===1){alert('Mantenha pelo menos uma parte.');return}if(!confirm('Excluir esta parte? Os conteúdos serão movidos para a primeira parte restante.'))return; a.splice(i,1);state.days[state.day].filter(x=>x.sectionId===s.id).forEach(x=>x.sectionId=a[0].id);break;
   case 'moveup':if(i>0)[a[i-1],a[i]]=[a[i],a[i-1]];break;
   case 'movedown':if(i<a.length-1)[a[i+1],a[i]]=[a[i],a[i+1]];break;
   }save();drawItems()
  });root.appendChild(wrap)
 });
 sectionOptions();
}
const baseDraw=drawItems;
drawItems=function(){ensure();baseDraw();renderSections()};
$('newSection').onclick=()=>{const title=prompt('Nome da nova parte da reunião:','Nova parte');if(!title||!title.trim())return;const s={id:uid(),title:title.trim(),color:sectionColors[currentSections().length%sectionColors.length]};currentSections().push(s);save();drawItems()};
const baseOpen=openEditor;
openEditor=function(x){baseOpen(x);sectionOptions();$('itemSection').value=x?itemSection(x).id:currentSections()[0].id;if($('type').value==='musica')renderMusicPicker()};
$('type').addEventListener('change',()=>{if($('type').value==='musica')renderMusicPicker()});
let folder='Segunda-feira';
function renderMusicPicker(){const folders=$('cronMusicFolders'),tracks=$('cronMusicTracks');if(!folders||!tracks)return;folders.innerHTML=MUSIC_FOLDERS.map(f=>`<button type="button" class="${folder===f?'selected':''}" data-folder="${escapeHtml(f)}">${escapeHtml(f)}</button>`).join('');folders.querySelectorAll('button').forEach(b=>b.onclick=()=>{folder=b.dataset.folder;renderMusicPicker()});const selected=$('musicSelect').value;const found=musicIndex.filter(m=>m.folder===folder);tracks.innerHTML=found.length?found.map(m=>`<button type="button" class="${selected===m.id?'selected':''}" data-id="${m.id}">♫ ${escapeHtml(m.name)}</button>`).join(''):'<p>Esta pasta está vazia. Adicione MP3 pela aba Músicas.</p>';tracks.querySelectorAll('button').forEach(b=>b.onclick=()=>{$('musicSelect').value=b.dataset.id;const m=musicIndex.find(v=>v.id===b.dataset.id);if(m)$('itemTitle').value=m.name;renderMusicPicker()})}
const origRefresh=refreshMusicSelect;refreshMusicSelect=function(){origRefresh();renderMusicPicker()};
$('musicRepeat').onchange=()=>{$('musicAudio').loop=$('musicRepeat').checked};
$('expandPreview').onclick=()=>{const preview=$('preview');preview.classList.toggle('preview-expanded');$('expandPreview').textContent=preview.classList.contains('preview-expanded')?'✕ Reduzir prévia':'⛶ Ampliar prévia'};
// Somente arquivos .mp3, inclusive se o seletor do sistema mostrar outros tipos.
$('musicUploadForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return;const invalid=[...$('musicFiles').files].some(f=>!/\.mp3$/i.test(f.name));if(invalid){e.preventDefault();e.stopImmediatePropagation();alert('Selecione somente arquivos com extensão .mp3.')}},true);
// Adiciona controle de repetição ao vídeo exibido na prévia, sem alterar a apresentação remota.
const repeatVideo=document.createElement('label');repeatVideo.className='repeat-control';repeatVideo.innerHTML='<input id="videoRepeat" type="checkbox"> ↻ Repetir vídeo';$('muteVideo').parentElement.appendChild(repeatVideo);
$('videoRepeat').onchange=()=>{const v=$('preview').querySelector('video');if(v)v.loop=$('videoRepeat').checked};
const priorPresent=present;present=function(x){priorPresent(x);const v=$('preview').querySelector('video');if(v)v.loop=$('videoRepeat').checked};
drawItems();
})();
