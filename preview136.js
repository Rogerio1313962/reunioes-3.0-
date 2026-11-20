/* PREVIA 136 — Seleção do Cronograma na biblioteca musical verdadeira. */
(()=>{'use strict';
 const library=document.getElementById('musicas');
 if(!library)return;
 const header=library.querySelector('.music-panel .panelhead');
 const back=document.createElement('button');back.type='button';back.id='r136ReturnAgenda';back.hidden=true;back.textContent='← Voltar ao cronograma';
 header?.append(back);
 function leave(){window.r136ScheduleMusicMode=false;library.classList.remove('r136SchedulePicker');back.hidden=true;setTab('agenda')}
 back.onclick=leave;
 // Na biblioteca em modo de escolha, tocar numa música adiciona-a ao
 // Cronograma. Nenhum MP3 é iniciado nesta ação.
 document.addEventListener('click',event=>{
  if(!window.r136ScheduleMusicMode||!library.classList.contains('active'))return;
  const hit=event.target.closest('#musicas .song-row-play,#musicas .music-track [data-play]');
  if(!hit)return;
  const id=hit.dataset.scheduleId||hit.dataset.play;
  if(!id)return;
  event.preventDefault();event.stopImmediatePropagation();
  Promise.resolve(window.r136ChooseSong?.(id)).catch(error=>{console.error(error);alert('Não foi possível adicionar a música ao cronograma.')});
 },true);
 // Se o usuário escolher outra aba, encerra o modo de seleção temporário.
 document.querySelectorAll('.sidebar .nav').forEach(button=>button.addEventListener('click',()=>{
  if(button.dataset.tab!=='musicas'&&window.r136ScheduleMusicMode){window.r136ScheduleMusicMode=false;library.classList.remove('r136SchedulePicker');back.hidden=true}
 }));
})();
