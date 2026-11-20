/* PREVIA 141: versiculos inteiros dentro da tela, referencia separada,
   fonte adaptativa em tela 16:9 e controlador sem ocultar o texto. */
(()=>{'use strict';
 let timer=0;
 const rootSelectors=['#preview','#b119Mirror','#stage'];
 function moveEndReference(verse){
  if(!verse.classList.contains('b120Pos-end'))return;
  const text=verse.querySelector('.b120VerseText');
  if(!text)return;
  const ref=text.querySelector(':scope > .b120Ref');
  if(!ref)return;
  const area=document.createElement('div');area.className='b120RefArea r141RefEnd';
  ref.remove();area.append(ref);verse.append(area);
  // Elimina o espaço em branco que antecedia a referencia incorporada ao texto.
  if(text.lastChild&&text.lastChild.nodeType===Node.TEXT_NODE)text.lastChild.textContent=text.lastChild.textContent.replace(/\s+$/,'');
 }
 function sizeVerse(verse){
  if(!verse.isConnected)return;
  const text=verse.querySelector('.b120VerseText');if(!text)return;
  moveEndReference(verse);
  const refArea=verse.querySelector('.b120RefArea');
  const reference=refArea?.querySelector('.b120Ref');
  const box=verse.getBoundingClientRect();if(box.width<40||box.height<30)return;
  const full=document.getElementById('stage')?.contains(verse)||verse.closest('#stage');
  const maxText=parseFloat(getComputedStyle(verse).getPropertyValue('--b120-tsize'))||58;
  const maxRef=parseFloat(getComputedStyle(verse).getPropertyValue('--b120-rsize'))||30;
  const scaled=full?1:Math.min(1, Math.max(.2,box.width/1000));
  const maxAllowed=Math.min(full?maxText:Math.max(6,maxText*scaled),full?100:46);
  const minAllowed=full?9:3.5;
  const refMax=Math.min(full?maxRef:Math.max(5,maxRef*scaled),full?65:28);
  const pad=box.width*(full?.045:.04);
  // Referencia nunca pode sair do quadro, mesmo nos cantos.
  if(reference){
    let r=Math.max(full?10:5,refMax);
    reference.style.setProperty('font-size',r+'px','important');
    for(let i=0;i<12;i++){
      if(refArea.scrollWidth<=refArea.clientWidth+1&&refArea.scrollHeight<=Math.max(16,r*2.6))break;
      r=Math.max(full?8:4,r*.88);
      reference.style.setProperty('font-size',r+'px','important');
    }
  }
  const h=verse.clientHeight;
  const style=getComputedStyle(verse);
  const paddingTop=parseFloat(style.paddingTop)||0;
  const paddingBottom=parseFloat(style.paddingBottom)||0;
  const reserved=(refArea?.getBoundingClientRect().height||0)+(refArea?Math.max(5,h*.025):0);
  const available=Math.max(12,h-paddingTop-paddingBottom-reserved-3);
  const usableWidth=Math.max(15,verse.clientWidth-(parseFloat(style.paddingLeft)||0)-(parseFloat(style.paddingRight)||0));
  // Garante que a caixa de texto nao invada o rodape reservado para a referencia.
  text.style.setProperty('max-height',available+'px','important');
  text.style.setProperty('max-width',usableWidth+'px','important');
  text.style.setProperty('overflow','visible','important');
  function fits(value){
    text.style.setProperty('font-size',value.toFixed(2)+'px','important');
    return text.scrollHeight<=available+1&&text.scrollWidth<=usableWidth+1;
  }
  let lo=Math.min(minAllowed,maxAllowed),hi=maxAllowed;
  if(!fits(hi)){
    if(!fits(lo)){
      // Para versos extraordinariamente extensos, continua reduzindo ate caber.
      for(let i=0;i<18&&!fits(lo);i++)lo=Math.max(2,lo*.88);
    }
    if(fits(lo))for(let i=0;i<18;i++){
      const middle=(lo+hi)/2;
      if(fits(middle))lo=middle;else hi=middle;
    }
    fits(lo);
  }
  // Versículos de até três linhas ficam no centro visual da área escura,
  // acima da ilustração da Bíblia. A referência permanece independente.
  // Removemos qualquer deslocamento anterior para recalcular corretamente.
  text.style.removeProperty('transform');
  const computed=getComputedStyle(text);
  const lineHeight=parseFloat(computed.lineHeight)||parseFloat(computed.fontSize)*1.16;
  const lineCount=lineHeight>0?Math.ceil((text.scrollHeight-1)/lineHeight):99;
  const textLength=(text.textContent||'').trim().length;
  if(lineCount>=1&&lineCount<=3&&textLength<=260){
    const parentRect=verse.getBoundingClientRect();
    const textRect=text.getBoundingClientRect();
    const centerY=textRect.top-parentRect.top+textRect.height/2;
    const bottomY=textRect.bottom-parentRect.top;
    // O centro desejado é 43% da altura do telão, sem tocar no livro ou na referência.
    const targetY=parentRect.height*.43;
    const remainingAboveImage=Math.max(0,parentRect.height*.72-bottomY);
    const remainingAboveRef=refArea
      ?Math.max(0,refArea.getBoundingClientRect().top-textRect.bottom-8)
      :remainingAboveImage;
    const shift=Math.max(0,Math.min(targetY-centerY,remainingAboveImage,remainingAboveRef,parentRect.height*.095));
    if(shift>.5)text.style.setProperty('transform','translateY('+shift.toFixed(1)+'px)','important');
  }
 }
 function fitAll(){timer=0;for(const selector of rootSelectors){const root=document.querySelector(selector);if(!root)continue;root.querySelectorAll('.b120Verse').forEach(sizeVerse)}}
 function schedule(){if(timer)return;timer=requestAnimationFrame(fitAll)}
 window.ReunioesAutoFit={fitAll,schedule};
 const observer=new MutationObserver(schedule);
 function install(){for(const s of rootSelectors){const root=document.querySelector(s);if(root){observer.observe(root,{childList:true,subtree:true,characterData:true});if(window.ResizeObserver)new ResizeObserver(schedule).observe(root)}}schedule()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
 if(document.fonts?.ready)document.fonts.ready.then(schedule).catch(()=>{});
 window.addEventListener('resize',schedule);
 window.addEventListener('pageshow',schedule);
})();

;
(()=>{'use strict';
const ch=new BroadcastChannel('reunioes3-projetor');const stage=document.getElementById('stage');let seq=0;let active=null;let pdfToken=0;let volume=.25,muted=false;
function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function effect(){try{return JSON.parse(localStorage.getItem('reunioes-transition-v70')||'{}')}catch(e){return {}}}
function markBibleText(raw,ranges,color){const value=String(raw||'');const terms=(Array.isArray(ranges)?ranges:[]).filter(s=>typeof s==='string'&&s.length).sort((a,b)=>b.length-a.length);if(!terms.length)return esc(value);let parts=[{text:value,hit:false}];for(const term of terms){const next=[];for(const part of parts){if(part.hit){next.push(part);continue}let rest=part.text,idx;while((idx=rest.toLocaleLowerCase('pt-BR').indexOf(term.toLocaleLowerCase('pt-BR')))!==-1){if(idx)next.push({text:rest.slice(0,idx),hit:false});next.push({text:rest.slice(idx,idx+term.length),hit:true});rest=rest.slice(idx+term.length)}if(rest)next.push({text:rest,hit:false})}parts=next}return parts.map(p=>p.hit?'<span class="b129Marked" style="color:'+esc(color||'#f0cf72')+'">'+esc(p.text)+'</span>':esc(p.text)).join('')}
function replace(x){let layer=document.createElement('div');layer.className='r70layer';if(!x){return layer}if(x.type==='versiculo'){
 const c=x.refSettings||{refPosition:'below-center',refSize:30,refColor:'#f0cf72',textSize:58,textColor:'#ffffff',textFont:'Arial',refFont:'Arial'};
 const position=['end','below-center','below-left','below-right','bottom-left','bottom-right'].includes(c.refPosition)?c.refPosition:'below-center';
 const css=`--b120-rsize:${Number(c.refSize)||30}px;--b120-tsize:${Number(c.textSize)||58}px;--b120-rcolor:${c.refColor||'#f0cf72'};--b120-tcolor:${c.textColor||'#fff'};--b120-rfont:${JSON.stringify(c.refFont||'Arial')},Arial;--b120-tfont:${JSON.stringify(c.textFont||'Arial')},Arial;--b120-rshadow:${c.refShadow?'0 3px 5px #000c':'none'};--b120-rstroke:${c.refOutline?'1px #000':'0 transparent'};--b120-tshadow:${c.textShadow?'0 3px 7px #000e':'none'};--b120-tstroke:${c.textOutline?'1px #000':'0 transparent'};background:${c.bg==='image'&&c.bgImage?'url('+JSON.stringify(c.bgImage)+') center/cover no-repeat':c.bg==='black'?'#030609':c.bg==='blue'?'#284e70':'#142d48'}`;
 const showTranslation=x.refSettings?.showTranslation!==false;const shortTranslation=String(x.translation||'').toUpperCase().includes('ARA')?'ARA':String(x.translation||'').toUpperCase().includes('ACF')?'ACF':String(x.translation||'').trim();const ref='<span class="b120Ref">'+esc(x.reference)+(showTranslation&&shortTranslation?' <span class="b120Translation">· '+esc(shortTranslation)+'</span>':'')+'</span>';
 layer.innerHTML='<div class="b120Verse b120Pos-'+position+'" style="'+css.replace(/"/g,'&quot;')+'"><div class="b120VerseText">'+markBibleText(x.content,x.highlights,x.refSettings?.refColor)+(position==='end'?' '+ref:'')+'</div>'+(position==='end'?'':'<div class="b120RefArea">'+ref+'</div>')+'</div>';
}
else if(x.type==='texto')layer.innerHTML='<div class="verse">'+esc(x.content)+'</div>';
else if(x.type==='imagem'){const im=document.createElement('img');im.src=x.fileUrl||'';layer.append(im)}
else if(x.type==='video'){const v=document.createElement('video');v.src=x.fileUrl||'';v.style.objectFit='contain';v.style.objectPosition='center center';v.playsInline=true;v.autoplay=true;v.controls=false;v.volume=volume;v.muted=muted;layer.append(v);v.play().catch(()=>{v.muted=true;v.play().catch(()=>{})})}
else if(x.type==='pdf'){const canvas=document.createElement('canvas');canvas.className='r85ProjectorPdf';layer.append(canvas);const token=++pdfToken;(async()=>{try{if(!window.pdfjsLib)throw Error('Leitor PDF indisponível');window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';const doc=await window.pdfjsLib.getDocument({url:x.fileUrl}).promise;const page=await doc.getPage(x.pdfPage||1);if(token!==pdfToken||!canvas.isConnected){await doc.destroy();return}const vp=page.getViewport({scale:1});const scale=Math.min(2,Math.max(.2,Math.min((innerWidth*.92)/vp.width,(innerHeight*.92)/vp.height)));const view=page.getViewport({scale});canvas.width=Math.ceil(view.width);canvas.height=Math.ceil(view.height);await page.render({canvasContext:canvas.getContext('2d',{alpha:false}),viewport:view}).promise;page.cleanup();await doc.destroy()}catch(err){if(canvas.isConnected)canvas.replaceWith(document.createTextNode('Não foi possível renderizar esta página do PDF.'))}})()}return layer}
function transition(x,forceCut){if(x?.type!=='pdf')pdfToken++;const id=++seq;const layer=replace(x);const prev=active;stage.append(layer);const cfg=effect();const how=(x?.type==='versiculo'||forceCut)?'corte':(cfg.effect||'fade');const ms=how==='corte'?0:Math.max(0,Math.min(2500,Number(cfg.duration??300)));if(prev&&ms){layer.style.opacity='0';layer.style.transition='opacity '+ms+'ms ease';if(how==='wipe'){layer.style.transform='translateX(100%)';layer.style.transition+=' ,transform '+ms+'ms ease'}if(how==='merge')prev.style.transition='opacity '+ms+'ms ease';requestAnimationFrame(()=>{layer.style.opacity='1';layer.style.transform='translateX(0)';if(how==='merge')prev.style.opacity='0'})}else{layer.style.opacity='1'}active=layer;setTimeout(()=>{if(id===seq){[...stage.children].filter(e=>e!==layer).forEach(e=>e.remove())}},ms+60)}
ch.onmessage=e=>{const d=e.data||{};if(d.kind==='volume'){volume=d.volume??volume;muted=!!d.muted;const v=stage.querySelector('video');if(v){v.volume=volume;v.muted=muted}return}if(d.kind==='videoControl'){const v=stage.querySelector('video');if(!v)return;if(d.action==='play')v.play().catch(()=>{});if(d.action==='pause')v.pause();if(d.action==='seek'&&Number.isFinite(d.time))v.currentTime=d.time;if(d.action==='repeat')v.loop=!!d.value;return}if(d.kind==='present'){if(Number.isInteger(d.item?.supportDay)){(async()=>{try{const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('reunioes3-apoio-v89',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});const row=await new Promise((resolve,reject)=>{const tx=db.transaction('images','readonly');const req=tx.objectStore('images').get(d.item.supportDay);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});db.close();if(!row?.blob)throw Error('Imagem indisponível');transition({...d.item,fileUrl:URL.createObjectURL(row.blob)},false)}catch(e){transition(null,true)}})();}else if(d.item?.mediaLibraryId){(async()=>{try{const db=await new Promise((res,rej)=>{const req=indexedDB.open('reunioes3-midias-v64',1);req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error)});const row=await new Promise((res,rej)=>{const tx=db.transaction('files');const req=tx.objectStore('files').get(d.item.mediaLibraryId);req.onsuccess=()=>res(req.result);req.onerror=()=>rej(req.error)});db.close();if(!row?.blob)throw Error('Não encontrado nesta biblioteca local');const url=URL.createObjectURL(row.blob);transition({...d.item,fileUrl:url},false)}catch(err){stage.textContent='Mídia indisponível neste navegador. Abra o telão na mesma origem da biblioteca.'}})();}else transition(d.item,d.item?.type==='versiculo')}};
})();
;
