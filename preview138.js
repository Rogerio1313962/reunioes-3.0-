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
