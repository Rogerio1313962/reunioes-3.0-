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
 Object.assign(saved,{title:reference,reference,translation:version,content:parts[0].text,verses:parts,highlights:[]});
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
