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
  // Mantem centragem do texto e referencia completamente separada.
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
