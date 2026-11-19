/* PREVIA 101 — reforço de visibilidade dos controles por tela e cabeçalho de vídeo. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const controls=$('r70MediaControls');
function refresh(){
 const typeVideo=controls&&!controls.hidden&&!$('r70VideoControls')?.hidden;
 controls?.classList.toggle('r101VideoMode',!!typeVideo);
}
const observer=new MutationObserver(()=>requestAnimationFrame(refresh));
if(controls)observer.observe(controls,{attributes:true,attributeFilter:['hidden']});
if($('r70VideoControls'))observer.observe($('r70VideoControls'),{attributes:true,attributeFilter:['hidden']});
document.querySelectorAll('.page').forEach(page=>observer.observe(page,{attributes:true,attributeFilter:['class']}));
refresh();
})();
