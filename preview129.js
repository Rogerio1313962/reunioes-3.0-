/* Prévia 129: modo cronograma / Bíblia, seleção múltipla, destaque e tipografia. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const htmlEscape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Destaques temporários só existem durante a apresentação livre. Os do cronograma
// pertencem ao item agendado, nunca a uma referência bíblica global.
let temporaryMarks=new Map();
const markKey=item=>String(item?.translation||'ACF')+'|'+String(item?.reference||'');
function scheduledRecord(item){
 if(!item?.id||typeof state==='undefined')return null;
 for(const day of state.days||[]){const found=day.find(x=>x.id===item.id&&x.type==='versiculo');if(found)return found}
 return null;
}
function isScheduled(item){return !!(item?.cronogramaSource||scheduledRecord(item))}
function readMarks(item){
 if(!item)return [];
 if(isScheduled(item)){
  const source=scheduledRecord(item)||item;
  const verseMarks=source.highlightsByReference?.[markKey(item)];
  if(Array.isArray(verseMarks))return [...verseMarks];
  const firstRef=source.verses?.[0]?.reference||source.reference;
  return item.reference===firstRef&&Array.isArray(source.highlights)?[...source.highlights]:[];
 }
 return [...(temporaryMarks.get(markKey(item))||[])];
}
function markHTML(raw,ranges,color){const value=String(raw||'');const terms=(Array.isArray(ranges)?ranges:[]).filter(s=>typeof s==='string'&&s.length).sort((a,b)=>b.length-a.length);if(!terms.length)return htmlEscape(value);let parts=[{text:value,hit:false}];for(const term of terms){let next=[];for(const part of parts){if(part.hit){next.push(part);continue}let rest=part.text,idx;while((idx=rest.toLocaleLowerCase('pt-BR').indexOf(term.toLocaleLowerCase('pt-BR')))!==-1){if(idx)next.push({text:rest.slice(0,idx),hit:false});next.push({text:rest.slice(idx,idx+term.length),hit:true});rest=rest.slice(idx+term.length)}if(rest)next.push({text:rest,hit:false})}parts=next}return parts.map(p=>p.hit?'<span class="b129Marked" style="color:'+htmlEscape(color||'#f0cf72')+'">'+htmlEscape(p.text)+'</span>':htmlEscape(p.text)).join('')}
window.bibleMarkHTML=markHTML;window.bible129ReadMarks=readMarks;
// Keep the same controller inside the Bible. On schedule use the Bible, not an overlay above telão.
const agendaController=$('b121Overlay-agenda');if(agendaController)agendaController.style.setProperty('display','none','important');
const right=$('b121Overlay-biblia');
const actions=document.createElement('div');actions.id='b129ModeActions';actions.innerHTML='<div class="b129ModeTop"><strong>Adicionar versículos ao cronograma</strong><button id="b129Cancel" type="button">Cancelar</button></div><p>Toque em um ou mais versículos. Eles ficarão selecionados em amarelo.</p><div class="b129ModeBottom"><span id="b129Count">0 selecionados</span><button id="b129Add" type="button" disabled>+ Adicionar ao cronograma</button></div>';
$('biblia').querySelector('.b119Editor .bible-stage')?.insertAdjacentElement('afterend',actions);
function renderMode(){const is=!!window.bibleCronogramaSelect;actions.hidden=!is;$('b129Count').textContent=(typeof selectedVerses!=='undefined'?selectedVerses.length:0)+' selecionado(s)';$('b129Add').disabled=!is||!selectedVerses.length}
$('b129Cancel').onclick=()=>{window.bibleCronogramaSelect=null;selectedVerses=[];drawBiblePicker();renderMode();setTab('agenda')};
$('b129Add').onclick=()=>{if(!window.bibleCronogramaSelect||!selectedVerses.length)return;const bi=Number($('bibleBook').value),ch=Number($('bibleChapter').value),v=$('bibleTranslation').value;const data=importedBibles[v];if(!data){alert('Aguarde a Bíblia carregar.');return}const nums=[...selectedVerses].sort((a,b)=>a-b),verses=nums.map(n=>({reference:BIBLE_BOOKS[bi][0]+' '+ch+':'+n,text:getImportedVerse(data,bi,ch,n)}));if(verses.some(x=>!x.text)){alert('Há versículos indisponíveis nesta tradução.');return}
const ref=BIBLE_BOOKS[bi][0]+' '+ch+':'+(typeof formatVerseSpan==='function'?formatVerseSpan(nums):nums.join(', ')),mode=window.bibleCronogramaSelect;
const item={id:uid(),type:'versiculo',title:ref,reference:ref,translation:v,content:verses[0].text,verses,sectionId:mode.sectionId||null,cronogramaSource:true};
state.days[mode.day].push(item);try{save()}catch(e){state.days[mode.day].pop();alert('Não foi possível salvar.');return}
window.bibleCronogramaSelect=null;selectedVerses=[];drawBiblePicker();drawItems();renderMode();setTab('agenda')};
window.addEventListener('bible-cronograma-mode',()=>{selectedVerses=[];drawBiblePicker();renderMode()});window.addEventListener('bible-verse-selection',renderMode);
// When the Bible is opened from the schedule, use the actual book/chapter/verse and show the same controller.
window.addEventListener('bible-schedule-present',e=>{const item=e.detail;if(!item)return;window.bibleCronogramaSelect=null;const r=String(item.verses?.[0]?.reference||item.reference||'').match(/^(.+?)\s+(\d+):(\d+)/u);if(r&&typeof BIBLE_BOOKS!=='undefined'){
 const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();const index=BIBLE_BOOKS.findIndex(b=>norm(b[0])===norm(r[1]));if(index!==-1){$('bibleBook').value=index;bibleChapters();$('bibleChapter').value=r[2];selectedVerses=[Number(r[3])];bibleStep='verse';drawBiblePicker()}}
if(item.translation&&['ACF','ARA'].includes(item.translation)){$('bibleTranslation').value=item.translation;drawBiblePicker()}
renderMode()});
// Sidebar opening the Bible always goes back to the direct one-touch presentation mode.
document.querySelector('button.nav[data-tab="biblia"]')?.addEventListener('click',()=>{window.bibleCronogramaSelect=null;renderMode()});
const modal=document.createElement('dialog');modal.id='b129HighlightDialog';modal.innerHTML='<div class="b129HighHead"><strong>Destacar trecho do versículo</strong><button type="button" id="b129Close">×</button></div><p>Selecione as palavras abaixo e toque em Destacar. A cor será a mesma da referência bíblica.</p><textarea id="b129VerseText" rows="7"></textarea><div class="b129HighFooter"><button type="button" id="b129Clear">Remover destaque</button><button type="button" id="b129Apply">Destacar seleção</button></div>';
document.body.append(modal);
function activeController(){const agenda=$('b121Overlay-agenda');const biblia=$('b121Overlay-biblia');if(agenda&&!agenda.hidden&&getComputedStyle(agenda).display!=='none')return agenda;if(biblia&&!biblia.hidden&&getComputedStyle(biblia).display!=='none')return biblia;return biblia||agenda||null}
function attachMarkButtons(){document.querySelectorAll('.b121MarkInline').forEach(btn=>{if(btn.dataset.bound==='1')return;btn.dataset.bound='1';btn.onclick=()=>{if(!lastItem)return;const root=activeController();const liveText=root?.querySelector('.b121Now .b121Text')?.textContent||lastItem.content||'';modal.querySelector('textarea').value=liveText;modal.showModal();};});}
attachMarkButtons();
let lastItem=null;
function canUseHighlights(item){return !!(item&&item.type==='versiculo');}
function syncHighlightUi(){const allow=canUseHighlights(lastItem);document.querySelectorAll('.b121MarkInline').forEach(btn=>{btn.hidden=!allow;btn.disabled=!allow});}
const outerPresent=present;
present=function(item){if(item?.type==='versiculo'){
 const one=item.verses?.[0];const ref=one?.reference||item.reference||'';const full={...item};
 full.highlights=readMarks({...full,reference:ref});
 lastItem=full;syncHighlightUi();return outerPresent(full)}
 if(!item){temporaryMarks.clear();if(modal.open)modal.close()}
 lastItem=null;syncHighlightUi();return outerPresent(item)};
window.bibleOnControllerVerseChange=(item)=>{
 if(!item||item.type!=='versiculo')return;
 lastItem={...item,highlights:readMarks(item)};
 syncHighlightUi();
};
$('b129Close').onclick=()=>modal.close();
function persistMarks(marks){
 if(!lastItem||!canUseHighlights(lastItem))return;
 const controllerRef=activeController()?.querySelector('.b121Now .b121Ref')?.textContent||lastItem.reference;
 const stamp={...lastItem,reference:controllerRef};
 const normalized=[...new Set(marks)].filter(x=>typeof x==='string'&&x.trim());
 const stored=scheduledRecord(stamp);
 if(stored){
  stored.cronogramaSource=true;
  if(!stored.highlightsByReference)stored.highlightsByReference={};
  stored.highlightsByReference[markKey(stamp)]=normalized;
  const firstRef=stored.verses?.[0]?.reference||stored.reference;
  if(firstRef===controllerRef)stored.highlights=normalized;
  try{save()}catch(err){console.warn('Falha ao salvar o destaque do cronograma',err)}
 }else{
  temporaryMarks.set(markKey(stamp),normalized);
 }
 lastItem={...stamp,highlights:normalized};
 // Atualizar apenas o versículo que está no telão, sem alterar a sequência nem
 // guardar destaques temporários na biblioteca.
 present({...lastItem,verses:undefined,highlights:normalized});
 modal.close();
}
$('b129Apply').onclick=()=>{const t=$('b129VerseText'),str=t.value.slice(t.selectionStart,t.selectionEnd).trim();if(!str){alert('Selecione primeiro as palavras que deseja destacar.');return}const marks=readMarks({...lastItem,reference:activeController()?.querySelector('.b121Now .b121Ref')?.textContent||lastItem.reference});if(!marks.includes(str))marks.push(str);persistMarks(marks)};
$('b129Clear').onclick=()=>persistMarks([]);
document.querySelectorAll('.sidebar .nav:not([data-tab="biblia"])').forEach(button=>button.addEventListener('click',()=>{
 temporaryMarks.clear();
 if(lastItem&&!isScheduled(lastItem)){
  const current=window.bibleActivePresentation;
  lastItem.highlights=[];
  // Saindo da aba Bíblia, remover também o destaque temporário já exibido.
  if(current?.type==='versiculo'&&!scheduledRecord(current))present({...current,highlights:[],verses:undefined});
 }
 if(modal.open)modal.close();
},true));
attachMarkButtons();
syncHighlightUi();
renderMode();
})();
