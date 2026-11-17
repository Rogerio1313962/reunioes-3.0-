// Preview 14: letras editáveis vinculadas ao MP3, rolagem manual sem seleção, player minimizável.
(function(){
'use strict';
const $=id=>document.getElementById(id);
const music=$('musicList'),float=$('floatingMusic'),audio=$('musicAudio');
if(!music||!float||!audio)return;
const isBackground=f=>['Fundos de Busca','Fundos de Clamor','Fundos de Descarrego'].includes(f);
let activeTrackId=null;
const box=document.createElement('section');box.id='lyricsPanel';box.hidden=true;
box.innerHTML='<div class="lyrics-head"><strong>Letra da música</strong><button type="button" id="lyricsHide">Ocultar letra</button></div><div id="lyricsScroll" tabindex="0" aria-label="Letra da música, deslize para ler"></div>';
float.appendChild(box);
$('lyricsHide').onclick=()=>{box.hidden=true;};
const edit=document.createElement('dialog');edit.id='lyricsEditor';edit.innerHTML='<form method="dialog" id="lyricsForm"><div class="lyrics-head"><h2>Editar letra da música</h2><button type="button" id="lyricsCancel" aria-label="Fechar">✕</button></div><p id="lyricsSongName"></p><label for="lyricsText">Cole ou digite a letra da música</label><textarea id="lyricsText" rows="15" spellcheck="true" placeholder="Digite a letra aqui..."></textarea><div class="lyrics-actions"><button type="button" id="lyricsClear">Apagar letra</button><button type="submit" class="primary">Salvar letra</button></div></form>';
document.body.appendChild(edit);
let editingId=null;
$('lyricsCancel').onclick=()=>edit.close();
$('lyricsClear').onclick=()=>{if(confirm('Apagar a letra desta música?'))$('lyricsText').value='';};
async function getTrack(id){const db=await musicDb();try{return await new Promise((res,rej)=>{const r=db.transaction('tracks','readonly').objectStore('tracks').get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}finally{db.close()}}
async function refreshLyrics(id){if(!id){box.hidden=true;return;}const track=await getTrack(id);if(!track||isBackground(track.folder)){box.hidden=true;return;}const scroll=$('lyricsScroll');scroll.textContent=track.lyrics?.trim()||'Esta música ainda não tem letra cadastrada. Use “Editar letra” na página Músicas.';scroll.scrollTop=0;box.hidden=false;}
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
    if(repeat.textContent!==label)repeat.textContent=label;
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
