/* Prévia 61: impede gesto de pinça/zoom no iPad Safari; mantém rolagem com um dedo. */
(()=>{ 'use strict';
  function blockPinch(event){ if(event.cancelable) event.preventDefault(); }
  for(const type of ['gesturestart','gesturechange','gestureend']){
    document.addEventListener(type,blockPinch,{passive:false});
  }
  document.addEventListener('touchmove',function(event){
    if(event.touches&&event.touches.length>1&&event.cancelable)event.preventDefault();
  },{passive:false});
})();
