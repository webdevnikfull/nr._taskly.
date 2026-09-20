(() => {
  'use strict';
  const M=window.TaskModel, KEY='taskly.tasks.v1';
  const $=selector=>document.querySelector(selector);
  const priorityNames={high:'Wysoki',medium:'Średni',low:'Niski'};
  const viewNames={all:'Wszystkie zadania',today:'Na dzisiaj',planned:'Zaplanowane',done:'Ukończone'};
  const descriptions={all:'Dobry plan zaczyna się od małych kroków.',today:'Mała lista. Więcej miejsca na skupienie.',planned:'To, co przed Tobą — w swoim czasie.',done:'Zatrzymaj się na chwilę. To już zrobione.'};
  let tasks=[],view='all',editingId=null,undoAction=null,toastTimer,storageHealthy=true;
  let day=M.localDate();
  const id=()=>window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  function seed() {
    const tomorrow=new Date(); tomorrow.setDate(tomorrow.getDate()+1);
    const examples=[['Przygotować scenariusze testowe','Przypadki pozytywne, negatywne i wartości brzegowe.',day,'high',false],['Sprawdzić widok mobilny','Przejść przez najważniejsze ekrany i interakcje.',day,'medium',false],['Uporządkować portfolio','Wybrać projekty i dopracować ich opisy.',M.localDate(tomorrow),'low',false],['Zrobić miejsce na dobry plan','Dodaj własne zadanie przyciskiem powyżej.','','low',true]];
    return examples.map(([title,notes,due,priority,completed],i)=>({...M.create({title,notes,due,priority},id(),Date.now()-i*1000),sample:true,completed}));
  }
  function toast(message,action=null) {
    clearTimeout(toastTimer); undoAction=action;
    $('#toast-message').textContent=message; $('#undo').hidden=!action; $('#toast').hidden=false;
    toastTimer=setTimeout(()=>{$('#toast').hidden=true;undoAction=null;},action?15000:6000);
  }
  function persist() {
    try {localStorage.setItem(KEY,JSON.stringify({version:1,tasks})); storageHealthy=true;}
    catch {storageHealthy=false;toast('Nie udało się zapisać. Wyeksportuj zadania przed zamknięciem strony.');}
    $('#save-status').textContent=storageHealthy?'Zapis na tym urządzeniu':'Brak trwałego zapisu — eksportuj';
  }
  try {const saved=localStorage.getItem(KEY); tasks=saved===null?seed():M.decode(saved); if(saved===null)persist();}
  catch {tasks=[];storageHealthy=false;$('#save-status').textContent='Nie można odczytać zapisanych zadań';toast('Nie można odczytać danych. Poprzedni zapis pozostaje nienaruszony.');}
  function node(tag,className,text) {const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
  function icon(name) {const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('aria-hidden','true');const use=document.createElementNS(svg.namespaceURI,'use');use.setAttribute('href',`#i-${name}`);svg.append(use);return svg;}
  function dateLabel(due) {if(!due)return '';if(due===day)return 'Dzisiaj';const t=new Date();t.setDate(t.getDate()+1);if(due===M.localDate(t))return 'Jutro';return new Intl.DateTimeFormat('pl',{day:'numeric',month:'short',...(due.slice(0,4)!==day.slice(0,4)?{year:'numeric'}:{})}).format(new Date(due+'T12:00:00'));}
  function row(task) {
    const el=node('article','task-row'+(task.completed?' is-done':''));el.dataset.id=task.id;
    const check=node('input','task-check');check.type='checkbox';check.checked=task.completed;check.setAttribute('aria-label',`${task.completed?'Przywróć':'Ukończ'}: ${task.title}`);
    check.addEventListener('change',()=>{task.completed=check.checked;task.updatedAt=Date.now();persist();render();$('#results-status').textContent=task.completed?'Zadanie ukończone.':'Zadanie przywrócone.';const target=$('.task-check')||$('#quick-title');target.focus();});
    const content=node('div','task-content'),title=node('button','task-title',task.title);title.type='button';title.setAttribute('aria-label',`Edytuj: ${task.title}`);title.addEventListener('click',()=>openEditor(task));content.append(title);
    if(task.notes)content.append(node('p','task-notes',task.notes));
    const meta=node('div','task-meta');if(task.due){const date=node('span','task-date'+(!task.completed&&task.due<day?' overdue':''));date.append(icon('calendar'),document.createTextNode(dateLabel(task.due)));if(!task.completed&&task.due<day)date.append(document.createTextNode(' · po terminie'));meta.append(date);}
    if(task.sample)meta.append(node('span','sample-marker','Przykład'));if(meta.childNodes.length)content.append(meta);
    const priority=node('span',`priority ${task.priority}`,priorityNames[task.priority]);priority.setAttribute('aria-label',`Priorytet: ${priorityNames[task.priority]}`);
    const actions=node('div','row-actions');for(const [action,name,handler] of [['edit','Edytuj',()=>openEditor(task)],['trash','Usuń',()=>remove(task.id)]]){const b=node('button','icon-button');b.type='button';b.setAttribute('aria-label',`${name}: ${task.title}`);b.title=name;b.append(icon(action));b.addEventListener('click',handler);actions.append(b);}
    el.append(check,content,priority,actions);return el;
  }
  function render() {
    const c=M.counts(tasks,day);
    document.querySelectorAll('[data-count]').forEach(e=>e.textContent=c[e.dataset.count]);
    document.querySelectorAll('[data-view]').forEach(e=>{const active=e.dataset.view===view;e.classList.toggle('active',active);if(active)e.setAttribute('aria-current','page');else e.removeAttribute('aria-current');});
    $('#metric-open').textContent=c.all;$('#metric-today').textContent=c.today;
    $('#metric-done').replaceChildren(document.createTextNode(c.done),node('span','',`/ ${c.total}`));
    $('#overdue-note').textContent=c.overdue?`Po terminie: ${c.overdue}`:'W swoim tempie';$('#overdue-note').classList.toggle('warn',c.overdue>0);
    const percent=c.total?Math.round(c.done/c.total*100):0;$('#progress-text').textContent=`${percent}%`;$('#progress-circle').style.strokeDashoffset=176*(1-percent/100);
    $('#breadcrumb-view').textContent=viewNames[view];$('#list-heading').replaceChildren(document.createTextNode(viewNames[view]+' '),node('span','',c[view]));$('#list-description').textContent=descriptions[view];
    const visible=M.visible(tasks,{view,search:$('#search').value,priority:$('#priority-filter').value,sort:$('#sort').value,today:day});
    $('#task-list').replaceChildren(...visible.map(row));$('#empty').hidden=visible.length>0;$('#list-count')?.remove();
    const filtered=$('#search').value.trim()||$('#priority-filter').value!=='all';
    $('#empty-title').textContent=filtered?'Nie ma takich zadań.':view==='done'?'Jeszcze wszystko przed Tobą.':view==='today'?'Dzisiaj jest przestrzeń.':'Czysta karta.';
    $('#empty-description').textContent=filtered?'Zmień wyszukiwanie lub usuń filtr priorytetu.':view==='done'?'Ukończone zadania pojawią się tutaj.':'Dodaj zadanie i zrób miejsce na dobry plan.';
    $('#empty-action').textContent=filtered?'Wyczyść filtry':'Dodaj zadanie';$('#empty-action').dataset.filtered=String(!!filtered);
    $('#results-status').textContent=`Wyświetlono: ${visible.length} · w tym widoku: ${c[view]}`;
    const hasSamples=tasks.some(t=>t.sample);$('#sample-badge').hidden=!hasSamples;$('#clear-demo').hidden=!hasSamples;
  }
  function openEditor(task=null) {
    editingId=task?.id||null;$('#editor-title').textContent=task?'Edytuj zadanie':'Nowe zadanie';$('#save-task').textContent=task?'Zapisz zmiany':'Dodaj zadanie';
    $('#task-title').value=task?.title||'';$('#task-notes').value=task?.notes||'';$('#task-due').value=task?.due||(view==='today'?day:'');$('#task-priority').value=task?.priority||'medium';$('#form-error').textContent='';$('#editor').showModal();$('#task-title').focus();
  }
  function remove(taskId) {
    const index=tasks.findIndex(t=>t.id===taskId);if(index<0)return;const [removed]=tasks.splice(index,1);persist();render();
    if(storageHealthy)toast('Zadanie usunięte.',()=>{if(!tasks.some(t=>t.id===removed.id)){tasks.splice(Math.min(index,tasks.length),0,removed);persist();render();}});
    $('#quick-title').focus();
  }
  $('#views').addEventListener('click',event=>{const b=event.target.closest('[data-view]');if(!b)return;view=b.dataset.view;render();});
  $('#new-task').addEventListener('click',()=>openEditor());
  $('#empty-action').addEventListener('click',()=>{if($('#empty-action').dataset.filtered==='true'){$('#search').value='';$('#priority-filter').value='all';render();}else openEditor();});
  for(const selector of ['#close-editor','#cancel-editor'])$(selector).addEventListener('click',()=>$('#editor').close());
  $('#editor-form').addEventListener('submit',event=>{
    event.preventDefault();
    try {
      const input=M.validate({title:$('#task-title').value,notes:$('#task-notes').value,due:$('#task-due').value,priority:$('#task-priority').value});
      if(editingId){const task=tasks.find(t=>t.id===editingId);if(!task)throw new Error('To zadanie zostało usunięte w innym oknie. Zamknij formularz i odśwież listę.');Object.assign(task,input,{updatedAt:Date.now(),sample:false});}
      else{tasks.unshift(M.create(input,id()));view=input.due===day&&view==='today'?'today':'all';$('#search').value='';$('#priority-filter').value='all';}
      persist();render();$('#editor').close();$('#new-task').focus();
    }catch(error){$('#form-error').textContent=error.message;}
  });
  $('#quick-form').addEventListener('submit',event=>{event.preventDefault();try{const input={title:$('#quick-title').value,notes:'',due:view==='today'?day:'',priority:'medium'};tasks.unshift(M.create(input,id()));$('#quick-title').value='';if(view==='done'||view==='planned')view='all';$('#search').value='';$('#priority-filter').value='all';persist();render();}catch(error){toast(error.message);}$('#quick-title').focus();});
  $('#search').addEventListener('input',render);$('#priority-filter').addEventListener('change',render);$('#sort').addEventListener('change',render);
  $('#undo').addEventListener('click',()=>{const action=undoAction;clearTimeout(toastTimer);undoAction=null;$('#toast').hidden=true;action?.();});
  $('#dismiss-toast').addEventListener('click',()=>{clearTimeout(toastTimer);$('#toast').hidden=true;undoAction=null;});
  $('#clear-demo').addEventListener('click',()=>$('#confirm-dialog').showModal());
  $('#confirm-dialog').addEventListener('close',()=>{if($('#confirm-dialog').returnValue==='remove'){const samples=tasks.filter(t=>t.sample);tasks=tasks.filter(t=>!t.sample);persist();render();if(storageHealthy)toast('Przykładowe zadania usunięte.',()=>{const ids=new Set(tasks.map(t=>t.id));tasks.push(...samples.filter(t=>!ids.has(t.id)));persist();render();});}});
  $('#export').addEventListener('click',()=>{const data=JSON.stringify({version:1,exportedAt:new Date().toISOString(),tasks},null,2);const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=node('a');a.href=url;a.download=`taskly-${M.localDate()}.json`;a.hidden=true;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);});
  document.addEventListener('keydown',event=>{if(event.ctrlKey||event.metaKey||event.altKey||event.repeat||$('dialog[open]')||event.target.closest('input,textarea,select,[contenteditable]'))return;if(event.key.toLowerCase()==='n'){event.preventDefault();openEditor();}if(event.key==='/'){event.preventDefault();$('#search').focus();}});
  window.addEventListener('storage',event=>{if(event.key!==KEY&&event.key!==null)return;try{tasks=event.newValue?M.decode(event.newValue):[];render();toast('Lista została zaktualizowana w innym oknie.');}catch{toast('Nie udało się odczytać zmian z innego okna.');}});
  function updateDay(){day=M.localDate();$('#today-label').textContent=new Intl.DateTimeFormat('pl',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());render();}
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateDay();});setInterval(()=>{if(day!==M.localDate())updateDay();},30000);
  updateDay();
})();
