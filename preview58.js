/* Prévia 106: o nome desliza até o final e retorna suavemente à posição inicial. */
(()=>{'use strict';
const title=document.getElementById('floatingMusicTitle');if(!title)return;
let viewport=document.getElementById('preview58TitleViewport');
let visible=document.getElementById('preview58TitleText');
if(!viewport){viewport=document.createElement('span');viewport.id='preview58TitleViewport';visible=document.createElement('span');visible.id='preview58TitleText';viewport.append(visible);title.after(viewport)}
let current=null,serial=0,timer=null,frame=0;
function cancel(){clearTimeout(timer);cancelAnimationFrame(frame);}
function schedule(){
 const value=title.textContent.replace(/^[♫♪♬🎵]\s*/u,'').trim();
 if(value===current)return;
 current=value;const id=++serial;cancel();
 visible.style.transition='none';visible.style.transform='translateX(0px)';visible.textContent=value;
 frame=requestAnimationFrame(()=>{if(id!==serial)return;
  const distance=Math.max(0,visible.scrollWidth-viewport.clientWidth+4);if(distance<5)return;
  const seconds=Math.max(3,distance/25);
  timer=setTimeout(()=>{if(id!==serial)return;
   visible.style.transition=`transform ${seconds}s linear`;
   visible.style.transform=`translateX(-${distance}px)`;
   // Pause no fim; retorno suave à posição original, sem salto e sem repetição.
   timer=setTimeout(()=>{if(id!==serial)return;
    visible.style.transition=`transform ${seconds}s linear`;
    visible.style.transform='translateX(0px)';
   },seconds*1000+650);
  },900);
 });
}
new MutationObserver(schedule).observe(title,{childList:true,characterData:true,subtree:true});
window.addEventListener('resize',()=>{current=null;schedule()});
schedule();
})();
