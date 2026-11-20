/* Prévia 123 — o mesmo controle da Bíblia abaixo do telão em ambas as páginas;
   a navegação é livre por toda a tradução, não só pelos versículos escolhidos. */
(()=>{'use strict';
const agendaRight=document.querySelector('#agenda .layout > .right');
const bibleRight=document.querySelector('#biblia .b119Right');
if(!agendaRight||!bibleRight||typeof present!=='function')return;
const views=[];
for(const [parent,name] of [[agendaRight,'agenda'],[bibleRight,'biblia']]){
 const control=document.createElement('section');control.className='b121Overlay b123Controller';control.id='b121Overlay-'+name;control.hidden=true;
 control.innerHTML=`<div class="b121Card"><header class="b121Head"><div class="b121Title"><span class="b121Book" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="12" rx="2.5"></rect><path d="M8 20h8"></path><path d="M12 17v3"></path></svg></span><div><strong>CONTROLE DA BÍBLIA</strong></div></div><div class="b121HeadActions"><button type="button" class="b121MarkInline">✎ Destacar trecho</button><button type="button" class="b121Close" aria-label="Encerrar apresentação" title="Encerrar apresentação">×</button></div></header><div class="b121VerseList"><button type="button" class="b121Cell b121Before" data-offset="-1"><span class="b121Label">ANTERIOR</span><strong class="b121Ref"></strong><span class="b121Text"></span></button><div class="b121Cell b121Now"><span class="b121Label"><i></i> NO TELÃO AGORA</span><strong class="b121Ref"></strong><span class="b121Text"></span></div><button type="button" class="b121Cell b121After" data-offset="1"><span class="b121Label">PRÓXIMO</span><strong class="b121Ref"></strong><span class="b121Text"></span></button></div><footer class="b121Foot"><span class="b121Counter">Navegação livre pela Bíblia</span></footer></div>`;
 if(name==='biblia'){parent.querySelector('.b119ScreenFrame')?.insertAdjacentElement('afterend',control)}else{const frame=parent.querySelector('.r109PresentationFrame')||parent.querySelector('.panel.preview');frame?.insertAdjacentElement('afterend',control)}
 const closeBtn=control.querySelector('.b121Close');if(closeBtn)closeBtn.onclick=()=>present(null);
 for(const btn of control.querySelectorAll('button[data-offset]'))btn.onclick=()=>{step(Number(btn.dataset.offset));btn.blur()};
 views.push(control);
}
for(const id of ['b120Sequence','b120AgendaSequence']){const el=document.getElementById(id);if(el){el.hidden=true;el.setAttribute('aria-hidden','true')}}
let active=null;let before=null;let after=null;
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const ver=item=>String(item?.translation||'ACF').toUpperCase().includes('ARA')?'ARA':'ACF';
function findBook(ref){if(typeof BIBLE_BOOKS==='undefined')return null;const m=String(ref||'').match(/^(.+?)\s+(\d+):(\d+)$/u);if(!m)return null;const bi=BIBLE_BOOKS.findIndex(b=>normalize(b[0])===normalize(m[1]));if(bi<0)return null;return {bi,ch:Number(m[2]),n:Number(m[3])}}
function getText(bi,ch,n,version){if(typeof importedBibles==='undefined'||typeof getImportedVerse!=='function')return '';const data=importedBibles[version];return data?getImportedVerse(data,bi,ch,n):''}
function nearby(part,delta){
 if(!part)return null;
 let {bi,ch,n}=part;const v=ver(active);
 for(let attempts=0;attempts<300;attempts++){
  n+=delta;
  if(delta>0&&n>180){ch++;n=1}
  if(delta<0&&n<1){ch--;n=180}
  if(ch<1){bi--;if(bi<0)return null;ch=BIBLE_BOOKS[bi][1];n=180}
  if(ch>BIBLE_BOOKS[bi][1]){bi++;if(bi>=BIBLE_BOOKS.length)return null;ch=1;n=1}
  const text=getText(bi,ch,n,v);
  if(text)return {bi,ch,n,reference:BIBLE_BOOKS[bi][0]+' '+ch+':'+n,text};
  // Avançar ao próximo capítulo depois do fim real do capítulo atual.
  if(delta>0){ch++;n=0;if(ch>BIBLE_BOOKS[bi][1]){bi++;if(bi>=BIBLE_BOOKS.length)return null;ch=1}}
 }
 return null;
}
function fallback(direction){if(!active)return null;const seq=Array.isArray(active.original?.verses)?active.original.verses:[];const idx=seq.findIndex(p=>p.reference===active.reference);const part=seq[idx+direction];return part?{...findBook(part.reference),reference:part.reference,text:part.text}:null}
function render(){const current=active?{reference:active.reference,text:active.text}:null;
 for(const v of views){v.hidden=!active;if(!active)continue;
  const cells=[[v.querySelector('.b121Before'),before,'Início da Bíblia'],[v.querySelector('.b121Now'),current,''],[v.querySelector('.b121After'),after,'Fim da Bíblia']];
  for(const [cell,item,empty] of cells){cell.querySelector('.b121Ref').textContent=item?.reference||'—';cell.querySelector('.b121Text').textContent=item?.text||empty;if(cell.tagName==='BUTTON')cell.disabled=!item;}
  const canHighlight=!!active;
  const markBtn=v.querySelector('.b121MarkInline'); if(markBtn){markBtn.hidden=!canHighlight; markBtn.disabled=!canHighlight;}
  v.querySelector('.b121Counter').textContent=(current?.reference||'')+(active?.original?.translation?' · '+String(active.original.translation).replace(/—.*/, '').trim():'');
 }
}
const originalPresent=present;
function broadcastCurrent(){if(!active)return;const item={...active.original,verses:undefined,content:active.text,reference:active.reference,refSettings:window.bible120Settings?.()||active.original.refSettings};if(window.bible129ReadMarks)item.highlights=window.bible129ReadMarks(item);window.bibleActivePresentation=item;originalPresent(item);window.bibleOnControllerVerseChange?.(item);render()}
function activate(reference,text,original){const position=findBook(reference);active={reference,text,original,position};before=position?nearby(position,-1):null;after=position?nearby(position,1):null;
 if(!before)before=fallback(-1);if(!after)after=fallback(1);
 broadcastCurrent()}
function step(dir){if(!active)return;const neighbor=dir<0?before:after;if(!neighbor)return;activate(neighbor.reference,neighbor.text,active.original)}
present=function(item){if(item?.type==='versiculo'){
 const first=Array.isArray(item.verses)&&item.verses.length?item.verses[0]:null;
 const reference=first?.reference||item.reference||'';
 const text=first?.text||item.content||'';
 activate(reference,text,item);return;
 }
 active=null;before=null;after=null;window.bibleActivePresentation=null;render();return originalPresent(item)
};
window.addEventListener('pageshow',render);render();
})();
