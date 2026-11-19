/* Prévia 73: título independente do arquivo e toque direto em versículos. */
(function(){
  const previousDraw=drawItems;
  drawItems=function(){
    previousDraw();
    document.querySelectorAll('#sectionsRoot .item, #items .item').forEach(row=>{
      const id=row.dataset.itemId;
      if(!id||row.querySelector('.r73Rename'))return;
      const item=state.days[state.day].find(x=>x.id===id);
      if(!item)return;
      const button=document.createElement('button');
      button.type='button';button.className='r73Rename';button.title='Editar nome exibido no cronograma';
      button.setAttribute('aria-label','Renomear '+(item.title||'item'));
      button.textContent='✎';
      button.addEventListener('click',e=>{
        e.preventDefault();e.stopPropagation();
        const fresh=state.days[state.day].find(x=>x.id===id);if(!fresh)return;
        const answer=prompt('Nome deste item no cronograma:',fresh.title||'');
        if(answer===null)return;
        const name=answer.trim();if(!name){alert('O nome não pode ficar vazio.');return}
        fresh.title=name;
        try{save();drawItems()}catch(err){alert('Não foi possível salvar o novo nome.');}
      });
      const info=row.querySelector('.iteminfo');
      if(info)info.appendChild(button);
      else row.appendChild(button);
      // O toque direto funciona apenas para versículos; as mídias seguem no player pausado.
      if(item.type==='versiculo'){
        row.classList.add('r73VerseTap');
        row.title='Toque para mostrar o versículo diretamente no telão';
        row.addEventListener('click',e=>{
          if(e.target.closest('button,input,select,textarea,a,[contenteditable],.content-grip,.drag-handle'))return;
          const verse=state.days[state.day].find(x=>x.id===id);
          if(verse?.type==='versiculo')present(verse);
        });
      }
    });
  };
  drawItems();
})();
