// Fonte consolidada: app.js
const DAYS=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];const KEY='reunioes3-local-v1';let state=JSON.parse(localStorage.getItem(KEY)||'null')||{day:0,days:Array.from({length:7},()=>[]),pastor:'',accent:'#a7c5ff'};let current=null;/* Prévia 110: abrir o cronograma no dia atual do aparelho. */state.day=new Date().getDay(),editId=null,channel=new BroadcastChannel('reunioes3-projetor');const $=id=>document.getElementById(id);const save=()=>localStorage.setItem(KEY,JSON.stringify(state));const uid=()=>crypto.randomUUID();const escapeHtml=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));function setTab(tab){document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===tab));document.querySelectorAll('.nav').forEach(x=>x.classList.toggle('active',x.dataset.tab===tab))}document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>setTab(b.dataset.tab));function drawDays(){$('days').innerHTML=DAYS.map((d,i)=>`<button class="${state.day===i?'selected':''}" data-day="${i}">${d}</button>`).join('');$('days').querySelectorAll('button').forEach(b=>b.onclick=()=>{state.day=+b.dataset.day;save();drawDays();drawItems()});$('dayTitle').textContent=DAYS[state.day]}function itemThumb(x){
  if(x.type==='texto')return '<div class="item-thumb note-icon" aria-hidden="true">▤</div>';
  if(x.type==='musica')return '<div class="item-thumb audio-icon" aria-hidden="true">♫</div>';
  if(x.type==='versiculo')return '<div class="item-thumb verse-icon verse-book-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6.2c-2.6-1.6-5.5-1.9-8.5-1.2v13.8c3.1-.7 5.9-.3 8.5 1.1 2.6-1.4 5.4-1.8 8.5-1.1V5c-3-.7-5.9-.4-8.5 1.2Z"/><path d="M12 6.3v13.6"/><path d="M8.6 9.3h1.8"/><path d="M13.6 9.3h1.8"/><path d="M9.1 12.2h5.8"/></svg></div>';
  if(!x.fileUrl)return '<div class="item-thumb file-icon" aria-hidden="true">▣</div>';
  if(x.type==='imagem')return `<img class="item-thumb" src="${x.fileUrl}" alt="Miniatura da imagem">`;
  if(x.type==='video')return `<video class="item-thumb" src="${x.fileUrl}#t=0.1" preload="metadata" muted playsinline aria-label="Miniatura do vídeo"></video>`;
  if(x.type==='pdf')return `<div class="item-thumb pdf-thumb"><iframe src="${x.fileUrl}#page=1&toolbar=0&navpanes=0" title="Prévia da primeira página do PDF" tabindex="-1"></iframe><span>PDF</span></div>`;
  return '<div class="item-thumb file-icon">▣</div>';
}
function drawItems(){
 const arr=state.days[state.day];
 $('items').innerHTML=arr.length?arr.map((x,i)=>`<div class="item ${x.type==='texto'?'item-recado':''}" data-item-id="${x.id}" draggable="true">
  <span class="num">${i+1}</span>${itemThumb(x)}
  <div class="iteminfo"><b>${x.type==='texto'?'▤ ':''}${escapeHtml(x.title)}</b>${x.type!=='texto'?`<small>${({versiculo:'Bíblia',imagem:'Imagem',video:'Vídeo',pdf:'PDF',musica:'♫ Música MP3'})[x.type]||''} ${x.reference?'· '+escapeHtml(x.reference):''}</small>`:''}${x.type==='texto'?`<p class="recado-excerpt">${escapeHtml(x.content)}</p>`:''}</div>
  ${x.type==='texto'?'':`<button data-act="show" data-id="${x.id}">${x.type==='musica'?'♫ Tocar':'▶ Apresentar'}</button>`}
  <button data-act="edit" data-id="${x.id}">Editar</button><button data-act="up" data-id="${x.id}" aria-label="Mover para cima">↑</button><button data-act="down" data-id="${x.id}" aria-label="Mover para baixo">↓</button><button data-act="delete" data-id="${x.id}" aria-label="Excluir">✕</button><span class="drag-handle" title="Arraste para mudar a ordem">⠿</span></div>`).join(''):'<div class="empty">Nenhum item neste dia.<br>Adicione o primeiro conteúdo.</div>';
 $('items').querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>{const arr=state.days[state.day],i=arr.findIndex(x=>x.id===b.dataset.id),x=arr[i];switch(b.dataset.act){case 'show':if(x.type!=='pdf'&&x.type!=='musica'&&window.R70?.isPdfOpen?.())window.R70.close();if(x.type==='musica'){window.__r167MusicFromSchedule=true;window.__r163ScheduleMusic=false;window.reunioesClearForScheduleMusic?.();playMusic(x.musicId);return}if(x.type==='texto')return;if(['video','imagem','pdf'].includes(x.type)&&window.R70){window.R70.open(x);return}present(x);if(x.type==='versiculo'){window.bibleOpenFromSchedule=true;window.dispatchEvent(new CustomEvent('bible-schedule-present',{detail:x}));setTab('biblia')}return;case 'edit':openEditor(x);return;case 'delete':if(confirm('Excluir este item?'))arr.splice(i,1);break;case 'up':if(i>0)[arr[i-1],arr[i]]=[arr[i],arr[i-1]];break;case 'down':if(i<arr.length-1)[arr[i+1],arr[i]]=[arr[i],arr[i+1]];break}save();drawItems()});
 let dragged=null;
 $('items').querySelectorAll('.item[draggable]').forEach(el=>{el.addEventListener('dragstart',e=>{dragged=el.dataset.itemId;el.classList.add('dragging');e.dataTransfer.effectAllowed='move'});el.addEventListener('dragend',()=>{el.classList.remove('dragging');dragged=null});el.addEventListener('dragover',e=>e.preventDefault());el.addEventListener('drop',e=>{e.preventDefault();if(!dragged||dragged===el.dataset.itemId)return;const from=arr.findIndex(x=>x.id===dragged),to=arr.findIndex(x=>x.id===el.dataset.itemId);if(from<0||to<0)return;arr.splice(to,0,arr.splice(from,1)[0]);save();drawItems()})});
}
function renderContent(x){if(!x)return '<div class="placeholder">✦<p>Nenhum conteúdo na tela</p></div>';if(x.type==='versiculo'){const showTranslation=x.refSettings?.showTranslation!==false;const meta=escapeHtml(x.reference||'')+(showTranslation&&x.translation?' · '+escapeHtml(x.translation):'');return `<div class="verse">${escapeHtml(x.content)}<small>${meta}</small></div>`;}if(x.type==='texto')return '<div class="placeholder">Recado não é projetado</div>';if(x.type==='imagem')return `<img alt="Imagem" src="${x.fileUrl}">`;if(x.type==='video')return `<video src="${x.fileUrl}" controls autoplay playsinline></video>`;if(x.type==='pdf')return `<iframe title="PDF" src="${x.fileUrl}"></iframe>`;return ''}let mediaPresentToken=0;const mediaPresentationUrls=[];
async function present(x){
 const token=++mediaPresentToken;
 if(!x){current=null;$('preview').innerHTML=renderContent(null);channel.postMessage({kind:'present',item:null});return}
 let toShow=x;
 if(x.mediaLibraryId){
  $('preview').innerHTML='<div class="placeholder"><p>Carregando arquivo da biblioteca…</p></div>';
  try{const record=await window.ReunioesMediaLibrary.get(x.mediaLibraryId);
   if(token!==mediaPresentToken)return;
   if(!record?.blob)throw Error('Arquivo não encontrado neste iPad.');
   const blob=x.type==='pdf'&&record.blob.type!=='application/pdf'?new Blob([record.blob],{type:'application/pdf'}):record.blob;
   const blobURL=URL.createObjectURL(blob);mediaPresentationUrls.push(blobURL);
   toShow={...x,fileUrl:blobURL};
  }catch(err){if(token===mediaPresentToken){$('preview').innerHTML='<div class="placeholder"><p>Arquivo indisponível neste aparelho. Abra a aba Mídias e confira o arquivo salvo.</p></div>';alert('Não foi possível abrir este arquivo da biblioteca.')}return}
 }
 if(token!==mediaPresentToken)return;
 current=toShow;$('preview').innerHTML=renderContent(toShow);channel.postMessage({kind:'present',item:toShow});
}
function openProjector(){window.open('telao.html','reunioes3-telao','width=1280,height=720')}$('openProjector').onclick=openProjector;$('openProjector2').onclick=openProjector;$('clearScreen').onclick=()=>present(null);async function refreshStoredMedia(type,chosenId){
 const selector=$('storedMediaSelect');if(!selector||!['imagem','video','pdf'].includes(type))return;
 const requested=chosenId||selector.value;
 selector.innerHTML='<option value="">Carregando arquivos salvos…</option>';
 try{
  const api=window.ReunioesMediaLibrary;
  if(!api)throw Error('Biblioteca indisponível');
  const entries=(await api.all()).filter(f=>f.type===type).sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));
  selector.innerHTML='<option value="">Escolher arquivo da biblioteca…</option>'+entries.map(f=>'<option value="'+escapeHtml(f.id)+'">'+escapeHtml(f.day+' · '+f.name)+'</option>').join('');
  if(requested&&entries.some(f=>f.id===requested))selector.value=requested;
  $('storedMediaCount').textContent=entries.length?entries.length+' arquivo(s) disponível(is).':'Nenhum arquivo desse tipo. Adicione primeiro na aba Mídias ou escolha um novo arquivo abaixo.';
 }catch(err){selector.innerHTML='<option value="">Não foi possível acessar a biblioteca</option>';$('storedMediaCount').textContent='Tente novamente ou selecione um arquivo novo.'}
}
function fields(){let t=$('type').value;$('verseFields').hidden=t!=='versiculo';$('fileFields').hidden=!['imagem','video','pdf'].includes(t);$('itemTitle').required=!['imagem','video','pdf'].includes(t);if(['imagem','video','pdf'].includes(t))void refreshStoredMedia(t);$('textFields').hidden=t!=='texto';$('musicFields').hidden=t!=='musica';if(t==='musica')refreshMusicSelect();$('file').accept=t==='imagem'?'image/*':t==='video'?'video/*':'.pdf,application/pdf'}$('type').onchange=fields;function openEditor(x){editId=x?.id||null;$('modalTitle').textContent=x?'Editar item':'Adicionar item';$('editForm').reset();$('type').value=x?.type||'versiculo';$('itemTitle').value=x?.title||'';$('reference').value=x?.reference||'';$('translation').value=x?.translation||'ACF';$('content').value=x?.content||'';$('freeText').value=x?.type==='texto'?x.content:'';fields();if(x?.type==='musica')$('musicSelect').value=x.musicId||'';$('editor').showModal();if(x?.mediaLibraryId)void refreshStoredMedia(x.type,x.mediaLibraryId)}$('addItem').onclick=()=>openEditor();$('libraryAdd').onclick=()=>{setTab('agenda');openEditor()};function blobToDataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}$('editForm').onsubmit=async e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();const type=$('type').value;let title=$('itemTitle').value.trim();if(type==='musica'&&!title){const entry=musicIndex.find(m=>m.id===$('musicSelect').value);title=entry?.name||'';}if(!title&&['imagem','video','pdf'].includes(type)){const id=$('storedMediaSelect')?.value;const api=window.ReunioesMediaLibrary;if(id&&api){const entry=await api.get(id).catch(()=>null);title=entry?.name||''}else if($('file').files[0])title=$('file').files[0].name}if(!title){alert('Informe o título.');return}const arr=state.days[state.day];const old=arr.find(x=>x.id===editId);let fileUrl=old?.fileUrl||null;let mediaLibraryId=old?.mediaLibraryId||null;
 if(['imagem','video','pdf'].includes(type)){
  const file=$('file').files[0];const librarySelection=$('storedMediaSelect')?.value;
  if(file){
   try{const api=window.ReunioesMediaLibrary;if(!api)throw Error('Biblioteca indisponível');
    const id=uid();await api.put({id,name:file.name,type,day:DAYS[state.day],blob:file,size:file.size,addedAt:Date.now()});
    mediaLibraryId=id;fileUrl=null;
   }catch(err){alert('Não foi possível salvar o novo arquivo na biblioteca. '+(err?.message||''));return}
  }else if(librarySelection){mediaLibraryId=librarySelection;fileUrl=null}
  if(!fileUrl&&!mediaLibraryId){alert('Escolha um arquivo da Biblioteca de Mídias ou selecione um novo arquivo.');return}
 }else{mediaLibraryId=null}
 let item={id:editId||uid(),type,title,mediaLibraryId,reference:$('reference').value,translation:$('translation').value,content:type==='texto'?$('freeText').value:$('content').value,fileUrl,musicId:type==='musica'?$('musicSelect').value:null,sectionId:$('itemSection').value};if(type==='musica'&&!item.musicId){alert('Escolha uma música da biblioteca.');return}if(old)arr[arr.indexOf(old)]=item;else arr.push(item);try{save()}catch(err){alert('Espaço do navegador insuficiente para salvar este arquivo. Para vídeos grandes, será necessário armazenamento na nuvem.');if(old)arr[arr.indexOf(item)]=old;else arr.pop();return}$('editor').close();drawItems()};$('pastor').value=state.pastor;$('pastor').oninput=e=>{state.pastor=e.target.value;save()};$('accent').value=state.accent;document.documentElement.style.setProperty('--accent',state.accent);$('accent').onchange=e=>{state.accent=e.target.value;document.documentElement.style.setProperty('--accent',state.accent);save()};drawDays();drawItems();

// Audio: ajuste de 1%, com atualização imediata da prévia local.
let videoVolume=25,videoMuted=false;const clamp=v=>Math.max(0,Math.min(100,v));
function syncVolume(){const shown=videoMuted?0:videoVolume;$('videoVolume').value=videoVolume;$('volumeValue').textContent=shown+'%';$('muteVideo').textContent=videoMuted?'Ativar som':'Silenciar';const video=$('preview').querySelector('video');if(video){video.volume=videoVolume/100;video.muted=videoMuted}channel.postMessage({kind:'volume',volume:videoVolume/100,muted:videoMuted})}
$('videoVolume').addEventListener('input',e=>{videoVolume=clamp(Number(e.target.value));videoMuted=false;syncVolume()});$('volumeDown').onclick=()=>{videoVolume=clamp(videoVolume-1);videoMuted=false;syncVolume()};$('volumeUp').onclick=()=>{videoVolume=clamp(videoVolume+1);videoMuted=false;syncVolume()};$('muteVideo').onclick=()=>{videoMuted=!videoMuted;syncVolume()};
const originalPresent=present;present=function(item){originalPresent(item);syncVolume()};
function tick(){const now=new Date();$('liveClock').textContent=now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});$('liveDate').textContent=now.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'short'})}tick();setInterval(tick,15000);
function pastorBadge(){$('pastorBadge').textContent=state.pastor||'Responsável não definido'}pastorBadge();$('pastor').addEventListener('input',pastorBadge);

// Seletor bíblico independente do editor e da projeção.
const BIBLE_BOOKS=[['Gênesis',50],['Êxodo',40],['Levítico',27],['Números',36],['Deuteronômio',34],['Josué',24],['Juízes',21],['Rute',4],['1 Samuel',31],['2 Samuel',24],['1 Reis',22],['2 Reis',25],['1 Crônicas',29],['2 Crônicas',36],['Esdras',10],['Neemias',13],['Ester',10],['Jó',42],['Salmos',150],['Provérbios',31],['Eclesiastes',12],['Cânticos',8],['Isaías',66],['Jeremias',52],['Lamentações',5],['Ezequiel',48],['Daniel',12],['Oseias',14],['Joel',3],['Amós',9],['Obadias',1],['Jonas',4],['Miqueias',7],['Naum',3],['Habacuque',3],['Sofonias',3],['Ageu',2],['Zacarias',14],['Malaquias',4],['Mateus',28],['Marcos',16],['Lucas',24],['João',21],['Atos',28],['Romanos',16],['1 Coríntios',16],['2 Coríntios',13],['Gálatas',6],['Efésios',6],['Filipenses',4],['Colossenses',4],['1 Tessalonicenses',5],['2 Tessalonicenses',3],['1 Timóteo',6],['2 Timóteo',4],['Tito',3],['Filemom',1],['Hebreus',13],['Tiago',5],['1 Pedro',5],['2 Pedro',3],['1 João',5],['2 João',1],['3 João',1],['Judas',1],['Apocalipse',22]];
$('bibleBook').innerHTML=BIBLE_BOOKS.map((b,i)=>`<option value="${i}">${b[0]}</option>`).join('');
function bibleChapters(){const count=BIBLE_BOOKS[Number($('bibleBook').value)][1];$('bibleChapter').innerHTML=Array.from({length:count},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('')}
bibleChapters();
// Prévia 5: navegação em três etapas, quadradinhos por grupos de cores.
const BIBLE_ABBR=['Gn','Ex','Lv','Nm','Dt','Js','Jz','Rt','1Sm','2Sm','1Rs','2Rs','1Cr','2Cr','Ed','Ne','Et','Jó','Sl','Pv','Ec','Ct','Is','Jr','Lm','Ez','Dn','Os','Jl','Am','Ob','Jn','Mq','Na','Hc','Sf','Ag','Zc','Ml','Mt','Mc','Lc','Jo','At','Rm','1Co','2Co','Gl','Ef','Fp','Cl','1Ts','2Ts','1Tm','2Tm','Tt','Fm','Hb','Tg','1Pe','2Pe','1Jo','2Jo','3Jo','Jd','Ap'];
const BIBLE_GROUPS=[5,17,22,27,39,43,44,57,65,66];
let bibleStep='book', selectedVerses=[];
let bibleLoadedKey='',bibleLoadedText='',bibleCredit='',bibleFetchSerial=0;
const BIBLE_SLUGS=['genesis','exodus','leviticus','numbers','deuteronomy','joshua','judges','ruth','1-samuel','2-samuel','1-kings','2-kings','1-chronicles','2-chronicles','ezra','nehemiah','esther','job','psalms','proverbs','ecclesiastes','song-of-solomon','isaiah','jeremiah','lamentations','ezekiel','daniel','hosea','joel','amos','obadiah','jonah','micah','nahum','habakkuk','zephaniah','haggai','zechariah','malachi','matthew','mark','luke','john','acts','romans','1-corinthians','2-corinthians','galatians','ephesians','philippians','colossians','1-thessalonians','2-thessalonians','1-timothy','2-timothy','titus','philemon','hebrews','james','1-peter','2-peter','1-john','2-john','3-john','jude','revelation'];
const bibleCache=new Map();
function resetBibleText(){bibleLoadedKey='';bibleLoadedText='';$('bibleText').value='';$('bibleCredit').textContent='';}
// Prévia 7: textos somente de bases ACF/ARA fornecidas pelo usuário.
// Formato JSON: {"translation":"ACF", "books":{"Gênesis":{"1":{"1":"Texto..."}}}}
// ou {"translation":"ARA", "books":{"0":{"1":{"1":"Texto..."}}}}.
const importedBibles={};
// Armazenamento local das bases autorizadas, para não exigir nova importação a cada abertura.
function bibleDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open('reunioes3-biblias',1);req.onupgradeneeded=()=>req.result.createObjectStore('translations');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function storeBible(version,data){const db=await bibleDB();return new Promise((resolve,reject)=>{const tx=db.transaction('translations','readwrite');tx.objectStore('translations').put(data,version);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
// Prévia 118: ACF e ARA já acompanham o aplicativo. Carrega os JSONs locais automaticamente,
// e guarda cópia no IndexedDB para que também funcionem depois de carregados sem rede.
async function restoreBibles(){
  const versions=['ACF','ARA'];
  const status=$('bibleImportStatus');
  if(status)status.textContent='Carregando ACF e ARA inclusas no aplicativo...';
  // A primeira tela fica interativa antes da leitura das bases (8 MB de JSON).
  // A base já persistida no IndexedDB tem prioridade, sem download, parse e gravação repetidos.
  await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,40)));
  try{
    const db=await bibleDB();
    try{
      for(const version of versions){
        const data=await new Promise((resolve,reject)=>{
          const tx=db.transaction('translations','readonly');
          const req=tx.objectStore('translations').get(version);
          req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
        });
        if(data&&data.books&&Object.keys(data.books).length===66)importedBibles[version]=data;
        // Entre as leituras grandes, devolva o controle ao Safari.
        await new Promise(resolve=>setTimeout(resolve,0));
      }
    }finally{db.close()}
  }catch(error){console.warn('Bíblias em cache indisponíveis:',error)}
  // Busque no pacote apenas a tradução que ainda não foi salva no dispositivo.
  for(const version of versions){
    if(importedBibles[version])continue;
    try{
      const response=await fetch('./Biblia_'+version+'.json?v=118',{cache:'force-cache'});
      if(!response.ok)throw Error('HTTP '+response.status);
      const data=await response.json();
      if(data.translation!==version||!data.books||Object.keys(data.books).length!==66)throw Error('Base bíblica incompleta');
      importedBibles[version]=data;
      try{await storeBible(version,data)}catch(error){console.warn('Não foi possível guardar Bíblia para uso offline:',error)}
    }catch(error){console.warn('Bíblia '+version+' não carregou do pacote:',error)}
    await new Promise(resolve=>setTimeout(resolve,0));
  }
  const ready=versions.filter(v=>!!importedBibles[v]);
  if(ready.length===2)status.textContent='ACF e ARA prontas para usar — já incluídas no aplicativo.';
  else if(ready.length)status.textContent='Disponível: '+ready.join(', ')+'. Para completar, abra o aplicativo com o servidor ativo.';
  else status.textContent='Não foi possível carregar as Bíblias. Abra o aplicativo pelo endereço do servidor e recarregue.';
  drawBiblePicker();loadBibleText();
}
function importedVerseCount(bi,ch){const data=importedBibles[$('bibleTranslation').value];if(!data)return 40;let n=0;for(let v=1;v<=180;v++){if(getImportedVerse(data,bi,ch,v))n=v;else if(n)break}return n||40}

function normalizeBookKey(k){return String(k).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function getImportedVerse(data,bi,ch,n){const books=data.books||data.livros||{};const bookName=BIBLE_BOOKS[bi][0];let book=books[bookName]||books[String(bi)]||books[String(bi+1)];if(!book){const wanted=normalizeBookKey(bookName);const key=Object.keys(books).find(k=>normalizeBookKey(k)===wanted);book=books[key]}const chapters=book?.chapters||book?.capitulos||book;const chapter=chapters?.[String(ch)]|| (Array.isArray(chapters)?chapters[ch-1]:null);const verses=chapter?.verses||chapter?.versiculos||chapter;const entry=verses?.[String(n)]??(Array.isArray(verses)?verses[n-1]:null);return typeof entry==='string'?entry:entry?.text||entry?.texto||''}
async function loadBibleText(){const serial=++bibleFetchSerial;resetBibleText();if(!selectedVerses.length){$('bibleLoadStatus').textContent='Toque nos versículos para selecionar.';return;}const bi=Number($('bibleBook').value),ch=Number($('bibleChapter').value),version=$('bibleTranslation').value;const data=importedBibles[version];if(!data){$('bibleLoadStatus').textContent=`Bíblia ${version} ainda não carregada. Aguarde ou recarregue o aplicativo.`;return;}const selected=[...selectedVerses].sort((a,b)=>a-b);const found=selected.map(n=>getImportedVerse(data,bi,ch,n));if(found.some(t=>!t)){ $('bibleLoadStatus').textContent='Um ou mais versículos não estão presentes na base importada.';return;}if(serial!==bibleFetchSerial)return;bibleLoadedText=found.map((t,i)=>`${selected[i]}. ${t}`).join('\n\n');bibleLoadedKey=[version,bi,ch,selected.join(',')].join('/');$('bibleText').value=bibleLoadedText;bibleCredit=data.credit||data.fonte||'';$('bibleCredit').textContent=bibleCredit;$('bibleLoadStatus').textContent=`Texto ${version} pronto para apresentação.`;}
$('bibleImport').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>15*1024*1024)throw Error('Arquivo maior que 15 MB.');const data=JSON.parse(await file.text());const translation=String(data.translation||data.traducao||'').toUpperCase();if(!['ACF','ARA'].includes(translation))throw Error('O JSON deve indicar translation: ACF ou ARA.');if(!data.books&&!data.livros)throw Error('O JSON precisa conter books ou livros.');importedBibles[translation]=data;await storeBible(translation,data);$('bibleTranslation').value=translation;$('bibleImportStatus').textContent=`Base ${translation} salva neste aparelho. Não é sincronizada entre aparelhos.`;drawBiblePicker();loadBibleText();}catch(err){$('bibleImportStatus').textContent='Erro na importação: '+err.message;}});
$('bibleTranslation').addEventListener('change',loadBibleText);
function bibleGroup(i){return BIBLE_GROUPS.findIndex(n=>i<n)}
function formatVerseSpan(nums){const arr=[...new Set((Array.isArray(nums)?nums:[]).map(Number).filter(n=>Number.isFinite(n)&&n>0))].sort((a,b)=>a-b);if(!arr.length)return'';const groups=[];let start=arr[0],prev=arr[0];for(const n of arr.slice(1)){if(n===prev+1){prev=n;continue}groups.push(start===prev?String(start):`${start}-${prev}`);start=prev=n}groups.push(start===prev?String(start):`${start}-${prev}`);return groups.join(', ')}
function bibleRef(){const name=BIBLE_BOOKS[Number($('bibleBook').value)][0],ch=Number($('bibleChapter').value)||1;const vs=[...selectedVerses].sort((a,b)=>a-b);const ref=`${name} ${ch}${vs.length?':'+formatVerseSpan(vs):''}`;$('bibleReferencePreview').textContent='Referência: '+ref;return ref}

function presentSelectedBibleVerse(){
  const bi=Number($('bibleBook').value),ch=Number($('bibleChapter').value),v=Number(selectedVerses[0]);
  const translation=$('bibleTranslation').value;
  const raw=importedBibles[translation];
  if(!raw||!v)return;
  const text=getImportedVerse(raw,bi,ch,v);
  if(!text){$('bibleLoadStatus').textContent='Versículo não disponível nesta tradução.';return;}
  const reference=BIBLE_BOOKS[bi][0]+' '+ch+':'+v;
  // A Bíblia apresenta diretamente um versículo. Não ativa o editor do cronograma.
  present({id:uid(),type:'versiculo',title:reference,reference,translation,content:text,cronogramaSource:false});
}

function drawBiblePicker(){const bi=Number($('bibleBook').value),book=BIBLE_BOOKS[bi],ch=Number($('bibleChapter').value)||1;
 $('bibleSelectedBook').textContent=book[0];$('bibleSelectedChapter').textContent='Capítulo '+ch;$('bibleSelectedVerses').textContent=selectedVerses.length?selectedVerses.slice().sort((a,b)=>a-b).join(', '):'Selecionar';
 ['book','chapter','verse'].forEach(step=>{const b=$('bibleStep'+step[0].toUpperCase()+step.slice(1));b.classList.toggle('active',step===bibleStep);b.setAttribute('aria-pressed',step===bibleStep)});
 $('bibleBooksGrid').hidden=bibleStep!=='book';$('bibleChaptersGrid').hidden=bibleStep!=='chapter';$('bibleVersesGrid').hidden=bibleStep!=='verse';
 if(bibleStep==='book'){$('bibleBooksGrid').innerHTML=BIBLE_BOOKS.map(([name],i)=>`<button type="button" class="bible-book-tile group-${bibleGroup(i)} ${i===bi?'chosen':''}" data-book="${i}"><strong>${BIBLE_ABBR[i]}</strong><small>${escapeHtml(name)}</small></button>`).join('');$('bibleBooksGrid').querySelectorAll('button').forEach(b=>b.onclick=()=>{$('bibleBook').value=b.dataset.book;bibleChapters();selectedVerses=[];bibleStep='chapter';drawBiblePicker();loadBibleText()})}
 if(bibleStep==='chapter'){$('bibleChaptersGrid').innerHTML=Array.from({length:book[1]},(_,i)=>`<button type="button" data-chapter="${i+1}" class="${ch===i+1?'chosen':''}">${i+1}</button>`).join('');$('bibleChaptersGrid').querySelectorAll('button').forEach(b=>b.onclick=()=>{$('bibleChapter').value=b.dataset.chapter;selectedVerses=[];bibleStep='verse';drawBiblePicker();loadBibleText()})}
 if(bibleStep==='verse'){const max=importedVerseCount(bi,ch); // Usa a quantidade da base importada quando disponível.
 $('bibleVersesGrid').innerHTML=Array.from({length:max},(_,i)=>`<button type="button" data-verse="${i+1}" class="${selectedVerses.includes(i+1)?'chosen':''}" aria-pressed="${selectedVerses.includes(i+1)}">${i+1}</button>`).join('');$('bibleVersesGrid').querySelectorAll('button').forEach(b=>b.onclick=()=>{const v=Number(b.dataset.verse);if(window.bibleCronogramaSelect){selectedVerses=selectedVerses.includes(v)?selectedVerses.filter(n=>n!==v):[...selectedVerses,v];drawBiblePicker();loadBibleText();window.dispatchEvent(new Event('bible-verse-selection'));}else{selectedVerses=[v];drawBiblePicker();loadBibleText();if(document.getElementById('biblia')?.classList.contains('active'))presentSelectedBibleVerse()}})}
 bibleRef();}
['book','chapter','verse'].forEach(step=>{$('bibleStep'+step[0].toUpperCase()+step.slice(1)).onclick=()=>{bibleStep=step;drawBiblePicker()}});
// A referência lista apenas os versículos tocados; nunca cria um intervalo.
function bibleItem(){const content=bibleLoadedText.trim();const key=[$('bibleTranslation').value,Number($('bibleBook').value),Number($('bibleChapter').value),selectedVerses.slice().sort((a,b)=>a-b).join(',')].join('/');if(!selectedVerses.length){alert('Escolha pelo menos um versículo.');return null}if(!content||bibleLoadedKey!==key){alert('Aguarde o carregamento do texto bíblico antes de continuar.');return null}const reference=bibleRef();return {id:uid(),type:'versiculo',title:$('bibleTitle').value.trim()||reference,reference,translation:$('bibleTranslation').value,content,credit:bibleCredit,fileUrl:null}}
$('bibleAdd').onclick=()=>{const item=bibleItem();if(!item)return;item.cronogramaSource=true;state.days[state.day].push(item);try{save()}catch(e){state.days[state.day].pop();alert('Não foi possível salvar no aparelho.');return}drawItems();setTab('agenda');alert('Adicionado ao cronograma. Nada foi projetado.')};
$('biblePresent').onclick=()=>{const item=bibleItem();if(item){item.cronogramaSource=false;present(item)}};
drawBiblePicker();
restoreBibles();

// Prévia 9: biblioteca de MP3 com armazenamento local em IndexedDB.
const MUSIC_FOLDERS=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado','Fundos de Busca','Fundos de Clamor','Fundos de Descarrego'];
let musicIndex=[],musicFolder=MUSIC_FOLDERS[0],musicObjectUrl=null;
function musicDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open('reunioes3-mp3-v1',1);req.onupgradeneeded=()=>req.result.createObjectStore('tracks',{keyPath:'id'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function musicAll(){const db=await musicDb();return new Promise((resolve,reject)=>{const req=db.transaction('tracks').objectStore('tracks').getAll();req.onsuccess=()=>{db.close();resolve(req.result)};req.onerror=()=>{db.close();reject(req.error)}})}
async function musicPut(track){const db=await musicDb();return new Promise((resolve,reject)=>{const tx=db.transaction('tracks','readwrite');tx.objectStore('tracks').put(track);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
async function musicRemove(id){const db=await musicDb();return new Promise((resolve,reject)=>{const tx=db.transaction('tracks','readwrite');tx.objectStore('tracks').delete(id);tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
function refreshMusicSelect(){const sel=$('musicSelect');const prev=sel.value;sel.innerHTML=musicIndex.map(m=>`<option value="${m.id}">${escapeHtml(m.folder)} · ${escapeHtml(m.name)}</option>`).join('');if(musicIndex.some(m=>m.id===prev))sel.value=prev}
function drawMusic(){const folders=$('musicFolders');folders.innerHTML=MUSIC_FOLDERS.map((f,i)=>`<button type="button" class="music-folder ${f===musicFolder?'chosen':''}" data-folder="${i}"><span>${i>6?'♫':'▦'}</span><b>${escapeHtml(f)}</b><small>${musicIndex.filter(m=>m.folder===f).length} arquivo(s)</small></button>`).join('');folders.querySelectorAll('button').forEach(b=>b.onclick=()=>{musicFolder=MUSIC_FOLDERS[+b.dataset.folder];drawMusic()});$('musicFolderTitle').textContent=musicFolder;const tracks=musicIndex.filter(m=>m.folder===musicFolder);$('musicCount').textContent=tracks.length+' arquivo(s)';$('musicList').innerHTML=tracks.length?tracks.map(m=>`<div class="music-track"><span>♫</span><div><b>${escapeHtml(m.name)}</b><small>MP3 · ${(m.size/1024/1024).toFixed(1)} MB</small></div><button data-play="${m.id}">▶ Ouvir</button><button data-add="${m.id}">+ Cronograma</button><button data-remove="${m.id}">Excluir</button></div>`).join(''):'<div class="empty">Esta pasta está vazia. Toque em “Gerenciar MP3” para adicionar músicas.</div>';$('musicList').querySelectorAll('[data-play]').forEach(b=>b.onclick=()=>playMusic(b.dataset.play));$('musicList').querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{const m=musicIndex.find(x=>x.id===b.dataset.add);state.days[state.day].push({id:uid(),type:'musica',title:m.name,musicId:m.id});save();drawItems();setTab('agenda')});$('musicList').querySelectorAll('[data-remove]').forEach(b=>b.onclick=async()=>{if(!confirm('Excluir este MP3 da biblioteca deste aparelho?'))return;await musicRemove(b.dataset.remove);await loadMusic()})}
async function loadMusic(){try{const all=await musicAll();musicIndex=all.map(({id,name,folder,size})=>({id,name,folder,size}));drawMusic();refreshMusicSelect()}catch(err){$('musicList').textContent='Não foi possível acessar o armazenamento de músicas neste navegador.'}}
async function playMusic(id){try{const db=await musicDb();const m=await new Promise((resolve,reject)=>{const r=db.transaction('tracks').objectStore('tracks').get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});db.close();if(!m){alert('Este MP3 não está salvo neste aparelho. Adicione-o novamente na aba Músicas.');return}const player=$('musicAudio');
// Prévia 167: o Cronograma já limpou explicitamente o telão antes de preparar o áudio.
player.pause();if(musicObjectUrl)URL.revokeObjectURL(musicObjectUrl);musicObjectUrl=URL.createObjectURL(m.blob);player.src=musicObjectUrl;$('musicNow').textContent='♫ '+m.name;if(!window.__preview58PrepareOnly)await player.play()}catch(err){alert('Não foi possível iniciar o áudio. Abra a aba Músicas e toque em Ouvir.') }}
$('musicManage').onclick=()=>{$('musicUploadFolder').value=musicFolder;$('musicUploadDialog').showModal()};$('musicUploadFolder').innerHTML=MUSIC_FOLDERS.map(f=>`<option>${escapeHtml(f)}</option>`).join('');$('musicUploadForm').onsubmit=async e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();const files=[...$('musicFiles').files];if(!files.length)return;const folder=$('musicUploadFolder').value;try{for(const file of files){if(!file.type.startsWith('audio/')&&!/\.mp3$/i.test(file.name))throw Error('Selecione arquivos de áudio.');await musicPut({id:uid(),name:file.name.replace(/\.[^.]+$/,''),folder,size:file.size,blob:file})}musicFolder=folder;$('musicUploadDialog').close();$('musicUploadForm').reset();await loadMusic()}catch(err){alert('Não foi possível salvar o MP3. Verifique o espaço livre no aparelho.')}};
$('musicStop').onclick=()=>{const player=$('musicAudio');player.pause();player.currentTime=0};$('musicVolume').oninput=e=>{$('musicAudio').volume=+e.target.value/100;$('musicVolumeLabel').textContent=e.target.value+'%'};$('musicAudio').volume=.5;loadMusic();

;

// Fonte consolidada: enhancements.js
// Prévia 13: edição protegida, etapas recolhíveis, toque-arraste sem seleção e MP3 persistente.
(function(){
const palette=['#2563eb','#0d9488','#9333ea','#d97706','#dc2626','#475569','#16a34a','#db2777'];
let editing=false,openIds=new Set(),drag=null;
function ensure(){if(!state.sections)state.sections={};for(let d=0;d<7;d++)if(!Array.isArray(state.sections[d])||!state.sections[d].length)state.sections[d]=[{id:'default-'+d,title:'Início',color:'#2563eb'}];}
ensure();save();
const sections=()=>state.sections[state.day];
const sectionOf=x=>sections().find(s=>s.id===x.sectionId)||sections()[0];
function options(){const el=$('itemSection');if(!el)return;const old=el.value;el.innerHTML=sections().map(s=>`<option value="${s.id}">${escapeHtml(s.title)}</option>`).join('');if(sections().some(s=>s.id===old))el.value=old;}
function setEdit(v){editing=v;$('editSchedule').hidden=v;$('saveSchedule').hidden=!v;$('newSection').hidden=!v;$('addItem').hidden=true;drawItems();}
$('editSchedule').onclick=()=>setEdit(true);
$('saveSchedule').onclick=()=>{save();setEdit(false)};
$('newSection').onclick=()=>{const name=prompt('Nome da nova etapa:','Nova etapa');if(!name||!name.trim())return;const s={id:uid(),title:name.trim(),color:palette[sections().length%palette.length]};sections().push(s);openIds.add(s.id);save();drawItems()};
const originalOpen=openEditor;
openEditor=function(x){originalOpen(x);options();$('itemSection').value=x?sectionOf(x).id:sections()[0].id;if($('type').value==='musica')renderMusicPicker()};
$('type').addEventListener('change',()=>{if($('type').value==='musica')renderMusicPicker()});
let folder=MUSIC_FOLDERS[0];
function renderMusicPicker(){const f=$('cronMusicFolders'),t=$('cronMusicTracks');if(!f||!t)return;f.innerHTML=MUSIC_FOLDERS.map(n=>`<button type="button" class="${n===folder?'selected':''}" data-folder="${escapeHtml(n)}">${escapeHtml(n)}</button>`).join('');f.querySelectorAll('button').forEach(b=>b.onclick=()=>{folder=b.dataset.folder;renderMusicPicker()});const tracks=musicIndex.filter(m=>m.folder===folder);t.innerHTML=tracks.length?tracks.map(m=>`<button type="button" class="${$('musicSelect').value===m.id?'selected':''}" data-id="${m.id}">♫ ${escapeHtml(m.name)}</button>`).join(''):'<p>Nenhum MP3 nesta pasta. Adicione na aba Músicas.</p>';t.querySelectorAll('button').forEach(b=>b.onclick=()=>{$('musicSelect').value=b.dataset.id;const m=musicIndex.find(v=>v.id===b.dataset.id);if(m)$('itemTitle').value=m.name;renderMusicPicker()});}
const oldRefresh=refreshMusicSelect;refreshMusicSelect=function(){oldRefresh();renderMusicPicker()};
const oldDraw=drawItems;
drawItems=function(){ensure();oldDraw();const root=$('sectionsRoot'),storage=$('items');root.innerHTML='';sections().forEach((s,index)=>{
 const items=state.days[state.day].filter(x=>sectionOf(x).id===s.id),expanded=openIds.has(s.id);
 const box=document.createElement('section');box.className='meeting-section'+(editing?' is-editing':'');box.dataset.section=s.id;
 box.innerHTML=`<div class="meeting-section-head" style="--section-accent:${s.color};--section-tint:color-mix(in srgb, ${s.color} 12%, white)"><span class="section-grip" ${editing?'':'hidden'} aria-hidden="true">⠿</span><button type="button" class="section-toggle" aria-expanded="${expanded}"><strong>${escapeHtml(s.title)}</strong><small>${items.length} ${items.length===1?'item':'itens'}</small></button><div class="section-actions" ${editing?'':'hidden'}><button type="button" data-sact="rename" title="Renomear">✎</button><button type="button" data-sact="color" title="Cor">🎨</button><button type="button" data-sact="remove" title="Excluir">✕</button></div></div><div class="meeting-section-body" ${expanded?'':'hidden'}><div class="meeting-section-content"></div><button type="button" class="section-add" ${editing?'':'hidden'}>+ Adicionar conteúdo nesta etapa</button></div>`;
 const content=box.querySelector('.meeting-section-content');
 for(const x of items){const el=storage.querySelector(`.item[data-item-id="${CSS.escape(x.id)}"]`);if(el){el.draggable=false;el.querySelectorAll('[data-act="up"],[data-act="down"]').forEach(b=>b.remove());el.querySelectorAll('[data-act="edit"],[data-act="delete"]').forEach(b=>b.hidden=!editing);el.querySelector('.drag-handle')?.remove();if(editing){const grip=document.createElement('span');grip.className='content-grip';grip.textContent='⠿';el.prepend(grip);setupPointer(grip,el,'.item',id=>reorderItem(id,el.dataset.itemId));}content.appendChild(el)}}
 if(!content.children.length)content.innerHTML='<p class="section-empty">Nenhum conteúdo nesta etapa.</p>';
 box.querySelector('.section-toggle').onclick=()=>{if(openIds.has(s.id))openIds.delete(s.id);else openIds.add(s.id);drawItems()};
 box.querySelector('.meeting-section-head').addEventListener('click',e=>{if(e.target.closest('button,.section-actions,.section-grip'))return;box.querySelector('.section-toggle').click()});
 box.querySelector('.section-add').onclick=()=>{openEditor();$('itemSection').value=s.id};
 box.querySelectorAll('[data-sact]').forEach(b=>b.onclick=()=>{const i=sections().findIndex(v=>v.id===s.id);switch(b.dataset.sact){case 'rename':{const n=prompt('Nome da etapa:',s.title);if(n?.trim())s.title=n.trim();break}case 'color':{const picker=document.createElement('div');picker.className='color-picker';picker.innerHTML=palette.map(c=>`<button type="button" style="background:${c}" data-color="${c}" aria-label="Cor ${c}"></button>`).join('');const prev=box.querySelector('.color-picker');if(prev){prev.remove();return}box.querySelector('.meeting-section-head').after(picker);picker.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{s.color=btn.dataset.color;save();drawItems()});return}case 'remove':{if(sections().length===1){alert('É necessário manter pelo menos uma etapa.');return}const count=state.days[state.day].filter(x=>sectionOf(x).id===s.id).length;const message=`Excluir a etapa «${s.title}» e ${count} ${count===1?'item':'itens'} dentro dela?\n\nOs itens serão removidos do Cronograma. Os arquivos originais nas bibliotecas de Músicas e Mídias serão mantidos.`;if(!confirm(message))return;state.days[state.day]=state.days[state.day].filter(x=>sectionOf(x).id!==s.id);sections().splice(i,1);openIds.delete(s.id);break;}}save();drawItems()});
 if(editing)setupPointer(box.querySelector('.meeting-section-head'),box,'.meeting-section',id=>reorderSection(id,s.id));
 root.appendChild(box);
 });options();};
function reorderSection(source,target){const a=sections(),from=a.findIndex(x=>x.id===source),to=a.findIndex(x=>x.id===target);if(from<0||to<0||from===to)return;const [item]=a.splice(from,1);a.splice(to,0,item);save();drawItems()}
function reorderItem(source,target){const a=state.days[state.day],from=a.findIndex(x=>x.id===source),to=a.findIndex(x=>x.id===target);if(from<0||to<0||from===to)return;const [item]=a.splice(from,1);item.sectionId=sectionOf(a.find(x=>x.id===target)).id;a.splice(to,0,item);save();drawItems()}
function setupPointer(handle,el,selector,commit){if(!handle)return;handle.style.touchAction='none';let start=null;
 handle.addEventListener('pointerdown',e=>{if(!editing||e.button!==0||e.target.closest('.section-actions'))return;e.preventDefault();start={id:el.dataset.section||el.dataset.itemId,x:e.clientX,y:e.clientY,target:null};handle.setPointerCapture(e.pointerId);el.classList.add('dragging-touch');document.body.classList.add('no-select')});
 handle.addEventListener('pointermove',e=>{if(!start)return;e.preventDefault();el.style.transform=`translateY(${e.clientY-start.y}px)`;const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest(selector);document.querySelectorAll(selector+'.drop-target').forEach(x=>x.classList.remove('drop-target'));if(hit&&hit!==el){hit.classList.add('drop-target');start.target=hit.dataset.section||hit.dataset.itemId}});
 const finish=()=>{if(!start)return;const source=start.id,target=start.target;el.style.transform='';el.classList.remove('dragging-touch');document.body.classList.remove('no-select');document.querySelectorAll(selector+'.drop-target').forEach(x=>x.classList.remove('drop-target'));start=null;if(target)commit(source,target)};
 handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);
}
// Player fixo: aparece ao tocar MP3 no cronograma e permanece visível ao navegar entre abas.
const audio=$('musicAudio'),float=$('floatingMusic');let playerCollapsed=false;let playerPreparing=false;const mini=document.createElement('button');mini.type='button';mini.id='floatingMusicRestore';mini.textContent='♫ Abrir player';mini.hidden=true;float.after(mini);mini.onclick=()=>{playerCollapsed=false;float.hidden=false;mini.hidden=true;syncPlayer()};
function fmt(sec){sec=Number.isFinite(sec)?Math.floor(sec):0;return `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`}
const playIcon='<svg viewBox="0 0 48 48" class="play-glyph" aria-hidden="true"><path d="M17 11 Q17 8 20 10 L39 21 Q43 24 39 27 L20 38 Q17 40 17 37 Z" fill="currentColor"/></svg>';
const pauseIcon='<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="12" y="9" width="9" height="30" rx="2" fill="currentColor"/><rect x="27" y="9" width="9" height="30" rx="2" fill="currentColor"/></svg>';
const repeatIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const volumeIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Zm4 4a5 5 0 0 1 0 6m3-9a9 9 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>';
const muteIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Zm5 4 5 6m0-6-5 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/></svg>';
let previousVolume=0.5;
function syncPlayer(){const name=$('musicNow').textContent;const switching=!!window.__reunioesVersionSwitch;const active=switching||!!audio.src&&!!audio.currentSrc;float.hidden=!active||playerCollapsed||(playerPreparing&&!switching);mini.hidden=!active||!playerCollapsed||(playerPreparing&&!switching);$('floatingMusicTitle').textContent=name;$('floatingPause').innerHTML=audio.paused?playIcon:pauseIcon;$('floatingPause').setAttribute('aria-label',audio.paused?'Reproduzir':'Pausar');$('floatingTime').textContent=fmt(audio.currentTime);$('floatingDuration').textContent=fmt(audio.duration);const seekValue=audio.duration?Math.round(audio.currentTime/audio.duration*1000):0;$('floatingSeek').value=seekValue;$('floatingSeek').style.setProperty('--seek-fill',(seekValue/10)+'%');$('floatingSeek').style.setProperty('--seek-pct',(seekValue/10)+'%');const label=audio.loop?'↻ Repetir: ligado':'↻ Repetir: desligado';$('floatingRepeat').innerHTML=repeatIcon;$('floatingRepeat').classList.toggle('is-on',audio.loop);$('musicRepeatButton').textContent='↻';$('floatingRepeat').setAttribute('aria-pressed',String(audio.loop));$('musicRepeatButton').setAttribute('aria-pressed',String(audio.loop));const actualVolume=audio.muted?0:Math.round(audio.volume*100);$('floatingVolume').value=actualVolume;$('floatingVolume').style.setProperty('--volume-fill',actualVolume+'%');$('floatingVolumeLabel').textContent=actualVolume+'%';$('floatingMute').innerHTML=audio.muted||audio.volume===0?muteIcon:volumeIcon}
const basePlay=playMusic;playMusic=async function(id){const switching=!!window.__reunioesVersionSwitch; if(!switching){playerPreparing=true;playerCollapsed=false;mini.hidden=true;float.hidden=true;$('floatingMusicTitle').textContent='♫ Carregando MP3…';}try{await basePlay(id)}finally{if(!switching){playerPreparing=false;float.style.left='12px';float.style.right='auto';float.style.top='auto';float.style.bottom='12px';}syncPlayer()}};
$('floatingPause').onclick=()=>{if(audio.paused)audio.play().catch(()=>{});else audio.pause();syncPlayer()};
function stop(){audio.pause();audio.currentTime=0;syncPlayer()}
$('floatingStop').onclick=()=>{audio.currentTime=0;if(audio.paused)audio.play().catch(()=>{});syncPlayer()};$('floatingMute').onclick=()=>{if(audio.muted||audio.volume===0){audio.muted=false;audio.volume=audio.volume||previousVolume||0.5}else{previousVolume=audio.volume||0.5;audio.muted=true}syncPlayer()};$('musicStop').addEventListener('click',syncPlayer);
function repeat(){audio.loop=!audio.loop;$('musicRepeat').checked=audio.loop;syncPlayer()}
$('floatingRepeat').onclick=repeat;$('musicRepeatButton').onclick=repeat;
$('floatingSeek').oninput=e=>{const v=Number(e.target.value);e.target.style.setProperty('--seek-fill',(v/10)+'%');e.target.style.setProperty('--seek-pct',(v/10)+'%');if(Number.isFinite(audio.duration)&&audio.duration>0)audio.currentTime=audio.duration*v/1000;syncPlayer()};
$('floatingVolume').oninput=e=>{audio.muted=false;audio.volume=Number(e.target.value)/100;$('musicVolume').value=e.target.value;$('musicVolumeLabel').textContent=e.target.value+'%';syncPlayer()};
$('floatingMusicClose').onclick=()=>{playerCollapsed=!playerCollapsed;syncPlayer()};
['play','pause','timeupdate','durationchange','ended','volumechange'].forEach(ev=>audio.addEventListener(ev,syncPlayer));
$('musicRepeat').onchange=()=>{audio.loop=$('musicRepeat').checked;syncPlayer()};
// Prévia 18: botão de saída fora da área ampliada, sempre acessível.
const previewExit=document.createElement('button');
previewExit.type='button';previewExit.id='previewExit';previewExit.textContent='✕ Fechar prévia';previewExit.hidden=true;
document.body.appendChild(previewExit);
function closeExpandedPreview(){const screen=$('preview');screen.classList.remove('preview-expanded');previewExit.hidden=true;$('expandPreview').textContent='⛶ Ampliar prévia';}
$('expandPreview').onclick=()=>{const screen=$('preview');if(screen.classList.contains('preview-expanded')){closeExpandedPreview();return;}screen.classList.add('preview-expanded');previewExit.hidden=false;$('expandPreview').textContent='✕ Reduzir prévia'};
previewExit.onclick=closeExpandedPreview;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('preview').classList.contains('preview-expanded'))closeExpandedPreview()});
$('musicUploadForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return;if([...$('musicFiles').files].some(f=>!/\.mp3$/i.test(f.name))){e.preventDefault();e.stopImmediatePropagation();alert('Selecione somente arquivos MP3.')}},true);
const videoRepeat=document.createElement('button');videoRepeat.type='button';videoRepeat.id='videoRepeat';videoRepeat.textContent='↻ Repetir vídeo: não';$('muteVideo').parentElement.appendChild(videoRepeat);let repeatVideo=false;videoRepeat.onclick=()=>{repeatVideo=!repeatVideo;videoRepeat.textContent=repeatVideo?'↻ Repetir vídeo: sim':'↻ Repetir vídeo: não';const v=$('preview').querySelector('video');if(v)v.loop=repeatVideo};const oldPresent=present;present=function(x){oldPresent(x);const v=$('preview').querySelector('video');if(v)v.loop=repeatVideo};
const oldMusicDraw=drawMusic;drawMusic=function(){oldMusicDraw();$('musicList').querySelectorAll('.music-track').forEach(row=>{const id=row.querySelector('[data-play]')?.dataset.play;if(!id)return;const b=document.createElement('button');b.textContent='Mover pasta';b.onclick=async()=>{const m=musicIndex.find(v=>v.id===id);const target=prompt('Mover para qual pasta?\n'+MUSIC_FOLDERS.map((x,i)=>`${i+1}. ${x}`).join('\n'),'1');const n=Number(target);if(!Number.isInteger(n)||n<1||n>MUSIC_FOLDERS.length)return;const tracks=await musicAll(),full=tracks.find(x=>x.id===id);if(!full)return;full.folder=MUSIC_FOLDERS[n-1];await musicPut(full);await loadMusic()};row.appendChild(b)})};
const oldLoad=loadMusic;loadMusic=async function(){await oldLoad();drawMusic()};
const originalDay=drawDays;drawDays=function(){originalDay();drawItems()};
// Adicionar MP3 pela biblioteca sempre atribui à etapa principal do dia.
$('addItem').onclick=()=>{openEditor();};$('addItem').hidden=true;
openIds.add(sections()[0].id);drawItems();
})();
// Bloqueia seleção nativa durante arraste no iOS, sem bloquear campos editáveis.
document.addEventListener('selectstart',e=>{if(e.target.closest('.meeting-section-head,.meeting-section-content')&&!e.target.closest('input,textarea,[contenteditable]'))e.preventDefault()});
document.addEventListener('contextmenu',e=>{if(e.target.closest('.meeting-section-head,.content-grip'))e.preventDefault()});

;

// Fonte consolidada: lyrics.js
// Preview 14: letras editáveis vinculadas ao MP3, rolagem manual sem seleção, player minimizável.
(function(){
'use strict';
const $=id=>document.getElementById(id);
const music=$('musicList'),float=$('floatingMusic'),audio=$('musicAudio');
if(!music||!float||!audio)return;
const isBackground=f=>['Fundos de Busca','Fundos de Clamor','Fundos de Descarrego'].includes(f);
let activeTrackId=null;
const box=document.createElement('section');box.id='lyricsPanel';box.hidden=true;
box.innerHTML='<div class="lyrics-head"><strong>Letra</strong><div class="lyrics-head-actions"><button type="button" id="lyricsEditInline" aria-label="Editar letra" title="Editar letra">✎</button><button type="button" id="lyricsHide">Ocultar</button></div></div><div id="lyricsScroll" tabindex="0" aria-label="Letra da música, deslize para ler"></div>';
float.appendChild(box);
$('lyricsHide').onclick=()=>{box.hidden=true;};
const edit=document.createElement('dialog');edit.id='lyricsEditor';edit.innerHTML='<form method="dialog" id="lyricsForm"><div class="lyrics-head"><h2>Editar letra da música</h2><button type="button" id="lyricsCancel" aria-label="Fechar">✕</button></div><p id="lyricsSongName"></p><label for="lyricsText">Cole ou digite a letra da música</label><p class="lyrics-auto-hint">O refrão é destacado automaticamente quando a letra contém uma indicação como [Refrão], (Refrão), REFRAO ou Refrão 2x.</p><textarea id="lyricsText" rows="15" spellcheck="true" placeholder="Digite a letra aqui..."></textarea><div class="lyrics-edit-tools"><button type="button" id="lyricsHighlight">Destacar seleção</button><button type="button" id="lyricsUnhighlight">Retirar destaque</button><small>Selecione o texto na caixa acima e toque em Destacar. O destaque ficará igual ao refrão.</small></div><div class="lyrics-actions"><button type="button" id="lyricsClear">Apagar letra</button><button type="submit" class="primary">Salvar letra</button></div></form>';
document.body.appendChild(edit);
let editingId=null;
$('lyricsCancel').onclick=()=>edit.close();
async function openActiveLyricsEditor(){if(!activeTrackId)return;const track=await getTrack(activeTrackId);if(!track||isBackground(track.folder))return;editingId=activeTrackId;$('lyricsSongName').textContent=track.groupTitle||track.name;$('lyricsText').value=track.lyrics||'';edit.showModal();}
$('lyricsEditInline').onclick=openActiveLyricsEditor;
function wrapSelectedHighlight(){const field=$('lyricsText');const a=field.selectionStart,b=field.selectionEnd;if(a===b){alert('Primeiro selecione o título, refrão ou trecho da letra que deseja destacar.');field.focus();return;}const selected=field.value.slice(a,b);field.setRangeText('[[DESTAQUE]]'+selected+'[[/DESTAQUE]]',a,b,'select');field.focus();}
$('lyricsHighlight').onclick=wrapSelectedHighlight;
$('lyricsUnhighlight').onclick=()=>{const field=$('lyricsText');const a=field.selectionStart,b=field.selectionEnd;const raw=field.value;const selected=raw.slice(a,b);if(a!==b){field.setRangeText(selected.replace(/\[\[\/?DESTAQUE\]\]/gi,''),a,b,'select');}else{field.value=raw.replace(/\[\[\/?DESTAQUE\]\]/gi,'');}field.focus();};
$('lyricsClear').onclick=()=>{if(confirm('Apagar a letra desta música?'))$('lyricsText').value='';};
async function getTrack(id){const db=await musicDb();try{return await new Promise((res,rej)=>{const r=db.transaction('tracks','readonly').objectStore('tracks').get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}finally{db.close()}}
// Formatação apenas visual: o texto original salvo não é modificado nem interpretado como HTML.
// Aceita indicadores isolados com símbolos/emoji e repetição 2x, x2 etc.
function isChorusMarker(line){
 const clean=String(line).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/\[\[\/?REFRAO\]\]/gi,'')
  .replace(/[^a-zA-Z0-9\s]/g,' ').replace(/\s+/g,' ').trim().toLowerCase();
 return /^refrao(?:\s+(?:x\s*\d+|\d+\s*x))?$/.test(clean);
}
function normalizedTitle(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\.[a-z0-9]{2,5}$/,'').replace(/[^a-z0-9]+/g,' ').trim();}
function titleMatches(line, name){
 const a=normalizedTitle(line), b=normalizedTitle(name);
 if(!a||!b||a.length<4)return false;
 // Aceita nome exato ou nome seguido por identificador entre parênteses, como (P)/(T).
 return a===b || (b.startsWith(a+' ') && b.slice(a.length+1).split(' ').length<=2 && /^[a-z0-9 ]+$/.test(b.slice(a.length+1)));
}
function renderLyrics(target, raw, trackName, groupTitle){
 target.replaceChildren();
 const lines=String(raw).replace(/\r\n?/g,'\n').split('\n');
 let chorus=false, hasVerse=false, nonEmptyBefore=0, manual=false;
 const firstNonEmpty=lines.findIndex(x=>x.trim());
 for(let i=0;i<lines.length;i++){
  const original=lines[i];
  const line=original.replace(/\[\[\/?REFRAO\]\]/gi,'');
  const plain=line.replace(/\[\[\/?DESTAQUE\]\]/gi,'');
  const marker=isChorusMarker(plain);
  if(marker){chorus=true;hasVerse=false;}
  else if(!plain.trim()&&chorus&&hasVerse){chorus=false;}
  const trimmed=plain.trim();
  const isFirst=i===firstNonEmpty;
  const obviousHeading=isFirst&&trimmed.length>=3&&trimmed.length<=80&&/^[^a-záàâãéêíóôõúç]*[A-ZÁÀÂÃÉÊÍÓÔÕÚÇ][^a-záàâãéêíóôõúç]*$/.test(trimmed)&&!/[.!?]$/.test(trimmed);
  const isTitle=!chorus&&!marker&&nonEmptyBefore<2&&(titleMatches(plain,groupTitle||'')||titleMatches(plain,trackName)||obviousHeading);
  if(trimmed)nonEmptyBefore++;
  const defaultHighlight=isTitle||(chorus&&!!trimmed);
  const parts=line.split(/(\[\[\/?DESTAQUE\]\])/gi);
  for(const part of parts){
   if(/^\[\[DESTAQUE\]\]$/i.test(part)){manual=true;continue;}
   if(/^\[\[\/DESTAQUE\]\]$/i.test(part)){manual=false;continue;}
   if(!part)continue;
   if(manual||defaultHighlight){const el=document.createElement('strong');el.className=manual?'lyrics-manual-highlight':isTitle?'lyrics-song-title':'lyrics-chorus';el.textContent=part;target.appendChild(el);}
   else target.appendChild(document.createTextNode(part));
  }
  if(chorus&&!marker&&trimmed)hasVerse=true;
  if(i<lines.length-1)target.appendChild(document.createTextNode('\n'));
 }
}

async function refreshLyrics(id){if(!id){box.hidden=true;return;}const track=await getTrack(id);if(!track||isBackground(track.folder)||!track.lyrics?.trim()){box.hidden=true;return;}const scroll=$('lyricsScroll');renderLyrics(scroll,track.lyrics.trim(),track.name,track.groupTitle);scroll.scrollTop=0;box.hidden=false;}
$('lyricsForm').onsubmit=async e=>{e.preventDefault();const id=editingId;if(!id)return;const track=await getTrack(id);if(!track)return;track.lyrics=$('lyricsText').value;await musicPut(track);edit.close();if(activeTrackId===id)await refreshLyrics(id);};
function addEditButtons(){music.querySelectorAll('.music-track').forEach(row=>{const id=row.querySelector('[data-play]')?.dataset.play;if(!id||row.querySelector('[data-edit-lyrics]'))return;const meta=musicIndex.find(m=>m.id===id);if(!meta||isBackground(meta.folder))return;const btn=document.createElement('button');btn.type='button';btn.textContent='✎ Editar letra';btn.dataset.editLyrics=id;btn.onclick=async()=>{const track=await getTrack(id);if(!track)return;editingId=id;$('lyricsSongName').textContent=track.name;$('lyricsText').value=track.lyrics||'';edit.showModal();};row.appendChild(btn);});}
// drawMusic é invocado pela aba, carregamentos e alterações de pastas.
const oldDraw=drawMusic;drawMusic=function(){oldDraw();addEditButtons()};addEditButtons();
// A música continua tocando ao trocar de aba ou minimizar o player.
const oldPlay=playMusic;playMusic=async function(id){activeTrackId=id;await oldPlay(id);await refreshLyrics(id);};
// Ao minimizar, oculta-se também a letra; ao restaurar, ela retorna sem reiniciar o áudio.
// O botão de minimizar da versão anterior mantém o áudio ativo.
const oldClose=$('floatingMusicClose').onclick;
$('floatingMusicClose').onclick=function(e){oldClose?.call(this,e);};
// Repetição visual simples e acessível.
const repeat=$('floatingRepeat');
if(repeat){
  repeat.title='Repetir música';
  repeat.setAttribute('aria-label','Ativar ou desativar repetição');
  // Não observar alterações de texto feitas pelo próprio observador: isso causava loop infinito no Safari.
  function syncRepeat(){
    const label=audio.loop?'↻ Repetir ligado':'↻ Repetir desligado';
    repeat.classList.toggle('is-on',audio.loop);
    // Ícone premium controlado pelo sincronizador; não substituir por texto.
  }
  repeat.addEventListener('click',()=>requestAnimationFrame(syncRepeat));
  $('musicRepeatButton')?.addEventListener('click',()=>requestAnimationFrame(syncRepeat));
  syncRepeat();
}
})();

// Prévia 15: painel de letra expansível, reversível e arrastável por toque.
(function(){
'use strict';
const player=document.getElementById('floatingMusic');
const lyrics=document.getElementById('lyricsPanel');
const hide=document.getElementById('lyricsHide');
const head=player?.querySelector('.floating-music-head');
if(!player||!lyrics||!hide||!head)return;
const toggle=document.createElement('button');toggle.type='button';toggle.id='lyricsShow';toggle.textContent='Mostrar letra';toggle.hidden=true;
player.querySelector('.floating-music-controls')?.after(toggle);
function update(){const available=!!document.getElementById('lyricsScroll')?.textContent?.trim()&&document.getElementById('lyricsScroll').textContent.indexOf('ainda não tem letra cadastrada')===-1;
 player.classList.toggle('with-lyrics',!lyrics.hidden);
 toggle.hidden=!lyrics.hidden||!available;
 hide.textContent='Ocultar';
 constrain();}
hide.addEventListener('click',()=>requestAnimationFrame(update));
toggle.addEventListener('click',()=>{lyrics.hidden=false;update();});
// Preserva a ação original de tocar, que preenche o painel assincronamente.
const watcher=new MutationObserver(()=>update());watcher.observe(lyrics,{attributes:true,attributeFilter:['hidden']});
head.setAttribute('aria-label','Arraste esta barra para mover o player');head.title='Segure e arraste para mover';
let moving=null;
function constrain(){if(!player.style.left)return;const r=player.getBoundingClientRect();const x=Math.max(0,Math.min(innerWidth-r.width,parseFloat(player.style.left)||0));const y=Math.max(0,Math.min(innerHeight-r.height,parseFloat(player.style.top)||0));player.style.left=x+'px';player.style.top=y+'px';}
head.addEventListener('pointerdown',e=>{if(e.target.closest('button')||e.button!==0)return;const r=player.getBoundingClientRect();moving={id:e.pointerId,dx:e.clientX-r.left,dy:e.clientY-r.top};head.setPointerCapture(e.pointerId);player.style.left=r.left+'px';player.style.top=r.top+'px';player.style.right='auto';player.style.bottom='auto';e.preventDefault();});
head.addEventListener('pointermove',e=>{if(!moving||moving.id!==e.pointerId)return;const x=Math.max(0,Math.min(innerWidth-player.offsetWidth,e.clientX-moving.dx));const y=Math.max(0,Math.min(innerHeight-player.offsetHeight,e.clientY-moving.dy));player.style.left=x+'px';player.style.top=y+'px';});
const end=()=>{moving=null;};head.addEventListener('pointerup',end);head.addEventListener('pointercancel',end);
window.addEventListener('resize',constrain);
update();
})();

;

// Fonte consolidada: groups.js
// Prévia 26: conjuntos manuais de música, sem classificação por nome de arquivo.
(function(){
'use strict';
const $=id=>document.getElementById(id);
const roles=[['completa','Piano'],['trecho','Trecho'],['refrao','Refrão'],['fundo','Fundo'],['piano_bateria','Piano + Bat.'],['trecho_bateria','Trecho + Bat.'],['refrao_bateria','Refrão + Bat.']];
const panel=document.createElement('section');panel.className='panel song-groups';panel.innerHTML=`<div class="panelhead"><div><div class="eyebrow">ÁUDIOS REUNIDOS</div><h2>♫ Músicas com versões</h2></div><button type="button" class="primary" id="newSongGroup">+ Nova música</button></div><p>Escolha pessoalmente a pasta e a versão de cada áudio. Os nomes dos MP3 não determinam o destino. Cada versão pode ter apenas um MP3. O título é obtido do nome do arquivo.</p><div id="songGroupsList"></div>`;
const section=$('musicas')?.querySelector('.music-panel');if(!section)return;section.querySelector('.panelhead').appendChild(panel.querySelector('#newSongGroup'));panel.remove();
const dlg=document.createElement('dialog');dlg.id='songGroupDialog';
const folderNames=Array.isArray(MUSIC_FOLDERS)?MUSIC_FOLDERS:[];
const backgroundFolder=folder=>/^(Fundos de Busca|Fundos de Clamor|Fundos de Descarrego)$/i.test((folder||'').trim());
function safe(s){return escapeHtml(String(s))}
dlg.innerHTML=`<form id="songGroupForm"><div class="dialoghead"><h2 id="groupDialogTitle">Adicionar música</h2><button type="button" id="groupClose">✕</button></div><div class="group-folder-banner" id="groupFolderBanner"><span class="group-folder-banner-label">Pasta selecionada</span><strong id="groupCurrentFolder"></strong><small id="groupFolderHint">Toque em uma pasta à esquerda para mudar o destino antes de adicionar a música.</small></div><div id="groupMoveArea" hidden><div class="group-move-line"><span>📁 <strong id="groupMoveFolderLabel"></strong></span><button type="button" id="groupMoveButton">Mover de pasta</button></div><div id="groupMoveOptions" hidden></div></div><p class="group-folder-confirm" id="groupFolderConfirm" aria-live="polite"></p><div id="groupExistingTracks" class="group-existing-tracks"></div><details id="groupAddDetails" class="group-add-details"><summary>＋ Adicionar outro MP3 <span id="groupAvailableCount"></span></summary><p class="muted">Somente versões ainda não cadastradas.</p><div id="groupFileSlots"></div></details><label class="group-lyrics-label">Letra da música (opcional)<textarea id="groupLyrics" rows="7" placeholder="Cole aqui a letra completa."></textarea></label><p class="muted" id="groupDetectedName">O nome será obtido do primeiro MP3.</p><p class="group-error" id="groupError" role="alert" hidden></p><div class="dialogactions"><button type="button" id="groupCancel">Cancelar</button><button type="submit" class="primary" id="groupSave">Salvar música</button></div></form>`;
document.body.appendChild(dlg);
let chosenFolder=folderNames[0]||'',editing=null;
const originalPut=musicPut;
const existing=$('groupExistingTracks');
function chooseFolder(folder){chosenFolder=folder||musicFolder||folderNames[0]||'';$('groupFolderConfirm').textContent=editing?'':'✓ Pasta escolhida: '+chosenFolder;$('groupCurrentFolder').textContent=chosenFolder;$('groupMoveFolderLabel').textContent=chosenFolder;updateAvailable();document.querySelector('.group-lyrics-label').hidden=backgroundFolder(chosenFolder);if(backgroundFolder(chosenFolder))$('groupAddDetails').open=true}
window.__r115ChooseMusicFolder=folder=>{if(!editing)chooseFolder(folder)};
$('groupMoveButton').onclick=()=>{$('groupMoveOptions').hidden=!$('groupMoveOptions').hidden};$('groupMoveOptions').innerHTML=folderNames.map(f=>`<button type="button" class="group-move-choice" data-folder="${safe(f)}">📁 ${safe(f)}</button>`).join('');$('groupMoveOptions').querySelectorAll('button').forEach(b=>b.onclick=()=>{chooseFolder(b.dataset.folder);$('groupMoveOptions').hidden=true});
$('groupFileSlots').innerHTML=roles.map(([key,label])=>`<div class="group-file-slot"><div class="group-slot-head"><b>${label}</b><small>${key==='completa'?'Piano':key==='piano_bateria'?'Piano com bateria':key==='trecho'?'Parte da música':key==='trecho_bateria'?'Trecho com bateria':key==='refrao'?'Somente refrão':key==='refrao_bateria'?'Refrão com bateria':'Instrumental'}</small></div><label class="group-pick-label">+ Escolher MP3<input type="file" id="groupFile_${key}" accept=".mp3,audio/mpeg,audio/mp3"></label><div class="group-file-selected" id="groupSelected_${key}">Nenhum MP3 escolhido</div></div>`).join('');
function cleanName(file){return file.name.replace(/\.mp3$/i,'')}
function guessedName(file){return cleanName(file).replace(/\s*[\(\[\{]\s*(?:PB|TB|RB|P|T|R|F|C|trecho|refr[aã]o|fundo|completa)\s*[\)\]\}]\s*$/i,'').trim()||cleanName(file)}
function selectedFiles(){return roles.map(([role])=>({role,files:[...$('groupFile_'+role).files]}))}
let occupiedRoles=new Set();
function updateAvailable(){let count=0;for(const [role] of roles){const slot=$('groupFile_'+role).closest('.group-file-slot');const available=!occupiedRoles.has(role)&&(!backgroundFolder(chosenFolder)||role==='fundo');slot.hidden=!available;if(!available)$('groupFile_'+role).value='';else count++} $('groupAvailableCount').textContent='';$('groupAddDetails').hidden=count===0;}
function updateSelected(){for(const {role,files} of selectedFiles()){$('groupSelected_'+role).textContent=files.length?files.map(f=>'✓ '+f.name).join('  |  '):'Nenhum MP3 escolhido';$('groupSelected_'+role).classList.toggle('has-files',!!files.length)}const first=selectedFiles().flatMap(x=>x.files)[0];$('groupDetectedName').textContent=editing?'Os MP3 serão adicionados ao conjunto: '+(editing.groupTitle||'Música'):(first?'Nome sugerido: '+guessedName(first):'O nome será obtido automaticamente do primeiro MP3 escolhido.');$('groupError').hidden=true}
for(const [role] of roles)$('groupFile_'+role).addEventListener('change',updateSelected);
async function openGroup(group){editing=group||null;$('songGroupForm').reset();$('groupAddDetails').open=!group;$('groupDialogTitle').textContent=group?'Editar música e versões':'Adicionar música';$('groupLyrics').value=group?.lyrics||'';chooseFolder(group?.folder||musicFolder||folderNames[0]);$('groupFolderBanner').hidden=false;$('groupFolderHint').hidden=!!group;$('groupMoveArea').hidden=!group;$('groupMoveOptions').hidden=true;await renderExisting();updateSelected();$('groupSave').textContent=group?'Salvar alterações':'Conferir e salvar música';dlg.showModal()}
async function renderExisting(){existing.replaceChildren();occupiedRoles=new Set();if(!editing?.groupId){updateAvailable();return}const all=await musicAll(),tracks=all.filter(t=>t.groupId===editing.groupId);occupiedRoles=new Set(tracks.map(t=>t.role||'completa'));const heading=document.createElement('h3');heading.textContent='MP3 já adicionados';existing.append(heading);for(const t of tracks){const row=document.createElement('div');row.className='group-existing-row';const label=document.createElement('span');label.textContent=(roles.find(([r])=>r===t.role)?.[1]||'Versão')+' · '+t.name+'.mp3';const play=document.createElement('button');play.type='button';play.textContent='▶ Ouvir';play.onclick=()=>playMusic(t.id);const remove=document.createElement('button');remove.type='button';remove.textContent='✕ Remover';remove.onclick=async()=>{if(!confirm('Excluir definitivamente este MP3 da biblioteca deste aparelho? Esta ação não pode ser desfeita.'))return;try{if(!backgroundFolder(chosenFolder)&&t.role!=='fundo'){const all=await musicAll();const others=all.filter(x=>x.groupId===editing.groupId&&x.id!==t.id);if(!others.some(x=>(x.role||'completa')!=='fundo')){alert('Esta é a última versão principal. Adicione outra versão principal antes de remover este MP3.');return}}await musicRemove(t.id);await renderExisting();await loadMusic();await drawGroups();}catch(error){$('groupError').textContent='Não foi possível remover o MP3: '+(error?.message||String(error));$('groupError').hidden=false}};row.append(label,play,remove);existing.append(row)}if(!tracks.length){existing.textContent='Nenhum MP3 restante neste conjunto.'}updateAvailable()}
$('groupClose').onclick=$('groupCancel').onclick=()=>dlg.close();
$('songGroupForm').onsubmit=async e=>{e.preventDefault();
 const selections=selectedFiles(),files=selections.flatMap(s=>s.files),err=$('groupError');err.hidden=true;
 if(!files.length&&!editing){err.textContent='Escolha pelo menos um MP3.';err.hidden=false;return}
 if(backgroundFolder(chosenFolder)&&selections.some(s=>s.role!=='fundo'&&s.files.length)){err.textContent='Nesta pasta é permitido apenas MP3 do tipo Fundo.';err.hidden=false;return}
 if(!backgroundFolder(chosenFolder)){const current=editing?.groupId?(await musicAll()).filter(t=>t.groupId===editing.groupId):[];const principal=[...current.map(t=>t.role||'completa'),...selections.filter(s=>s.files.length).map(s=>s.role)].some(role=>role!=='fundo');if(!principal){err.textContent='Adicione uma versão principal (Piano, Trecho ou Refrão, com ou sem bateria). Fundo sozinho não pode ser salvo nas pastas dos dias da semana.';err.hidden=false;return}}
 if(files.some(f=>!/\.mp3$/i.test(f.name))){err.textContent='Somente arquivos MP3 são permitidos.';err.hidden=false;return}
 if(selections.some(s=>s.files.length>1||s.files.length&&occupiedRoles.has(s.role))){err.textContent='Cada versão aceita um único MP3. Remova o arquivo anterior para substituí-lo.';err.hidden=false;return}
 const title=editing?.groupTitle||guessedName(files[0]),artist=editing?.artist||'',folder=chosenFolder,groupId=editing?.groupId||uid(),lyrics=backgroundFolder(folder)?'':$('groupLyrics').value.trim();
 if(!lyrics&&!backgroundFolder(folder)&&!confirm('Música sem letra. Deseja salvar mesmo assim?'))return;
 const summary=selections.filter(s=>s.files.length).map(s=>roles.find(r=>r[0]===s.role)[1]+': '+s.files[0].name).join('\n');
 if(files.length&&!confirm('Confira antes de salvar:\n\nMúsica: '+title+'\nPasta: '+folder+'\n\n'+summary+'\n\nEstá tudo certo?'))return;
 const button=$('groupSave');button.disabled=true;button.textContent='Salvando...';
 try{
  // Salvar apenas letra/pasta não cria novos registros nem exige selecionar MP3 novamente.
  // A gravação usa a função original de IndexedDB, evitando regravações recursivas.
  if(editing){const all=await musicAll();for(const t of all.filter(t=>t.groupId===groupId)){if(t.lyrics!==lyrics||t.folder!==folder){await originalPut({...t,lyrics,folder})}}}
  for(const {role,files:chosen} of selections){for(const file of chosen){await originalPut({id:uid(),name:cleanName(file),folder,size:file.size,blob:file,groupId,groupTitle:title,artist,role,lyrics})}}
  dlg.close();musicFolder=folder;await loadMusic();await drawGroups();
 }catch(error){const name=error?.name||'',detail=error?.message||String(error);err.textContent=name==='QuotaExceededError'?'O armazenamento de músicas do Safari está cheio. Nenhum arquivo existente foi apagado.':'Não foi possível salvar: '+detail;err.hidden=false;console.error('Erro ao salvar música',error)}
 finally{button.disabled=false;button.textContent=editing?'Salvar alterações':'Conferir e salvar música'}
};
// Biblioteca única: as pastas abrem uma janela com todos os arquivos e conjuntos.
const folderDialog=document.createElement('div');folderDialog.id='musicFolderDialog';folderDialog.hidden=true;folderDialog.open=false;folderDialog.showModal=()=>{folderDialog.hidden=false;folderDialog.open=true;section.classList.add('library-expanded')};folderDialog.close=()=>{folderDialog.hidden=true;folderDialog.open=false;section.classList.remove('library-expanded')};folderDialog.innerHTML='<div class="folder-modal-head"><h2 id="folderModalTitle">Músicas</h2><button type="button" id="folderModalClose">✕ Fechar</button></div><div id="folderModalContent"></div>';document.body.appendChild(folderDialog);
$('folderModalClose').onclick=()=>folderDialog.close();
const nativeList=$('musicList'),nativeHead=section.querySelector('.music-list-head');
const folderContent=$('folderModalContent');section.appendChild(folderDialog);const folderSearch=document.createElement('input');folderSearch.type='search';folderSearch.id='folderMusicSearch';folderSearch.className='music-search-input';folderSearch.placeholder='Pesquisar';folderSearch.setAttribute('aria-label','Pesquisar músicas nesta pasta');folderContent.append(folderSearch,nativeHead,nativeList);folderSearch.addEventListener('input',()=>{oldDrawMusic();drawGroups()});const mainSearch=document.createElement('input');mainSearch.type='search';mainSearch.id='allMusicSearch';mainSearch.className='music-search-input';mainSearch.placeholder='Pesquisar';mainSearch.setAttribute('aria-label','Pesquisar músicas em todas as pastas');const mainResults=document.createElement('div');mainResults.id='allMusicResults';section.querySelector('#musicFolders').before(mainSearch,mainResults);mainSearch.addEventListener('input',()=>drawGroups());
section.querySelector('.panelhead h2').textContent='♫ Biblioteca de Músicas';
const groupButton=$('newSongGroup');groupButton.textContent='+ Adicionar música';
const originalOpenGroup=openGroup;
$('newSongGroup').onclick=()=>{chooseFolder(musicFolder||folderNames[0]);originalOpenGroup(null)};
$('musicManage').hidden=true;
async function drawGroups(){let all;try{all=await musicAll()}catch(err){folderContent.textContent='Não foi possível carregar músicas.';return}
const groups=new Map();for(const t of all){if(!t.groupId||t.folder!==musicFolder)continue;if(!groups.has(t.groupId))groups.set(t.groupId,[]);groups.get(t.groupId).push(t)}
let target=$('folderGroups');if(!target){target=document.createElement('div');target.id='folderGroups';folderContent.insertBefore(target,nativeHead)}target.replaceChildren();
for(const [id,tracks] of [...groups.entries()].sort((a,b)=>(a[1][0].groupTitle||a[1][0].name||'').localeCompare((b[1][0].groupTitle||b[1][0].name||''),'pt-BR',{sensitivity:'base'}))){
 if(folderSearch.value.trim()&&!((tracks[0].groupTitle||tracks[0].name||'')+' '+(tracks[0].artist||'')).toLocaleLowerCase('pt-BR').includes(folderSearch.value.trim().toLocaleLowerCase('pt-BR')))continue;
 const first=tracks[0],card=document.createElement('div');card.className='song-group-card song-group-compact';
 const title=first.groupTitle||first.name||'Música';
 const head=document.createElement('div');head.className='song-group-head';
 const play=document.createElement('button');play.type='button';play.className='song-row-play';play.title='Abrir música no Media Player';
 const label=document.createElement('span');label.textContent='♫ '+title;
 play.append(label);play.dataset.scheduleId=(tracks.find(t=>t.role==='completa')||tracks[0]).id;play.onclick=()=>playMusic(play.dataset.scheduleId);
 const removeGroup=document.createElement('button');removeGroup.type='button';removeGroup.textContent='×';removeGroup.setAttribute('aria-label','Excluir música');removeGroup.title='Excluir música';removeGroup.className='song-row-action song-row-delete';removeGroup.onclick=async()=>{if(!confirm('Excluir definitivamente a música “'+title+'” e todas as suas '+tracks.length+' versões MP3 deste aparelho? Esta ação não pode ser desfeita.'))return;removeGroup.disabled=true;try{for(const track of tracks)await musicRemove(track.id);await loadMusic();}catch(error){alert('Não foi possível excluir a música: '+(error?.message||String(error)));removeGroup.disabled=false}};
 const edit=document.createElement('button');edit.type='button';edit.className='song-row-action';edit.textContent='✎';edit.setAttribute('aria-label','Editar música');edit.title='Editar música';edit.onclick=()=>openGroup(first);
 head.append(play,edit,removeGroup);card.append(head);target.append(card)
}
// Arquivos agrupados aparecem apenas no conjunto, sem duplicação na lista comum.
nativeList.querySelectorAll('.music-track').forEach(el=>{const btn=el.querySelector('[data-play]');if(!btn)return;const track=all.find(t=>t.id===btn.dataset.play);if(track?.groupId){el.remove();return}if(folderSearch.value.trim()&&!track.name.toLocaleLowerCase('pt-BR').includes(folderSearch.value.trim().toLocaleLowerCase('pt-BR'))){el.hidden=true;return}const addButton=el.querySelector('[data-add]');if(addButton)addButton.remove();btn.textContent='♫ '+track.name;const editButton=document.createElement('button');editButton.type='button';editButton.textContent='✎';editButton.className='song-row-action';editButton.title='Editar música';editButton.onclick=()=>openGroup(track);const removeButton=el.querySelector('[data-remove]');if(removeButton){removeButton.before(editButton);removeButton.textContent='×';removeButton.classList.add('song-row-action','song-row-delete');removeButton.title='Excluir música';}});
// Prévia 66: ordenar alfabeticamente todos os títulos da pasta (grupos e avulsos), A–Z.
// Mover os cartões de avulsos para a mesma lista dos grupos, respeitando a ordem única.
for(const element of [...nativeList.querySelectorAll('.music-track')]){if(!element.hidden)target.append(element)}
const songTitle=node=>node.querySelector('.song-row-play,.music-track [data-play]')?.textContent?.replace(/^♫\s*/, '').trim()||node.textContent.trim();
[...target.children].sort((a,b)=>songTitle(a).localeCompare(songTitle(b),'pt-BR',{sensitivity:'base',numeric:true})).forEach(el=>target.append(el));
// Contar conjuntos, e não arquivos MP3 individuais.
const uniqueMusicCount=folder=>new Set(all.filter(t=>t.folder===folder).map(t=>t.groupId?'grupo:'+t.groupId:'avulso:'+t.id)).size;
const countLabel=folder=>{const n=uniqueMusicCount(folder);const isFundos=['Fundos de Busca','Fundos de Clamor','Fundos de Descarrego'].includes(folder);return n+' '+(isFundos?(n===1?'fundo':'fundos'):(n===1?'música':'músicas'));};
$('musicFolders').querySelectorAll('.music-folder').forEach((b,i)=>{const count=b.querySelector('small');if(count)count.textContent=countLabel(MUSIC_FOLDERS[i])});
$('musicCount').textContent=countLabel(musicFolder);
const q=mainSearch.value.trim().toLocaleLowerCase('pt-BR');mainResults.replaceChildren();$('musicFolders').hidden=!!q;if(q){const seen=new Set();const matched=all.filter(t=>{const id=t.groupId||t.id;if(seen.has(id))return false;seen.add(id);return ((t.groupTitle||t.name||'')+' '+(t.artist||'')).toLocaleLowerCase('pt-BR').includes(q)});if(!matched.length){mainResults.textContent=''}for(const t of matched){const card=document.createElement('div');card.className='music-search-result';const label=document.createElement('div');const name=document.createElement('strong');name.textContent='♫ '+(t.groupTitle||t.name);const folder=document.createElement('small');folder.textContent='📁 '+t.folder.toLocaleUpperCase('pt-BR');label.append(name,folder);const actions=document.createElement('div');actions.className='music-result-actions';const play=document.createElement('button');play.className='primary';play.textContent='♫ '+(t.groupTitle||t.name);play.className='song-row-play';play.dataset.scheduleId=(all.find(x=>x.groupId===t.groupId&&x.role==='completa')||t).id;play.onclick=()=>{section.classList.add('library-expanded');playMusic(play.dataset.scheduleId)};const edit=document.createElement('button');edit.textContent='✎';edit.className='song-row-action';edit.title='Editar música';edit.onclick=()=>{musicFolder=t.folder;openGroup(t)};actions.append(play,edit);card.append(label,actions);mainResults.append(card)}}
$('folderModalTitle').textContent=musicFolder.toLocaleUpperCase('pt-BR');
}
// Um toque abre a pasta diretamente. O manipulador em captura impede que
// o clique antigo apenas selecione a pasta e redesenhe os botões.
const oldDrawMusic=drawMusic;
drawMusic=function(){const labels=[...$('musicFolders').querySelectorAll('.music-folder small')].map(n=>n.textContent);oldDrawMusic();const buttons=$('musicFolders').querySelectorAll('.music-folder');buttons.forEach((b,i)=>{if(labels[i])b.querySelector('small').textContent=labels[i]});void drawGroups()};
$('musicFolders').addEventListener('click',async event=>{
 const button=event.target.closest('button.music-folder');
 if(!button||!$('musicFolders').contains(button))return;
 event.preventDefault();event.stopImmediatePropagation();
 musicFolder=MUSIC_FOLDERS[Number(button.dataset.folder)];
 folderSearch.value='';
 // Abrir a janela ANTES de redesenhar a lista: impede o flash da contagem
 // temporária de arquivos e da escrita antiga atrás do modal.
 if(!folderDialog.open)folderDialog.showModal();
 oldDrawMusic();
 await drawGroups();
},true);
const originalLoad=loadMusic;loadMusic=async function(){await originalLoad();await drawGroups()};drawMusic();drawGroups();

// Prévia 54: biblioteca inicia somente com pastas; player aparece sob demanda.
// Mantém a pesquisa e o editor existentes, mas remove a coluna de player permanente.
const musicNav=document.querySelector('[data-tab="musicas"]');
const oldOpenDialog=folderDialog.showModal;
folderDialog.showModal=()=>{oldOpenDialog()};
const oldCloseDialog=folderDialog.close;
folderDialog.close=()=>{oldCloseDialog()};
// Ocultar o botão de ocultar letra sem remover o botão do lápis.
const hideLyrics=$('lyricsHide');if(hideLyrics)hideLyrics.hidden=true;
const showLyrics=$('lyricsShow');if(showLyrics)showLyrics.hidden=true;
if($('lyricsPanel'))$('lyricsPanel').hidden=false;

// Usa gravação direta para evitar duplicação de áudios no armazenamento.

})();

;

// Fonte consolidada: versions29.js
// Prévia 29: um registro por música; versões somente no player.
(function(){
'use strict';
const $=id=>document.getElementById(id);
let groupCache=new Map(),trackMap=new Map(),currentGroup=null;
async function scan(){const all=await musicAll();groupCache=new Map();trackMap=new Map(all.map(t=>[t.id,t]));for(const t of all){if(!t.groupId)continue;if(!groupCache.has(t.groupId))groupCache.set(t.groupId,[]);groupCache.get(t.groupId).push(t)}return all}
function representative(group){return group.find(t=>t.role==='completa')||group[0]}
function catalog(folder){const result=[];const seen=new Set();for(const m of musicIndex.filter(m=>m.folder===folder)){const t=trackMap.get(m.id);if(t?.groupId){if(seen.has(t.groupId))continue;seen.add(t.groupId);const group=groupCache.get(t.groupId);if(group)result.push({id:representative(group).id,name:group[0].groupTitle||group[0].name,groupId:t.groupId})}else result.push({id:m.id,name:m.name})}return result}
// Captura os dados atuais sem alterar o armazenamento original.
const oldLoad=loadMusic;
loadMusic=async function(){await oldLoad();await scan();refreshMusicSelect();};
const oldRefresh=refreshMusicSelect;
refreshMusicSelect=function(){oldRefresh();const sel=$('musicSelect');const previous=sel.value;sel.replaceChildren();for(const folder of MUSIC_FOLDERS){for(const entry of catalog(folder)){const option=document.createElement('option');option.value=entry.id;option.textContent=folder+' · '+entry.name;sel.append(option)}}if([...sel.options].some(o=>o.value===previous))sel.value=previous};
// No editor do cronograma, substitui a lista extensa por músicas principais.
function updatePicker(){const f=$('cronMusicFolders'),t=$('cronMusicTracks');if(!f||!t||$('type')?.value!=='musica')return;
let selected=f.querySelector('.selected')?.dataset.folder||MUSIC_FOLDERS[0];
function render(){f.replaceChildren();for(const folder of MUSIC_FOLDERS){const b=document.createElement('button');b.type='button';b.textContent=folder;b.dataset.folder=folder;b.className=folder===selected?'selected':'';b.onclick=()=>{selected=folder;render()};f.append(b)}
t.replaceChildren();const items=catalog(selected);for(const entry of items){const b=document.createElement('button');b.type='button';b.textContent='♫ '+entry.name;b.className=$('musicSelect').value===entry.id?'selected':'';b.onclick=()=>{$('musicSelect').value=entry.id;$('itemTitle').value=entry.name;render()};t.append(b)}if(!items.length)t.textContent='Nenhuma música nesta pasta.'}
render()}
// Os listeners antigos são instalados pelo aplicativo. Atualiza depois que abrem o editor.
const originalOpen=openEditor;openEditor=function(item){originalOpen(item);updatePicker()};
$('type')?.addEventListener('change',()=>{if($('type').value==='musica')queueMicrotask(updatePicker)});
// Captura os cliques do seletor para reconstruir sem listar as versões individualmente.
$('cronMusicFolders')?.addEventListener('click',()=>queueMicrotask(updatePicker));
// Faixa de versões no player: usa o mesmo áudio e letra já existentes.
const bar=document.createElement('div');bar.id='groupVersionBar';bar.className='group-version-bar';bar.hidden=true;
const heading=document.createElement('div');heading.className='group-version-heading';heading.textContent='Escolha a versão';bar.append(heading);
const buttons=document.createElement('div');buttons.className='group-version-buttons';bar.append(buttons);
$('floatingMusic')?.querySelector('.floating-music-head')?.after(bar);
const oldPlay=playMusic;
playMusic=async function(id){await scan();const track=trackMap.get(id);const group=track?.groupId?groupCache.get(track.groupId):null;
currentGroup=group||null;
bar.hidden=!group;
buttons.replaceChildren();
if(group){for(const [role,label] of [['completa','PIANO'],['trecho','TRECHO'],['refrao','REFRÃO'],['fundo','FUNDO'],['piano_bateria','PIANO / B'],['trecho_bateria','TRECHO / B'],['refrao_bateria','REFRÃO / B']]){const versions=group.filter(t=>t.role===role);for(let i=0;i<versions.length;i++){const t=versions[i];const b=document.createElement('button');b.type='button';b.textContent=label+(versions.length>1?' '+(i+1):'');b.className='version-choice version-'+role+(t.id===id?' selected':'');b.dataset.versionId=t.id;b.title=t.name;b.onclick=async()=>{if(t.id===document.getElementById('musicAudio')?.dataset?.versionId)return;window.__reunioesVersionSwitch=true;try{await playMusic(t.id)}finally{window.__reunioesVersionSwitch=false;document.getElementById('floatingMusic').hidden=false}};buttons.append(b)}}}
await oldPlay(id);
$('musicAudio').dataset.versionId=id;
if(group){$('floatingMusicTitle').textContent='♫ '+(group[0].groupTitle||group[0].name);$('musicNow').textContent='♫ '+(group[0].groupTitle||group[0].name);}
};
// Biblioteca de pastas: atualiza contagens para contar músicas e não versões.
const oldDraw=drawMusic;drawMusic=function(){oldDraw();for(const b of $('musicFolders')?.querySelectorAll('[data-folder]')||[]){const folder=MUSIC_FOLDERS[Number(b.dataset.folder)];const small=b.querySelector('small');if(small)small.textContent=catalog(folder).length+' música(s)'}};
scan().then(()=>{refreshMusicSelect();drawMusic()}).catch(()=>{});
})();

;

// Fonte consolidada: player44.js
/* Prévia 44: biblioteca fixa; cronograma flutuante. */
(()=>{'use strict';const p=document.getElementById('floatingMusic'),h=p?.querySelector('.floating-music-head');if(!p||!h)return;
const library=()=>!!document.getElementById('musicas')?.classList.contains('active');
function update(){const fixed=library();p.classList.toggle('library-fixed',fixed);if(fixed){p.style.left='auto';p.style.right='8px';p.style.top=p.classList.contains('with-lyrics')?'8px':'auto';p.style.bottom=p.classList.contains('with-lyrics')?'auto':'12px';}else{p.style.right='auto';if(!p.style.left||p.style.left==='auto')p.style.left='12px';if(p.classList.contains('with-lyrics')){p.style.top='8px';p.style.bottom='auto';}else if(p.style.top==='8px'){p.style.top='auto';p.style.bottom='12px';}}}
document.querySelectorAll('.nav[data-tab]').forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(update)));
new MutationObserver(()=>requestAnimationFrame(update)).observe(p,{attributes:true,attributeFilter:['class']});
h.addEventListener('pointerdown',e=>{if(library())e.stopImmediatePropagation()},true);
h.addEventListener('pointermove',e=>{if(library())e.stopImmediatePropagation()},true);
window.addEventListener('resize',update);update();})();

;

// Fonte consolidada: player45.js
/* Prévia 45: indicador de versão reproduzida. */
(()=>{'use strict';const bar=document.getElementById('groupVersionBar'),audio=document.getElementById('musicAudio');if(!bar||!audio)return;function sync(){const id=audio.dataset.versionId;bar.classList.toggle('is-paused',audio.paused||audio.ended);for(const b of bar.querySelectorAll('.version-choice')){const on=b.dataset.versionId===id;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));let indicator=b.querySelector('.playing-bars');if(on&&!indicator){indicator=document.createElement('span');indicator.className='playing-bars';indicator.setAttribute('aria-hidden','true');for(let i=0;i<3;i++)indicator.appendChild(document.createElement('i'));b.appendChild(indicator)}else if(!on&&indicator)indicator.remove();}}for(const evt of ['play','pause','ended','loadedmetadata'])audio.addEventListener(evt,sync);new MutationObserver(sync).observe(bar,{childList:true,subtree:false});const old=window.playMusic;if(typeof old==='function')window.playMusic=async function(...args){const result=await old.apply(this,args);sync();return result};sync();})();
;

// Fonte consolidada: player48.js
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

;

// Fonte consolidada: layout56.js
/* Prévia 56: um único player, restrito a Cronograma e à pasta aberta. */
(()=>{'use strict';
 const $=id=>document.getElementById(id);
 const page=$('musicas'), panel=page?.querySelector('.music-panel'), folder=$('musicFolderDialog');
 const float=$('floatingMusic'), preview=document.querySelector('#agenda .preview');
 const folders=$('musicFolders'), search=$('allMusicSearch'), localSearch=$('folderMusicSearch');
 const results=$('allMusicResults'), add=$('newSongGroup'), header=panel?.querySelector('.panelhead');
 const audio=$('musicAudio');
 if(!page||!panel||!folder||!float||!preview||!header)return;
 // The original code used a fixed-position global overlay; the new layout uses a real grid.
 const workspace=document.createElement('div');workspace.id='music56Workspace';
 const left=document.createElement('div');left.id='music56Left';
 const right=document.createElement('div');right.id='music56Right';
 const empty=document.createElement('div');empty.id='music56Empty';
 empty.innerHTML='<div class="music57-minihead"><span class="music57-note" aria-hidden="true">♫</span><strong>Media Player</strong></div><div class="music57-minicontrols"><button type="button" id="music57Play" aria-label="Reproduzir música selecionada" disabled>▶</button><span>Selecione uma música para reproduzir</span></div>';
 const actions=document.createElement('div');actions.id='music56Actions';
 const topTools=document.createElement('div');topTools.id='music57TopTools';
 const back=document.createElement('button');back.type='button';back.id='music56Back';back.textContent='Voltar';
 actions.append(back);right.append(empty);workspace.append(left,right);panel.prepend(workspace);
 topTools.append(search,add);
 left.append(header,topTools,results,folders,folder);
 // Dentro da pasta, a pesquisa fica acima de Voltar / Adicionar música.
 localSearch?.after(actions);
 const agendaMusicHost=document.createElement('div');agendaMusicHost.id='r91MusicHost';preview.closest('.preview').insertAdjacentElement('afterend',agendaMusicHost);
 const parking=document.createElement('div');parking.id='music56Parking';parking.hidden=true;document.body.append(parking);
 parking.append(float);
 const restore=$('floatingMusicRestore');if(restore)restore.hidden=true;
 const legacyClose=$('floatingMusicClose');if(legacyClose)legacyClose.hidden=true;
 let selected=false, agendaSong=false, agendaMinimized=false;
 const minimize=document.createElement('button');minimize.type='button';minimize.id='agenda56Minimize';minimize.textContent='−';minimize.title='Minimizar player e mostrar telão';minimize.setAttribute('aria-label','Minimizar player e mostrar telão');
 float.querySelector('.floating-music-head')?.append(minimize);
 const closeAgenda=document.createElement('button');closeAgenda.type='button';closeAgenda.id='agenda106Close';closeAgenda.textContent='×';closeAgenda.title='Fechar Media Player e parar a música';closeAgenda.setAttribute('aria-label','Fechar Media Player e parar a música');
 minimize.after(closeAgenda);
 const reopen=document.createElement('button');reopen.type='button';reopen.id='agenda56Reopen';reopen.textContent='♫ Mostrar player';reopen.title='Reabrir player de música';
 document.body.append(reopen);
 minimize.onclick=()=>{agendaMinimized=true;refresh()};
 closeAgenda.onclick=()=>{resetTrack();try{audio.currentTime=0}catch(_e){};refresh();};
 reopen.onclick=()=>{agendaMinimized=false;refresh()};
 let lastTab='';let folderOpenToken=0;
 const activeTab=()=>document.querySelector('.page.active')?.id||'';
 function clearSearch(){for(const el of [search,localSearch]){if(el&&el.value){el.value='';el.dispatchEvent(new Event('input'))}}}
 function resetTrack(){selected=false;agendaSong=false;agendaMinimized=false;audio.pause();}
 function refresh(){
  const tab=activeTab();const open=tab==='musicas'&&!!folder.open&&!folder.hidden;const agendaVisible=tab==='agenda'&&agendaSong&&!agendaMinimized;
  document.body.dataset.player56=agendaVisible?'agenda':open?'folder':'none';
  workspace.classList.toggle('folder-open',open);
  if(open){
   if(add&&add.parentElement!==actions)actions.append(add);
   if(selected){if(float.parentElement!==right)right.append(float)}else if(float.parentElement!==parking)parking.append(float);
   empty.hidden=selected;
  }else{
   if(add&&add.parentElement!==topTools)topTools.append(add);
   if(agendaVisible){if(float.parentElement!==agendaMusicHost)agendaMusicHost.append(float)}
   else if(float.parentElement!==parking)parking.append(float);
   empty.hidden=false;
  }
  preview.classList.remove('player56-on','music-on-right');agendaMusicHost.hidden=!agendaVisible;minimize.hidden=!agendaVisible;closeAgenda.hidden=!agendaVisible;reopen.hidden=!(tab==='agenda'&&agendaSong&&agendaMinimized);
  float.setAttribute('aria-hidden',String(!(agendaVisible||open&&selected)));
  if(restore)restore.hidden=true;
  if(legacyClose)legacyClose.hidden=true;
  lastTab=tab;
 }
 const originalFolderShow=folder.showModal.bind(folder);
 const originalFolderClose=folder.close.bind(folder);
 folder.showModal=function(){
  const token=++folderOpenToken;
  clearSearch();selected=false;agendaSong=false;audio.pause();originalFolderShow();refresh();
  // Preparar a primeira música da pasta, sem reproduzi-la automaticamente.
  // A flag evita o play(), mas preserva versões, controles e letra da música.
  (async()=>{
   try{
    const all=await musicAll();
    if(token!==folderOpenToken||!folder.open||activeTab()!=='musicas')return;
    const found=all.find(t=>t.folder===musicFolder);
    if(!found){selected=false;refresh();return;}
    const group=found.groupId?all.filter(t=>t.groupId===found.groupId&&t.folder===musicFolder):[found];
    const first=group.find(t=>t.role==='completa')||group[0];
    window.__preview58PrepareOnly=true;
    try{await playMusic(first.id)}finally{window.__preview58PrepareOnly=false;audio.pause();}
    if(token===folderOpenToken&&folder.open&&activeTab()==='musicas')refresh();
   }catch(error){window.__preview58PrepareOnly=false;console.warn('Não foi possível preparar a primeira música da pasta',error)}
  })();
 };
 folder.close=function(){++folderOpenToken;originalFolderClose();clearSearch();resetTrack();refresh()};
 back.onclick=()=>folder.close();
 const originalPlay=playMusic;
 playMusic=async function(id){
  if(!window.__preview58PrepareOnly)++folderOpenToken;
  const tab=activeTab();
  if(tab==='musicas'){
   if(!folder.open){
    const match=(typeof musicIndex!=='undefined'?musicIndex:[]).find(t=>t.id===id);
    if(match&&typeof musicFolder!=='undefined')musicFolder=match.folder;
    folder.showModal();if(typeof drawMusic==='function')drawMusic();
   }
   selected=true;agendaSong=false;
  }else if(tab==='agenda'){
   agendaSong=true;agendaMinimized=false;selected=false;
   // Música é áudio: preservar sem alterações a apresentação atual (foto, vídeo, PDF ou apoio).
  }else{
   // No player allowed on Bible, media or settings.
   return;
  }
  refresh();
  try{return await originalPlay(id)}finally{refresh()}
 };
 // Navigation performed by the application may be programmatic or via sidebar clicks.
 const originalSetTab=setTab;
 setTab=function(tab){
  if(tab!==activeTab()){
   if(folder.open)folder.close();else clearSearch();
   resetTrack();
  }
  originalSetTab(tab);refresh();
 };
 document.querySelectorAll('.nav[data-tab]').forEach(nav=>nav.addEventListener('click',()=>queueMicrotask(refresh)));
 // No leftover text in either search field when switching folders or leaving music.
 folders.addEventListener('click',e=>{if(e.target.closest('.music-folder')){clearSearch();queueMicrotask(refresh)}},true);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 // Prevent the old global music overlay from returning on unrelated pages.
 ['play','pause','ended','loadedmetadata'].forEach(ev=>audio.addEventListener(ev,()=>queueMicrotask(refresh)));
 refresh();
})();

;

// Fonte consolidada: preview58.js
/* Prévia 106: o nome desliza até o final e retorna suavemente à posição inicial. */
(()=>{'use strict';
const title=document.getElementById('floatingMusicTitle');if(!title)return;
let viewport=document.getElementById('preview58TitleViewport');
let visible=document.getElementById('preview58TitleText');
if(!viewport){viewport=document.createElement('span');viewport.id='preview58TitleViewport';visible=document.createElement('span');visible.id='preview58TitleText';viewport.append(visible);title.after(viewport)}
let current=null,serial=0,timer=null,frame=0;
function cancel(){clearTimeout(timer);cancelAnimationFrame(frame);}
function schedule(){
 const value=title.textContent.replace(/^[♫♪♬🎵]\s*/u,'').trim();
 if(value===current)return;
 current=value;const id=++serial;cancel();
 visible.style.transition='none';visible.style.transform='translateX(0px)';visible.textContent=value;
 frame=requestAnimationFrame(()=>{if(id!==serial)return;
  const distance=Math.max(0,visible.scrollWidth-viewport.clientWidth+4);if(distance<5)return;
  const seconds=Math.max(3,distance/25);
  timer=setTimeout(()=>{if(id!==serial)return;
   visible.style.transition=`transform ${seconds}s linear`;
   visible.style.transform=`translateX(-${distance}px)`;
   // Pause no fim; retorno suave à posição original, sem salto e sem repetição.
   timer=setTimeout(()=>{if(id!==serial)return;
    visible.style.transition=`transform ${seconds}s linear`;
    visible.style.transform='translateX(0px)';
   },seconds*1000+650);
  },900);
 });
}
new MutationObserver(schedule).observe(title,{childList:true,characterData:true,subtree:true});
window.addEventListener('resize',()=>{current=null;schedule()});
schedule();
})();

;

// Fonte consolidada: preview60.js
/* Prévia 115: painel de cadastro dividido com pastas à esquerda e MP3 à direita. */
(()=>{'use strict';
const $=id=>document.getElementById(id),page=$('musicas'),dialog=$('songGroupDialog');
if(!page||!dialog)return;
const overlay=document.createElement('div');overlay.id='r115Overlay';overlay.hidden=true;
overlay.innerHTML='<div id="r115Panel"><div id="r115Folders"><div class="r115-folder-top"><h2>Escolher pasta</h2><p>Selecione onde a música será salva.</p></div><div id="r115FolderList"></div></div><div id="r115Form"></div></div>';
page.appendChild(overlay);
const folderList=$('r115FolderList'),form=$('r115Form');
const names=typeof MUSIC_FOLDERS!=='undefined'&&Array.isArray(MUSIC_FOLDERS)?MUSIC_FOLDERS:[];
let chosen='';
const safe=t=>String(t).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
function paint(){folderList.innerHTML=names.map(n=>'<button type="button" class="r115-folder '+(n===chosen?'active':'')+'" data-folder="'+safe(n)+'"><span class="r115-folder-icon">▰</span><span>'+safe(n).toUpperCase()+'</span>'+(n===chosen?'<span class="r115-tick">✓</span>':'')+'</button>').join('');}
folderList.addEventListener('click',e=>{const button=e.target.closest('button[data-folder]');if(!button)return;chosen=button.dataset.folder;window.__r115ChooseMusicFolder?.(chosen);paint();});
const originalParent=dialog.parentNode;let docked=false;
const originalShow=dialog.showModal?.bind(dialog),originalClose=dialog.close?.bind(dialog);
dialog.showModal=function(){
  if(document.querySelector('.page.active')?.id!=='musicas')return;
  const isEdit=!!document.querySelector('#groupMoveArea:not([hidden])');
  const current=document.getElementById('groupCurrentFolder')?.textContent?.trim();
  chosen=current||names[0]||'';
  paint();
  overlay.hidden=false;
  document.body.classList.add('r115-adding-music');
  form.append(dialog);
  dialog.setAttribute('open','');
  dialog.scrollTop=0;
  docked=true;
  // Em edições, manter a pasta da música até o usuário optar por mover.
  if(!isEdit&&chosen)window.__r115ChooseMusicFolder?.(chosen);
};
dialog.close=function(){
  if(!docked){if(originalClose)try{return originalClose()}catch(_e){}return;}
  dialog.removeAttribute('open');
  overlay.hidden=true;
  document.body.classList.remove('r115-adding-music');
  if(originalParent&&dialog.parentNode!==originalParent)originalParent.append(dialog);
  docked=false;
};
// Adicionar música: apenas botão da biblioteca, fora das pastas abertas.
const add=$('newSongGroup');
add?.addEventListener('click',e=>{
  if(document.getElementById('musicFolderDialog')?.open){
    // Botão na pasta não deve abrir o cadastro.
    e.preventDefault();e.stopImmediatePropagation();
  }
},true);
for(const nav of document.querySelectorAll('.nav[data-tab]'))nav.addEventListener('click',()=>{if(docked)dialog.close()},true);
dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();dialog.close()}});
})();

;

// Fonte consolidada: preview61.js
/* Prévia 61: impede gesto de pinça/zoom no iPad Safari; mantém rolagem com um dedo. */
(()=>{ 'use strict';
  function blockPinch(event){ if(event.cancelable) event.preventDefault(); }
  for(const type of ['gesturestart','gesturechange','gestureend']){
    document.addEventListener(type,blockPinch,{passive:false});
  }
  document.addEventListener('touchmove',function(event){
    if(event.touches&&event.touches.length>1&&event.cancelable)event.preventDefault();
  },{passive:false});
})();

;

// Fonte consolidada: preview62.js
/* Prévia 62: esquema de cores unificado; rolagem nativa da letra. */
(()=>{'use strict';const x=document.querySelector('#musicas .panelhead .eyebrow');if(x&&/biblioteca de áudio/i.test(x.textContent||''))x.remove();})();

;

// Fonte consolidada: media64.js
/* Prévia 64: biblioteca local de vídeos, fotos e PDFs. */
(()=>{'use strict';
const app=document.getElementById('media64App');if(!app)return;
const body=document.getElementById('m64Body'),crumb=document.getElementById('m64Crumb');
const categories=[{id:'video',label:'Vídeos',single:'vídeo',symbol:'film',accept:'.mp4,.mov,.m4v,video/mp4,video/quicktime,video/x-m4v'},
{id:'imagem',label:'Fotos',single:'foto',symbol:'image',accept:'.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'},
{id:'pdf',label:'PDFs',single:'PDF',symbol:'file-text',accept:'.pdf,application/pdf'}];
const days=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
let cat=null,day=null,selected=null,mode='preview',search='',rows=[],url=null,modal=null;
const cardUrls=[];
function orderedFiles(){return rows.filter(f=>f.type===cat&&(day==='Todos'||f.day===day)).sort((a,b)=>(Number(b.addedAt)||0)-(Number(a.addedAt)||0)||((b._fallbackIndex||0)-(a._fallbackIndex||0)))}
function orderedAll(all){return all.map((f,i)=>({...f,_fallbackIndex:i}))}
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function dbOpen(){return new Promise((ok,no)=>{const r=indexedDB.open('reunioes3-midias-v64',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('files'))r.result.createObjectStore('files',{keyPath:'id'})};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
async function dbAll(){const db=await dbOpen();return new Promise((ok,no)=>{const tx=db.transaction('files');const r=tx.objectStore('files').getAll();r.onsuccess=()=>{db.close();ok(r.result)};r.onerror=()=>{db.close();no(r.error)}})}
// Índice leve para a interface: evita manter todos os vídeos em memória ao trocar de aba.
async function dbIndex(){const db=await dbOpen();return new Promise((ok,no)=>{const values=[];const tx=db.transaction('files','readonly');const r=tx.objectStore('files').openCursor();r.onsuccess=()=>{const cursor=r.result;if(!cursor)return;const {id,name,type,day,addedAt,size}=cursor.value;values.push({id,name,type,day,addedAt,size});cursor.continue()};tx.oncomplete=()=>{db.close();ok(values)};tx.onerror=()=>{db.close();no(tx.error)}})}
async function dbGet(id){const db=await dbOpen();return new Promise((ok,no)=>{const r=db.transaction('files').objectStore('files').get(id);r.onsuccess=()=>{db.close();ok(r.result)};r.onerror=()=>{db.close();no(r.error)}})}
async function dbChange(operation,val){const db=await dbOpen();return new Promise((ok,no)=>{const tx=db.transaction('files','readwrite');const store=tx.objectStore('files');if(operation==='put')store.put(val);else store.delete(val);tx.oncomplete=()=>{db.close();ok()};tx.onerror=()=>{db.close();no(tx.error)}})}
let cardObserver=null,previewEpoch=0,activeLoads=0;
const lazyQueue=[];
function release(){
 ++previewEpoch;
 if(cardObserver){cardObserver.disconnect();cardObserver=null}
 lazyQueue.length=0;
 for(const v of document.querySelectorAll('#m64List video')){try{v.pause();v.removeAttribute('src');v.load()}catch(_){}}
 if(url){URL.revokeObjectURL(url);url=null}
 for(const u of cardUrls.splice(0))URL.revokeObjectURL(u)
}
function config(){return categories.find(c=>c.id===cat)}
// API local: permite ao cronograma escolher arquivos já guardados na biblioteca, sem copiar blobs para localStorage.
window.ReunioesMediaLibrary={all:dbAll,get:dbGet,put:record=>dbChange('put',record)};

// Validar arquivos antes de gravar no IndexedDB; a Preview 67 invocava validFile sem defini-la.
function validFile(file){
 if(!file||!file.name||!file.size)return false;
 const extension=file.name.split('.').pop().toLowerCase();
 const mime=(file.type||'').toLowerCase();
 if(cat==='video')return ['mp4','mov','m4v'].includes(extension)||(mime==='video/mp4'||mime==='video/quicktime'||mime==='video/x-m4v');
 if(cat==='imagem')return ['jpg','jpeg','png','webp'].includes(extension)||['image/jpeg','image/png','image/webp'].includes(mime);
 if(cat==='pdf')return extension==='pdf'||mime==='application/pdf';
 return false;
}
function counter(c,d){return rows.filter(f=>f.type===c&&(!d||f.day===d)).length}
function crumbs(){crumb.innerHTML='<button type="button" data-go="home">Mídias</button>'+(cat?' <span>›</span> <strong>'+esc(config().label)+'</strong>':'');crumb.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{if(b.dataset.go==='home'){cat=null;day=null}else {cat=null;day=null}selected=null;search='';mode='preview';release();render()})}
function magnify(){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="10.8" cy="10.8" r="7.2"/><path d="m16 16 5 5"/></svg>'}
function searchBar(){return '<label class="m64searchwrap">'+magnify()+'<input class="m64search" id="m64Search" placeholder="Pesquisar" autocomplete="off" aria-label="Pesquisar arquivos"></label>'}
function hookSearch(){const input=document.getElementById('m64Search');if(input){input.value=search;input.oninput=()=>{search=input.value;renderListOnly()}}}
function categoriesView(){body.innerHTML='<h2 class="m64heading">Biblioteca de Mídias</h2><div class="m64grid m64categories">'+categories.map(c=>'<button type="button" class="m64tile" data-cat="'+c.id+'"><span class="m77folder-icon" aria-hidden="true"><svg viewBox="0 0 96 72" fill="none"><path d="M7 18V13a7 7 0 0 1 7-7h26l9 10h33a7 7 0 0 1 7 7v37a7 7 0 0 1-7 7H14a7 7 0 0 1-7-7V18Z" fill="#91b6d3"/><path d="M7 30a7 7 0 0 1 7-7h68a7 7 0 0 1 7 7v30a7 7 0 0 1-7 7H14a7 7 0 0 1-7-7V30Z" fill="#dbeaf5" stroke="#6c9cbf" stroke-width="2"/></svg><span class="m77folder-glyph">'+(c.id==='video'?'▶':c.id==='imagem'?'▧':'▤')+'</span></span><strong>'+c.label.toLocaleUpperCase('pt-BR')+'</strong><small>'+counter(c.id)+' arquivo(s)</small></button>').join('')+'</div>';body.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{cat=b.dataset.cat;day='Todos';search='';render()})}
function daysView(){const c=config();body.innerHTML='<div class="m64titlebar"><h2 class="m64heading">'+c.label+'</h2></div><div class="m64toolbar">'+searchBar()+'<div class="m67navbuttons"><button type="button" class="m64back" id="m64HomeBack">← Voltar</button><button class="m64add" id="m64Add">+ Adicionar '+c.single+'</button></div></div><div class="m64grid" id="m64Days"></div>';hookSearch();document.getElementById('m64HomeBack').onclick=()=>{cat=null;day=null;search='';render()};document.getElementById('m64Add').onclick=()=>{day='Domingo';mode='add';selected=null;search='';render()};renderDays();document.getElementById('m64Search').oninput=e=>{search=e.target.value;renderDays()}}
function renderDays(){const root=document.getElementById('m64Days');if(!root)return;root.innerHTML=days.filter(d=>!search||d.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR'))||rows.some(f=>f.type===cat&&f.day===d&&f.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')))).map(d=>'<button type="button" class="m64tile" data-day="'+esc(d)+'"><span class="m64ico">▣</span><strong>'+esc(d.toUpperCase())+'</strong><small>'+counter(cat,d)+' arquivo(s)</small></button>').join('');root.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{day=b.dataset.day;mode='preview';search='';const first=orderedFiles()[0];selected=first?first.id:null;render()})}
function listRows(){return orderedFiles()}
function cardHTML(f){
 const typeIcon=cat==='video'?'▶':cat==='imagem'?'▧':'▤';
 return '<article class="m66card" data-card="'+esc(f.id)+'">'+
 '<div class="m66thumb" data-thumb="'+esc(f.id)+'" aria-label="Prévia de '+esc(f.name)+'"><span class="m66placeholder" aria-hidden="true">'+typeIcon+'</span><span class="m160PreviewState">Carregando prévia…</span></div>'+
 '<div class="m66filebody"><div class="m66filetitle" title="'+esc(f.name)+'">'+esc(f.name)+'</div>'+
 '<div class="m66actions">'+
 (cat==='video'?'<button type="button" class="m66btn m69open" data-play="'+esc(f.id)+'" title="Reproduzir no iPad">▶ Ver vídeo</button>':'')+
 '<button type="button" class="m66btn m66schedule" data-schedule="'+esc(f.id)+'" title="Usar no cronograma">+ Cronograma</button>'+
 '<button type="button" class="m66icon" data-edit="'+esc(f.id)+'" title="Editar nome" aria-label="Editar nome">✎</button>'+
 '<button type="button" class="m66icon m66danger" data-delete="'+esc(f.id)+'" title="Excluir" aria-label="Excluir arquivo">✕</button>'+
 '</div></div></article>'
}
function renderListOnly(){
 release();const root=document.getElementById('m64List');if(!root)return;
 const list=listRows();root.innerHTML=list.map(cardHTML).join('');
 root.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>editName(b.dataset.edit));
 root.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>deleteItem(b.dataset.delete));
 root.querySelectorAll('[data-schedule]').forEach(b=>b.onclick=()=>{const f=rows.find(x=>x.id===b.dataset.schedule);if(f)addToSchedule(f)});
 // Prévia de vídeos somente dentro do cartão, nunca abre outra aba ou projeta no telão.
 root.querySelectorAll('[data-play]').forEach(b=>b.addEventListener('click',async()=>{
   const slot=root.querySelector('[data-thumb="'+CSS.escape(b.dataset.play)+'"]');
   const video=slot?.querySelector('video');
   if(!video){b.textContent='Carregando…';return}
   for(const other of root.querySelectorAll('video'))if(other!==video){other.pause();other.controls=false;other.muted=true}
   if(video.paused){video.muted=false;video.controls=true;try{await video.play()}catch(_){b.textContent='Formato não compatível'};if(!video.paused)b.textContent='❚❚ Pausar'}
   else{video.pause();b.textContent='▶ Ver vídeo'}
 }));
 document.getElementById('m64Count').textContent=list.length+' arquivo(s)';
 void loadCardPreviews(list);
}
// Prévia sob demanda: o Safari só decodifica os cartões que entram na área visível.
function loadCardPreviews(list){
 const epoch=previewEpoch;
 const byId=new Map(list.map(f=>[String(f.id),f]));
 const root=document.getElementById('m64List');
 if(!root)return;
 const seen=new Set();
 const schedule=el=>{
  const id=el?.dataset?.thumb;if(!id||seen.has(id)||!byId.has(id))return;
  seen.add(id);lazyQueue.push({id,epoch});drainPreviews();
 };
 if('IntersectionObserver' in window){
   cardObserver=new IntersectionObserver(entries=>{
     for(const entry of entries)if(entry.isIntersecting){schedule(entry.target);cardObserver?.unobserve(entry.target)}
   },{root:root,rootMargin:'180px 0px',threshold:0});
   const cards=[...root.querySelectorAll('[data-thumb]')];
   cards.slice(0,4).forEach(schedule);
   cards.slice(4).forEach(el=>cardObserver.observe(el));
 }else{
   for(const el of [...root.querySelectorAll('[data-thumb]')].slice(0,8))schedule(el);
 }
}
function drainPreviews(){
 while(activeLoads<2&&lazyQueue.length){
  const job=lazyQueue.shift();if(job.epoch!==previewEpoch)continue;
  activeLoads++;
  void hydratePreview(job).finally(()=>{activeLoads--;drainPreviews()});
 }
}
async function hydratePreview({id,epoch}){
 const record=await dbGet(id).catch(()=>null);
 if(epoch!==previewEpoch||!document.getElementById('biblioteca')?.classList.contains('active')||!record?.blob)return;
 const slot=document.querySelector('#m64List [data-thumb="'+CSS.escape(id)+'"]');
 if(!slot)return;
 const pdfBlob=cat==='pdf'&&record.blob.type!=='application/pdf'?new Blob([record.blob],{type:'application/pdf'}):record.blob;
 const objectURL=URL.createObjectURL(pdfBlob);cardUrls.push(objectURL);
 // Nenhum link externo: fotos, PDFs e vídeos permanecem nesta página.
 slot.replaceChildren();
 if(cat==='video'){
   const video=document.createElement('video');
   video.playsInline=true;video.setAttribute('playsinline','');video.muted=true;
   video.preload='metadata';video.controls=false;
   video.setAttribute('aria-label','Prévia do vídeo '+record.name);
   video.addEventListener('loadedmetadata',()=>{
     if(Number.isFinite(video.duration)&&video.duration>0){try{video.currentTime=Math.min(0.7,Math.max(0.08,video.duration*.12))}catch(_){}}
   },{once:true});
   video.addEventListener('error',()=>{
      if(epoch!==previewEpoch)return;
      slot.classList.add('m160Unavailable');
      const notice=document.createElement('span');notice.className='m160PreviewState';notice.textContent='Prévia indisponível';slot.append(notice);
   },{once:true});
   // A miniatura e o nome são independentes. A falha ao decodificar o .mov
   // não afeta o título, a edição ou os botões de cada arquivo.
   video.src=objectURL;slot.append(video);
   const btn=document.createElement('button');btn.type='button';btn.className='m160OpenPreview';btn.textContent='▶';
   btn.title='Reproduzir neste iPad';btn.setAttribute('aria-label','Reproduzir vídeo '+record.name);
   btn.addEventListener('click',()=>{document.querySelector('#m64List [data-play="'+CSS.escape(id)+'"]')?.click();});slot.append(btn);
 }else if(cat==='imagem'){
   const img=document.createElement('img');img.src=objectURL;img.alt='Foto: '+record.name;img.loading='lazy';slot.append(img);
 }else{
   // PDF.js desenha uma miniatura leve e padronizada, sem iframe ou abertura de nova página.
   const canvas=document.createElement('canvas');canvas.className='m162PdfCanvas';canvas.setAttribute('aria-label','Primeira página de '+record.name);slot.append(canvas);
   const lib=window.pdfjsLib;
   if(lib){try{
     lib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
     const data=new Uint8Array(await pdfBlob.arrayBuffer());
     if(epoch!==previewEpoch)return;
     const doc=await lib.getDocument({data}).promise;
     const page=await doc.getPage(1);const natural=page.getViewport({scale:1});
     const scale=Math.min(310/natural.width,190/natural.height,1.5);
     const viewport=page.getViewport({scale});canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
     if(epoch===previewEpoch)await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
     await doc.destroy();
   }catch(_){canvas.replaceWith(Object.assign(document.createElement('span'),{className:'m162PdfFallback',textContent:'PDF'}))}}
   else{canvas.replaceWith(Object.assign(document.createElement('span'),{className:'m162PdfFallback',textContent:'PDF'}))}
 }
}
function folderView(){
 body.innerHTML='<div class="m66folderpage"><div class="m66folderhead"><h3>'+esc(config().label.toUpperCase())+'</h3></div>'+
 '<div class="m66tools"><button class="m64back" id="m64Back">← Voltar</button><button class="m64add" id="m64Add">+ Adicionar '+esc(config().single)+'</button></div>'+
 '<div class="m66formhost" id="m64FormHost" hidden></div><div class="m66gallery" id="m64List"></div><small class="m66count" id="m64Count"></small></div>';
 document.getElementById('m64Back').onclick=()=>{cat=null;day=null;mode='preview';selected=null;search='';release();render()};
 document.getElementById('m64Add').onclick=()=>{mode=mode==='add'?'preview':'add';renderRight()};
 renderRight();renderListOnly();
}
function renderRight(){
 const host=document.getElementById('m64FormHost');if(!host)return;
 host.hidden=mode!=='add';if(mode!=='add'){host.innerHTML='';return}
 host.innerHTML='<form class="m66form m77simpleform" id="m64Form"><div class="m77uploadrow"><div><h3>Adicionar '+esc(config().single)+'</h3><small>Escolha o arquivo. Ele será salvo automaticamente em '+esc(config().label)+'.</small></div><label class="m77filepicker"><span>Escolher arquivo</span><input id="m64File" type="file" accept="'+config().accept+'" required></label></div><p class="m64error" id="m64Error" role="status"></p><div class="m64footer"><button type="button" class="m64back" id="m64Cancel">Cancelar</button><button class="m64gold" type="submit" id="m64Save">Salvar arquivo</button></div></form>';
 document.getElementById('m64Cancel').onclick=()=>{mode='preview';renderRight()};document.getElementById('m64Form').onsubmit=saveFile;
}
async function saveFile(e){
 e.preventDefault();
 const input=document.getElementById('m64File'),msg=document.getElementById('m64Error'),saveBtn=document.getElementById('m64Save');
 const file=input?.files?.[0];
 if(!file||!validFile(file)){msg.textContent='Selecione um arquivo válido para esta categoria.';return}
 const dest='Todos';
 const name=file.name;
 saveBtn.disabled=true;saveBtn.textContent='Salvando…';msg.textContent='Gravando arquivo neste iPad…';
 try{
   const id=(typeof crypto!=='undefined'&&typeof crypto.randomUUID==='function'?crypto.randomUUID():String(Date.now())+'-'+Math.random().toString(36).slice(2));
   await dbChange('put',{id,name,type:cat,day:dest,blob:file,size:file.size,addedAt:Date.now()});
   const saved=await dbGet(id);
   if(!saved||!saved.blob)throw new Error('O arquivo não foi encontrado após salvar.');
   rows=orderedAll(await dbIndex());day=dest;selected=id;mode='preview';search='';render();
 }catch(err){
   msg.textContent=err?.name==='QuotaExceededError'?'Sem espaço de armazenamento neste iPad. Libere espaço e tente novamente.':'Não foi possível salvar o arquivo no Safari. '+(err?.message||'Tente novamente.');
   saveBtn.disabled=false;saveBtn.textContent='Salvar arquivo';
 }
}
function popup(title,inner,confirmLabel,onConfirm){if(modal)modal.remove();modal=document.createElement('div');modal.className='m64modal';modal.innerHTML='<div class="m64modalbox"><strong>'+title+'</strong>'+inner+'<footer><button type="button" class="m64back" id="m64No">Cancelar</button><button type="button" class="m64gold" id="m64Yes">'+confirmLabel+'</button></footer></div>';app.append(modal);modal.querySelector('#m64No').onclick=closePopup;modal.querySelector('#m64Yes').onclick=onConfirm}
function closePopup(){if(modal){modal.remove();modal=null}}
function editName(id){const f=rows.find(x=>x.id===id);if(!f)return;popup('Editar nome','<input id="m64Rename" aria-label="Nome do arquivo" value="'+esc(f.name)+'">','Salvar',async()=>{const name=modal.querySelector('#m64Rename').value.trim();if(!name)return;const rec=await dbGet(id);rec.name=name;await dbChange('put',rec);rows=orderedAll(await dbIndex());closePopup();render()})}
function deleteItem(id){const f=rows.find(x=>x.id===id);if(!f)return;popup('Excluir arquivo?','<p>'+esc(f.name)+'</p>','Excluir',async()=>{await dbChange('delete',id);rows=orderedAll(await dbIndex());if(selected===id){release();selected=rows.find(r=>r.type===cat)?.id||null}closePopup();render()})}
async function addToSchedule(f){
 const index=typeof state!=='undefined'?state.day:0;if(index<0||index>6)return;
 const record=await dbGet(f.id).catch(()=>null);if(!record?.blob){alert('Arquivo não encontrado na biblioteca deste iPad.');return}
 const section=state.sections?.[index]?.[0]?.id||'default-'+index;
 const item={id:uid(),type:f.type,title:f.name,mediaLibraryId:f.id,fileUrl:null,sectionId:section,reference:'',translation:'',content:''};
 state.days[index].push(item);
 try{save()}catch(err){state.days[index].pop();alert('Não foi possível salvar o item no cronograma.');return}
 state.day=index;drawDays();drawItems();setTab('agenda');alert('Arquivo incluído no cronograma. Ele permanece guardado nesta biblioteca do iPad.');
}
function render(){release();crumbs();if(!cat)categoriesView();else if(!day)daysView();else folderView()}
// Sempre retornar à tela com as três categorias quando a aba Mídias for reaberta.
// Não mexer nos arquivos salvos no IndexedDB, somente no estado da navegação.
const mediaPage=document.getElementById('biblioteca');
if(mediaPage){
 let wasActive=mediaPage.classList.contains('active');
 new MutationObserver(()=>{
   const active=mediaPage.classList.contains('active');
   if(!active&&wasActive){release()}
   if(active&&!wasActive){
      cat=null;day=null;selected=null;mode='preview';search='';
      release();render();
   }
   wasActive=active;
 }).observe(mediaPage,{attributes:true,attributeFilter:['class']});
}

(async()=>{try{rows=orderedAll(await dbIndex())}catch(e){body.textContent='Este navegador não permitiu acessar o armazenamento local. Verifique o modo privado e as permissões.';return}render()})();
})();

;

// Fonte consolidada: media70.js
(()=>{'use strict';
const $=id=>document.getElementById(id);const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const weekdays=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
let pdfDocument=null,pdfObserver=null,pdfQueue=[],pdfBusy=false,pdfSession=0,previewSession=0;
let supportPreviewUrl=null;let ready=null,objectUrl=null,activePage=1,skipped=new Set(),pageTotal=1,isLive=false,pdfMinimized=false,playerVideo=null,pickerDay=null,pickerType=null,pickerEntries=[],repeat=false;
function ensure(){if($('r70MediaControls'))return;const holder=document.createElement('div');holder.id='r70MediaControls';holder.hidden=true;holder.innerHTML=`<div class="r70head"><span id="r70Name">Arquivo</span><button type="button" id="r70Close" title="Fechar player">✕</button></div><div class="r70buttons"><button type="button" id="r70Present">▶ Apresentar no telão</button></div><div id="r70VideoControls" hidden><div class="r70seek"><span id="r70Elapsed">0:00</span><input id="r70Seek" type="range" min="0" max="1000" value="0"><span id="r70Duration">0:00</span></div><div class="r70center"><button id="r70Restart" title="Voltar ao início">↺</button><button id="r70Play" title="Reproduzir/Pausar">▶</button><button id="r70Repeat" title="Repetir continuamente" aria-label="Repetir vídeo" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m17 2 4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4m14-1v2a3 3 0 0 1-3 3H3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><div class="r74volume"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg> <input id="r74Volume" type="range" min="0" max="100" value="25" aria-label="Volume do vídeo"><output id="r74VolumeLabel">25%</output></div></div><div id="r70PdfControls" hidden><div class="r70center"><button id="r70Prev">‹ Anterior</button><span id="r70PageCount">1 / 1</span><button id="r70Next">Próxima ›</button></div></div><div class="r70settings"><button id="r70Gear" type="button" title="Configurar transição" aria-label="Configurar transição">⚙</button><div id="r70Config" hidden><label>Efeito <select id="r70Effect"><option value="fade">Fade</option><option value="merge">Merge</option><option value="wipe">Wipe</option><option value="corte">Corte</option></select></label><label>Duração <select id="r70DurationSelect"><option value="300">300 ms</option><option value="500">500 ms</option><option value="1000">1 segundo</option></select></label></div></div>`;const preview=$('preview');preview.closest('.preview').insertAdjacentElement('afterend',holder);
const settings=holder.querySelector('.r70settings');if(settings){settings.id='r88TransitionSettings';const previewPanel=preview.closest('.preview')||preview.parentElement;const title=previewPanel.querySelector('.panelhead');if(title){title.append(settings);const heading=title.querySelector('h2');if(heading)heading.textContent='TELÃO SANTUÁRIO';title.classList.add('r90ExternalHeader');previewPanel.parentElement.insertBefore(title,previewPanel)}else previewPanel.insertBefore(settings,preview)}
const outerPanel=preview.closest('.preview');if(outerPanel&&!$('r90EndButton')){const end=document.createElement('button');end.id='r90EndButton';end.type='button';end.textContent='■ Encerrar';end.title='Encerrar mídia no telão';end.hidden=true;outerPanel.insertAdjacentElement('afterend',end);end.onclick=()=>{stop();if(ready?.type==='imagem'||ready?.type==='video')void showSupport()}}
const supportBar=document.createElement('div');supportBar.id='r88SupportBar';supportBar.innerHTML='<button type="button" id="r87Support">▧ Imagem de apoio</button>';const agenda=$('sectionsRoot')||$('items');if(agenda){const outer=agenda.closest('.panel')||agenda.parentElement;const mainHead=outer.querySelector('.panelhead')||outer.querySelector('.section-header');if(mainHead)mainHead.after(supportBar);else agenda.parentElement.insertBefore(supportBar,agenda)}$('r87Support').onclick=supportPicker;document.getElementById('days')?.addEventListener('click',()=>queueMicrotask(()=>{void refreshSupportButton();if(!isLive&&ready?.type==='pdf')void showSupport()}));void refreshSupportButton();
const reopen=document.createElement('button');reopen.type='button';reopen.id='r71PdfReopen';reopen.hidden=true;reopen.textContent='▤ Páginas do PDF';reopen.title='Reabrir páginas do PDF';document.body.append(reopen);reopen.onclick=()=>minimizePdf(false);
$('r70Close').onclick=close;$('r70Present').onclick=show;$('r70Play').onclick=()=>{if(!playerVideo)return;if(!isLive){show();return}if(playerVideo.paused)playerVideo.play().catch(()=>{});else playerVideo.pause();updatePlay()};$('r70Restart').onclick=()=>{if(playerVideo){playerVideo.currentTime=0;syncVideo()}};$('r70Repeat').onclick=()=>{repeat=!repeat;if(playerVideo)playerVideo.loop=repeat;$('r70Repeat').classList.toggle('on',repeat);$('r70Repeat').setAttribute('aria-pressed',String(repeat));channel.postMessage({kind:'videoControl',action:'repeat',value:repeat})};$('r70Seek').oninput=e=>{if(!playerVideo?.duration)return;playerVideo.currentTime=Number(e.target.value)>=1000?playerVideo.duration:playerVideo.duration*Number(e.target.value)/1000;channel.postMessage({kind:'videoControl',action:'seek',time:playerVideo.currentTime})};$('r74Volume').oninput=e=>{let n=Number(e.target.value);$('r74VolumeLabel').textContent=n+'%';if(playerVideo)playerVideo.volume=n/100;channel.postMessage({kind:'volume',volume:n/100,muted:n===0})};$('r70Prev').onclick=()=>step(-1);$('r70Next').onclick=()=>step(1);$('r70Gear').onclick=()=>{$('r70Config').hidden=!$('r70Config').hidden};const c=loadSettings();$('r70Effect').value=c.effect;$('r70DurationSelect').value=String(c.duration);for(const id of ['r70Effect','r70DurationSelect'])$(id).onchange=()=>localStorage.setItem('reunioes-transition-v70',JSON.stringify({effect:$('r70Effect').value,duration:Number($('r70DurationSelect').value)}));
const nav=$('fileFields');if(nav){const pick=document.createElement('div');pick.className='r70picker';pick.innerHTML=`<button type="button" class="r70PickButton" id="r70OpenPicker">▣ Escolher nas pastas da Biblioteca</button><div id="r70Picker" hidden></div>`;nav.insertBefore(pick,nav.firstChild);$('r70OpenPicker').onclick=()=>pickFolders()}
}
const channel=new BroadcastChannel('reunioes3-projetor');
function loadSettings(){try{const v=JSON.parse(localStorage.getItem('reunioes-transition-v70')||'{}');return {effect:v.effect||'fade',duration:Number(v.duration??300)}}catch(e){return {effect:'fade',duration:300}}}
function minimizePdf(shouldMinimize){if(!ready||ready.type!=='pdf')return;pdfMinimized=!!shouldMinimize;changeWorkspace(true);const b=$('r71PdfReopen');if(b){b.hidden=!pdfMinimized;b.textContent='▤ PDF · Página '+(activePage||'—')} }
function changeWorkspace(pdf){let host=$('r70PageWorkspace');const right=$('agenda')?.querySelector('.layout > .right');const preview=right?.querySelector('.preview');if(!host){host=document.createElement('div');host.id='r70PageWorkspace';host.hidden=true;}if(preview){const target=preview.closest('.r109PresentationFrame')||right;if(target&&host.parentElement!==target)preview.insertAdjacentElement('afterend',host);}const visible=!!pdf;host.hidden=!visible;pdfMinimized=false;const oldReopen=$('r71PdfReopen');if(oldReopen)oldReopen.hidden=true;const sections=$('sectionsRoot'),items=$('items');if(sections)sections.style.display='';if(items)items.style.display='';const support=$('r88SupportBar');if(support)support.hidden=false;return host}
function supportKey(){return 'reunioes3-support-v87-day-'+(typeof state!=='undefined'?state.day:0)}
function supportDay(){return Number(typeof state!=='undefined'?state.day:0)}
function chosenSupport(){try{return JSON.parse(localStorage.getItem(supportKey())||'null')}catch(e){return null}}
function supportDb(){return new Promise((resolve,reject)=>{const r=indexedDB.open('reunioes3-apoio-v89',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('images'))r.result.createObjectStore('images',{keyPath:'day'})};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function galleryRow(day){const db=await supportDb();try{return await new Promise((resolve,reject)=>{const tx=db.transaction('images','readonly');const r=tx.objectStore('images').get(day);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}finally{db.close()}}
async function saveGalleryRow(day,blob,name){const db=await supportDb();try{await new Promise((resolve,reject)=>{const tx=db.transaction('images','readwrite');tx.objectStore('images').put({day,blob,name,updatedAt:Date.now()});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}finally{db.close()}}
async function deleteGalleryRow(day){const db=await supportDb();try{await new Promise((resolve,reject)=>{const tx=db.transaction('images','readwrite');tx.objectStore('images').delete(day);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}finally{db.close()}}
async function compressSupport(file){if(!file.type.startsWith('image/'))throw Error('Escolha uma foto JPG, PNG, HEIC ou WebP.');if(file.size>45*1024*1024)throw Error('Foto muito grande. Escolha uma com menos de 45 MB.');let url=null;try{url=URL.createObjectURL(file);const img=new Image();img.src=url;await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Não foi possível ler a imagem.'))});const max=1920;const ratio=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(img.naturalHeight*ratio));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.84));return blob||file}catch(e){if(file.type==='image/heic'||file.type==='image/heif')throw Error('Não foi possível abrir esta foto HEIC. Escolha outra foto ou converta para JPG.');throw e}finally{if(url)URL.revokeObjectURL(url)}}
async function setSupport(id){const day=supportDay();if(!id){localStorage.removeItem(supportKey());await deleteGalleryRow(day)}else{const f=await window.ReunioesMediaLibrary.get(id);if(!f?.blob||f.type!=='imagem')throw Error('Foto não encontrada na Biblioteca.');localStorage.setItem(supportKey(),JSON.stringify({id:f.id,name:f.name,source:'library'}));await deleteGalleryRow(day)}await refreshSupportButton();if(!isLive)await showSupport()}
async function setGallerySupport(file){if(!file)return;const day=supportDay();const blob=await compressSupport(file);await saveGalleryRow(day,blob,file.name);localStorage.setItem(supportKey(),JSON.stringify({source:'gallery',name:file.name}));await refreshSupportButton();if(!isLive)await showSupport()}
async function refreshSupportButton(){const b=$('r87Support');if(b){const d=chosenSupport();b.textContent='▧ Imagem de Apoio';b.title=d?'Imagem configurada. Toque para trocar ou remover.':'Toque para configurar a Imagem de Apoio.';b.setAttribute('aria-label','Configurar Imagem de Apoio')}}
async function supportPicker(){const old=$('r87SupportDialog');old?.remove();const container=document.createElement('div');container.id='r87SupportDialog';container.className='r87supportPicker';container.innerHTML='<div class="r87SupportHead"><strong>Imagem de Apoio · '+esc(typeof DAYS!=='undefined'?DAYS[state.day]:'Reunião')+'</strong><button type="button" data-close aria-label="Fechar">✕</button></div><p>Escolha uma foto da galeria do aparelho ou das fotos já salvas no aplicativo.</p><div class="r89SupportActions"><button type="button" data-gallery>▣ Galeria do aparelho</button><button type="button" data-library>▤ Fotos do aplicativo</button></div><input type="file" data-gallery-input accept="image/*,.heic,.heif" hidden><div class="r89SupportStatus" role="status"></div><div class="r87SupportItems" hidden></div><button type="button" data-none class="r89RemoveSupport">Remover Imagem de Apoio</button>';document.body.append(container);
const current=chosenSupport();
const currentBox=document.createElement('div');currentBox.className='r96CurrentSupport';
const currentLabel=document.createElement('strong');currentLabel.textContent='Imagem atual';currentBox.append(currentLabel);
const currentImage=document.createElement('img');currentImage.alt='Imagem de apoio atual';currentBox.append(currentImage);
const currentEmpty=document.createElement('p');currentEmpty.textContent='Nenhuma imagem de apoio selecionada.';currentBox.append(currentEmpty);
container.querySelector('.r89SupportActions').before(currentBox);
if(current){try{let blob;if(current.source==='gallery')blob=(await galleryRow(supportDay()))?.blob;else blob=(await window.ReunioesMediaLibrary.get(current.id))?.blob;
if(blob){const u=URL.createObjectURL(blob);currentImage.src=u;currentImage.onload=()=>URL.revokeObjectURL(u);currentEmpty.hidden=true}else currentImage.hidden=true;
}catch(e){currentImage.hidden=true}}else currentImage.hidden=true;
const status=container.querySelector('.r89SupportStatus');const list=container.querySelector('.r87SupportItems');const close=()=>container.remove();container.querySelector('[data-close]').onclick=close;
container.querySelector('[data-gallery]').onclick=()=>container.querySelector('[data-gallery-input]').click();
container.querySelector('[data-gallery-input]').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;status.textContent='Salvando Imagem de Apoio…';try{await setGallerySupport(file);close()}catch(err){status.textContent='Erro: '+err.message}};
container.querySelector('[data-none]').onclick=async()=>{status.textContent='Removendo…';try{await setSupport(null);close()}catch(err){status.textContent='Erro: '+err.message}};
container.querySelector('[data-library]').onclick=async()=>{list.hidden=false;list.textContent='Carregando fotos…';try{const all=await window.ReunioesMediaLibrary.all();const pictures=all.filter(f=>f.type==='imagem');list.innerHTML=pictures.length?'':'Nenhuma foto salva. Adicione uma na aba Mídias → Fotos.';for(const f of pictures){const b=document.createElement('button');b.type='button';b.append(document.createTextNode(f.name));const img=document.createElement('img');img.alt='Prévia '+f.name;const uri=URL.createObjectURL(f.blob);img.src=uri;img.onload=()=>URL.revokeObjectURL(uri);b.prepend(img);b.onclick=async()=>{status.textContent='Selecionando…';try{await setSupport(f.id);close()}catch(err){status.textContent=err.message}};list.append(b)}}catch(e){list.textContent='Não foi possível carregar as fotos.'}};
}
let supportRenderVersion=0;
async function showSupport(){
 if(window.__r112SwitchingDay)return;
 const version=++supportRenderVersion;
 const day=supportDay();
 if(isLive)return;
 const setting=chosenSupport();
 const pv=$('preview');
 // O carregamento antigo não pode sobrescrever a imagem de outro dia.
 const stillCurrent=()=>version===supportRenderVersion&&day===supportDay()&&!isLive;
 if(!setting){
  if(!stillCurrent())return;
  if(supportPreviewUrl){URL.revokeObjectURL(supportPreviewUrl);supportPreviewUrl=null}
  channel.postMessage({kind:'present',item:null});
  pv.innerHTML='<div class="placeholder">✦<p>Nenhum conteúdo no telão</p></div>';
  return;
 }
 try{
  let blob=null,item=null;
  if(setting.source==='gallery'){
   const row=await galleryRow(day);blob=row?.blob;
   item={type:'imagem',title:'Imagem de Apoio',supportDay:day};
  }else{
   const row=await window.ReunioesMediaLibrary.get(setting.id);blob=row?.blob;
   item={type:'imagem',title:'Imagem de Apoio',mediaLibraryId:setting.id};
  }
  if(!stillCurrent())return;
  if(!blob)throw Error('Imagem indisponível');
  const nextUrl=URL.createObjectURL(blob);
  const im=document.createElement('img');im.className='r70Image';im.alt='Imagem de Apoio';
  im.src=nextUrl;
  // Só altera o telão depois de a imagem estar decodificada, evitando tela preta.
  try{if(im.decode)await im.decode();else await new Promise((resolve,reject)=>{im.onload=resolve;im.onerror=reject})}catch(e){URL.revokeObjectURL(nextUrl);throw e}
  if(!stillCurrent()){URL.revokeObjectURL(nextUrl);return}
  const previous=supportPreviewUrl;
  supportPreviewUrl=nextUrl;
  pv.replaceChildren(im);
  channel.postMessage({kind:'present',item});
  if(previous)URL.revokeObjectURL(previous);
 }catch(e){
  if(!stillCurrent())return;
  if(supportPreviewUrl){URL.revokeObjectURL(supportPreviewUrl);supportPreviewUrl=null}
  channel.postMessage({kind:'present',item:null});
  pv.textContent='Imagem de Apoio indisponível';
 }
}
function close(){releasePdf();stop();ready=null;pdfMinimized=false;if($('r71PdfReopen'))$('r71PdfReopen').hidden=true;if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null}playerVideo=null;$('r70MediaControls').hidden=true;changeWorkspace(false);void showSupport()}
function stop(){previewSession++;if($('r90EndButton'))$('r90EndButton').hidden=true;if(isLive){channel.postMessage({kind:'present',item:null});isLive=false;window.dispatchEvent(new Event('r93-live-change'));void showSupport()}if(ready?.type==='pdf')updatePdfSelection();if($('r70Present')){$('r70Present').disabled=false;$('r70Present').textContent='▶ Apresentar'}if(playerVideo){playerVideo.pause();updatePlay()}}
function format(n){n=Math.max(0,Math.floor(n||0));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')}
function updatePlay(){if($('r70Play'))$('r70Play').textContent=playerVideo&&!playerVideo.paused?'Ⅱ':'▶'}
function syncVideo(){if(!playerVideo)return;$('r70Elapsed').textContent=format(playerVideo.currentTime);$('r70Duration').textContent=format(playerVideo.duration);const fraction=Number.isFinite(playerVideo.duration)&&playerVideo.duration>0?Math.min(1,Math.max(0,playerVideo.currentTime/playerVideo.duration)):0;const seek=$('r70Seek');seek.value=Math.round(fraction*1000);seek.style.setProperty('--seek-pct',(fraction*100)+'%');updatePlay()}
function releasePdf(){pdfSession++;previewSession++;pdfQueue=[];pdfBusy=false;if(pdfObserver){pdfObserver.disconnect();pdfObserver=null}if(pdfDocument){const old=pdfDocument;pdfDocument=null;try{old.destroy()}catch(e){}}}
function pdfLibrary(){if(!window.pdfjsLib)throw Error('Leitor PDF indisponível. Conecte o iPad à internet, recarregue e tente novamente.');window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';return window.pdfjsLib}
async function paintPdfPage(num,canvas,maxWidth){if(!pdfDocument)throw Error('PDF não carregado');const page=await pdfDocument.getPage(num);const v=page.getViewport({scale:1});const scale=Math.min(2,Math.max(.15,maxWidth/v.width));const view=page.getViewport({scale});canvas.width=Math.max(1,Math.round(view.width));canvas.height=Math.max(1,Math.round(view.height));const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);try{await page.render({canvasContext:ctx,viewport:view}).promise}finally{page.cleanup()}}
function queueVisiblePdf(){if(pdfObserver)pdfObserver.disconnect();pdfObserver=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){const c=e.target;pdfObserver.unobserve(c);pdfQueue.push(c)}}void drainPdfQueue()},{root:null,rootMargin:'150px'});document.querySelectorAll('#r70PageWorkspace canvas[data-pdf-page]').forEach(c=>pdfObserver.observe(c))}
async function drainPdfQueue(){if(pdfBusy)return;pdfBusy=true;const id=pdfSession;try{while(pdfQueue.length&&id===pdfSession){const c=pdfQueue.shift();if(!c?.isConnected||!pdfDocument)continue;try{await paintPdfPage(Number(c.dataset.pdfPage),c,240)}catch(e){if(c.isConnected)c.replaceWith(document.createTextNode('Prévia indisponível'))}await new Promise(r=>setTimeout(r,0))}}finally{pdfBusy=false}}
function updatePdfSelection(){const host=$('r70PageWorkspace');if(!host)return;host.querySelectorAll('.r70page').forEach(el=>{const p=Number(el.dataset.pageNum);el.classList.toggle('on-screen',isLive&&p===activePage&&!skipped.has(p));el.classList.toggle('removed',skipped.has(p));const b=el.querySelector('[data-page]');if(b){b.disabled=skipped.has(p);b.setAttribute('aria-pressed',String(isLive&&p===activePage&&!skipped.has(p)))}const label=el.querySelector('.r85pageLabel');if(label)label.textContent=isLive&&p===activePage?'NO TELÃO':String(p)})}

function renderPageGrid(){const host=changeWorkspace(true);if(pdfObserver){pdfObserver.disconnect();pdfObserver=null}pdfQueue=[];host.innerHTML=`<div class="r70gridHeader"><div class="r107PdfTitle" title="${esc(ready?.title||'PDF')}"><strong>${esc(ready?.title||'PDF')}</strong></div><div class="r71GridActions"><button id="r71PdfMinimize" type="button">✕</button></div></div><div class="r70grid">${Array.from({length:pageTotal},(_,i)=>i+1).map(p=>`<div class="r70page" data-page-num="${p}"><button type="button" class="r70pageSelect" data-page="${p}" aria-label="Apresentar página ${p}"><div class="r70pageThumb"><canvas data-pdf-page="${p}" aria-label="Página ${p}"></canvas></div><small class="r85pageLabel">${p}</small></button></div>`).join('')}</div>`;host.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>togglePdfPage(Number(b.dataset.page)));$('r71PdfMinimize').title='Fechar PDF e retirar do telão';$('r71PdfMinimize').setAttribute('aria-label','Fechar PDF e retirar do telão');$('r71PdfMinimize').onclick=()=>close();queueVisiblePdf()}

async function previewPage(){
  // Double-buffer PDFs: never clear the telão or display a loading message between slides.
  const id=++previewSession,documentAtStart=pdfDocument,pageAtStart=activePage,preview=$('preview');
  if(!pageAtStart||!documentAtStart)return false;
  // A previously painted gallery thumbnail can appear immediately while a crisp slide renders.
  const thumb=document.querySelector('#r70PageWorkspace canvas[data-pdf-page="'+pageAtStart+'"]');
  if(thumb?.width>0&&thumb.height>0){
    try{
      const quick=document.createElement('canvas');quick.className='r85PreviewCanvas';
      quick.width=thumb.width;quick.height=thumb.height;
      quick.getContext('2d',{alpha:false}).drawImage(thumb,0,0);
      if(id===previewSession&&ready?.type==='pdf'&&isLive)preview.replaceChildren(quick);
    }catch(e){console.warn('Prévia rápida indisponível',e)}
  }
  const canvas=document.createElement('canvas');canvas.className='r85PreviewCanvas';
  try{
    await paintPdfPage(pageAtStart,canvas,Math.min(1450,Math.max(500,preview.clientWidth*1.8)));
    if(id!==previewSession||ready?.type!=='pdf'||documentAtStart!==pdfDocument||!isLive)return false;
    preview.replaceChildren(canvas);
    if($('r70PageCount'))$('r70PageCount').textContent=pageAtStart+' / '+pageTotal;
    if($('r71PdfReopen'))$('r71PdfReopen').textContent='▤ PDF · Página '+pageAtStart;
    // Only send after rendering, never before: prevents an intermediate blank/loading frame.
    send();
    return true;
  }catch(e){
    if(id===previewSession&&ready?.type==='pdf')console.warn('Não foi possível desenhar a página '+pageAtStart,e);
    return false;
  }
}
function setPage(p){if(p<1||p>pageTotal||skipped.has(p))return;activePage=p;updatePdfSelection();if(isLive)void previewPage()}
function togglePdfPage(p){if(p<1||p>pageTotal||skipped.has(p)||ready?.type!=='pdf')return;if(isLive&&activePage===p){stop();return}activePage=p;if(!isLive){isLive=true;window.dispatchEvent(new Event('r93-live-change'))}updatePdfSelection();void previewPage()}
function step(dir){const list=Array.from({length:pageTotal},(_,i)=>i+1).filter(p=>!skipped.has(p));const idx=list.indexOf(activePage);if(idx<0)return;setPage(list[Math.max(0,Math.min(list.length-1,idx+dir))])}
function send(){if(!ready||!objectUrl)return;const item={...ready,fileUrl:ready.mediaLibraryId?null:objectUrl,videoLoop:repeat};if(ready.type==='pdf')item.pdfPage=activePage;channel.postMessage({kind:'present',item})}
function show(){if(isLive){stop();return}if(!ready||!objectUrl)return;if(ready.type==='pdf'&&!activePage)return;send();isLive=true;window.dispatchEvent(new Event('r93-live-change'));if(ready.type==='pdf')updatePdfSelection();$('r70Present').textContent='■ Encerrar';$('r70Present').disabled=false;if(ready.type==='video'){const v=playerVideo;channel.postMessage({kind:'videoControl',action:'repeat',value:repeat});channel.postMessage({kind:'volume',volume:Number($('r74Volume').value)/100,muted:false});if(v&&v.paused)v.play().catch(()=>{});updatePlay()}}
async function open(item){ensure();releasePdf();stop();if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null}ready=item;pdfMinimized=false;if($('r71PdfReopen'))$('r71PdfReopen').hidden=true;playerVideo=null;skipped=new Set(item.pdfSkipped||[]);activePage=item.type==='pdf'?0:1;pageTotal=1;const preview=$('preview');$('r70MediaControls').hidden=item.type!=='video';$('r70Name').textContent=item.title;$('r70VideoControls').hidden=item.type!=='video';$('r70PdfControls').hidden=item.type!=='pdf';$('r70Present').hidden=item.type==='pdf';changeWorkspace(item.type==='pdf');if(item.type!=='pdf')preview.innerHTML='<div class="r70Empty">Carregando prévia…</div>';let blob=null;try{if(item.mediaLibraryId){const record=await window.ReunioesMediaLibrary.get(item.mediaLibraryId);if(!record?.blob)throw Error('Arquivo não encontrado');blob=record.blob}else if(item.fileUrl){objectUrl=item.fileUrl}else throw Error('Sem arquivo');if(blob){if(item.type==='pdf'&&blob.type!=='application/pdf')blob=new Blob([blob],{type:'application/pdf'});objectUrl=URL.createObjectURL(blob)}
if(item.type==='video'){changeWorkspace(false);preview.innerHTML='';const video=document.createElement('video');video.className='r70Video';video.style.objectFit='contain';video.style.objectPosition='center center';video.playsInline=true;video.setAttribute('playsinline','');video.preload='metadata';video.src=objectUrl;video.controls=false;video.autoplay=false;video.loop=repeat;video.volume=Number($('r74Volume').value)/100;video.addEventListener('loadedmetadata',()=>{video.pause();syncVideo()});video.addEventListener('timeupdate',syncVideo);video.addEventListener('play',()=>{updatePlay();if(isLive)channel.postMessage({kind:'videoControl',action:'play'})});video.addEventListener('pause',()=>{updatePlay();if(isLive)channel.postMessage({kind:'videoControl',action:'pause'})});video.addEventListener('ended',updatePlay);preview.append(video);playerVideo=video;updatePlay()}
else if(item.type==='imagem'){changeWorkspace(false);preview.innerHTML='<img class="r70Image" alt="Prévia" src="'+objectUrl+'">'}
else if(item.type==='pdf'){const source=blob?await blob.arrayBuffer():await(await fetch(objectUrl)).arrayBuffer();const task=pdfLibrary().getDocument({data:new Uint8Array(source),useSystemFonts:true});pdfDocument=await task.promise;pageTotal=pdfDocument.numPages;renderPageGrid();updatePdfSelection();/* PDF só é apresentado ao tocar em uma miniatura */}
if(item.type==='imagem'){isLive=true;send();window.dispatchEvent(new Event('r93-live-change'));if($('r90EndButton'))$('r90EndButton').hidden=false} else if(item.type==='video'&&playerVideo){playerVideo.pause();updatePlay();$('r70Present').textContent='▶ Apresentar no telão'}
}catch(e){preview.innerHTML='<div class="r70Empty">Não foi possível abrir: '+esc(e.message)+'</div>'}}
// Pasta > arquivo, sem lista suspensa e sem modificar a seleção já salva.
async function pickFolders(){ensure();const type=$('type')?.value;if(!['video','imagem','pdf'].includes(type))return;pickerType=type;pickerDay=null;const el=$('r70Picker');el.hidden=false;void pickFiles('Todos')}
async function pickFiles(day){pickerDay=day;const el=$('r70Picker');el.innerHTML='<div class="r70PickTitle"><button id="r70PickBack">‹ Pastas</button><strong>'+esc(day)+'</strong></div><div class="r70PickFiles">Carregando…</div>';el.querySelector('#r70PickBack').onclick=()=>{el.hidden=true};try{const rows=await window.ReunioesMediaLibrary.all();pickerEntries=rows.filter(f=>f.type===pickerType&&(day==='Todos'||f.day===day)).sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));const box=el.querySelector('.r70PickFiles');box.innerHTML=pickerEntries.length?pickerEntries.map(f=>'<button data-id="'+esc(f.id)+'"><span>▣</span><small>'+esc(f.name)+'</small></button>').join(''):'Nenhum arquivo nesta pasta.';box.querySelectorAll('[data-id]').forEach(b=>b.onclick=async()=>{const record=await window.ReunioesMediaLibrary.get(b.dataset.id);$('storedMediaSelect').value=record.id;$('itemTitle').value=record.name;el.hidden=true;el.innerHTML='';$('storedMediaCount').textContent='✓ Arquivo escolhido: '+record.name})}catch(e){el.querySelector('.r70PickFiles').textContent='Não foi possível acessar a biblioteca.'}}
// The older native selector remains for compatibility but is hidden in favor of the folder picker.
const oldFileFields=$('fileFields');if(oldFileFields){const select=$('storedMediaSelect');select?.closest('label')?.classList.add('r70LegacyPicker')}
window.R70={open,close,pickFolders,isPdfOpen:()=>ready?.type==='pdf',displaySupport:showSupport,hasActiveMedia:()=>!!ready,isLive:()=>isLive,stopForMusic:()=>{if(ready){close()}else{if(isLive)stop();void showSupport()}}};ensure();queueMicrotask(()=>{if(!ready)void showSupport()});
})();
;

// Fonte consolidada: cronograma73.js
/* Prévia 81: a edição só aparece em Editar cronograma; música permite apenas renomear/remover. */
(function(){
  const previousDraw=drawItems;
  function renameItem(id){
    const item=state.days[state.day].find(x=>x.id===id);
    if(!item)return;
    const answer=prompt('Nome deste item no cronograma:',item.title||'');
    if(answer===null)return;
    const title=answer.trim();
    if(!title){alert('O nome não pode ficar vazio.');return;}
    item.title=title;
    try{save();drawItems();}catch(e){alert('Não foi possível salvar o nome.');}
  }
  drawItems=function(){
    previousDraw();
    const editing=!!document.getElementById('saveSchedule')&&!document.getElementById('saveSchedule').hidden;
    document.querySelectorAll('#sectionsRoot .item, #items .item').forEach(row=>{
      const id=row.dataset.itemId;
      const item=state.days[state.day].find(x=>x.id===id);
      if(!item)return;
      // Pencils from older builds must never be visible while schedule is saved.
      row.querySelectorAll('.r73Rename').forEach(btn=>btn.remove());
      const edit=row.querySelector('[data-act="edit"]');
      if(edit){
        edit.hidden=!editing;
        if(item.type==='musica'){
          edit.textContent='Renomear';
          edit.title='Alterar somente o nome deste item';
          edit.onclick=e=>{e.preventDefault();e.stopPropagation();if(editing)renameItem(id)};
        }
      }
      if(item.type==='versiculo'){
        row.classList.add('r73VerseTap');
        row.title='Toque para apresentar o versículo diretamente no telão';
        row.addEventListener('click',e=>{
          if(e.target.closest('button,input,select,textarea,a,[contenteditable],.content-grip,.drag-handle'))return;
          const verse=state.days[state.day].find(x=>x.id===id);
          if(verse?.type==='versiculo'){window.bibleOpenFromSchedule=true;present({...verse,cronogramaSource:true});window.dispatchEvent(new CustomEvent('bible-schedule-present',{detail:verse}));setTab('biblia');}
        });
      }
    });
  };
  drawItems();
})();

;

// Fonte consolidada: consolidado74.js
(()=>{'use strict';
const el=id=>document.getElementById(id),escape=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const K=['versiculo','video','imagem','pdf','musica','texto'], N=['Bíblia','Vídeo','Foto','PDF','Música','Lembrete'],I=['<svg viewBox="0 0 24 24" width="33" height="33" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7v14m0-14C10.6 5.6 8.3 5 4 5v14c4.3 0 6.6.6 8 2m0-14c1.4-1.4 3.7-2 8-2v14c-4.3 0-6.6.6-8 2"/></svg>', '<svg viewBox="0 0 24 24" width="33" height="33" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 10h18M7 5l3 5m3-5 3 5"/><path d="m10 12 5 3-5 3z"/></svg>', '<svg viewBox="0 0 24 24" width="33" height="33" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>', '<svg viewBox="0 0 24 24" width="33" height="33" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></svg>', '<svg viewBox="0 0 24 24" width="33" height="33" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13M9 9l12-2"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>', '<svg viewBox="0 0 24 24" width="33" height="33" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>'];
let chosenSection=null,kind=null,folder=null,urls=[];
// Miniaturas compartilhadas: extrai um quadro real no Safari quando possivel.
function renderVideoThumbnail(target,blob,url){
 if(!target?.isConnected)return;
 target.replaceChildren();target.classList.add('r96mediaThumb');
 const fallback=document.createElement('span');fallback.className='r96VideoFallback';fallback.textContent='▶';target.append(fallback);
 const video=document.createElement('video');video.muted=true;video.defaultMuted=true;video.playsInline=true;video.preload='auto';video.src=url;
 video.setAttribute('playsinline','');video.setAttribute('webkit-playsinline','');
 let done=false;
 const capture=()=>{if(done||!target.isConnected||video.videoWidth<2||video.videoHeight<2)return;try{
  const canvas=document.createElement('canvas');canvas.width=300;canvas.height=Math.max(1,Math.round(300*video.videoHeight/video.videoWidth));
  canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
  const pic=new Image();pic.alt='Quadro do vídeo';pic.src=canvas.toDataURL('image/jpeg',.78);pic.className='r96ThumbPicture';
  target.replaceChildren(pic);const mark=document.createElement('span');mark.className='r96VideoMark';mark.textContent='▶';target.append(mark);done=true;video.removeAttribute('src');video.load();
 }catch(e){/* em formatos sem quadro no Safari, usar ícone de vídeo */}};
 video.addEventListener('loadeddata',()=>{try{video.currentTime=Math.min(.5,Number.isFinite(video.duration)?Math.max(.05,video.duration/10):.2)}catch(e){};capture()});
 video.addEventListener('seeked',capture);video.addEventListener('canplay',capture);
 video.addEventListener('error',()=>{video.removeAttribute('src')},{once:true});
}
async function renderPdfThumbnail(target,blob,url,withMark){
 if(!target?.isConnected)return;target.classList.add('r96mediaThumb');target.replaceChildren();
 const fallback=document.createElement('span');fallback.className='r96PdfFallback';fallback.textContent='PDF';target.append(fallback);
 try{
  const lib=window.pdfjsLib;if(!lib)return;
  lib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const bytes=await blob.arrayBuffer();const task=lib.getDocument({data:new Uint8Array(bytes)});
  const doc=await task.promise;try{
   const page=await doc.getPage(1);const view=page.getViewport({scale:1});const scale=Math.min(1.3,300/view.width);
   const viewport=page.getViewport({scale});const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
   const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
   await page.render({canvasContext:ctx,viewport}).promise;
   if(target.isConnected){canvas.className='r96PdfCanvas';canvas.setAttribute('aria-label','Primeira página do PDF');target.replaceChildren(canvas);if(withMark){const mark=document.createElement('span');mark.className='r96PdfMark';mark.textContent='PDF';target.append(mark)}}
  }finally{await doc.destroy()}
 }catch(e){/* placeholder legível se PDF.js não estiver disponível */}
}

const d=document.createElement('dialog');d.id='r74AddDialog';d.className='r74modal';d.innerHTML='<div class="r74top"><h2 id="r74Title">Adicionar conteúdo</h2><button type="button" class="r74close" id="r74Close">✕</button></div><div id="r74Content"></div>';
document.body.appendChild(d);el('r74Close').onclick=()=>{d.close();chosenSection=null};
function flush(){urls.forEach(u=>URL.revokeObjectURL(u));urls=[]}
function content(html){flush();el('r74Content').innerHTML=html}
function add(type,title,extras={}){const s=chosenSection||state.sections?.[state.day]?.[0]?.id;const item={id:uid(),type,title,sectionId:s,reference:'',translation:'ACF',content:'',fileUrl:null,...extras};state.days[state.day].push(item);save();drawItems();d.close();chosenSection=null;}
function choices(){d.classList.remove('r105SmallGallery');el('r74Title').textContent='Adicionar conteúdo';content('<div class="r74choices">'+K.map((t,i)=>`<button type="button" class="r74choice" data-type="${t}"><span class="r74ico">${I[i]}</span>${N[i]}</button>`).join('')+'</div>');el('r74Content').querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>selectType(b.dataset.type))}
function selectType(t){kind=t;folder=null;if(t==='versiculo'){window.bibleCronogramaSelect={sectionId:chosenSection||state.sections?.[state.day]?.[0]?.id||null,day:state.day};d.close();setTab('biblia');window.dispatchEvent(new Event('bible-cronograma-mode'));return}if(t==='texto'){el('r74Title').textContent='Lembrete';content('<button class="r74back">‹ Voltar</button><label>Lembrete<textarea id="r74Memo" rows="6" placeholder="Escreva o lembrete…"></textarea></label><button type="button" class="primary" id="r74SaveMemo">Adicionar ao cronograma</button>');el('r74Content').querySelector('.r74back').onclick=choices;el('r74SaveMemo').onclick=()=>{const note=el('r74Memo').value.trim();if(!note){alert('Escreva o lembrete.');return}add('texto','Lembrete',{content:note})};return}(t==='musica'?openScheduleMusicLibrary():files('Todos'))}
// Escolha musical pelo Cronograma: usa exatamente a Biblioteca de Músicas,
// não o seletor antigo de pastas da janela Adicionar conteúdo.
function openScheduleMusicLibrary(){
 window.r136ScheduleMusicMode=true;
 d.close();
 setTab('musicas');
 const library=el('musicas');library?.classList.add('r136SchedulePicker');
 const search=el('allMusicSearch');if(search){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}))}
 if(typeof drawMusic==='function')drawMusic();
 const back=el('r136ReturnAgenda');if(back)back.hidden=false;
}
window.r136ChooseSong=async function(trackId){
 if(!window.r136ScheduleMusicMode)return false;
 const tracks=await musicAll();
 const selected=tracks.find(t=>t.id===trackId);if(!selected)return false;
 const group=selected.groupId?tracks.filter(t=>t.groupId===selected.groupId):[selected];
 const main=group.find(t=>t.role==='completa')||group.find(t=>t.role==='piano_bateria')||group.find(t=>t.role!=='fundo')||group[0];
 add('musica',main.groupTitle||main.name,{musicId:main.id});
 window.r136ScheduleMusicMode=false;
 el('musicas')?.classList.remove('r136SchedulePicker');
 const back=el('r136ReturnAgenda');if(back)back.hidden=true;
 setTab('agenda');
 return true;
};
function folders(){el('r74Title').textContent='Escolher '+({musica:'música',video:'vídeo',imagem:'foto',pdf:'PDF'}[kind]||'arquivo');const days=kind==='musica'?(typeof MUSIC_FOLDERS!=='undefined'?MUSIC_FOLDERS:[]):['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];content('<button type="button" class="r74back">‹ Tipos</button><div class="r74folders">'+days.map((day,i)=>`<button type="button" data-folder="${i}">▣ ${escape(day)}</button>`).join('')+'</div>');el('r74Content').querySelector('.r74back').onclick=choices;el('r74Content').querySelectorAll('[data-folder]').forEach(b=>b.onclick=()=>files(days[Number(b.dataset.folder)]))}
async function files(day){
 folder=day;el('r74Title').textContent=day==='Todos'?({video:'Vídeos',imagem:'Fotos',pdf:'PDFs'}[kind]||day):day;
 content('<button type="button" class="r74back">‹ Voltar</button>'+ (kind==='musica'?'':'<div class="r105Import"><label class="r105ImportButton" for="r105NewFile">＋ Adicionar do iPad / celular</label><input id="r105NewFile" type="file" accept="'+(kind==='video'?'video/*,.mov,.mp4,.m4v':kind==='imagem'?'image/*,.jpg,.jpeg,.png,.webp,.heic,.heif':'.pdf,application/pdf')+'" aria-label="Escolher arquivo do aparelho"><div id="r105ImportStatus" role="status"></div></div>')+'<div class="r74files r75gallery" aria-live="polite">Carregando arquivos…</div>');
 const upload=el('r105NewFile');if(upload)upload.addEventListener('change',async()=>{
  const file=upload.files?.[0];if(!file)return;const status=el('r105ImportStatus');const allowed=kind==='video'?/\.(mov|mp4|m4v)$/i:kind==='imagem'?/\.(jpe?g|png|webp|heic|heif)$/i:/\.pdf$/i;
  if(!allowed.test(file.name)){status.textContent='Formato não aceito nesta pasta.';upload.value='';return}
  if(!file.size){status.textContent='O arquivo está vazio.';return}
  try{upload.disabled=true;status.textContent='Salvando arquivo no aplicativo…';const id=(crypto.randomUUID?.()||('media-'+Date.now()+'-'+Math.random().toString(36).slice(2)));
   await window.ReunioesMediaLibrary.put({id,name:file.name,type:kind,day:'Todos',blob:file,size:file.size,addedAt:Date.now()});
   status.textContent='Arquivo salvo e adicionado ao cronograma.';add(kind,file.name,{mediaLibraryId:id});
  }catch(error){status.textContent='Não foi possível adicionar: '+(error?.message||error);upload.disabled=false}
 });
 el('r74Content').querySelector('.r74back').onclick=kind==='musica'?folders:choices;
 const box=el('r74Content').querySelector('.r74files');
 try{
  if(kind==='musica'){
   // Uma única entrada por música, independentemente dos sete arquivos de versões.
   const tracks=(await musicAll()).filter(x=>x.folder===day);
   const groups=new Map();
   for(const track of tracks){const key=track.groupId||track.id;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(track)}
   const matches=[...groups.values()].map(variants=>{
     const track=variants.find(t=>t.role==='completa')||variants.find(t=>t.role==='piano_bateria')||variants.find(t=>(t.role||'completa')!=='fundo')||variants[0];
     return {id:track.id,name:track.groupTitle||track.name,available:variants.length};
   }).sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
   box.innerHTML=matches.length?matches.map(m=>`<button type="button" class="r75file" data-id="${escape(m.id)}"><span class="r75image r75music"><span class="r75musicIcon">♫</span></span><span class="r75filename">${escape(m.name)}</span><span class="r75kind">Música · ${m.available} versão(ões)</span></button>`).join(''):'Nenhuma música nesta pasta.';
   box.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{const m=matches.find(x=>x.id===b.dataset.id);if(m)add('musica',m.name,{musicId:m.id})});return;
  }
  const all=await window.ReunioesMediaLibrary.all();
  const list=all.filter(r=>r.type===kind&&(day==='Todos'||r.day===day)).sort((a,b)=>(b.addedAt||0)-(a.addedAt||0));
  d.classList.toggle('r105SmallGallery',list.length===1);
  if(!d.open||folder!==day)return;
  box.innerHTML=list.length?list.map(r=>`<button type="button" class="r75file" data-id="${escape(r.id)}" title="Adicionar ${escape(r.name)}"><span class="r75image" data-preview="${escape(r.id)}"><span class="r75fallback">${kind==='video'?'▶':kind==='imagem'?'▧':'PDF'}</span></span><span class="r75filename">${escape(r.name)}</span><span class="r75kind">${kind==='video'?'Vídeo':kind==='imagem'?'Foto':'PDF'}</span></button>`).join(''):'Pasta vazia. Adicione arquivos na Biblioteca de Mídias.';
  box.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{const m=list.find(x=>x.id===b.dataset.id);if(m)add(kind,m.name,{mediaLibraryId:m.id})});
  for(const record of list){
   if(!record.blob)continue;
   const tile=[...box.querySelectorAll('[data-preview]')].find(n=>n.dataset.preview===record.id);
   if(!tile)continue;
   const blob=kind==='pdf'&&record.blob.type!=='application/pdf'?new Blob([record.blob],{type:'application/pdf'}):record.blob;
   const objectURL=URL.createObjectURL(blob);urls.push(objectURL);
   if(kind==='imagem'){
    const pic=document.createElement('img');pic.alt='Miniatura da foto';pic.loading='lazy';pic.src=objectURL;tile.replaceChildren(pic);
   }else if(kind==='video'){
    renderVideoThumbnail(tile,record.blob,objectURL);
   }else{
    renderPdfThumbnail(tile,record.blob,objectURL,true);
   }
  }
 }catch(err){box.textContent='Não foi possível abrir esta pasta: '+err.message}
}
function openPicker(section){chosenSection=section||state.sections?.[state.day]?.[0]?.id;kind=null;choices();d.showModal()}
// Final loaded after all old scripts: intercept "add" only; preserve full editor for existing items.
const before=openEditor;openEditor=function(x){if(x)return before(x);const currentSection=chosenSection||el('itemSection')?.value||state.sections?.[state.day]?.[0]?.id;openPicker(currentSection);};
// Old section-add calls openEditor() then sets section select; infer from clicked parent in capture phase.
document.addEventListener('click',e=>{const btn=e.target.closest('.section-add');if(btn)chosenSection=btn.closest('.meeting-section')?.dataset.section||null},true);
// Take over item tap on media thumbnails and body, not action buttons; Bible remains direct.
document.addEventListener('click',e=>{const row=e.target.closest('#sectionsRoot .item');if(!row||e.target.closest('button,[contenteditable],input,textarea,select,.drag-handle,.content-grip'))return;const item=state.days[state.day].find(x=>x.id===row.dataset.itemId);if(!item)return;if(['video','imagem','pdf'].includes(item.type)){window.R70?.open(item)}else if(item.type==='musica'){playMusic(item.musicId)}},false);
// Library-backed item thumbnails: each redraw retains small square preview without storing large videos in localStorage.
let thumbUrls=[];function thumbnails(){thumbUrls.forEach(u=>URL.revokeObjectURL(u));thumbUrls=[];const day=state.day;for(const row of document.querySelectorAll('#sectionsRoot .item[data-item-id]')){const item=state.days[day].find(x=>x.id===row.dataset.itemId);if(!item?.mediaLibraryId)continue;const thumb=row.querySelector('.item-thumb');if(!thumb)continue;thumb.dataset.thumbId=item.mediaLibraryId;window.ReunioesMediaLibrary?.get(item.mediaLibraryId).then(record=>{if(!record?.blob||thumb.dataset.thumbId!==record.id||!thumb.isConnected)return;const url=URL.createObjectURL(record.blob);thumbUrls.push(url);thumb.classList.add('r74loaded');if(item.type==='imagem'){const image=document.createElement('img');image.alt='Miniatura da foto';image.src=url;thumb.replaceChildren(image)}else if(item.type==='video'){renderVideoThumbnail(thumb,record.blob,url)}else if(item.type==='pdf'){renderPdfThumbnail(thumb,record.blob,url,false)}}).catch(()=>{})}}
const priorDraw=drawItems;drawItems=function(){priorDraw();thumbnails()};drawItems();
window.Reunioes74={openPicker};
})();
;

// Fonte consolidada: preview91.js
/* Preview 91 - support image & minimized player dock */
(()=>{'use strict';
 const right=document.querySelector('#agenda .right');const panel=right?.querySelector('.preview');
 if(!right||!panel)return;
 let dock=document.getElementById('r91MinimizedDock');
 if(!dock){dock=document.createElement('div');dock.id='r91MinimizedDock';dock.setAttribute('aria-label','Reabrir apresentações minimizadas');const after=document.getElementById('r91MusicHost');(after||panel).insertAdjacentElement('afterend',dock)}
 ['r71PdfReopen','agenda56Reopen'].forEach(id=>{const b=document.getElementById(id);if(b)dock.append(b)});
 // Support image must remain the background even while a music player is in use.
 window.addEventListener('pageshow',()=>{const pv=document.getElementById('preview');if(pv&&!pv.querySelector('img,video,canvas,.verse')&&!window.R70?.hasActiveMedia?.())void window.R70?.displaySupport?.()});
})();

;

// Fonte consolidada: preview93.js
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
   const bibleShown=!!preview.querySelector('.verse,.b120Verse');
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

;

// Fonte consolidada: preview95.js
/* Previa 95 — mover os controles de edição ao lado de Imagem de Apoio.
   Apenas reorganiza a interface: nenhuma alteração nos dados. */
(()=>{
  'use strict';
  const bar=document.querySelector('#agenda #r88SupportBar');
  const toolbar=document.querySelector('#agenda .layout>.panel>.panelhead .section-toolbar');
  if(bar&&toolbar&&!bar.contains(toolbar))bar.append(toolbar);
})();

;

// Fonte consolidada: preview96.js
/* Prévia 96: player integrado à coluna do cronograma, sem sobreposição. */
(()=>{'use strict';
 const agenda=document.getElementById('agenda'),host=document.getElementById('r91MusicHost');
 const bar=document.getElementById('r88SupportBar'),sections=document.getElementById('sectionsRoot');
 if(host&&sections){sections.before(host);}
 const reopen=document.getElementById('agenda56Reopen');
 const dock=document.getElementById('r91MinimizedDock');
 if(reopen&&bar&&!dock){bar.append(reopen)}
 // Reduz a chance de telas antigas reaparecerem após alternar de dia.
 const observer=new MutationObserver(()=>{if(host&&sections&&host.parentElement!==sections.parentElement)sections.before(host)});
 if(agenda)observer.observe(agenda,{childList:true,subtree:false});
})();

;

// Fonte consolidada: preview97.js
/* Prévia 97: edição rápida e miniaturas 16:9 no cronograma. */
(()=>{'use strict';
 const editing=()=>{const b=document.getElementById('saveSchedule');return Boolean(b&&!b.hidden)};
 const simpleDialog=document.createElement('dialog');simpleDialog.className='r97Dialog';simpleDialog.id='r97QuickEdit';simpleDialog.innerHTML='<form method="dialog"><div class="r97DialogTop"><strong id="r97Heading">Editar</strong><button type="button" id="r97Dismiss" aria-label="Fechar">✕</button></div><label id="r97FieldLabel" for="r97Field">Nome</label><textarea id="r97Field" rows="2"></textarea><div class="r97DialogButtons"><button type="button" id="r97Cancel">Cancelar</button><button type="submit" class="primary">Salvar</button></div></form>';
 document.body.append(simpleDialog);
 const field=simpleDialog.querySelector('#r97Field');
 let editingItem=null,editingType=null;
 function close(){simpleDialog.close();editingItem=null;editingType=null}
 simpleDialog.querySelector('#r97Dismiss').onclick=close;
 simpleDialog.querySelector('#r97Cancel').onclick=close;
 simpleDialog.querySelector('form').addEventListener('submit',e=>{e.preventDefault();if(!editingItem)return;const val=field.value.trim();if(!val){field.focus();return}const now=state.days[state.day].find(x=>x.id===editingItem);if(!now)return close();if(editingType==='texto')now.content=val;else now.title=val;save();close();drawItems()});
 function quickEdit(item){editingItem=item.id;editingType=item.type;const memo=item.type==='texto';simpleDialog.querySelector('#r97Heading').textContent=memo?'Editar lembrete':'Renomear arquivo';simpleDialog.querySelector('#r97FieldLabel').textContent=memo?'Texto do lembrete':'Nome no cronograma';field.value=memo?(item.content||''):(item.title||'');field.rows=memo?6:2;simpleDialog.showModal();field.focus();field.setSelectionRange(field.value.length,field.value.length)}
 function apply(){const isEdit=editing();document.querySelectorAll('#sectionsRoot .item[data-item-id]').forEach(row=>{
  const item=state.days[state.day].find(x=>x.id===row.dataset.itemId);if(!item)return;
  row.classList.toggle('r97Editing',isEdit);row.classList.toggle('r97Media',['imagem','video','pdf'].includes(item.type));
  const show=row.querySelector('[data-act="show"]'),edit=row.querySelector('[data-act="edit"]'),del=row.querySelector('[data-act="delete"]');
  if(show)show.hidden=isEdit;
  if(edit){const allowEdit=isEdit&&item.type!=='musica';edit.hidden=!allowEdit;
   if(allowEdit&&item.type==='versiculo'){edit.classList.add('r140VerseEdit');edit.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.2 3.8a2.1 2.1 0 0 1 3 3L8.7 17.3 4 18.5l1.2-4.7Z"/></svg>';edit.setAttribute('aria-label','Editar referência bíblica');edit.title='Editar referência bíblica';}
   if(allowEdit&&['texto','imagem','video','pdf'].includes(item.type)){edit.textContent='✎';edit.setAttribute('aria-label',item.type==='texto'?'Editar texto do lembrete':'Renomear arquivo');edit.title=edit.getAttribute('aria-label');edit.onclick=e=>{e.preventDefault();e.stopPropagation();quickEdit(item)}}
  }
  if(del){del.hidden=!isEdit;del.textContent='✕';del.title='Remover do cronograma';del.setAttribute('aria-label','Remover do cronograma');}
 });}
 const prior=drawItems;drawItems=function(){prior();apply()};apply();
 // Quando em edição, toques sobre o conteúdo não devem apresentar mídia no telão.
 document.addEventListener('click',e=>{if(!editing())return;const row=e.target.closest('#sectionsRoot .item');if(!row)return;if(e.target.closest('button,.content-grip,input,select,textarea,[contenteditable]'))return;e.stopPropagation()},true);
})();

;

// Fonte consolidada: preview99.js
/* Prévia 99: a primeira etapa permanece em cabeçalho fixo, fora da lista que rola.
   Os botões da faixa fixa acionam os controles originais, preservando as funções existentes. */
(()=>{
  'use strict';
  const agenda=document.getElementById('agenda');
  const root=document.getElementById('sectionsRoot');
  if(!agenda||!root)return;
  const pinned=document.createElement('div');
  pinned.id='r99PinnedFirstStage';
  pinned.setAttribute('aria-label','Primeira etapa fixa do cronograma');
  root.before(pinned);
  let currentSource=null;
  function sync(){
    const first=root.querySelector(':scope > .meeting-section:first-child');
    const source=first?.querySelector(':scope > .meeting-section-head');
    if(!source){pinned.hidden=true;currentSource=null;return;}
    currentSource=source;
    pinned.hidden=false;
    const replica=source.cloneNode(true);
    replica.classList.add('r99PinnedHeading');
    replica.querySelector('.section-grip')?.remove();
    replica.querySelector('.color-picker')?.remove();
    const button=replica.querySelector('.section-toggle');
    if(button){button.setAttribute('aria-label','Expandir ou recolher a primeira etapa');}
    pinned.replaceChildren(replica);
  }
  pinned.addEventListener('click',event=>{
    const src=currentSource;
    if(!src||!src.isConnected)return;
    const action=event.target.closest('[data-sact]');
    if(action){src.querySelector('[data-sact="'+action.dataset.sact+'"]')?.click();return;}
    src.querySelector('.section-toggle')?.click();
  });
  // A renderização do cronograma reconstrói a lista ao mudar de dia/editar/expandir.
  // Sincronizar depois da reconstrução sem mexer na posição de rolagem.
  const observer=new MutationObserver(sync);
  observer.observe(root,{childList:true});
  sync();
})();

;

// Fonte consolidada: preview100.js
/* Prévia 100: player sobreposto à lista (não empurra etapas); dock compacto sob telão durante grade PDF. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const host=$('r91MusicHost'),panel=$('agenda')?.querySelector('.layout > .panel'),right=$('agenda')?.querySelector('.right'),preview=right?.querySelector('.preview'),grid=$('r70PageWorkspace');
if(!host||!panel||!right||!preview)return;
const leftMarker=document.createElement('span');leftMarker.id='r100PlayerAnchor';leftMarker.hidden=true;panel.insertBefore(leftMarker,$('r99PinnedFirstStage')||$('sectionsRoot'));
const rightMarker=document.createElement('span');rightMarker.id='r100RightAnchor';rightMarker.hidden=true;preview.insertAdjacentElement('afterend',rightMarker);
const expand=document.createElement('button');expand.type='button';expand.id='r100Expand';expand.textContent='⤢ Ampliar';expand.title='Ampliar Media Player sobre o cronograma';
let expanded=false,last='';
expand.onclick=()=>{expanded=true;sync()};
const head=$('floatingMusic')?.querySelector('.floating-music-head');head?.append(expand);
function gridShowing(){const el=$('r70PageWorkspace');return Boolean(el&&!el.hidden&&getComputedStyle(el).display!=='none')}
function sync(){
 const playing=document.body.dataset.player56==='agenda'&&!host.hidden;
 if(host.parentElement!==panel)leftMarker.after(host);
 document.body.classList.remove('r100CompactPlayer');
 document.body.classList.toggle('r100OverlayPlayer',playing);
 expand.hidden=true;
 if(playing){
  const origin=$('r99PinnedFirstStage')||$('sectionsRoot');
  const top=Math.max(0,origin.getBoundingClientRect().top-panel.getBoundingClientRect().top);
  host.style.setProperty('--r100Top',top+'px');
 }
}

const watch=new MutationObserver(()=>requestAnimationFrame(sync));
watch.observe(document.body,{attributes:true,attributeFilter:['data-player56']});
watch.observe(host,{attributes:true,attributeFilter:['hidden']});
const gridWrap=$('r70PageWorkspace');if(gridWrap)watch.observe(gridWrap,{attributes:true,attributeFilter:['hidden','style']});
$('agenda56Minimize')?.addEventListener('click',()=>{expanded=false;requestAnimationFrame(sync)});
$('agenda56Reopen')?.addEventListener('click',()=>{expanded=false;requestAnimationFrame(sync)});
window.addEventListener('resize',sync);
requestAnimationFrame(sync);
})();
;

// Fonte consolidada: preview101.js
/* PREVIA 101 — reforço de visibilidade dos controles por tela e cabeçalho de vídeo. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const controls=$('r70MediaControls');
function refresh(){
 const typeVideo=controls&&!controls.hidden&&!$('r70VideoControls')?.hidden;
 controls?.classList.toggle('r101VideoMode',!!typeVideo);
}
const observer=new MutationObserver(()=>requestAnimationFrame(refresh));
if(controls)observer.observe(controls,{attributes:true,attributeFilter:['hidden']});
if($('r70VideoControls'))observer.observe($('r70VideoControls'),{attributes:true,attributeFilter:['hidden']});
document.querySelectorAll('.page').forEach(page=>observer.observe(page,{attributes:true,attributeFilter:['class']}));
refresh();
})();

;

// Fonte consolidada: preview105.js
/* Prévia 105: cabeçalho do cronograma e controles limpos */
(()=>{'use strict';
 const $=id=>document.getElementById(id);const agenda=$('agenda');if(!agenda)return;
 const panel=agenda.querySelector('.layout > .panel');const head=panel?.querySelector('.panelhead');const bar=$('r88SupportBar');const toolbar=head?.querySelector('.section-toolbar')||bar?.querySelector('.section-toolbar');
 if(head&&bar){
   const heading=head.querySelector('h2#dayTitle');if(heading){heading.style.textTransform='uppercase';heading.closest('div')?.classList.add('r105DayHeading')}
   if(toolbar&&toolbar.parentElement!==head)head.append(toolbar);
   const support=bar.querySelector('#r87Support');if(support){support.classList.add('r105Support');if(toolbar)head.insertBefore(support,toolbar);else head.append(support)}
   if(!bar.children.length)bar.remove();else bar.hidden=true;
   head.classList.add('r105AgendaHeader');
 }
 // Never draw the blue title panel for photos; keep the dedicated red Encerrar control.
 const media=$('r70MediaControls');if(media){
  const observer=new MutationObserver(()=>{if(!media.hidden){media.classList.add('r105VideoOnly')}});
  observer.observe(media,{attributes:true,attributeFilter:['hidden']});
 }
})();

;

// Fonte consolidada: preview109.js
/* Prévia 109: moldura única do Telão Santuário e da grade PDF. */
(()=>{
 function mount(){
  const right=document.querySelector('#agenda .layout>.right');
  const preview=right?.querySelector('.preview');
  if(!right||!preview)return;
  let frame=right.querySelector('.r109PresentationFrame');
  if(!frame){frame=document.createElement('div');frame.className='r109PresentationFrame';preview.before(frame)}
  if(preview.parentElement!==frame)frame.appendChild(preview);
  const grid=document.getElementById('r70PageWorkspace');
  if(grid&&grid.parentElement!==frame)frame.appendChild(grid);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
 // Reparent only after media70 initializes; catch opening PDFs if the view is rebuilt.
 const agenda=document.getElementById('agenda');
 if(agenda){new MutationObserver(()=>{
  const preview=agenda.querySelector('.right .preview');
  const grid=document.getElementById('r70PageWorkspace');
  if(preview&&grid&&preview.parentElement?.classList.contains('r109PresentationFrame')&&grid.parentElement!==preview.parentElement){preview.parentElement.appendChild(grid)}
 }).observe(agenda,{childList:true,subtree:true})}
})();

;

// Fonte consolidada: preview110.js
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
   window.__r112SwitchingDay=true;
   closePrevious();
   // O handler original atualiza todas as etapas, contadores e registros do cronograma.
   // Aguarda o handler do botão concluir a atualização do dia antes de abrir o apoio.
   // O início da próxima tarefa impede que limpezas antigas apaguem a imagem nova.
   setTimeout(()=>{
      window.__r112SwitchingDay=false;
      if(state.day!==next)return;
      try{void window.R70?.displaySupport?.()}catch(e){console.warn(e)}
      try{document.querySelector('#agenda .r70grid')?.scrollTo({top:0,behavior:'instant'})}catch(e){}
   },0);
 },true);
 // Se retornar à aba Cronograma durante outra semana, não reinicia um dia escolhido manualmente.
})();

;

// Fonte consolidada: preview119.js
/* Prévia 119 — Bíblia em layout claro com a prévia compartilhada do Telão Santuário. */
(()=>{'use strict';
 const page=document.getElementById('biblia');
 const source=document.getElementById('preview');
 const mirror=document.getElementById('b119Mirror');
 const badge=document.getElementById('b119LiveBadge');
 if(!page||!source||!mirror)return;
 const book=document.getElementById('bibleBook');
 const chapter=document.getElementById('bibleChapter');
 const prev=document.getElementById('b119PrevChapter');
 const next=document.getElementById('b119NextChapter');
 let scheduled=false;
 function updateMirror(){
  scheduled=false;
  // Usa uma CÓPIA visual; nunca move a tela original do Cronograma.
  const copy=source.cloneNode(true);
  mirror.replaceChildren(...Array.from(copy.childNodes));
  const srcCanvas=[...source.querySelectorAll('canvas')];
  const clonedCanvas=[...mirror.querySelectorAll('canvas')];
  clonedCanvas.forEach((canvas,i)=>{
   const original=srcCanvas[i];if(!original)return;
   try{canvas.width=original.width;canvas.height=original.height;canvas.getContext('2d')?.drawImage(original,0,0)}catch(_e){}
  });
  // A tela da Bíblia mostra a mesma mídia, mas sem controles independentes.
  const srcVideos=[...source.querySelectorAll('video')];
  mirror.querySelectorAll('video').forEach((v,i)=>{v.removeAttribute('controls');v.muted=true;v.playsInline=true;try{v.currentTime=srcVideos[i]?.currentTime||0}catch(_e){};if(srcVideos[i]&&!srcVideos[i].paused)v.play().catch(()=>{})});
  const active=!!(source.querySelector('.verse,.b120Verse') || window.R70?.isLive?.() || source.querySelector('img:not([alt="Imagem de Apoio"]),video,canvas,iframe'));
  badge.classList.toggle('b119Active',active);
  badge.setAttribute('aria-label',active?'Conteúdo em apresentação':'Telão em espera');
 }
 function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(updateMirror)}
 new MutationObserver(schedule).observe(source,{childList:true,subtree:true,attributes:true,attributeFilter:['src','class','style']});
 document.addEventListener('click',schedule,true);
 document.addEventListener('change',schedule,true);
 window.addEventListener('r93-live-change',schedule);
 // Apresentar os versículos sem navegar de volta para o Cronograma.
 document.getElementById('biblePresent')?.addEventListener('click',event=>{
   event.preventDefault();event.stopImmediatePropagation();
   if(typeof bibleItem!=='function'||typeof present!=='function')return;
   const item=bibleItem();if(!item)return;
   if(window.R70?.hasActiveMedia?.())window.R70.close();
   present(item);
   schedule();
 },true);
 document.getElementById('b119Clear')?.addEventListener('click',()=>{
   if(window.R70?.hasActiveMedia?.())window.R70.close();
   if(typeof present==='function')present(null);
   schedule();
 });
 function goChapter(offset){
  const total=typeof BIBLE_BOOKS!=='undefined'?BIBLE_BOOKS[Number(book.value)]?.[1]:0;
  const current=Number(chapter.value)||1;
  const candidate=current+offset;
  if(candidate<1||candidate>total)return;
  chapter.value=String(candidate);
  if(typeof selectedVerses!=='undefined')selectedVerses=[];
  if(typeof bibleStep!=='undefined')bibleStep='verse';
  if(typeof drawBiblePicker==='function')drawBiblePicker();
  if(typeof loadBibleText==='function')loadBibleText();
  refreshChapters();
 }
 function refreshChapters(){const current=Number(chapter.value)||1;const total=typeof BIBLE_BOOKS!=='undefined'?BIBLE_BOOKS[Number(book.value)]?.[1]:0;prev.disabled=current<=1;next.disabled=current>=total;}
 prev.addEventListener('click',()=>goChapter(-1));next.addEventListener('click',()=>goChapter(1));
 document.getElementById('bibleBooksGrid')?.addEventListener('click',()=>queueMicrotask(refreshChapters));
 document.getElementById('bibleChaptersGrid')?.addEventListener('click',()=>queueMicrotask(refreshChapters));
 document.getElementById('bibleStepBook')?.addEventListener('click',refreshChapters);
 window.addEventListener('pageshow',()=>{refreshChapters();schedule()});
 refreshChapters();schedule();
})();

;

// Fonte consolidada: preview120.js
/* Prévia 120 — controles bíblicos unificados, referência e versículos separados. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const settingsKey='reunioes3-bible-projection-v120';
const defaults={refPosition:'below-center',refSize:26,refColor:'#f0cf72',refFont:'Arial',refOutline:true,refShadow:true,showTranslation:true,textSize:58,textFont:'Arial',textColor:'#ffffff',textShadow:true,textOutline:false,bg:'navy',bgImage:''};
let config={...defaults};try{config={...config,...JSON.parse(localStorage.getItem(settingsKey)||'{}')}}catch(_e){}
const persist=()=>{try{const copy={...config,bgImage:''};localStorage.setItem(settingsKey,JSON.stringify(copy));return true}catch(e){console.warn('Configurações indisponíveis para gravação',e);return false}};
// O fundo fica no IndexedDB, sem o limite reduzido do localStorage.
function bgDatabase(){return new Promise((resolve,reject)=>{const r=indexedDB.open('reunioes3-bible-bg-v123',1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains('images'))r.result.createObjectStore('images')};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function putBackground(value){const db=await bgDatabase();try{await new Promise((resolve,reject)=>{const t=db.transaction('images','readwrite');t.objectStore('images').put(value,'active');t.oncomplete=resolve;t.onerror=()=>reject(t.error)})}finally{db.close()}}
async function getBackground(){const db=await bgDatabase();try{return await new Promise((resolve,reject)=>{const t=db.transaction('images','readonly');const r=t.objectStore('images').get('active');r.onsuccess=()=>resolve(r.result||'');r.onerror=()=>reject(r.error)})}finally{db.close()}}
let backgroundReady=(async()=>{try{const stored=await getBackground();if(stored){config.bgImage=stored;if(config.bg==='image')refreshVerseProjection()}}catch(e){console.warn('Fundo bíblico indisponível',e)}})();
function imageData(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{try{const canvas=document.createElement('canvas');const ratio=Math.min(1,1920/img.width,1080/img.height);canvas.width=Math.max(1,Math.round(img.width*ratio));canvas.height=Math.max(1,Math.round(img.height*ratio));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.87))}catch(e){reject(e)}};img.onerror=()=>reject(Error('Não foi possível abrir a imagem'));img.src=String(r.result)};r.onerror=()=>reject(r.error);r.readAsDataURL(file)})}
window.bible120SaveSettings=async()=>{await backgroundReady;return persist()};
window.bible120Settings=()=>({...config});
const editor=$('biblia')?.querySelector('.b119Editor');if(!editor)return;
const panel=document.createElement('details');panel.id='b120Settings';panel.className='b120Settings';panel.innerHTML=`<summary title="Configurações da Bíblia" aria-label="Configurações de apresentação da Bíblia">⚙</summary><div class="b120SettingsInner"><div class="b120CompactHead"><h3>Configuração da Bíblia</h3><p>Ajuste o texto, a referência e o fundo do telão.</p></div><div class="b120Block"><h4>Texto do versículo</h4><div class="b120Fields b120FieldsCompact"><label>Fonte<select id="b120TextFont"><option value="Arial">Arial</option><option value="Anton">Anton</option><option value="League Spartan">League Spartan</option><option value="Georgia">Georgia</option><option value="Bebas Neue">Bebas Neue</option><option value="Oswald">Oswald</option><option value="Roboto Condensed">Roboto Condensed</option><option value="Montserrat">Montserrat</option><option value="Poppins">Poppins</option><option value="DM Sans">DM Sans</option><option value="Merriweather">Merriweather</option><option value="Lora">Lora</option><option value="Playfair Display">Playfair Display</option></select></label><label class="b120RangeLabel">Tamanho <output id="b120TextSizeOut"></output><input type="range" id="b120TextSize" min="28" max="100" step="1"></label><label>Cor<input type="color" id="b120TextColor"></label><label>Fundo<select id="b120BG"><option value="navy">Azul profundo</option><option value="black">Preto</option><option value="blue">Azul médio</option><option value="image">Imagem escolhida</option></select></label></div><div class="b120Checks"><label><input type="checkbox" id="b120TextOutline"> Contorno do texto</label><label><input type="checkbox" id="b120TextShadow"> Sombra do texto</label></div></div><div class="b120Block"><h4>Referência bíblica</h4><div class="b120Fields b120FieldsCompact"><label>Posição<select id="b120Position"><option value="end">No fim do texto</option><option value="below-center">Abaixo do texto — Centro</option><option value="below-left">Abaixo do texto — Esquerda</option><option value="below-right">Abaixo do texto — Direita</option><option value="bottom-left">Canto inferior esquerdo</option><option value="bottom-right">Canto inferior direito</option></select></label><label class="b120RangeLabel">Tamanho <output id="b120RefSizeOut"></output><input type="range" id="b120RefSize" min="14" max="70" step="1"></label><label>Cor<input type="color" id="b120RefColor"></label><label>Fonte<select id="b120RefFont"><option value="Arial">Arial</option><option value="Anton">Anton</option><option value="League Spartan">League Spartan</option><option value="Georgia">Georgia</option><option value="Bebas Neue">Bebas Neue</option><option value="Oswald">Oswald</option><option value="Roboto Condensed">Roboto Condensed</option><option value="Montserrat">Montserrat</option><option value="Poppins">Poppins</option><option value="DM Sans">DM Sans</option><option value="Merriweather">Merriweather</option><option value="Lora">Lora</option><option value="Playfair Display">Playfair Display</option></select></label></div><div class="b120Checks"><label><input type="checkbox" id="b120ShowTranslation"> Mostrar sigla da versão (ACF/ARA)</label><label><input type="checkbox" id="b120RefOutline"> Contorno da referência</label><label><input type="checkbox" id="b120RefShadow"> Sombra da referência</label></div></div><label class="b120BgUpload">Imagem para o fundo <input id="b120BgFile" type="file" accept="image/*"></label><div class="b123SaveLine"><button type="button" id="b123SaveSettings">Salvar configurações</button><span id="b123SaveStatus" role="status">Configurações guardadas automaticamente.</span></div></div>`;
const toolbar=editor.querySelector('.b125HeaderTools');if(toolbar)toolbar.appendChild(panel);else editor.querySelector('.b119Header')?.appendChild(panel);
const status=()=>document.getElementById('b123SaveStatus');
document.getElementById('b123SaveSettings').onclick=()=>{
 // O fechamento deve ser imediato; a gravação do fundo no IndexedDB não pode segurar a janela aberta.
 const el=status();
 const ok=persist();
 if(el)el.textContent=ok?'✓ Configurações salvas neste iPad.':'Não foi possível salvar as configurações.';
 panel.open=false;
 panel.removeAttribute('open');
 window.bible120SaveSettings().then(saved=>{if(!saved&&el)el.textContent='Não foi possível salvar as configurações.'}).catch(error=>{console.warn('Falha ao confirmar salvamento da Bíblia',error)});
};
const controls={b120Position:'refPosition',b120RefFont:'refFont',b120RefSize:'refSize',b120RefColor:'refColor',b120RefOutline:'refOutline',b120RefShadow:'refShadow',b120ShowTranslation:'showTranslation',b120TextFont:'textFont',b120TextSize:'textSize',b120TextColor:'textColor',b120BG:'bg',b120TextOutline:'textOutline',b120TextShadow:'textShadow'};
function updateValues(){for(const [id,key] of Object.entries(controls)){const el=$(id);if(!el)continue;if(el.type==='checkbox')el.checked=!!config[key];else el.value=String(config[key])} $('b120RefSizeOut').textContent=config.refSize+' px';$('b120TextSizeOut').textContent=config.textSize+' px';}
updateValues();
for(const [id,key] of Object.entries(controls)){const el=$(id);el?.addEventListener(el.type==='range'?'input':'change',()=>{config[key]=el.type==='checkbox'?el.checked:el.type==='range'?Number(el.value):el.value;updateValues();persist();if(status())status().textContent='✓ Ajustes salvos automaticamente.';refreshVerseProjection()})}
$('b120BgFile').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;if(!f.type.startsWith('image/'))return alert('Selecione uma imagem.');const el=status();if(el)el.textContent='Salvando a imagem de fundo…';try{const data=await imageData(f);await putBackground(data);config.bg='image';config.bgImage=data;persist();updateValues();refreshVerseProjection();if(el)el.textContent='✓ Imagem de fundo salva neste iPad.'}catch(error){console.error('Falha ao guardar imagem',error);if(el)el.textContent='Não foi possível salvar a imagem.';alert('Não foi possível guardar esta imagem no aparelho.')}});
const seqBar=document.createElement('div');seqBar.id='b120Sequence';seqBar.className='b120Sequence';seqBar.hidden=true;
seqBar.innerHTML='<button id="b120Prev" type="button">‹ Anterior</button><strong id="b120Counter">Versículo 1 de 1</strong><button id="b120Next" type="button">Próximo ›</button>';
$('b119Mirror')?.closest('.b119ScreenFrame')?.after(seqBar);
const agendaBar=seqBar.cloneNode(true);agendaBar.id='b120AgendaSequence';agendaBar.querySelector('#b120Prev').id='b120AgendaPrev';agendaBar.querySelector('#b120Counter').id='b120AgendaCounter';agendaBar.querySelector('#b120Next').id='b120AgendaNext';
$('preview')?.parentElement?.append(agendaBar);
let sequence=null,seqIndex=0,displayed=null;
const priorPresent=present;
function finalItem(item,index){if(!item?.verses?.length)return item;const part=item.verses[index];return {...item,content:part.text,reference:part.reference,title:item.title,verses:undefined,bibleSequenceId:item.id};}
function showIndex(i){if(!sequence)return;seqIndex=Math.max(0,Math.min(sequence.verses.length-1,i));displayed=finalItem(sequence,seqIndex);priorPresent(displayed);updateNavigation()}
function updateNavigation(){const on=!!sequence&&sequence.verses.length>1;for(const bar of [seqBar,agendaBar]){bar.hidden=!on;if(!on)continue;bar.querySelector('strong').textContent='Versículo '+(seqIndex+1)+' de '+sequence.verses.length;const btn=bar.querySelectorAll('button');btn[0].disabled=seqIndex===0;btn[1].disabled=seqIndex===sequence.verses.length-1}}
function step(n){if(!sequence)return;showIndex(seqIndex+n)}
$('b120Prev').onclick=()=>step(-1);$('b120Next').onclick=()=>step(1);$('b120AgendaPrev').onclick=()=>step(-1);$('b120AgendaNext').onclick=()=>step(1);
present=function(item){if(item?.type==='versiculo'&&Array.isArray(item.verses)&&item.verses.length){sequence=item;seqIndex=0;showIndex(0);return}sequence=null;displayed=item?.type==='versiculo'?item:null;priorPresent(item);updateNavigation()};
function selectedItem(){const item=typeof bibleItem==='function'?bibleItem():null;if(!item)return null;const nums=[...selectedVerses].sort((a,b)=>a-b);const bi=Number($('bibleBook').value),ch=Number($('bibleChapter').value),ver=$('bibleTranslation').value;const raw=importedBibles[ver];if(!raw)return null;const parts=nums.map(n=>({text:getImportedVerse(raw,bi,ch,n),reference:BIBLE_BOOKS[bi][0]+' '+ch+':'+n}));if(parts.some(x=>!x.text))return null;item.verses=parts;item.content=parts[0].text;item.reference=nums.length===1?parts[0].reference:BIBLE_BOOKS[bi][0]+' '+ch+':'+nums[0]+'–'+nums[nums.length-1];item.refSettings={...config,bgImage:''};return item}
// Captura ANTES dos handlers originais, para evitar salvar os textos concatenados.
document.addEventListener('click',e=>{const btn=e.target.closest?.('#bibleAdd,#biblePresent');if(!btn)return;e.preventDefault();e.stopImmediatePropagation();const item=selectedItem();if(!item)return;if(btn.id==='biblePresent'){if(window.R70?.hasActiveMedia?.())window.R70.close();present(item);return}const arr=state.days[state.day];arr.push(item);try{save()}catch(err){arr.pop();alert('Não foi possível salvar no aparelho.');return}drawItems();setTab('agenda');alert('Sequência adicionada ao cronograma. Nenhum versículo foi projetado.')},true);
// Projeção: atualizar os parâmetros visuais sem alterar a tradução ou o conteúdo.
const nativeRender=renderContent;
renderContent=function(item){if(item?.type!=='versiculo')return nativeRender(item);const c=item.refSettings?{...config,...item.refSettings,bgImage:item.refSettings.bgImage||config.bgImage}:config;const ref=escapeHtml(item.reference||'');const translation=escapeHtml(String(item.translation||'').toUpperCase().includes('ARA')?'ARA':String(item.translation||'').toUpperCase().includes('ACF')?'ACF':String(item.translation||'').trim());const position=['end','below-center','below-left','below-right','bottom-left','bottom-right'].includes(c.refPosition)?c.refPosition:'below-center';const text=escapeHtml(item.content||'');const bg=c.bg==='image'&&c.bgImage?'url('+JSON.stringify(c.bgImage)+') center/cover no-repeat':c.bg==='black'?'#030609':c.bg==='blue'?'#284e70':'#142d48';const sty=`--b120-rsize:${Number(c.refSize)||30}px;--b120-tsize:${Number(c.textSize)||58}px;--b120-rcolor:${c.refColor||'#f0cf72'};--b120-tcolor:${c.textColor||'#ffffff'};--b120-rfont:${JSON.stringify(c.refFont||'Arial')},Arial,sans-serif;--b120-tfont:${JSON.stringify(c.textFont||'Arial')},Arial,sans-serif;--b120-rshadow:${c.refShadow?'0 3px 5px #000c':'none'};--b120-rstroke:${c.refOutline?'1px #000':'0 transparent'};--b120-tshadow:${c.textShadow?'0 3px 7px #000e':'none'};--b120-tstroke:${c.textOutline?'1px #000':'0 transparent'};background:${bg}`;
const renderedText=window.bibleMarkHTML?window.bibleMarkHTML(item.content||'',item.highlights||[],c.refColor):text;const label=`<span class="b120Ref">${ref}${c.showTranslation!==false&&translation?` <span class="b120Translation">· ${translation}</span>`:''}</span>`;
return `<div class="b120Verse b120Pos-${position}" style="${sty.replace(/"/g,'&quot;')}"><div class="b120VerseText">${renderedText}${position==='end'?' '+label:''}</div>${position==='end'?'':`<div class="b120RefArea">${label}</div>`}</div>`};
function refreshVerseProjection(){if(!displayed||displayed.type!=='versiculo')return;if(sequence){sequence.refSettings={...config};showIndex(seqIndex)}else{displayed={...displayed,refSettings:{...config}};priorPresent(displayed)}}
// Atualizar conteúdos de outras partes do app que usam renderContent.
window.addEventListener('pageshow',updateNavigation);updateNavigation();
})();

;

// Fonte consolidada: preview121.js
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

;

// Fonte consolidada: preview122.js
/* Prévia 122: ações aparecem somente com versículos escolhidos. */
(()=>{'use strict';
 const actions=document.querySelector('#biblia .b119Actions');
 const verses=document.getElementById('bibleVersesGrid');
 if(!actions||!verses)return;
 const refresh=()=>{
  let chosen=false;
  try{chosen=typeof selectedVerses!=='undefined'&&Array.isArray(selectedVerses)&&selectedVerses.length>0}catch(_e){}
  if(!chosen)chosen=!!verses.querySelector('button.chosen,button[aria-pressed="true"]');
  actions.hidden=!chosen;
 };
 // O seletor recria os botões ao trocar livro, capítulo ou versículo.
 new MutationObserver(refresh).observe(verses,{childList:true,subtree:true,attributes:true,attributeFilter:['class','aria-pressed','hidden']});
 document.getElementById('bibleBooksGrid')?.addEventListener('click',()=>queueMicrotask(refresh));
 document.getElementById('bibleChaptersGrid')?.addEventListener('click',()=>queueMicrotask(refresh));
 for(const id of ['bibleStepBook','bibleStepChapter','bibleStepVerse','bibleTranslation']){
  const element=document.getElementById(id);
  element?.addEventListener('click',()=>queueMicrotask(refresh));
  element?.addEventListener('change',()=>queueMicrotask(refresh));
 }
 window.addEventListener('pageshow',refresh);
 refresh();
})();

;

// Fonte consolidada: preview124.js
/* Prévia 124 — aprimoramentos do telão, controles e nova biblioteca FUNDOS. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// A imagem de apoio selecionada para o dia reaparece depois de encerrar a Bíblia.
if(typeof present==='function'){
  const previousPresent=present;
  present=function(item){const result=previousPresent(item);if(!item){queueMicrotask(()=>{if(!window.R70?.isLive?.()&&!window.R70?.hasActiveMedia?.())window.R70?.displaySupport?.()})}return result};
}
// Caixas do controle limitadas à coluna do telão, nunca sobrepostas à prévia.
for(const v of document.querySelectorAll('.b123Controller')){
 const close=v.querySelector('.b121Close');if(close)close.title='Encerrar e voltar à imagem de apoio';
}
const nav=document.querySelector('.sidebar nav');const settingsButton=nav?.querySelector('[data-tab="ajustes"]');
if(!nav||!settingsButton)return;
const fundosButton=document.createElement('button');fundosButton.className='nav';fundosButton.dataset.tab='fundos';
fundosButton.innerHTML='<span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 8 6 4-6 4V8Z"/></svg></span><span>FUNDOS</span>';
nav.insertBefore(fundosButton,settingsButton);
const section=document.createElement('section');section.id='fundos';section.className='page fundos124';
section.innerHTML=`<div class="f124Layout"><div class="f124Library"><div class="f124Head"><div><span class="f124Kicker">ANTES DAS REUNIÕES</span><h2>Fundos de oração</h2></div><label class="f124Upload">＋ Adicionar vídeos<input type="file" id="f124Upload" accept="video/*,.mp4,.mov,.m4v" multiple hidden></label></div><p class="f124Hint">Escolha um vídeo para preparar e, quando desejar, envie ao telão. Os vídeos ficam armazenados neste navegador.</p><div id="f124Status" class="f124Status" role="status"></div><div id="f124List" class="f124List"></div></div><div class="f124Right"><div class="f124ScreenTitle"><h2>FUNDOS ANTES DA REUNIÃO</h2><span id="f124Badge" class="f124Badge" hidden aria-live="polite"><span class="f153LiveDot" aria-hidden="true"></span> AO VIVO</span></div><div class="f124Screen"><video id="f124Video" playsinline preload="auto"></video><img id="f153VideoStill" hidden alt="Prévia do vídeo selecionado"><img id="f124SupportImage" hidden alt="Imagem de apoio do dia"><div id="f124Empty">Nenhuma imagem de apoio definida para este dia</div></div><div class="f124Player"><div class="f147PlayerHeader"><div id="f124Name" class="f124Name">Nenhum vídeo selecionado</div><button type="button" id="f147Close" class="f147Close" aria-label="Fechar vídeo e voltar à imagem de apoio" title="Fechar e voltar à imagem de apoio">×</button></div><div class="f124Actions"><button id="f124Back" title="Voltar ao início">↺</button><button id="f124Play" title="Reproduzir ou pausar">▶</button><button id="f124Repeat" title="Repetir vídeo" aria-pressed="false">↻</button><div class="f124Volume"><button type="button" id="f150Mute" class="f150Mute" aria-label="Silenciar vídeo" title="Silenciar vídeo"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg></button><input type="range" id="f124Volume" min="0" max="100" value="50" aria-label="Volume"></div></div><div class="f124Seek"><span id="f124Current">0:00</span><input id="f124Seek" type="range" min="0" max="1000" value="0" aria-label="Avançar vídeo"><span id="f124Duration">0:00</span></div></div></div></div>`;
$('ajustes').insertAdjacentElement('beforebegin',section);
fundosButton.onclick=()=>setTab('fundos');
const video=$('f124Video'),empty=$('f124Empty'),status=$('f124Status'),supportImg=$('f124SupportImage'),still=$('f153VideoStill');
let supportUrl=null,supportToken=0;
function releaseSupportImage(){if(supportUrl){URL.revokeObjectURL(supportUrl);supportUrl=null}}
async function refreshSupportImage(){
 const ticket=++supportToken;
 if(selected)return;
 supportImg.hidden=true;
 releaseSupportImage();
 empty.hidden=false;
 const day=typeof state==='undefined'?0:Number(state.day);
 let data=null;
 try{data=JSON.parse(localStorage.getItem('reunioes3-support-v87-day-'+day)||'null')}catch(_){}
 if(!data){empty.textContent='Nenhuma imagem de apoio definida para este dia';return}
 try{
   let blob=null;
   if(data.source==='gallery'){
     const db=await new Promise((resolve,reject)=>{const q=indexedDB.open('reunioes3-apoio-v89',1);q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});
     try{blob=await new Promise((resolve,reject)=>{const tx=db.transaction('images','readonly');const q=tx.objectStore('images').get(day);q.onsuccess=()=>resolve(q.result?.blob||null);q.onerror=()=>reject(q.error)})}finally{db.close()}
   }else if(data.id){blob=(await window.ReunioesMediaLibrary.get(data.id))?.blob}
   if(ticket!==supportToken||selected)return;
   if(!blob){empty.textContent='Imagem de apoio indisponível neste iPad';return}
   supportUrl=URL.createObjectURL(blob);
   supportImg.onload=()=>{if(ticket===supportToken&&!selected){empty.hidden=true;supportImg.hidden=false}};
   supportImg.onerror=()=>{if(ticket===supportToken){supportImg.hidden=true;empty.hidden=false;empty.textContent='Não foi possível abrir a imagem de apoio'}};
   supportImg.src=supportUrl;
 }catch(e){if(ticket===supportToken){empty.textContent='Não foi possível carregar a imagem de apoio';console.warn(e)}}
}

const send=(action,extra={})=>channel.postMessage({kind:'videoControl',action,...extra});
const pretty=n=>{n=Number.isFinite(n)?Math.floor(n):0;return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')};
let selected=null,objectUrl=null,live=false,loop=false,loadToken=0;
function syncBadge(){
 const badge=$('f124Badge');
 if(!badge)return;
 badge.innerHTML='<span class="f153LiveDot" aria-hidden="true"></span> AO VIVO';
 badge.hidden=!live;
 badge.classList.toggle('f124BadgeLive',live);
 badge.setAttribute('aria-label',live?'Vídeo ao vivo no telão':'Vídeo preparado apenas no iPad');
}
syncBadge();
function sync(){
 $('f124Play').textContent=video.paused?'▶':'Ⅱ';
 const duration=Number.isFinite(video.duration)?video.duration:0;
 const t=Number.isFinite(video.currentTime)?video.currentTime:0;
 $('f124Current').textContent=pretty(t);$('f124Duration').textContent=pretty(duration);
 const fraction=duration>0?Math.max(0,Math.min(1,t/duration)):0;
 const seek=$('f124Seek');seek.value=Math.round(fraction*1000);seek.style.setProperty('--seek-pct',(fraction*100)+'%');
} 
function resetObject(){video.pause();still.hidden=true;still.removeAttribute('src');video.removeAttribute('poster');video.removeAttribute('src');video.load();if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;}
const thumbCache=new Map();
const thumbPending=new Map();
let thumbnailQueue=Promise.resolve();
let listEpoch=0;
function showThumb(slot,uri){
 if(!slot)return;
 if(!uri){slot.replaceChildren();const label=document.createElement('span');label.className='f151NoThumb';label.textContent='▶';const note=document.createElement('small');note.textContent='Prévia indisponível';slot.append(label,note);return;}
 const im=document.createElement('img');im.src=uri;im.alt='Prévia do vídeo';slot.replaceChildren(im);
}
function capturePreview(row,slot){
 const key=row.id;
 if(thumbCache.has(key)){showThumb(slot,thumbCache.get(key));return}
 if(thumbPending.has(key)){thumbPending.get(key).then(uri=>{if(slot.isConnected)showThumb(slot,uri)});return}
 const task=thumbnailQueue.catch(()=>{}).then(()=>new Promise(resolve=>{
  if(!row.blob){resolve(null);return}
  const url=URL.createObjectURL(row.blob),v=document.createElement('video');
  v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('webkit-playsinline','');
  v.preload='auto';v.style.cssText='position:absolute;width:2px;height:2px;opacity:0;pointer-events:none';
  // Anexar o elemento ajuda o Safari do iPad a decodificar quadros de MOV/HEVC.
  document.body.append(v);
  let done=false,attempt=0;
  const waiters=[];
  function cleanup(){for(const x of waiters)clearTimeout(x);v.pause();v.removeAttribute('src');v.load();v.remove();URL.revokeObjectURL(url)}
  function finish(uri){if(done)return;done=true;cleanup();resolve(uri||null)}
  function viableFrame(){
   if(v.videoWidth<2||v.videoHeight<2||v.readyState<2)return null;
   try{
    const c=document.createElement('canvas');c.width=224;c.height=126;
    const ctx=c.getContext('2d',{willReadFrequently:true});if(!ctx)return null;
    ctx.fillStyle='#061624';ctx.fillRect(0,0,224,126);
    const scale=Math.min(224/v.videoWidth,126/v.videoHeight);
    const w=Math.round(v.videoWidth*scale),h=Math.round(v.videoHeight*scale);
    ctx.drawImage(v,Math.round((224-w)/2),Math.round((126-h)/2),w,h);
    // Ignorar quadros ainda não decodificados (pretos/sem informação).
    const pixel=ctx.getImageData(Math.round((224-w)/2),Math.round((126-h)/2),Math.max(1,w),Math.max(1,h)).data;
    let bright=0,variation=0,prior=-1,count=0;
    for(let i=0;i<pixel.length;i+=Math.max(4,Math.floor(pixel.length/3200/4)*4)){
     const lum=(pixel[i]*.2126+pixel[i+1]*.7152+pixel[i+2]*.0722);
     bright+=lum;if(prior>=0)variation+=Math.abs(lum-prior);prior=lum;count++;
    }
    if(count<3||bright/count<7||variation/count<1.9)return null;
    return c.toDataURL('image/jpeg',.78)
   }catch(e){return null}
  }
  function next(){
   if(done)return;
   if(attempt>=6){finish(null);return}
   const duration=Number.isFinite(v.duration)&&v.duration>0?v.duration:0;
   const times=duration>0?[Math.min(.8,duration*.15),Math.min(2,duration*.32),Math.min(4,duration*.53),Math.min(6,duration*.72),Math.min(.1,duration*.04),Math.max(0,duration-.2)]:[.25,.8,1.4,2.3,3.5,5];
   const target=times[attempt++];
   if(Math.abs(v.currentTime-target)<.035){onFrame();return}
   try{v.currentTime=target}catch(e){waiters.push(setTimeout(onFrame,300))}
   waiters.push(setTimeout(onFrame,900));
  }
  function onFrame(){
   if(done)return;
   if(v.requestVideoFrameCallback){
    try{v.requestVideoFrameCallback(()=>{if(done)return;const uri=viableFrame();if(uri)finish(uri);else next()});
      waiters.push(setTimeout(()=>{if(done)return;const uri=viableFrame();if(uri)finish(uri);else next()},350));return
    }catch(e){}
   }
   const uri=viableFrame();if(uri)finish(uri);else next();
  }
  let started=false;
  function start(){if(done||started)return;started=true;next()}
  v.addEventListener('loadedmetadata',start,{once:true});
  v.addEventListener('loadeddata',start,{once:true});
  v.addEventListener('seeked',onFrame);
  v.addEventListener('error',()=>finish(null),{once:true});
  waiters.push(setTimeout(()=>finish(null),14000));
  v.src=url;v.load();
 }));
 thumbnailQueue=task.then(()=>new Promise(done=>setTimeout(done,80)));
 thumbPending.set(key,task);
 task.then(uri=>{thumbCache.set(key,uri);thumbPending.delete(key);if(slot.isConnected)showThumb(slot,uri)});
}
async function list(){try{const rows=(await window.ReunioesMediaLibrary.all()).filter(x=>x.type==='video'&&x.day==='Fundos de oração').sort((a,b)=>b.addedAt-a.addedAt);const holder=$('f124List');holder.innerHTML=rows.length?'':'<p class="f124NoFiles">Nenhum fundo adicionado. Use “Adicionar vídeos”.</p>';
for(const row of rows){const card=document.createElement('div');card.className='f124Item'+(selected?.id===row.id?' selected':'');const name=document.createElement('button');name.type='button';name.className='f124Choose';const preview=document.createElement('span');preview.className='f150Thumb';preview.textContent='▶';const title=document.createElement('span');title.className='f150Title';title.textContent=row.name;name.append(preview,title);name.onclick=()=>choose(row.id);const del=document.createElement('button');del.type='button';del.className='f124Delete';del.textContent='✕';del.title='Excluir vídeo';del.onclick=async()=>{if(!confirm('Excluir este vídeo de fundo?'))return;if(selected?.id===row.id){await closeVideo();}await deleteRow(row.id);thumbCache.delete(row.id);thumbPending.delete(row.id);list()};card.append(name,del);holder.append(card);if(row.blob)capturePreview(row,preview);else showThumb(preview,null)}
}catch(e){status.textContent='Não foi possível abrir a biblioteca de vídeos.'}}
async function deleteRow(id){const db=await new Promise((ok,no)=>{const req=indexedDB.open('reunioes3-midias-v64',1);req.onsuccess=()=>ok(req.result);req.onerror=()=>no(req.error)});await new Promise((ok,no)=>{const t=db.transaction('files','readwrite');t.objectStore('files').delete(id);t.oncomplete=ok;t.onerror=()=>no(t.error)});db.close()}
function refreshSelectedPoster(row, token){
 still.hidden=true;still.removeAttribute('src');
 const apply=uri=>{
  if(token!==loadToken||!selected||selected.id!==row.id||live)return;
  if(uri){still.src=uri;still.hidden=false;video.poster=uri;}
  else{still.hidden=true;video.removeAttribute('poster');}
 };
 if(thumbCache.has(row.id)){apply(thumbCache.get(row.id));return;}
 if(!thumbPending.has(row.id))capturePreview(row,document.createElement('span'));
 const pending=thumbPending.get(row.id);
 if(pending)pending.then(apply).catch(()=>apply(null));
}
async function choose(id){const token=++loadToken;try{const row=await window.ReunioesMediaLibrary.get(id);if(token!==loadToken||!row?.blob)return;if(live)await finish();resetObject();selected=row;supportToken++;supportImg.hidden=true;releaseSupportImage();objectUrl=URL.createObjectURL(row.blob);video.preload='auto';video.src=objectUrl;video.style.objectFit='contain';video.style.objectPosition='center center';video.loop=loop;video.volume=Number($('f124Volume').value)/100;video.load();empty.hidden=true;refreshSelectedPoster(row,token);$('f124Name').textContent=row.name;status.textContent='Vídeo preparado no iPad. Toque em Play para reproduzir no telão.';syncBadge();sync();list()}catch(e){status.textContent='Não foi possível carregar este vídeo.'}}
async function finish(){
 if(live){video.pause();channel.postMessage({kind:'present',item:null});live=false}
 status.textContent='Apresentação encerrada. O vídeo voltou a ficar apenas no iPad.';
 syncBadge();
 await window.R70?.displaySupport?.();
 sync();
}
async function closeVideo(){
 ++loadToken;
 if(live)await finish();
 resetObject();
 selected=null;
 $('f124Name').textContent='Nenhum vídeo selecionado';
 status.textContent='';
 syncBadge();
 sync();
 await refreshSupportImage();
 list();
}
async function beginLive(){
 if(!selected||live)return;
 if(window.R70?.hasActiveMedia?.())window.R70.close();
 if(typeof present==='function'&&window.current?.type==='versiculo')present(null);
 channel.postMessage({kind:'present',item:{type:'video',title:selected.name,mediaLibraryId:selected.id}});
 live=true;
 still.hidden=true;
 syncBadge();
 status.textContent='Vídeo transmitido no telão.';
 send('repeat',{value:loop});
 channel.postMessage({kind:'volume',volume:video.volume,muted:video.volume===0});
}
$('f124Upload').onchange=async e=>{const files=Array.from(e.target.files||[]);if(!files.length)return;status.textContent='Salvando vídeos no iPad…';let count=0;for(const file of files){if(!file.type.startsWith('video/')&&!/\.(mp4|mov|m4v)$/i.test(file.name))continue;try{await window.ReunioesMediaLibrary.put({id:crypto.randomUUID(),name:file.name,type:'video',day:'Fundos de oração',addedAt:Date.now()+count,blob:file});count++}catch(err){status.textContent='Alguns vídeos não puderam ser salvos. Verifique o espaço do aparelho.';break}}e.target.value='';if(count)status.textContent=count+' vídeo(s) salvos neste aparelho.';list()};
$('f147Close').onclick=closeVideo;
$('f124Play').onclick=async()=>{if(!selected)return;if(video.paused){await beginLive();try{await video.play();setTimeout(()=>{if(live&&!video.paused)send('play')},350)}catch(e){status.textContent='Toque em Play para iniciar o vídeo.'}}else{video.pause()}};
$('f124Back').onclick=()=>{if(!selected)return;video.currentTime=0;if(live)send('seek',{time:0});sync()};
$('f124Repeat').onclick=()=>{loop=!loop;video.loop=loop;$('f124Repeat').setAttribute('aria-pressed',String(loop));if(live)send('repeat',{value:loop})};
const f150Mute=$('f150Mute');
function setMuteUi(){const muted=video.muted||video.volume===0;f150Mute.classList.toggle('muted',muted);f150Mute.setAttribute('aria-label',muted?'Ativar som':'Silenciar vídeo');f150Mute.title=muted?'Ativar som':'Silenciar vídeo'}
f150Mute.onclick=()=>{video.muted=!video.muted;setMuteUi();if(live)channel.postMessage({kind:'volume',volume:video.volume,muted:video.muted})};
$('f124Volume').oninput=e=>{video.volume=Number(e.target.value)/100;video.muted=video.volume===0;setMuteUi();if(live)channel.postMessage({kind:'volume',volume:video.volume,muted:video.muted})};
setMuteUi();
$('f124Seek').oninput=e=>{if(!video.duration)return;video.currentTime=Number(e.target.value)>=1000?video.duration:video.duration*Number(e.target.value)/1000;if(live)send('seek',{time:video.currentTime});sync()};
video.onplay=()=>{still.hidden=true;sync();if(live)send('play')};video.onpause=()=>{sync();if(live)send('pause')};video.ontimeupdate=sync;video.onloadedmetadata=()=>{sync();if(selected&&!live&&video.duration>.2){try{video.currentTime=Math.min(.25,video.duration*.08)}catch(_){}}};video.onended=()=>{sync();if(live&&!loop)closeVideo()};
fundosButton.addEventListener('click',()=>{if(!selected)refreshSupportImage()});
document.addEventListener('click',e=>{if(e.target.closest('#days [data-day]'))queueMicrotask(()=>{if(!selected)refreshSupportImage()})},true);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!selected)refreshSupportImage()});
// Evite ler todos os arquivos de vídeo e decodificar miniaturas antes da visita à aba FUNDOS.
let firstFundosVisit=true;
fundosButton.addEventListener('click',()=>{
 if(!firstFundosVisit)return;
 firstFundosVisit=false;
 setTimeout(()=>{void list();if(!selected)void refreshSupportImage();},0);
});
})();

;

// Fonte consolidada: preview125.js
/* Prévia 125 — ajustes finos da Bíblia, cronograma e controles. */
(()=>{'use strict';
const apply=()=>{
  // Mover o bloco de controle do cronograma para ficar sempre abaixo do telão.
  const agendaRight=document.querySelector('#agenda .right');
  const agendaCtrl=agendaRight?.querySelector('.b123Controller');
  const frame=agendaRight?.querySelector('.r109PresentationFrame')||agendaRight?.querySelector('.panel.preview');
  if(agendaRight&&agendaCtrl&&frame&&frame.nextElementSibling!==agendaCtrl){frame.after(agendaCtrl)}
  // Remover indicação antiga ACF · ARA, se restar.
  document.querySelectorAll('#biblia .b119Versions').forEach(el=>el.remove());
};
new MutationObserver(apply).observe(document.body,{childList:true,subtree:true});
window.addEventListener('pageshow',apply);setTimeout(apply,0);
})();

;

// Fonte consolidada: preview129.js
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

;

// Fonte consolidada: preview134.js
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

// Prévia 154: toque em uma música do cronograma abre diretamente o Media Player.
// A seleção de versões é feita pelos botões do próprio player, sem janela intermediária.
async function openSongPlayer(item){
 if(!item)return;
 const records=await musicAll().catch(()=>[]);
 const selected=records.find(t=>t.id===item.musicId);
 if(!selected){alert('Música não encontrada neste aparelho.');return}
 const group=selected.groupId?records.filter(t=>t.groupId===selected.groupId):[selected];
 // Sempre começar pela versão Piano completa quando disponível.
 const piano=group.find(t=>t.role==='completa')||selected;
 await playMusic(piano.id);
}
window.r134OpenSongVersions=openSongPlayer;
document.addEventListener('click',e=>{
 const row=e.target.closest?.('#sectionsRoot .item[data-item-id],#items .item[data-item-id]');
 if(!row||!document.getElementById('agenda')?.classList.contains('active'))return;
 const item=state.days[state.day]?.find(it=>it.id===row.dataset.itemId);
 if(item?.type!=='musica')return;
 const act=e.target.closest('button[data-act]');
 if(act&&act.dataset.act!=='show')return;
 if(e.target.closest('button:not([data-act]),input,textarea,select,a,.drag-handle,.content-grip'))return;
 e.preventDefault();e.stopImmediatePropagation();void openSongPlayer(item);
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
 const activeItem=window.bibleActivePresentation;
 const scheduled=activeItem?.id&&state.days.some(day=>day.some(entry=>entry.id===activeItem.id&&entry.type==='versiculo'));
 const cronogramaSource=!!scheduled;
 const item={...activeItem,id:activeItem?.id||uid(),type:'versiculo',title:ref,reference:ref,translation,content:text,
  verses:undefined,refSettings:window.bible120Settings?.(),cronogramaSource,
  highlights:[]};
 present(item);
});
})();

;

// Fonte consolidada: preview136.js
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

;

// Fonte consolidada: preview138.js
/* Prévia 138 — configuração do Telão Santuário sempre acessível, inclusive no Safari/iPad. */
(()=>{'use strict';
const gear=document.getElementById('r70Gear');
const legacy=document.getElementById('r70Config');
if(!gear)return;
// O painel anterior, aninhado no cabeçalho, podia ser encoberto pela moldura do telão.
if(legacy)legacy.hidden=true;
const dialog=document.createElement('dialog');
dialog.id='r138TelSettings';
dialog.setAttribute('aria-labelledby','r138TelTitle');
dialog.innerHTML=`<div class="r138Top"><strong id="r138TelTitle">Configuração do telão</strong><button type="button" id="r138Close" aria-label="Fechar configurações">×</button></div>
<p class="r138Intro">Escolha o efeito de passagem entre as mídias e a duração da transição.</p>
<label for="r138Effect">Efeito de transição<select id="r138Effect"><option value="fade">Fade</option><option value="merge">Merge</option><option value="wipe">Wipe</option><option value="corte">Corte (sem transição)</option></select></label>
<label for="r138Duration">Duração<select id="r138Duration"><option value="300">300 ms</option><option value="500">500 ms</option><option value="1000">1 segundo</option></select></label>
<div class="r138Buttons"><button type="button" id="r138Cancel">Cancelar</button><button type="button" id="r138Save">Salvar configurações</button></div>`;
document.body.appendChild(dialog);
const el=id=>document.getElementById(id);
const key='reunioes-transition-v70';
const read=()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch(_){return {}}};
function open(){
 const data=read();
 const effect=['fade','merge','wipe','corte'].includes(data.effect)?data.effect:'fade';
 const duration=['300','500','1000'].includes(String(data.duration))?String(data.duration):'300';
 el('r138Effect').value=effect;
 el('r138Duration').value=duration;
 if(legacy)legacy.hidden=true;
 if(!dialog.open)dialog.showModal();
}
// Captura o clique antes do tratamento antigo que abria a janela escondida no cabeçalho.
gear.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();open()},true);
gear.setAttribute('aria-haspopup','dialog');
gear.setAttribute('aria-controls','r138TelSettings');
el('r138Close').onclick=()=>dialog.close();
el('r138Cancel').onclick=()=>dialog.close();
el('r138Save').onclick=()=>{
 const data={effect:el('r138Effect').value,duration:Number(el('r138Duration').value)};
 try{
  localStorage.setItem(key,JSON.stringify(data));
  const effect=el('r70Effect'),duration=el('r70DurationSelect');
  if(effect)effect.value=data.effect;
  if(duration)duration.value=String(data.duration);
  dialog.close();
 }catch(error){alert('Não foi possível salvar as configurações neste navegador. Verifique o armazenamento do Safari.')}
};
})();

;

// Fonte consolidada: autofit141.js
/* PREVIA 141: versiculos inteiros dentro da tela, referencia separada,
   fonte adaptativa em tela 16:9 e controlador sem ocultar o texto. */
(()=>{'use strict';
 let timer=0;
 const rootSelectors=['#preview','#b119Mirror','#stage'];
 function moveEndReference(verse){
  if(!verse.classList.contains('b120Pos-end'))return;
  const text=verse.querySelector('.b120VerseText');
  if(!text)return;
  const ref=text.querySelector(':scope > .b120Ref');
  if(!ref)return;
  const area=document.createElement('div');area.className='b120RefArea r141RefEnd';
  ref.remove();area.append(ref);verse.append(area);
  // Elimina o espaço em branco que antecedia a referencia incorporada ao texto.
  if(text.lastChild&&text.lastChild.nodeType===Node.TEXT_NODE)text.lastChild.textContent=text.lastChild.textContent.replace(/\s+$/,'');
 }
 function sizeVerse(verse){
  if(!verse.isConnected)return;
  const text=verse.querySelector('.b120VerseText');if(!text)return;
  moveEndReference(verse);
  const refArea=verse.querySelector('.b120RefArea');
  const reference=refArea?.querySelector('.b120Ref');
  const box=verse.getBoundingClientRect();if(box.width<40||box.height<30)return;
  const full=document.getElementById('stage')?.contains(verse)||verse.closest('#stage');
  const maxText=parseFloat(getComputedStyle(verse).getPropertyValue('--b120-tsize'))||58;
  const maxRef=parseFloat(getComputedStyle(verse).getPropertyValue('--b120-rsize'))||30;
  const scaled=full?1:Math.min(1, Math.max(.2,box.width/1000));
  const maxAllowed=Math.min(full?maxText:Math.max(6,maxText*scaled),full?100:46);
  const minAllowed=full?9:3.5;
  const refMax=Math.min(full?maxRef:Math.max(5,maxRef*scaled),full?65:28);
  const pad=box.width*(full?.045:.04);
  // Referencia nunca pode sair do quadro, mesmo nos cantos.
  if(reference){
    let r=Math.max(full?10:5,refMax);
    reference.style.setProperty('font-size',r+'px','important');
    for(let i=0;i<12;i++){
      if(refArea.scrollWidth<=refArea.clientWidth+1&&refArea.scrollHeight<=Math.max(16,r*2.6))break;
      r=Math.max(full?8:4,r*.88);
      reference.style.setProperty('font-size',r+'px','important');
    }
  }
  const h=verse.clientHeight;
  const style=getComputedStyle(verse);
  const paddingTop=parseFloat(style.paddingTop)||0;
  const paddingBottom=parseFloat(style.paddingBottom)||0;
  const reserved=(refArea?.getBoundingClientRect().height||0)+(refArea?Math.max(5,h*.025):0);
  const available=Math.max(12,h-paddingTop-paddingBottom-reserved-3);
  const usableWidth=Math.max(15,verse.clientWidth-(parseFloat(style.paddingLeft)||0)-(parseFloat(style.paddingRight)||0));
  // Garante que a caixa de texto nao invada o rodape reservado para a referencia.
  text.style.setProperty('max-height',available+'px','important');
  text.style.setProperty('max-width',usableWidth+'px','important');
  text.style.setProperty('overflow','visible','important');
  function fits(value){
    text.style.setProperty('font-size',value.toFixed(2)+'px','important');
    return text.scrollHeight<=available+1&&text.scrollWidth<=usableWidth+1;
  }
  let lo=Math.min(minAllowed,maxAllowed),hi=maxAllowed;
  if(!fits(hi)){
    if(!fits(lo)){
      // Para versos extraordinariamente extensos, continua reduzindo ate caber.
      for(let i=0;i<18&&!fits(lo);i++)lo=Math.max(2,lo*.88);
    }
    if(fits(lo))for(let i=0;i<18;i++){
      const middle=(lo+hi)/2;
      if(fits(middle))lo=middle;else hi=middle;
    }
    fits(lo);
  }
  // Versículos de até três linhas ficam no centro visual da área escura,
  // acima da ilustração da Bíblia. A referência permanece independente.
  // Removemos qualquer deslocamento anterior para recalcular corretamente.
  text.style.removeProperty('transform');
  const computed=getComputedStyle(text);
  const lineHeight=parseFloat(computed.lineHeight)||parseFloat(computed.fontSize)*1.16;
  const lineCount=lineHeight>0?Math.ceil((text.scrollHeight-1)/lineHeight):99;
  const textLength=(text.textContent||'').trim().length;
  if(lineCount>=1&&lineCount<=3&&textLength<=260){
    const parentRect=verse.getBoundingClientRect();
    const textRect=text.getBoundingClientRect();
    const centerY=textRect.top-parentRect.top+textRect.height/2;
    const bottomY=textRect.bottom-parentRect.top;
    // O centro desejado é 43% da altura do telão, sem tocar no livro ou na referência.
    const targetY=parentRect.height*.43;
    const remainingAboveImage=Math.max(0,parentRect.height*.72-bottomY);
    const remainingAboveRef=refArea
      ?Math.max(0,refArea.getBoundingClientRect().top-textRect.bottom-8)
      :remainingAboveImage;
    const shift=Math.max(0,Math.min(targetY-centerY,remainingAboveImage,remainingAboveRef,parentRect.height*.095));
    if(shift>.5)text.style.setProperty('transform','translateY('+shift.toFixed(1)+'px)','important');
  }
 }
 function fitAll(){timer=0;for(const selector of rootSelectors){const root=document.querySelector(selector);if(!root)continue;root.querySelectorAll('.b120Verse').forEach(sizeVerse)}}
 function schedule(){if(timer)return;timer=requestAnimationFrame(fitAll)}
 window.ReunioesAutoFit={fitAll,schedule};
 const observer=new MutationObserver(schedule);
 function install(){for(const s of rootSelectors){const root=document.querySelector(s);if(root){observer.observe(root,{childList:true,subtree:true,characterData:true});if(window.ResizeObserver)new ResizeObserver(schedule).observe(root)}}schedule()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
 if(document.fonts?.ready)document.fonts.ready.then(schedule).catch(()=>{});
 window.addEventListener('resize',schedule);
 window.addEventListener('pageshow',schedule);
})();

;

// Fonte consolidada: preview142.js
/* PRÉVIA 142 — a Bíblia abre pelos livros; edição de versículo no Cronograma usa a Bíblia. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function books(){
 if(window.bibleCronogramaSelect?.editId)return;
 if(typeof bibleStep==='undefined'||typeof drawBiblePicker!=='function')return;
 bibleStep='book';
 if(typeof selectedVerses!=='undefined')selectedVerses=[];
 drawBiblePicker();
}
// Navegação comum pela barra lateral deve sempre mostrar os livros; não o último capítulo.
const nav=document.querySelector('.sidebar .nav[data-tab="biblia"]');
nav?.addEventListener('click',()=>{
 window.bibleCronogramaSelect=null;
 books();
},true);
// Ao editar uma referência do cronograma, não abrir o formulário legado.
document.addEventListener('click',event=>{
 const button=event.target.closest('#sectionsRoot .item[data-item-id] button[data-act="edit"],#items .item[data-item-id] button[data-act="edit"]');
 if(!button)return;
 const row=button.closest('.item[data-item-id]');
 const day=state.day, item=state.days[day]?.find(x=>x.id===row?.dataset.itemId);
 if(item?.type!=='versiculo')return;
 event.preventDefault();event.stopImmediatePropagation();
 const old=$('editor');if(old?.open)old.close();
 window.bibleCronogramaSelect={day,sectionId:item.sectionId||null,editId:item.id};
 bibleStep='book';selectedVerses=[];drawBiblePicker();
 setTab('biblia');
 window.dispatchEvent(new Event('bible-cronograma-mode'));
 // Distinct mode: the existing add button will replace the edited reference.
 const action=$('b129Add');if(action)action.textContent='✓ Salvar versículos no cronograma';
 const heading=$('b129ModeActions')?.querySelector('.b129ModeTop strong');if(heading)heading.textContent='Editar versículos do cronograma';
},true);
// Substitute only the edit flow; normal insertion continues through the original handler.
$('b129Add')?.addEventListener('click',event=>{
 const mode=window.bibleCronogramaSelect;
 if(!mode?.editId)return;
 event.preventDefault();event.stopImmediatePropagation();
 const verses=Array.from(new Set(selectedVerses)).sort((a,b)=>a-b);
 if(!verses.length)return;
 const book=Number($('bibleBook').value),chapter=Number($('bibleChapter').value),version=$('bibleTranslation').value;
 const data=importedBibles[version];if(!data){alert('Aguarde a Bíblia carregar.');return}
 const parts=verses.map(n=>({reference:BIBLE_BOOKS[book][0]+' '+chapter+':'+n,text:getImportedVerse(data,book,chapter,n)}));
 if(parts.some(p=>!p.text)){alert('Um ou mais versículos não estão disponíveis.');return}
 const reference=BIBLE_BOOKS[book][0]+' '+chapter+':'+(typeof formatVerseSpan==='function'?formatVerseSpan(verses):verses.join(', '));
 const saved=state.days[mode.day]?.find(x=>x.id===mode.editId);
 if(!saved){alert('O item original não foi encontrado.');return}
 const old={...saved};
 Object.assign(saved,{title:reference,reference,translation:version,content:parts[0].text,verses:parts,highlights:[],cronogramaSource:true});
 try{save()}catch(err){Object.assign(saved,old);alert('Não foi possível salvar no iPad.');return}
 window.bibleCronogramaSelect=null;selectedVerses=[];bibleStep='book';drawBiblePicker();
 $('b129Add').textContent='+ Adicionar ao cronograma';
 const heading=$('b129ModeActions')?.querySelector('.b129ModeTop strong');if(heading)heading.textContent='Adicionar versículos ao cronograma';
 $('b129ModeActions').hidden=true;
 drawItems();setTab('agenda');
},true);
// Restore usual text after cancelling edit or adding a new Bible passage.
function resetLabels(){if(window.bibleCronogramaSelect?.editId)return;const add=$('b129Add');if(add)add.textContent='+ Adicionar ao cronograma';const h=$('b129ModeActions')?.querySelector('.b129ModeTop strong');if(h)h.textContent='Adicionar versículos ao cronograma'}
$('b129Cancel')?.addEventListener('click',resetLabels);
window.addEventListener('bible-cronograma-mode',resetLabels);
})();

;

// Fonte consolidada: preview153.js
/* Prévia 153: evita o zoom do Safari por toque duplo sem interferir em controles. */
(()=>{'use strict';
 document.addEventListener('dblclick',e=>{if(e.cancelable)e.preventDefault()},{capture:true,passive:false});
})();

;

/* Prévia 167 — exclusividade do telão ao iniciar música pelo Cronograma.
 * A imagem de apoio não é projetada como música; é restabelecida no telão
 * quando o último versículo/vídeo é encerrado. */
(()=>{'use strict';
 const audio=document.getElementById('musicAudio');
 let lastClear=0;
 window.reunioesClearForScheduleMusic=function(){
   const now=Date.now();
   if(now-lastClear<180)return;
   lastClear=now;
   // Invalida o estado de vídeo/PDF e impede que sua prévia continue no telão.
   try{window.R70?.stopForMusic?.()}catch(e){console.warn('Falha ao encerrar mídia anterior',e)}
   // A Bíblia pode ter projetado diretamente, sem passar pelo player R70.
   // Sempre envia a saída e recupera o apoio — inclusive se o vídeo estiver pausado.
   try{current=null;channel.postMessage({kind:'present',item:null})}catch(e){}
   try{void window.R70?.displaySupport?.()}catch(e){console.warn('Não foi possível recuperar o apoio',e)}
 };
 // Se o usuário apertar Play novamente no player aberto pelo Cronograma,
 // reaplica a exclusividade sem interferir nos testes na Biblioteca Músicas.
 if(audio)audio.addEventListener('play',()=>{
   if(window.__r167MusicFromSchedule){window.reunioesClearForScheduleMusic()}
 });
 document.querySelectorAll('.nav').forEach(nav=>nav.addEventListener('click',()=>{
   if(nav.dataset.tab==='musicas')window.__r167MusicFromSchedule=false;
 }));
})();
