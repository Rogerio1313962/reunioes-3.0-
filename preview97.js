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
