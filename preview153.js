/* Prévia 153: evita o zoom do Safari por toque duplo sem interferir em controles. */
(()=>{'use strict';
 document.addEventListener('dblclick',e=>{if(e.cancelable)e.preventDefault()},{capture:true,passive:false});
})();
