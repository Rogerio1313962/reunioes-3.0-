/* Prévia 121: controle bíblico sobre a coluna esquerda, comum ao Cronograma e Bíblia.
   Anterior em cima, versículo AO VIVO ao centro, próximo embaixo, sem setas. */
(()=>{'use strict';
const agenda=document.querySelector('#agenda .layout > .panel');
const bible=document.querySelector('#biblia .b119Editor');
if(!agenda||!bible||typeof present!=='function')return;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const bars=['b120Sequence','b120AgendaSequence'];
const views=[];
for(const [parent,context] of [[agenda,'agenda'],[bible,'biblia']]){
  const overlay=document.createElement('div');overlay.className='b121Overlay';overlay.id='b121Overlay-'+context;overlay.hidden=true;
  overlay.innerHTML=`<section class="b121Card" role="dialog" aria-modal="false" aria-label="Controle da Bíblia"><header class="b121Head"><div class="b121Title"><span class="b121Book">▣</span><div><strong>CONTROLE DA BÍBLIA</strong><small>Toque no anterior ou próximo para projetar</small></div></div><button type="button" class="b121Close" title="Encerrar apresentação" aria-label="Fechar e retirar versículo do telão">×</button></header><div class="b121VerseList"><button type="button" class="b121Cell b121Before" data-offset="-1"><span class="b121Label">ANTERIOR</span><strong class="b121Ref"></strong><span class="b121Text"></span></button><div class="b121Cell b121Now" aria-live="polite"><span class="b121Label"><i></i> NO TELÃO AGORA</span><strong class="b121Ref"></strong><span class="b121Text"></span></div><button type="button" class="b121Cell b121After" data-offset="1"><span class="b121Label">PRÓXIMO</span><strong class="b121Ref"></strong><span class="b121Text"></span></button></div><footer class="b121Foot"><span class="b121Counter"></span><button type="button" class="b121Finish">Encerrar apresentação</button></footer></section>`;
  parent.append(overlay);
  overlay.querySelectorAll('.b121Close,.b121Finish').forEach(b=>b.addEventListener('click',()=>present(null)));
  overlay.querySelectorAll('button[data-offset]').forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.offset))));
  views.push(overlay);
}
let activeItem=null,parts=[],index=0,stopped=true;
const bibleVersion=item=>String(item?.translation||'ACF').toUpperCase().startsWith('ARA')?'ARA':'ACF';
function expandSingle(item){
  if(!item||item.type!=='versiculo'||item.verses?.length)return null;
  if(typeof BIBLE_BOOKS==='undefined'||typeof importedBibles==='undefined'||typeof getImportedVerse!=='function')return null;
  const ref=String(item.reference||'').trim();const m=ref.match(/^(.+?)\s+(\d+):(\d+)$/u);if(!m)return null;
  const bi=BIBLE_BOOKS.findIndex(b=>String(b[0]).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()===m[1].normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase());
  if(bi<0)return null;
  const ch=Number(m[2]),num=Number(m[3]);const data=importedBibles[bibleVersion(item)];if(!data)return null;
  const list=[];for(let n=1;n<=180;n++){const text=getImportedVerse(data,bi,ch,n);if(!text){if(n>num)break;continue}list.push({reference:BIBLE_BOOKS[bi][0]+' '+ch+':'+n,text})}
  if(!list.length)return null;
  const start=list.findIndex(v=>v.reference===m[1]+' '+ch+':'+num);
  if(start<0)return null;
  // Abrir na seleção original, sem avançar ou retroceder involuntariamente.
  return {list,start};
}
function markCell(node,part,disabled){
  const label=node.querySelector('.b121Ref'),txt=node.querySelector('.b121Text');
  if(!part){label.textContent='—';txt.textContent=disabled==='before'?'Início da sequência':'Fim da sequência'}
  else{label.textContent=part.reference||'';txt.textContent=part.text||''}
  if(node.tagName==='BUTTON'){node.disabled=!part;node.setAttribute('aria-label',part?'Apresentar '+part.reference:'Indisponível')}
}
function render(){
  for(const overlay of views){overlay.hidden=stopped;
    if(stopped)continue;
    markCell(overlay.querySelector('.b121Before'),parts[index-1],'before');
    markCell(overlay.querySelector('.b121Now'),parts[index]);
    markCell(overlay.querySelector('.b121After'),parts[index+1],'after');
    overlay.querySelector('.b121Counter').textContent='Versículo '+(index+1)+' de '+parts.length;
  }
}
function showPart(next){
  if(stopped||next<0||next>=parts.length)return;
  index=next;
  // O controle da Prévia 120 continua atualizando o telão e a transmissão.
  const button=document.getElementById(next>lastIndex?'b120Next':'b120Prev');
  if(activeItem?.verses?.length&&button&&!button.disabled){button.click()}
  else if(activeItem){
    const part=parts[index];const single={...activeItem,verses:undefined,content:part.text,reference:part.reference};
    internalPresent(single);
  }
  lastIndex=index;render();
}
let lastIndex=0;
function go(offset){showPart(index+offset)}
const internalPresent=present;
present=function(item){
  if(item?.type==='versiculo'){
    const bundled=Array.isArray(item.verses)&&item.verses.length?item.verses:null;
    const expanded=bundled?null:expandSingle(item);
    activeItem=item;
    if(bundled){parts=bundled.map(v=>({reference:v.reference,text:v.text}));index=0;lastIndex=0;stopped=false;const r=internalPresent(item);render();return r}
    if(expanded){parts=expanded.list;index=expanded.start;lastIndex=index;stopped=false;const r=internalPresent(item);render();return r}
    parts=[{reference:item.reference||'',text:item.content||''}];index=0;lastIndex=0;stopped=false;const r=internalPresent(item);render();return r;
  }
  stopped=true;parts=[];activeItem=null;index=0;lastIndex=0;render();
  return internalPresent(item);
};
// Controles antigos com setas não devem aparecer na interface.
for(const id of bars){const bar=document.getElementById(id);if(bar){bar.hidden=true;bar.setAttribute('aria-hidden','true')}}
window.addEventListener('pageshow',render);render();
})();
