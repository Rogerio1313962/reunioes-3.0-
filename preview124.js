/* Prévia 124 — aprimoramentos do telão, controles e nova biblioteca FUNDOS. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// A imagem de apoio selecionada para o dia reaparece depois de encerrar a Bíblia.
if(typeof present==='function'){
  const previousPresent=present;
  present=function(item){const result=previousPresent(item);if(!item){queueMicrotask(()=>{if(!window.R70?.isLive?.()&&!window.R70?.hasActiveMedia?.())window.R70?.displaySupport?.()})}return result};
}
// Caixas do controle limitadas à coluna do telão, nunca sobrepostas à prévia.
for(const v of document.querySelectorAll('.b123Controller')){
 const close=v.querySelector('.b121Close');if(close)close.title='Encerrar e voltar à imagem de apoio';
}
const nav=document.querySelector('.sidebar nav');const settingsButton=nav?.querySelector('[data-tab="ajustes"]');
if(!nav||!settingsButton)return;
const fundosButton=document.createElement('button');fundosButton.className='nav';fundosButton.dataset.tab='fundos';
fundosButton.innerHTML='<span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 8 6 4-6 4V8Z"/></svg></span><span>FUNDOS</span>';
nav.insertBefore(fundosButton,settingsButton);
const section=document.createElement('section');section.id='fundos';section.className='page fundos124';
section.innerHTML=`<div class="f124Layout"><div class="f124Library"><div class="f124Head"><div><span class="f124Kicker">ANTES DAS REUNIÕES</span><h2>Fundos de oração</h2></div><label class="f124Upload">＋ Adicionar vídeos<input type="file" id="f124Upload" accept="video/*,.mp4,.mov,.m4v" multiple hidden></label></div><p class="f124Hint">Escolha um vídeo para preparar e, quando desejar, envie ao telão. Os vídeos ficam armazenados neste navegador.</p><div id="f124Status" class="f124Status" role="status"></div><div id="f124List" class="f124List"></div></div><div class="f124Right"><div class="f124ScreenTitle"><h2>TELÃO SANTUÁRIO</h2><span class="f124Badge">FUNDOS</span></div><div class="f124Screen"><video id="f124Video" playsinline preload="metadata"></video><img id="f124SupportImage" hidden alt="Imagem de apoio do dia"><div id="f124Empty">Nenhuma imagem de apoio definida para este dia</div></div><div class="f124Player"><div class="f147PlayerHeader"><div id="f124Name" class="f124Name">Nenhum vídeo selecionado</div><button type="button" id="f147Close" class="f147Close" aria-label="Fechar vídeo e voltar à imagem de apoio" title="Fechar e voltar à imagem de apoio">×</button></div><div class="f124Actions"><button id="f124Back" title="Voltar ao início">↺</button><button id="f124Play" title="Reproduzir ou pausar">▶</button><button id="f124Repeat" title="Repetir vídeo" aria-pressed="false">↻</button><label class="f124Volume">🔊 <input type="range" id="f124Volume" min="0" max="100" value="50" aria-label="Volume"></label></div><div class="f124Seek"><span id="f124Current">0:00</span><input id="f124Seek" type="range" min="0" max="1000" value="0" aria-label="Avançar vídeo"><span id="f124Duration">0:00</span></div></div></div></div>`;
$('ajustes').insertAdjacentElement('beforebegin',section);
fundosButton.onclick=()=>setTab('fundos');
const video=$('f124Video'),empty=$('f124Empty'),status=$('f124Status'),supportImg=$('f124SupportImage');
let supportUrl=null,supportToken=0;
function releaseSupportImage(){if(supportUrl){URL.revokeObjectURL(supportUrl);supportUrl=null}}
async function refreshSupportImage(){
 const ticket=++supportToken;
 if(selected)return;
 supportImg.hidden=true;
 releaseSupportImage();
 empty.hidden=false;
 const day=typeof state==='undefined'?0:Number(state.day);
 let data=null;
 try{data=JSON.parse(localStorage.getItem('reunioes3-support-v87-day-'+day)||'null')}catch(_){}
 if(!data){empty.textContent='Nenhuma imagem de apoio definida para este dia';return}
 try{
   let blob=null;
   if(data.source==='gallery'){
     const db=await new Promise((resolve,reject)=>{const q=indexedDB.open('reunioes3-apoio-v89',1);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});
     try{blob=await new Promise((resolve,reject)=>{const tx=db.transaction('images','readonly');const q=tx.objectStore('images').get(day);q.onsuccess=()=>resolve(q.result?.blob||null);q.onerror=()=>reject(q.error)})}finally{db.close()}
   }else if(data.id){blob=(await window.ReunioesMediaLibrary.get(data.id))?.blob}
   if(ticket!==supportToken||selected)return;
   if(!blob){empty.textContent='Imagem de apoio indisponível neste iPad';return}
   supportUrl=URL.createObjectURL(blob);
   supportImg.onload=()=>{if(ticket===supportToken&&!selected){empty.hidden=true;supportImg.hidden=false}};
   supportImg.onerror=()=>{if(ticket===supportToken){supportImg.hidden=true;empty.hidden=false;empty.textContent='Não foi possível abrir a imagem de apoio'}};
   supportImg.src=supportUrl;
 }catch(e){if(ticket===supportToken){empty.textContent='Não foi possível carregar a imagem de apoio';console.warn(e)}}
}

const send=(action,extra={})=>channel.postMessage({kind:'videoControl',action,...extra});
const pretty=n=>{n=Number.isFinite(n)?Math.floor(n):0;return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')};
let selected=null,objectUrl=null,live=false,loop=false,loadToken=0;
function sync(){ $('f124Play').textContent=video.paused?'▶':'Ⅱ';$('f124Current').textContent=pretty(video.currentTime);$('f124Duration').textContent=pretty(video.duration);$('f124Seek').value=video.duration?Math.round(video.currentTime/video.duration*1000):0 }
function resetObject(){video.pause();video.removeAttribute('src');video.load();if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;}
async function list(){try{const rows=(await window.ReunioesMediaLibrary.all()).filter(x=>x.type==='video'&&x.day==='Fundos de oração').sort((a,b)=>b.addedAt-a.addedAt);const holder=$('f124List');holder.innerHTML=rows.length?'':'<p class="f124NoFiles">Nenhum fundo adicionado. Use “Adicionar vídeos”.</p>';
for(const row of rows){const card=document.createElement('div');card.className='f124Item'+(selected?.id===row.id?' selected':'');const name=document.createElement('button');name.type='button';name.className='f124Choose';name.textContent='▶  '+row.name;name.onclick=()=>choose(row.id);const del=document.createElement('button');del.type='button';del.className='f124Delete';del.textContent='✕';del.title='Excluir vídeo';del.onclick=async()=>{if(!confirm('Excluir este vídeo de fundo?'))return;if(selected?.id===row.id){await closeVideo();}await deleteRow(row.id);list()};card.append(name,del);holder.append(card)}
}catch(e){status.textContent='Não foi possível abrir a biblioteca de vídeos.'}}
async function deleteRow(id){const db=await new Promise((ok,no)=>{const req=indexedDB.open('reunioes3-midias-v64',1);req.onsuccess=()=>ok(req.result);req.onerror=()=>no(req.error)});await new Promise((ok,no)=>{const t=db.transaction('files','readwrite');t.objectStore('files').delete(id);t.oncomplete=ok;t.onerror=()=>no(t.error)});db.close()}
async function choose(id){const token=++loadToken;try{const row=await window.ReunioesMediaLibrary.get(id);if(token!==loadToken||!row?.blob)return;if(live)await finish();resetObject();selected=row;supportToken++;supportImg.hidden=true;releaseSupportImage();objectUrl=URL.createObjectURL(row.blob);video.src=objectUrl;video.loop=loop;video.volume=Number($('f124Volume').value)/100;empty.hidden=true;$('f124Name').textContent=row.name;status.textContent='Vídeo preparado. Toque em Play para reproduzir no telão.';sync();list()}catch(e){status.textContent='Não foi possível carregar este vídeo.'}}
async function finish(){
 if(live){video.pause();channel.postMessage({kind:'present',item:null});live=false}
 status.textContent='Apresentação encerrada.';
 await window.R70?.displaySupport?.();
 sync();
}
async function closeVideo(){
 ++loadToken;
 if(live)await finish();
 resetObject();
 selected=null;
 $('f124Name').textContent='Nenhum vídeo selecionado';
 status.textContent='';
 sync();
 await refreshSupportImage();
 list();
}
async function beginLive(){
 if(!selected||live)return;
 if(window.R70?.hasActiveMedia?.())window.R70.close();
 if(typeof present==='function'&&window.current?.type==='versiculo')present(null);
 channel.postMessage({kind:'present',item:{type:'video',title:selected.name,mediaLibraryId:selected.id}});
 live=true;
 status.textContent='Vídeo transmitido no telão.';
 send('repeat',{value:loop});
 channel.postMessage({kind:'volume',volume:video.volume,muted:video.volume===0});
}
$('f124Upload').onchange=async e=>{const files=Array.from(e.target.files||[]);if(!files.length)return;status.textContent='Salvando vídeos no iPad…';let count=0;for(const file of files){if(!file.type.startsWith('video/')&&!/\.(mp4|mov|m4v)$/i.test(file.name))continue;try{await window.ReunioesMediaLibrary.put({id:crypto.randomUUID(),name:file.name,type:'video',day:'Fundos de oração',addedAt:Date.now()+count,blob:file});count++}catch(err){status.textContent='Alguns vídeos não puderam ser salvos. Verifique o espaço do aparelho.';break}}e.target.value='';if(count)status.textContent=count+' vídeo(s) salvos neste aparelho.';list()};
$('f147Close').onclick=closeVideo;
$('f124Play').onclick=async()=>{if(!selected)return;if(video.paused){await beginLive();try{await video.play();setTimeout(()=>{if(live&&!video.paused)send('play')},350)}catch(e){status.textContent='Toque em Play para iniciar o vídeo.'}}else{video.pause()}};
$('f124Back').onclick=()=>{if(!selected)return;video.currentTime=0;if(live)send('seek',{time:0});sync()};
$('f124Repeat').onclick=()=>{loop=!loop;video.loop=loop;$('f124Repeat').setAttribute('aria-pressed',String(loop));if(live)send('repeat',{value:loop})};
$('f124Volume').oninput=e=>{video.volume=Number(e.target.value)/100;if(live)channel.postMessage({kind:'volume',volume:video.volume,muted:video.volume===0})};
$('f124Seek').oninput=e=>{if(!video.duration)return;video.currentTime=video.duration*Number(e.target.value)/1000;if(live)send('seek',{time:video.currentTime});sync()};
video.onplay=()=>{sync();if(live)send('play')};video.onpause=()=>{sync();if(live)send('pause')};video.ontimeupdate=sync;video.onloadedmetadata=sync;video.onended=()=>{sync();if(live&&!loop)closeVideo()};
fundosButton.addEventListener('click',()=>{if(!selected)refreshSupportImage()});
document.addEventListener('click',e=>{if(e.target.closest('#days [data-day]'))queueMicrotask(()=>{if(!selected)refreshSupportImage()})},true);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!selected)refreshSupportImage()});
refreshSupportImage();
list();
})();
