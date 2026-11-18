/* Prévia 58: título longo, passagem automática única, não altera a reprodução. */
(()=>{'use strict';
const title=document.getElementById('floatingMusicTitle');
if(!title)return;
const viewport=document.createElement('span');viewport.id='preview58TitleViewport';
const visible=document.createElement('span');visible.id='preview58TitleText';
viewport.append(visible);title.after(viewport);
let current='',serial=0,startTimer=null,frame=0;
function update(){
  const value=title.textContent.replace(/^[♫♪♬🎵]\s*/u,'').trim();
  if(value===current)return;
  current=value;const serialNow=++serial;
  clearTimeout(startTimer);cancelAnimationFrame(frame);
  visible.style.transition='none';visible.style.transform='translateX(0px)';
  visible.textContent=value;
  frame=requestAnimationFrame(()=>{
    if(serialNow!==serial)return;
    const distance=Math.max(0,visible.scrollWidth-viewport.clientWidth+3);
    if(!distance)return;
    startTimer=setTimeout(()=>{
      if(serialNow!==serial)return;
      visible.style.transition='transform '+Math.max(4,distance/26)+'s linear';
      visible.style.transform='translateX(-'+distance+'px)';
    },1100);
  });
}
new MutationObserver(update).observe(title,{childList:true,characterData:true,subtree:true});
window.addEventListener('resize',()=>{current='';update()});
update();
})();
