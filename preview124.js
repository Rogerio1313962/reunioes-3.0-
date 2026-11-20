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
section.innerHTML=`<div class="f124Layout"><div class="f124Library"><div class="f124Head"><div><span class="f124Kicker">ANTES DAS REUNIÕES</span><h2>Fundos de oração</h2></div><label class="f124Upload">＋ Adicionar vídeos<input type="file" id="f124Upload" accept="video/*,.mp4,.mov,.m4v" multiple hidden></label></div><p class="f124Hint">Escolha um vídeo para preparar e, quando desejar, envie ao telão. Os vídeos ficam armazenados neste navegador.</p><div id="f124Status" class="f124Status" role="status"></div><div id="f124List" class="f124List"></div></div><div class="f124Right"><div class="f124ScreenTitle"><h2>FUNDOS ANTES DA REUNIÃO</h2><span id="f124Badge" class="f124Badge" hidden aria-live="polite"><span class="f153LiveDot" aria-hidden="true"></span> AO VIVO</span></div><div class="f124Screen"><video id="f124Video" playsinline preload="auto"></video><img id="f153VideoStill" hidden alt="Prévia do vídeo selecionado"><img id="f124SupportImage" hidden alt="Imagem de apoio do dia"><div id="f124Empty">Nenhuma imagem de apoio definida para este dia</div></div><div class="f124Player"><div class="f147PlayerHeader"><div id="f124Name" class="f124Name">Nenhum vídeo selecionado</div><button type="button" id="f147Close" class="f147Close" aria-label="Fechar vídeo e voltar à imagem de apoio" title="Fechar e voltar à imagem de apoio">×</button></div><div class="f124Actions"><button id="f124Back" title="Voltar ao início">↺</button><button id="f124Play" title="Reproduzir ou pausar">▶</button><button id="f124Repeat" title="Repetir vídeo" aria-pressed="false">↻</button><div class="f124Volume"><button type="button" id="f150Mute" class="f150Mute" aria-label="Silenciar vídeo" title="Silenciar vídeo"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg></button><input type="range" id="f124Volume" min="0" max="100" value="50" aria-label="Volume"></div></div><div class="f124Seek"><span id="f124Current">0:00</span><input id="f124Seek" type="range" min="0" max="1000" value="0" aria-label="Avançar vídeo"><span id="f124Duration">0:00</span></div></div></div></div>`;
$('ajustes').insertAdjacentElement('beforebegin',section);
fundosButton.onclick=()=>setTab('fundos');
const video=$('f124Video'),empty=$('f124Empty'),status=$('f124Status'),supportImg=$('f124SupportImage'),still=$('f153VideoStill');
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
function syncBadge(){
 const badge=$('f124Badge');
 if(!badge)return;
 badge.innerHTML='<span class="f153LiveDot" aria-hidden="true"></span> AO VIVO';
 badge.hidden=!live;
 badge.classList.toggle('f124BadgeLive',live);
 badge.setAttribute('aria-label',live?'Vídeo ao vivo no telão':'Vídeo preparado apenas no iPad');
}
syncBadge();
function sync(){
 $('f124Play').textContent=video.paused?'▶':'Ⅱ';
 const duration=Number.isFinite(video.duration)?video.duration:0;
 const t=Number.isFinite(video.currentTime)?video.currentTime:0;
 $('f124Current').textContent=pretty(t);$('f124Duration').textContent=pretty(duration);
 const fraction=duration>0?Math.max(0,Math.min(1,t/duration)):0;
 const seek=$('f124Seek');seek.value=Math.round(fraction*1000);seek.style.setProperty('--seek-pct',(fraction*100)+'%');
} 
function resetObject(){video.pause();still.hidden=true;still.removeAttribute('src');video.removeAttribute('poster');video.removeAttribute('src');video.load();if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;}
const thumbCache=new Map();
const thumbPending=new Map();
let thumbnailQueue=Promise.resolve();
let listEpoch=0;
function showThumb(slot,uri){
 if(!slot)return;
 if(!uri){slot.replaceChildren();const label=document.createElement('span');label.className='f151NoThumb';label.textContent='▶';const note=document.createElement('small');note.textContent='Prévia indisponível';slot.append(label,note);return;}
 const im=document.createElement('img');im.src=uri;im.alt='Prévia do vídeo';slot.replaceChildren(im);
}
function capturePreview(row,slot){
 const key=row.id;
 if(thumbCache.has(key)){showThumb(slot,thumbCache.get(key));return}
 if(thumbPending.has(key)){thumbPending.get(key).then(uri=>{if(slot.isConnected)showThumb(slot,uri)});return}
 const task=thumbnailQueue.catch(()=>{}).then(()=>new Promise(resolve=>{
  if(!row.blob){resolve(null);return}
  const url=URL.createObjectURL(row.blob),v=document.createElement('video');
  v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');
  v.preload='auto';v.style.cssText='position:absolute;width:2px;height:2px;opacity:0;pointer-events:none';
  // Anexar o elemento ajuda o Safari do iPad a decodificar quadros de MOV/HEVC.
  document.body.append(v);
  let done=false,attempt=0;
  const waiters=[];
  function cleanup(){for(const x of waiters)clearTimeout(x);v.pause();v.removeAttribute('src');v.load();v.remove();URL.revokeObjectURL(url)}
  function finish(uri){if(done)return;done=true;cleanup();resolve(uri||null)}
  function viableFrame(){
   if(v.videoWidth<2||v.videoHeight<2||v.readyState<2)return null;
   try{
    const c=document.createElement('canvas');c.width=224;c.height=126;
    const ctx=c.getContext('2d',{willReadFrequently:true});if(!ctx)return null;
    ctx.fillStyle='#061624';ctx.fillRect(0,0,224,126);
    const scale=Math.min(224/v.videoWidth,126/v.videoHeight);
    const w=Math.round(v.videoWidth*scale),h=Math.round(v.videoHeight*scale);
    ctx.drawImage(v,Math.round((224-w)/2),Math.round((126-h)/2),w,h);
    // Ignorar quadros ainda não decodificados (pretos/sem informação).
    const pixel=ctx.getImageData(Math.round((224-w)/2),Math.round((126-h)/2),Math.max(1,w),Math.max(1,h)).data;
    let bright=0,variation=0,prior=-1,count=0;
    for(let i=0;i<pixel.length;i+=Math.max(4,Math.floor(pixel.length/3200/4)*4)){
     const lum=(pixel[i]*.2126+pixel[i+1]*.7152+pixel[i+2]*.0722);
     bright+=lum;if(prior>=0)variation+=Math.abs(lum-prior);prior=lum;count++;
    }
    if(count<3||bright/count<7||variation/count<1.9)return null;
    return c.toDataURL('image/jpeg',.78)
   }catch(e){return null}
  }
  function next(){
   if(done)return;
   if(attempt>=6){finish(null);return}
   const duration=Number.isFinite(v.duration)&&v.duration>0?v.duration:0;
   const times=duration>0?[Math.min(.8,duration*.15),Math.min(2,duration*.32),Math.min(4,duration*.53),Math.min(6,duration*.72),Math.min(.1,duration*.04),Math.max(0,duration-.2)]:[.25,.8,1.4,2.3,3.5,5];
   const target=times[attempt++];
   if(Math.abs(v.currentTime-target)<.035){onFrame();return}
   try{v.currentTime=target}catch(e){waiters.push(setTimeout(onFrame,300))}
   waiters.push(setTimeout(onFrame,900));
  }
  function onFrame(){
   if(done)return;
   if(v.requestVideoFrameCallback){
    try{v.requestVideoFrameCallback(()=>{if(done)return;const uri=viableFrame();if(uri)finish(uri);else next()});
      waiters.push(setTimeout(()=>{if(done)return;const uri=viableFrame();if(uri)finish(uri);else next()},350));return
    }catch(e){}
   }
   const uri=viableFrame();if(uri)finish(uri);else next();
  }
  let started=false;
  function start(){if(done||started)return;started=true;next()}
  v.addEventListener('loadedmetadata',start,{once:true});
  v.addEventListener('loadeddata',start,{once:true});
  v.addEventListener('seeked',onFrame);
  v.addEventListener('error',()=>finish(null),{once:true});
  waiters.push(setTimeout(()=>finish(null),14000));
  v.src=url;v.load();
 }));
 thumbnailQueue=task.then(()=>new Promise(done=>setTimeout(done,80)));
 thumbPending.set(key,task);
 task.then(uri=>{thumbCache.set(key,uri);thumbPending.delete(key);if(slot.isConnected)showThumb(slot,uri)});
}
async function list(){try{const rows=(await window.ReunioesMediaLibrary.all()).filter(x=>x.type==='video'&&x.day==='Fundos de oração').sort((a,b)=>b.addedAt-a.addedAt);const holder=$('f124List');holder.innerHTML=rows.length?'':'<p class="f124NoFiles">Nenhum fundo adicionado. Use “Adicionar vídeos”.</p>';
for(const row of rows){const card=document.createElement('div');card.className='f124Item'+(selected?.id===row.id?' selected':'');const name=document.createElement('button');name.type='button';name.className='f124Choose';const preview=document.createElement('span');preview.className='f150Thumb';preview.textContent='▶';const title=document.createElement('span');title.className='f150Title';title.textContent=row.name;name.append(preview,title);name.onclick=()=>choose(row.id);const del=document.createElement('button');del.type='button';del.className='f124Delete';del.textContent='✕';del.title='Excluir vídeo';del.onclick=async()=>{if(!confirm('Excluir este vídeo de fundo?'))return;if(selected?.id===row.id){await closeVideo();}await deleteRow(row.id);thumbCache.delete(row.id);thumbPending.delete(row.id);list()};card.append(name,del);holder.append(card);if(row.blob)capturePreview(row,preview);else showThumb(preview,null)}
}catch(e){status.textContent='Não foi possível abrir a biblioteca de vídeos.'}}
async function deleteRow(id){const db=await new Promise((ok,no)=>{const req=indexedDB.open('reunioes3-midias-v64',1);req.onsuccess=()=>ok(req.result);req.onerror=()=>no(req.error)});await new Promise((ok,no)=>{const t=db.transaction('files','readwrite');t.objectStore('files').delete(id);t.oncomplete=ok;t.onerror=()=>no(t.error)});db.close()}
function refreshSelectedPoster(row, token){
 still.hidden=true;still.removeAttribute('src');
 const apply=uri=>{
  if(token!==loadToken||!selected||selected.id!==row.id||live)return;
  if(uri){still.src=uri;still.hidden=false;video.poster=uri;}
  else{still.hidden=true;video.removeAttribute('poster');}
 };
 if(thumbCache.has(row.id)){apply(thumbCache.get(row.id));return;}
 if(!thumbPending.has(row.id))capturePreview(row,document.createElement('span'));
 const pending=thumbPending.get(row.id);
 if(pending)pending.then(apply).catch(()=>apply(null));
}
async function choose(id){const token=++loadToken;try{const row=await window.ReunioesMediaLibrary.get(id);if(token!==loadToken||!row?.blob)return;if(live)await finish();resetObject();selected=row;supportToken++;supportImg.hidden=true;releaseSupportImage();objectUrl=URL.createObjectURL(row.blob);video.preload='auto';video.src=objectUrl;video.style.objectFit='contain';video.style.objectPosition='center center';video.loop=loop;video.volume=Number($('f124Volume').value)/100;video.load();empty.hidden=true;refreshSelectedPoster(row,token);$('f124Name').textContent=row.name;status.textContent='Vídeo preparado no iPad. Toque em Play para reproduzir no telão.';syncBadge();sync();list()}catch(e){status.textContent='Não foi possível carregar este vídeo.'}}
async function finish(){
 if(live){video.pause();channel.postMessage({kind:'present',item:null});live=false}
 status.textContent='Apresentação encerrada. O vídeo voltou a ficar apenas no iPad.';
 syncBadge();
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
 syncBadge();
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
 still.hidden=true;
 syncBadge();
 status.textContent='Vídeo transmitido no telão.';
 send('repeat',{value:loop});
 channel.postMessage({kind:'volume',volume:video.volume,muted:video.volume===0});
}
$('f124Upload').onchange=async e=>{const files=Array.from(e.target.files||[]);if(!files.length)return;status.textContent='Salvando vídeos no iPad…';let count=0;for(const file of files){if(!file.type.startsWith('video/')&&!/\.(mp4|mov|m4v)$/i.test(file.name))continue;try{await window.ReunioesMediaLibrary.put({id:crypto.randomUUID(),name:file.name,type:'video',day:'Fundos de oração',addedAt:Date.now()+count,blob:file});count++}catch(err){status.textContent='Alguns vídeos não puderam ser salvos. Verifique o espaço do aparelho.';break}}e.target.value='';if(count)status.textContent=count+' vídeo(s) salvos neste aparelho.';list()};
$('f147Close').onclick=closeVideo;
$('f124Play').onclick=async()=>{if(!selected)return;if(video.paused){await beginLive();try{await video.play();setTimeout(()=>{if(live&&!video.paused)send('play')},350)}catch(e){status.textContent='Toque em Play para iniciar o vídeo.'}}else{video.pause()}};
$('f124Back').onclick=()=>{if(!selected)return;video.currentTime=0;if(live)send('seek',{time:0});sync()};
$('f124Repeat').onclick=()=>{loop=!loop;video.loop=loop;$('f124Repeat').setAttribute('aria-pressed',String(loop));if(live)send('repeat',{value:loop})};
const f150Mute=$('f150Mute');
function setMuteUi(){const muted=video.muted||video.volume===0;f150Mute.classList.toggle('muted',muted);f150Mute.setAttribute('aria-label',muted?'Ativar som':'Silenciar vídeo');f150Mute.title=muted?'Ativar som':'Silenciar vídeo'}
f150Mute.onclick=()=>{video.muted=!video.muted;setMuteUi();if(live)channel.postMessage({kind:'volume',volume:video.volume,muted:video.muted})};
$('f124Volume').oninput=e=>{video.volume=Number(e.target.value)/100;video.muted=video.volume===0;setMuteUi();if(live)channel.postMessage({kind:'volume',volume:video.volume,muted:video.muted})};
setMuteUi();
$('f124Seek').oninput=e=>{if(!video.duration)return;video.currentTime=Number(e.target.value)>=1000?video.duration:video.duration*Number(e.target.value)/1000;if(live)send('seek',{time:video.currentTime});sync()};
video.onplay=()=>{still.hidden=true;sync();if(live)send('play')};video.onpause=()=>{sync();if(live)send('pause')};video.ontimeupdate=sync;video.onloadedmetadata=()=>{sync();if(selected&&!live&&video.duration>.2){try{video.currentTime=Math.min(.25,video.duration*.08)}catch(_){}}};video.onended=()=>{sync();if(live&&!loop)closeVideo()};
fundosButton.addEventListener('click',()=>{if(!selected)refreshSupportImage()});
document.addEventListener('click',e=>{if(e.target.closest('#days [data-day]'))queueMicrotask(()=>{if(!selected)refreshSupportImage()})},true);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!selected)refreshSupportImage()});
// Evite ler todos os arquivos de vídeo e decodificar miniaturas antes da visita à aba FUNDOS.
let firstFundosVisit=true;
fundosButton.addEventListener('click',()=>{
 if(!firstFundosVisit)return;
 firstFundosVisit=false;
 setTimeout(()=>{void list();if(!selected)void refreshSupportImage();},0);
});
})();
