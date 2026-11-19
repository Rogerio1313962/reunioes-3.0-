/* Preview 91 - support image & minimized player dock */
(()=>{'use strict';
 const right=document.querySelector('#agenda .right');const panel=right?.querySelector('.preview');
 if(!right||!panel)return;
 let dock=document.getElementById('r91MinimizedDock');
 if(!dock){dock=document.createElement('div');dock.id='r91MinimizedDock';dock.setAttribute('aria-label','Reabrir apresentações minimizadas');const after=document.getElementById('r91MusicHost');(after||panel).insertAdjacentElement('afterend',dock)}
 ['r71PdfReopen','agenda56Reopen'].forEach(id=>{const b=document.getElementById(id);if(b)dock.append(b)});
 // Support image must remain the background even while a music player is in use.
 window.addEventListener('pageshow',()=>{const pv=document.getElementById('preview');if(pv&&!pv.querySelector('img,video,canvas,.verse')&&!window.R70?.hasActiveMedia?.())void window.R70?.displaySupport?.()});
})();
