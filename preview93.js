/* PREVIA 93 — Indicador AO VIVO: nunca sinalizar imagem de apoio. */
(()=>{'use strict';
 const header=document.querySelector('#agenda .right > .r90ExternalHeader');
 const preview=document.getElementById('preview');
 if(!header||!preview)return;
 const heading=header.querySelector('h2');
 if(!heading)return;
 const badge=document.createElement('span');
 badge.id='r93LiveIndicator';
 badge.setAttribute('role','status');
 badge.setAttribute('aria-label','Conteúdo ao vivo no telão');
 badge.innerHTML='<span class="r93LiveDot" aria-hidden="true"></span><span>AO VIVO</span>';
 badge.hidden=false;
 const titleGroup=document.createElement('div');titleGroup.className='r107TelaoTitleGroup';heading.parentNode.insertBefore(titleGroup,heading);titleGroup.append(heading,badge);
 const refresh=()=>{
   const content=preview.firstElementChild;
   const support=content?.matches?.('img[alt="Imagem de Apoio"]')||false;
   const empty=!content||content.matches('.placeholder,.r70Empty,.r85PreviewLoading')||(!preview.querySelector('img,video,canvas,.verse,iframe')&&!preview.querySelector('.r70Image'));
   const pdfOrMediaLive=window.R70?.isLive?.()===true;
   const standardMedia=!!(window.current && !support && !empty);
   // Algumas telas bíblicas são montadas diretamente no preview.
   const bibleShown=!!preview.querySelector('.verse');
   const live=!support&&!empty&&(pdfOrMediaLive||standardMedia||bibleShown);
   badge.hidden=false;
   badge.classList.toggle('r108Active',Boolean(live));
   badge.classList.toggle('r108Idle',!live);
   badge.setAttribute('aria-label',live?'Apresentação ao vivo no telão':'Telão em espera, sem apresentação ao vivo');
 };
 let pending=false;
 const schedule=()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;refresh()})};
 new MutationObserver(schedule).observe(preview,{childList:true,subtree:false,attributes:true,attributeFilter:['src','class']});
 document.addEventListener('click',schedule,true);
 document.addEventListener('change',schedule,true);
 window.addEventListener('pageshow',schedule);
 window.addEventListener('r93-live-change',schedule);
 refresh();
})();
