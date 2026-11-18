/* Preview 48: animated golden equalizer, active audio variant and stable playback icon. */
(()=>{'use strict';
 const player=document.getElementById('floatingMusic'),audio=document.getElementById('musicAudio'),bar=document.getElementById('groupVersionBar');
 if(!player||!audio)return;
 const head=player.querySelector('.floating-music-head');
 if(head&&!head.querySelector('.gold-equalizer')){
  const el=document.createElement('span');el.className='gold-equalizer';el.setAttribute('aria-hidden','true');el.innerHTML='<i></i><i></i><i></i><i></i><i></i>';
  head.insertBefore(el,head.firstChild);
 }
 const variants=['completa','piano','refrao','fundo','trecho','piano_bateria','trecho_bateria','refrao_bateria'];
 function sync(){
  const live=!audio.paused&&!audio.ended;
  player.classList.toggle('audio-is-playing',live);
  if(!bar)return;
  bar.classList.toggle('is-paused',!live);
  const buttons=[...bar.querySelectorAll('.version-choice')];
  const id=audio.dataset.versionId;
  for(const b of buttons){
   const selected=!!id&&b.dataset.versionId===id;
   b.classList.toggle('selected',selected);b.classList.toggle('is-playing',selected&&live);
   b.setAttribute('aria-pressed',String(selected));
   let bars=b.querySelector('.playing-bars');
   if(selected&&!bars){bars=document.createElement('span');bars.className='playing-bars';bars.setAttribute('aria-hidden','true');bars.innerHTML='<i></i><i></i><i></i>';b.appendChild(bars)}
   if(!selected&&bars)bars.remove();
  }
 }
 ['play','pause','ended','loadedmetadata','emptied','canplay','playing'].forEach(ev=>audio.addEventListener(ev,sync));
 if(bar){new MutationObserver(sync).observe(bar,{childList:true,subtree:false});bar.addEventListener('click',()=>{requestAnimationFrame(sync);setTimeout(sync,100)},true)}
 sync();
})();
