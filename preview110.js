/* Prévia 110: troca de dias segura + controles não herdados entre reuniões. */
(()=>{'use strict';
 const days=document.getElementById('days');
 if(!days)return;
 let switching=false;
 const mediaAudio=document.getElementById('musicAudio');
 function activePresentation(){
   const vid=document.querySelector('#preview video');
   return !!(window.R70?.isLive?.() || (vid&&!vid.paused&&!vid.ended) ||
     (mediaAudio&&!mediaAudio.paused&&!mediaAudio.ended) ||
     document.querySelector('#preview .verse'));
 }
 function closePrevious(){
   // A ordem importa: encerra controles existentes ANTES de carregar o apoio do dia novo.
   try{document.getElementById('agenda106Close')?.click()}catch(e){console.warn(e)}
   try{mediaAudio?.pause()}catch(e){}
   try{window.R70?.close?.()}catch(e){console.warn(e)}
   try{if(typeof current!=='undefined'&&current){present(null)}}catch(e){console.warn(e)}
   document.getElementById('r87SupportDialog')?.remove();
 }
 days.addEventListener('click',e=>{
   const btn=e.target.closest('button[data-day]');
   if(!btn || !days.contains(btn) || switching)return;
   const next=Number(btn.dataset.day);
   if(!Number.isInteger(next)||next<0||next>6||next===state.day)return;
   const label=['domingo','segunda-feira','terça-feira','quarta-feira','quinta-feira','sexta-feira','sábado'][next];
   if(activePresentation()&&!window.confirm('Há uma apresentação ou música em andamento. Deseja encerrar o conteúdo atual e abrir o cronograma de '+label+'?')){
      e.preventDefault();e.stopImmediatePropagation();return;
   }
   closePrevious();
   // O handler original atualiza todas as etapas, contadores e registros do cronograma.
   queueMicrotask(()=>{
      if(state.day!==next)return;
      try{window.R70?.displaySupport?.()}catch(e){console.warn(e)}
      try{document.querySelector('#agenda .r70grid')?.scrollTo({top:0,behavior:'instant'})}catch(e){}
   });
 },true);
 // Se retornar à aba Cronograma durante outra semana, não reinicia um dia escolhido manualmente.
})();
