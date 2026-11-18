// Preview 14: letras editáveis vinculadas ao MP3, rolagem manual sem seleção, player minimizável.
(function(){
'use strict';
const $=id=>document.getElementById(id);
const music=$('musicList'),float=$('floatingMusic'),audio=$('musicAudio');
if(!music||!float||!audio)return;
const isBackground=f=>['Fundos de Busca','Fundos de Clamor','Fundos de Descarrego'].includes(f);
let activeTrackId=null;
const box=document.createElement('section');box.id='lyricsPanel';box.hidden=true;
box.innerHTML='<div class="lyrics-head"><strong>Letra da música</strong><div class="lyrics-head-actions"><button type="button" id="lyricsEditInline">✎ Editar</button><button type="button" id="lyricsHide">Ocultar letra</button></div></div><div id="lyricsScroll" tabindex="0" aria-label="Letra da música, deslize para ler"></div>';
float.appendChild(box);
$('lyricsHide').onclick=()=>{box.hidden=true;};
const edit=document.createElement('dialog');edit.id='lyricsEditor';edit.innerHTML='<form method="dialog" id="lyricsForm"><div class="lyrics-head"><h2>Editar letra da música</h2><button type="button" id="lyricsCancel" aria-label="Fechar">✕</button></div><p id="lyricsSongName"></p><label for="lyricsText">Cole ou digite a letra da música</label><p class="lyrics-auto-hint">O refrão é destacado automaticamente quando a letra contém uma indicação como [Refrão], (Refrão), REFRAO ou Refrão 2x.</p><textarea id="lyricsText" rows="15" spellcheck="true" placeholder="Digite a letra aqui..."></textarea><div class="lyrics-edit-tools"><button type="button" id="lyricsHighlight">Destacar seleção</button><button type="button" id="lyricsUnhighlight">Retirar destaque</button><small>Selecione o texto na caixa acima e toque em Destacar. O destaque ficará igual ao refrão.</small></div><div class="lyrics-actions"><button type="button" id="lyricsClear">Apagar letra</button><button type="submit" class="primary">Salvar letra</button></div></form>';
document.body.appendChild(edit);
let editingId=null;
$('lyricsCancel').onclick=()=>edit.close();
async function openActiveLyricsEditor(){if(!activeTrackId)return;const track=await getTrack(activeTrackId);if(!track||isBackground(track.folder))return;editingId=activeTrackId;$('lyricsSongName').textContent=track.groupTitle||track.name;$('lyricsText').value=track.lyrics||'';edit.showModal();}
$('lyricsEditInline').onclick=openActiveLyricsEditor;
function wrapSelectedHighlight(){const field=$('lyricsText');const a=field.selectionStart,b=field.selectionEnd;if(a===b){alert('Primeiro selecione o título, refrão ou trecho da letra que deseja destacar.');field.focus();return;}const selected=field.value.slice(a,b);field.setRangeText('[[DESTAQUE]]'+selected+'[[/DESTAQUE]]',a,b,'select');field.focus();}
$('lyricsHighlight').onclick=wrapSelectedHighlight;
$('lyricsUnhighlight').onclick=()=>{const field=$('lyricsText');const a=field.selectionStart,b=field.selectionEnd;const raw=field.value;const selected=raw.slice(a,b);if(a!==b){field.setRangeText(selected.replace(/\[\[\/?DESTAQUE\]\]/gi,''),a,b,'select');}else{field.value=raw.replace(/\[\[\/?DESTAQUE\]\]/gi,'');}field.focus();};
$('lyricsClear').onclick=()=>{if(confirm('Apagar a letra desta música?'))$('lyricsText').value='';};
async function getTrack(id){const db=await musicDb();try{return await new Promise((res,rej)=>{const r=db.transaction('tracks','readonly').objectStore('tracks').get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}finally{db.close()}}
// Formatação apenas visual: o texto original salvo não é modificado nem interpretado como HTML.
// Aceita indicadores isolados com símbolos/emoji e repetição 2x, x2 etc.
function isChorusMarker(line){
 const clean=String(line).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/\[\[\/?REFRAO\]\]/gi,'')
  .replace(/[^a-zA-Z0-9\s]/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
 return /^refrao(?:\s+(?:x\s*\d+|\d+\s*x))?$/.test(clean);
}
function normalizedTitle(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\.[a-z0-9]{2,5}$/,'').replace(/[^a-z0-9]+/g,' ').trim();}
function titleMatches(line, name){
 const a=normalizedTitle(line), b=normalizedTitle(name);
 if(!a||!b||a.length<4)return false;
 // Aceita nome exato ou nome seguido por identificador entre parênteses, como (P)/(T).
 return a===b || (b.startsWith(a+' ') && b.slice(a.length+1).split(' ').length<=2 && /^[a-z0-9 ]+$/.test(b.slice(a.length+1)));
}
function renderLyrics(target, raw, trackName, groupTitle){
 target.replaceChildren();
 const lines=String(raw).replace(/\r\n?/g,'\n').split('\n');
 let chorus=false, hasVerse=false, nonEmptyBefore=0, manual=false;
 const firstNonEmpty=lines.findIndex(x=>x.trim());
 for(let i=0;i<lines.length;i++){
  const original=lines[i];
  const line=original.replace(/\[\[\/?REFRAO\]\]/gi,'');
  const plain=line.replace(/\[\[\/?DESTAQUE\]\]/gi,'');
  const marker=isChorusMarker(plain);
  if(marker){chorus=true;hasVerse=false;}
  else if(!plain.trim()&&chorus&&hasVerse){chorus=false;}
  const trimmed=plain.trim();
  const isFirst=i===firstNonEmpty;
  const obviousHeading=isFirst&&trimmed.length>=3&&trimmed.length<=80&&/^[^a-záàâãéêíóôõúç]*[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][^a-záàâãéêíóôõúç]*$/.test(trimmed)&&!/[.!?]$/.test(trimmed);
  const isTitle=!chorus&&!marker&&nonEmptyBefore<2&&(titleMatches(plain,groupTitle||'')||titleMatches(plain,trackName)||obviousHeading);
  if(trimmed)nonEmptyBefore++;
  const defaultHighlight=isTitle||(chorus&&!!trimmed);
  const parts=line.split(/(\[\[\/?DESTAQUE\]\])/gi);
  for(const part of parts){
   if(/^\[\[DESTAQUE\]\]$/i.test(part)){manual=true;continue;}
   if(/^\[\[\/DESTAQUE\]\]$/i.test(part)){manual=false;continue;}
   if(!part)continue;
   if(manual||defaultHighlight){const el=document.createElement('strong');el.className=manual?'lyrics-manual-highlight':isTitle?'lyrics-song-title':'lyrics-chorus';el.textContent=part;target.appendChild(el);}
   else target.appendChild(document.createTextNode(part));
  }
  if(chorus&&!marker&&trimmed)hasVerse=true;
  if(i<lines.length-1)target.appendChild(document.createTextNode('\n'));
 }
}

async function refreshLyrics(id){if(!id){box.hidden=true;return;}const track=await getTrack(id);if(!track||isBackground(track.folder)||!track.lyrics?.trim()){box.hidden=true;return;}const scroll=$('lyricsScroll');renderLyrics(scroll,track.lyrics.trim(),track.name,track.groupTitle);scroll.scrollTop=0;box.hidden=false;}
$('lyricsForm').onsubmit=async e=>{e.preventDefault();const id=editingId;if(!id)return;const track=await getTrack(id);if(!track)return;track.lyrics=$('lyricsText').value;await musicPut(track);edit.close();if(activeTrackId===id)await refreshLyrics(id);};
function addEditButtons(){music.querySelectorAll('.music-track').forEach(row=>{const id=row.querySelector('[data-play]')?.dataset.play;if(!id||row.querySelector('[data-edit-lyrics]'))return;const meta=musicIndex.find(m=>m.id===id);if(!meta||isBackground(meta.folder))return;const btn=document.createElement('button');btn.type='button';btn.textContent='✎ Editar letra';btn.dataset.editLyrics=id;btn.onclick=async()=>{const track=await getTrack(id);if(!track)return;editingId=id;$('lyricsSongName').textContent=track.name;$('lyricsText').value=track.lyrics||'';edit.showModal();};row.appendChild(btn);});}
// drawMusic é invocado pela aba, carregamentos e alterações de pastas.
const oldDraw=drawMusic;drawMusic=function(){oldDraw();addEditButtons()};addEditButtons();
// A música continua tocando ao trocar de aba ou minimizar o player.
const oldPlay=playMusic;playMusic=async function(id){activeTrackId=id;await oldPlay(id);await refreshLyrics(id);};
// Ao minimizar, oculta-se também a letra; ao restaurar, ela retorna sem reiniciar o áudio.
// O botão de minimizar da versão anterior mantém o áudio ativo.
const oldClose=$('floatingMusicClose').onclick;
$('floatingMusicClose').onclick=function(e){oldClose?.call(this,e);};
// Repetição visual simples e acessível.
const repeat=$('floatingRepeat');
if(repeat){
  repeat.title='Repetir música';
  repeat.setAttribute('aria-label','Ativar ou desativar repetição');
  // Não observar alterações de texto feitas pelo próprio observador: isso causava loop infinito no Safari.
  function syncRepeat(){
    const label=audio.loop?'↻ Repetir ligado':'↻ Repetir desligado';
    repeat.classList.toggle('is-on',audio.loop);
    // Ícone premium controlado pelo sincronizador; não substituir por texto.
  }
  repeat.addEventListener('click',()=>requestAnimationFrame(syncRepeat));
  $('musicRepeatButton')?.addEventListener('click',()=>requestAnimationFrame(syncRepeat));
  syncRepeat();
}
})();

// Prévia 15: painel de letra expansível, reversível e arrastável por toque.
(function(){
'use strict';
const player=document.getElementById('floatingMusic');
const lyrics=document.getElementById('lyricsPanel');
const hide=document.getElementById('lyricsHide');
const head=player?.querySelector('.floating-music-head');
if(!player||!lyrics||!hide||!head)return;
const toggle=document.createElement('button');toggle.type='button';toggle.id='lyricsShow';toggle.textContent='Mostrar letra';toggle.hidden=true;
player.querySelector('.floating-music-controls')?.after(toggle);
function update(){const available=!!document.getElementById('lyricsScroll')?.textContent?.trim()&&document.getElementById('lyricsScroll').textContent.indexOf('ainda não tem letra cadastrada')===-1;
 player.classList.toggle('with-lyrics',!lyrics.hidden);
 toggle.hidden=!lyrics.hidden||!available;
 hide.textContent='Ocultar letra';
 constrain();}
hide.addEventListener('click',()=>requestAnimationFrame(update));
toggle.addEventListener('click',()=>{lyrics.hidden=false;update();});
// Preserva a ação original de tocar, que preenche o painel assincronamente.
const watcher=new MutationObserver(()=>update());watcher.observe(lyrics,{attributes:true,attributeFilter:['hidden']});
head.setAttribute('aria-label','Arraste esta barra para mover o player');head.title='Segure e arraste para mover';
let moving=null;
function constrain(){if(!player.style.left)return;const r=player.getBoundingClientRect();const x=Math.max(0,Math.min(innerWidth-r.width,parseFloat(player.style.left)||0));const y=Math.max(0,Math.min(innerHeight-r.height,parseFloat(player.style.top)||0));player.style.left=x+'px';player.style.top=y+'px';}
head.addEventListener('pointerdown',e=>{if(e.target.closest('button')||e.button!==0)return;const r=player.getBoundingClientRect();moving={id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top};head.setPointerCapture(e.pointerId);player.style.left=r.left+'px';player.style.top=r.top+'px';player.style.right='auto';player.style.bottom='auto';e.preventDefault();});
head.addEventListener('pointermove',e=>{if(!moving||moving.id!==e.pointerId)return;const x=Math.max(0,Math.min(innerWidth-player.offsetWidth,e.clientX-moving.dx));const y=Math.max(0,Math.min(innerHeight-player.offsetHeight,e.clientY-moving.dy));player.style.left=x+'px';player.style.top=y+'px';});
const end=()=>{moving=null;};head.addEventListener('pointerup',end);head.addEventListener('pointercancel',end);
window.addEventListener('resize',constrain);
update();
})();
