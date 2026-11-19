/* PREVIA 101 — reforço de visibilidade dos controles por tela e cabeçalho de vídeo. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const controls=$('r70MediaControls');
function refresh(){
 const agenda=document.querySelector('#agenda.page.active');
 // Os botões pertencem apenas à tela de cronograma.
 const support=$('r88SupportBar');
 if(support){support.classList.toggle('r101NotAgenda',!agenda);}
 const typeVideo=controls&&!controls.hidden&&!$('r70VideoControls')?.hidden;
 controls?.classList.toggle('r101VideoMode',!!typeVideo);
}
const css=document.createElement('style');css.textContent='#agenda #r88SupportBar.r101NotAgenda{display:none!important}';document.head.append(css);
const observer=new MutationObserver(()=>requestAnimationFrame(refresh));
if(controls)observer.observe(controls,{attributes:true,attributeFilter:['hidden']});
if($('r70VideoControls'))observer.observe($('r70VideoControls'),{attributes:true,attributeFilter:['hidden']});
document.querySelectorAll('.page').forEach(page=>observer.observe(page,{attributes:true,attributeFilter:['class']}));
refresh();
})();
