/* Prévia 50: uma única nota dupla dourada em pausa; equalizador dourado durante reprodução. */
(()=>{'use strict';
 const player=document.getElementById('floatingMusic');
 const audio=document.getElementById('musicAudio');
 const bar=document.getElementById('groupVersionBar');
 if(!player||!audio)return;
 const head=player.querySelector('.floating-music-head');
 const title=document.getElementById('floatingMusicTitle');
 if(head){
   head.querySelectorAll('.gold-equalizer').forEach(el=>el.remove());
   const badge=document.createElement('span');badge.className='gold-music-badge';badge.setAttribute('aria-hidden','true');
   badge.innerHTML='<svg class="gold-music-note" viewBox="0 0 48 48" width="31" height="31"><path d="M18 11 L39 7 L39 31 L35 31 L35 14 L22 17 L22 36 L18 36 Z" fill="currentColor"/><ellipse cx="13" cy="36" rx="8" ry="5" transform="rotate(-18 13 36)" fill="currentColor"/><ellipse cx="30" cy="31" rx="8" ry="5" transform="rotate(-18 30 31)" fill="currentColor"/></svg><span class="gold-music-waves"><i></i><i></i><i></i><i></i><i></i></span>';
   head.insertBefore(badge,head.firstChild);
 }
 function cleanTitle(){if(!title)return;for(const node of title.childNodes){if(node.nodeType===3 && /^\s*[♫♪♬🎵]\s*/u.test(node.textContent)){node.textContent=node.textContent.replace(/^\s*[♫♪♬🎵]\s*/u,'');}}}
 function sync(){
  cleanTitle();
  const live=!audio.paused&&!audio.ended&&!!audio.currentSrc;
  player.classList.toggle('audio-is-playing',live);
  if(!bar)return;
  bar.classList.toggle('is-paused',!live);
  const buttons=[...bar.querySelectorAll('.version-choice')];
  let id=audio.dataset.versionId;
  if(!id){const chosen=buttons.find(b=>b.classList.contains('selected'));if(chosen)id=chosen.dataset.versionId;}
  for(const b of buttons){
    const selected=!!id&&b.dataset.versionId===id;
    b.classList.toggle('selected',selected);
    b.classList.toggle('is-playing',selected&&live);
    b.setAttribute('aria-pressed',String(selected));
    let bars=b.querySelector('.playing-bars');
    if(selected&&!bars){bars=document.createElement('span');bars.className='playing-bars';bars.setAttribute('aria-hidden','true');bars.innerHTML='<i></i><i></i><i></i>';b.appendChild(bars)}
    if(!selected&&bars)bars.remove();
  }
 }
 ['play','pause','ended','loadedmetadata','emptied','canplay','playing','seeking','seeked'].forEach(ev=>audio.addEventListener(ev,sync));
 if(bar){new MutationObserver(sync).observe(bar,{childList:true,subtree:false});bar.addEventListener('click',()=>{requestAnimationFrame(sync);setTimeout(sync,100);setTimeout(sync,350)},true)}
 if(title)new MutationObserver(cleanTitle).observe(title,{childList:true,characterData:true,subtree:true});
 setInterval(()=>{if(!player.hidden)sync()},350);
 sync();
})();
