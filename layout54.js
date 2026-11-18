// Prévia 54 — sem modificar a lógica de armazenamento, Bíblia ou áudio.
(()=>{
  const $=id=>document.getElementById(id);
  const clock=document.querySelector('.clock-box');
  const sidebar=document.querySelector('.sidefoot');
  if(clock&&sidebar){sidebar.replaceChildren(clock);clock.setAttribute('aria-label','Relógio e data');}
  const preview=document.querySelector('#agenda .preview');
  const float=$('floatingMusic');
  const origin=document.createComment('posição original do player');
  if(float?.parentNode)float.before(origin);
  const navMusic=document.querySelector('[data-tab="musicas"]');
  const playerTitle=$('floatingMusicTitle');
  function refresh(){
    const agenda=$('agenda').classList.contains('active');
    const music=$('musicas').classList.contains('active');
    const playing=!!(float&&!float.hidden);
    if(agenda&&playing){
      if(preview&&float.parentNode!==preview)preview.prepend(float);
      preview?.classList.add('music-on-right');
    }else{
      preview?.classList.remove('music-on-right');
      if(float&&origin.parentNode&&float.parentNode!==origin.parentNode)origin.after(float);
    }
    document.body.classList.toggle('music-page-player-open',music&&playing);
    // O player recolhido não deve cobrir o cronograma.
    if(agenda){const restore=$('floatingMusicRestore');if(restore)restore.hidden=true;}
  }
  document.querySelectorAll('.nav[data-tab]').forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(refresh)));
  const existingPlay=playMusic;
  playMusic=async function(id){await existingPlay(id);requestAnimationFrame(refresh)};
  const close=$('floatingMusicClose');
  close?.addEventListener('click',()=>requestAnimationFrame(refresh));
  const restore=$('floatingMusicRestore');
  restore?.addEventListener('click',()=>requestAnimationFrame(refresh));
  // A tela de pastas deve sempre abrir limpa, sem player herdado de outra página.
  navMusic?.addEventListener('click',()=>{
    if(float){float.hidden=true;preview?.classList.remove('music-on-right');}
    if(restore)restore.hidden=true;
    requestAnimationFrame(refresh);
  });
  // Um único botão de abrir telão, somente sob a prévia preta do cronograma.
  const open=$('openProjector2');if(open){open.textContent='▣ Abrir telão';open.setAttribute('aria-label','Abrir telão');}
  refresh();
})();
