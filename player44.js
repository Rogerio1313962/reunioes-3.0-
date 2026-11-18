/* Prévia 44: biblioteca fixa; cronograma flutuante. */
(()=>{'use strict';const p=document.getElementById('floatingMusic'),h=p?.querySelector('.floating-music-head');if(!p||!h)return;
const library=()=>!!document.getElementById('musicas')?.classList.contains('active');
function update(){const fixed=library();p.classList.toggle('library-fixed',fixed);if(fixed){p.style.left='auto';p.style.right='8px';p.style.top=p.classList.contains('with-lyrics')?'8px':'auto';p.style.bottom=p.classList.contains('with-lyrics')?'auto':'12px';}else{p.style.right='auto';if(!p.style.left||p.style.left==='auto')p.style.left='12px';if(p.classList.contains('with-lyrics')){p.style.top='8px';p.style.bottom='auto';}else if(p.style.top==='8px'){p.style.top='auto';p.style.bottom='12px';}}}
document.querySelectorAll('.nav[data-tab]').forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(update)));
new MutationObserver(()=>requestAnimationFrame(update)).observe(p,{attributes:true,attributeFilter:['class']});
h.addEventListener('pointerdown',e=>{if(library())e.stopImmediatePropagation()},true);
h.addEventListener('pointermove',e=>{if(library())e.stopImmediatePropagation()},true);
window.addEventListener('resize',update);update();})();
