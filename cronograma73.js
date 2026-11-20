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
          if(verse?.type==='versiculo'){window.bibleOpenFromSchedule=true;present(verse);window.dispatchEvent(new CustomEvent('bible-schedule-present',{detail:verse}));setTab('biblia');}
        });
      }
    });
  };
  drawItems();
})();
