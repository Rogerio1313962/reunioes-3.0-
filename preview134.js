/* Prévia 134 — biblioteca musical por conjunto, reprodução sob escolha,
   referências compactas e atualização da Bíblia ao vivo. */
(()=>{'use strict';
const $$=id=>document.getElementById(id);
const clean=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const roles=[['completa','Piano completo','P'],['trecho','Trecho','T'],['refrao','Refrão','R'],['fundo','Fundo','F'],['piano_bateria','Piano com bateria','PB'],['trecho_bateria','Trecho com bateria','TB'],['refrao_bateria','Refrão com bateria','RB']];
// Atualiza APENAS a apresentação das referências antigas, preservando o texto e as seleções.
function compactReference(ref){
 const m=String(ref||'').match(/^(.+?\s+\d+):\s*([\d,\s\-–]+)$/u);
 if(!m)return String(ref||'');
 const nums=[];
 for(const part of m[2].split(/[,;]/)){
  const range=part.trim().match(/^(\d+)\s*[-–]\s*(\d+)$/);
  if(range){let a=+range[1],b=+range[2];if(b>=a&&b-a<=175)for(let i=a;i<=b;i++)nums.push(i)}
  else if(/^\d+$/.test(part.trim()))nums.push(+part.trim());
 }
 if(!nums.length)return String(ref||'');
 const sequence=[...new Set(nums)].sort((a,b)=>a-b);
 const labels=[];let start=sequence[0],last=start;
 for(const n of sequence.slice(1)){
  if(n===last+1){last=n;continue}
  labels.push(start===last?String(start):start+'-'+last);start=last=n;
 }
 labels.push(start===last?String(start):start+'-'+last);
 return m[1]+':'+labels.join(', ');
}
window.r134CompactReference=compactReference;
let migrated=false;
function updateOldReferences(){
 if(migrated)return;migrated=true;let modified=false;
 for(const day of state.days){for(const item of day){if(item.type!=='versiculo')continue;
  const oldRef=item.reference||'',oldTitle=item.title||'';
  const fromParts=Array.isArray(item.verses)&&item.verses.length>1?(()=>{
   const first=String(item.verses[0].reference||'').match(/^(.+?\s+\d+):(\d+)$/);
   if(!first)return null;
   const nums=item.verses.map(v=>String(v.reference||'').match(/^(.+?\s+\d+):(\d+)$/)).filter(m=>m&&m[1]===first[1]).map(m=>+m[2]);
   return nums.length===item.verses.length?compactReference(first[1]+':'+nums.join(', ')):null;
  })():null;
  const nextRef=fromParts||compactReference(oldRef);
  if(nextRef!==oldRef){item.reference=nextRef;modified=true}
  if(oldTitle===oldRef||/^.+?\s+\d+:\s*[\d,\s\-–]+$/u.test(oldTitle)){
   const nextTitle=oldTitle===oldRef?nextRef:compactReference(oldTitle);
   if(nextTitle!==oldTitle){item.title=nextTitle;modified=true}
  }
 }}
 if(modified){try{save()}catch(e){console.warn('Não foi possível persistir atualização das referências',e)}}
 if(typeof drawItems==='function')drawItems();
}
updateOldReferences();

// O seletor só adiciona o conjunto; nenhum áudio toca no ato da seleção.
const modal=document.createElement('dialog');modal.id='r134SongDialog';modal.innerHTML=`<div class="r134DialogHead"><div><small>BIBLIOTECA DE MÚSICAS</small><h2 id="r134SongName">Música</h2></div><button type="button" id="r134SongClose" aria-label="Fechar">×</button></div><p>Escolha a versão que deseja reproduzir.</p><div id="r134Versions" class="r134Versions"></div>`;
document.body.appendChild(modal);
$$('r134SongClose').onclick=()=>modal.close();
let currentSong=null;
async function openSongVersions(item){
 if(!item)return;
 const records=await musicAll().catch(()=>[]);
 const selected=records.find(t=>t.id===item.musicId);
 const siblings=selected?.groupId?records.filter(t=>t.groupId===selected.groupId):selected?[selected]:[];
 currentSong=item;
 $$('r134SongName').textContent=item.title||selected?.groupTitle||selected?.name||'Música';
 const grid=$$('r134Versions');grid.replaceChildren();
 if(!siblings.length){grid.textContent='Música não encontrada neste aparelho.';modal.showModal();return}
 for(const [role,label,code] of roles){
  const track=siblings.find(t=>(t.role||'completa')===role);
  const button=document.createElement('button');button.type='button';button.className='r134VersionButton';button.disabled=!track;
  button.innerHTML=`<b>${code}</b><span>${label}</span>`;
  if(track)button.onclick=()=>{modal.close();playMusic(track.id)};
  grid.appendChild(button);
 }
 modal.showModal();
}
window.r134OpenSongVersions=openSongVersions;
// Captura o toque nas músicas do cronograma antes dos handlers antigos que iniciavam o MP3 direto.
document.addEventListener('click',e=>{
 const row=e.target.closest('#sectionsRoot .item[data-item-id],#items .item[data-item-id]');
 if(!row||!document.getElementById('agenda')?.classList.contains('active'))return;
 const item=state.days[state.day]?.find(it=>it.id===row.dataset.itemId);
 if(item?.type!=='musica')return;
 const act=e.target.closest('button[data-act]');
 if(act&&act.dataset.act!=='show')return;
 if(e.target.closest('button:not([data-act]),input,textarea,select,a,.drag-handle,.content-grip'))return;
 e.preventDefault();e.stopImmediatePropagation();void openSongVersions(item);
},true);

// Troca instantânea da tradução do versículo já projetado, sem exigir novo toque no número.
$$('bibleTranslation')?.addEventListener('change',()=>{
 const ref=$$('b121Overlay-biblia')?.querySelector('.b121Now .b121Ref')?.textContent?.trim();
 if(!ref||!/^.+?\s+\d+:\d+$/u.test(ref))return;
 const match=ref.match(/^(.+?)\s+(\d+):(\d+)$/u);
 if(!match)return;
 const book=BIBLE_BOOKS.findIndex(b=>clean(b[0])===clean(match[1]));
 const translation=$$('bibleTranslation').value;
 const raw=importedBibles[translation];
 if(book<0||!raw)return;
 const text=getImportedVerse(raw,book,+match[2],+match[3]);
 if(!text)return;
 const original=state.days[state.day]?.find(item=>item.type==='versiculo'&&item.verses?.some(v=>v.reference===ref));
 const item={id:original?.id||uid(),type:'versiculo',title:ref,reference:ref,translation,content:text,
  refSettings:window.bible120Settings?.(),highlights:window.bible129ReadMarks?.({translation,reference:ref})||[]};
 present(item);
});
})();
