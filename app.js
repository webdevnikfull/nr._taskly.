(() => {
  'use strict';
  const M=window.TaskModel, KEY='taskly.tasks.v1';
  const I=window.TasklyI18n, t=I.t;
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
    catch {storageHealthy=false;toast(t('Nie udało się zapisać. Wyeksportuj zadania przed zamknięciem strony.'));}
    $('#save-status').textContent=storageHealthy?t('Zapis na tym urządzeniu'):t('Brak trwałego zapisu — eksportuj');
  }
  try {const saved=localStorage.getItem(KEY); tasks=saved===null?seed():M.decode(saved); if(saved===null)persist();}
  catch {tasks=[];storageHealthy=false;$('#save-status').textContent=t('Nie można odczytać zapisanych zadań');toast(t('Nie można odczytać danych. Poprzedni zapis pozostaje nienaruszony.'));}
  function node(tag,className,text) {const e=document.createElement(tag);if(className)e.className=className;if(text!==undefined)e.textContent=text;return e;}
  function icon(name) {const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('aria-hidden','true');const use=document.createElementNS(svg.namespaceURI,'use');use.setAttribute('href',`#i-${name}`);svg.append(use);return svg;}
  function dateLabel(due) {if(!due)return '';if(due===day)return t('Dzisiaj');const nextDay=new Date();nextDay.setDate(nextDay.getDate()+1);if(due===M.localDate(nextDay))return t('Jutro');return new Intl.DateTimeFormat(I.language,{day:'numeric',month:'short',...(due.slice(0,4)!==day.slice(0,4)?{year:'numeric'}:{})}).format(new Date(due+'T12:00:00'));}
  function row(task) {
    const displayTitle=task.sample?t(task.title):task.title;
    const displayNotes=task.sample?t(task.notes):task.notes;
    const el=node('article','task-row'+(task.completed?' is-done':''));el.dataset.id=task.id;
    const check=node('input','task-check');check.type='checkbox';check.checked=task.completed;check.setAttribute('aria-label',`${task.completed?t('Przywróć'):t('Ukończ')}: ${displayTitle}`);
    check.addEventListener('change',()=>{task.completed=check.checked;task.updatedAt=Date.now();persist();render();$('#results-status').textContent=task.completed?t('Zadanie ukończone.'):t('Zadanie przywrócone.');const target=$('.task-check')||$('#quick-title');target.focus();});
    const content=node('div','task-content'),title=node('button','task-title',displayTitle);title.type='button';title.setAttribute('aria-label',`${t('Edytuj')}: ${displayTitle}`);title.addEventListener('click',()=>openEditor(task));content.append(title);
    if(task.notes)content.append(node('p','task-notes',displayNotes));
    const meta=node('div','task-meta');if(task.due){const date=node('span','task-date'+(!task.completed&&task.due<day?' overdue':''));date.append(icon('calendar'),document.createTextNode(dateLabel(task.due)));if(!task.completed&&task.due<day)date.append(document.createTextNode(' · '+t('po terminie')));meta.append(date);}
    if(task.sample)meta.append(node('span','sample-marker',t('Przykład')));if(meta.childNodes.length)content.append(meta);
    const priority=node('span',`priority ${task.priority}`,t(priorityNames[task.priority]));priority.setAttribute('aria-label',`${t('Priorytet')}: ${t(priorityNames[task.priority])}`);
    const actions=node('div','row-actions');for(const [action,name,handler] of [['edit',t('Edytuj'),()=>openEditor(task)],['trash',t('Usuń'),()=>remove(task.id)]]){const b=node('button','icon-button');b.type='button';b.setAttribute('aria-label',`${name}: ${displayTitle}`);b.title=name;b.append(icon(action));b.addEventListener('click',handler);actions.append(b);}
    el.append(check,content,priority,actions);return el;
  }
  function render() {
    const c=M.counts(tasks,day);
    document.querySelectorAll('[data-count]').forEach(e=>e.textContent=c[e.dataset.count]);
    document.querySelectorAll('[data-view]').forEach(e=>{const active=e.dataset.view===view;e.classList.toggle('active',active);if(active)e.setAttribute('aria-current','page');else e.removeAttribute('aria-current');});
    $('#metric-open').textContent=c.all;$('#metric-today').textContent=c.today;
    $('#metric-done').replaceChildren(document.createTextNode(c.done),node('span','',`/ ${c.total}`));
    $('#overdue-note').textContent=c.overdue?t('Po terminie: {count}',{count:c.overdue}):t('W swoim tempie');$('#overdue-note').classList.toggle('warn',c.overdue>0);
    const percent=c.total?Math.round(c.done/c.total*100):0;$('#progress-text').textContent=`${percent}%`;$('#progress-circle').style.strokeDashoffset=176*(1-percent/100);
    $('#breadcrumb-view').textContent=t(viewNames[view]);$('#list-heading').replaceChildren(document.createTextNode(t(viewNames[view])+' '),node('span','',c[view]));$('#list-description').textContent=t(descriptions[view]);
    const visible=M.visible(tasks.map(task=>({...task,title:task.sample?t(task.title):task.title,notes:task.sample?t(task.notes):task.notes})),{locale:I.language,view,search:$('#search').value,priority:$('#priority-filter').value,sort:$('#sort').value,today:day});
    $('#task-list').replaceChildren(...visible.map(item=>row(tasks.find(task=>task.id===item.id))));$('#empty').hidden=visible.length>0;$('#list-count')?.remove();
    const filtered=$('#search').value.trim()||$('#priority-filter').value!=='all';
    $('#empty-title').textContent=filtered?t('Nie ma takich zadań.'):view==='done'?t('Jeszcze wszystko przed Tobą.'):view==='today'?t('Dzisiaj jest przestrzeń.'):t('Czysta karta.');
    $('#empty-description').textContent=filtered?t('Zmień wyszukiwanie lub usuń filtr priorytetu.'):view==='done'?t('Ukończone zadania pojawią się tutaj.'):t('Dodaj zadanie i zrób miejsce na dobry plan.');
    $('#empty-action').textContent=filtered?t('Wyczyść filtry'):t('Dodaj zadanie');$('#empty-action').dataset.filtered=String(!!filtered);
    $('#results-status').textContent=t('Wyświetlono: {shown} · w tym widoku: {total}',{shown:visible.length,total:c[view]});
    const hasSamples=tasks.some(t=>t.sample);$('#sample-badge').hidden=!hasSamples;$('#clear-demo').hidden=!hasSamples;
  }
  function openEditor(task=null) {
    editingId=task?.id||null;$('#editor-title').textContent=task?t('Edytuj zadanie'):t('Nowe zadanie');$('#save-task').textContent=task?t('Zapisz zmiany'):t('Dodaj zadanie');
    $('#task-title').value=task?(task.sample?t(task.title):task.title):'';$('#task-notes').value=task?(task.sample?t(task.notes):task.notes):'';$('#task-due').value=task?.due||(view==='today'?day:'');$('#task-priority').value=task?.priority||'medium';$('#form-error').textContent='';$('#editor').showModal();$('#task-title').focus();
  }
  function remove(taskId) {
    const index=tasks.findIndex(t=>t.id===taskId);if(index<0)return;const [removed]=tasks.splice(index,1);persist();render();
    if(storageHealthy)toast(t('Zadanie usunięte.'),()=>{if(!tasks.some(t=>t.id===removed.id)){tasks.splice(Math.min(index,tasks.length),0,removed);persist();render();}});
    $('#quick-title').focus();
  }
  $('#views').addEventListener('click',event=>{const b=event.target.closest('[data-view]');if(!b)return;view=b.dataset.view;render();});
  $('#editor-form').noValidate=true;
  $('#new-task').addEventListener('click',()=>openEditor());
  $('#empty-action').addEventListener('click',()=>{if($('#empty-action').dataset.filtered==='true'){$('#search').value='';$('#priority-filter').value='all';render();}else openEditor();});
  for(const selector of ['#close-editor','#cancel-editor'])$(selector).addEventListener('click',()=>$('#editor').close());
  $('#editor-form').addEventListener('submit',event=>{
    event.preventDefault();
    try {
      const input=M.validate({title:$('#task-title').value,notes:$('#task-notes').value,due:$('#task-due').value,priority:$('#task-priority').value});
      if(editingId){const task=tasks.find(t=>t.id===editingId);if(!task)throw new Error(t('To zadanie zostało usunięte w innym oknie. Zamknij formularz i odśwież listę.'));Object.assign(task,input,{updatedAt:Date.now(),sample:false});}
      else{tasks.unshift(M.create(input,id()));view=input.due===day&&view==='today'?'today':'all';$('#search').value='';$('#priority-filter').value='all';}
      persist();render();$('#editor').close();$('#new-task').focus();
    }catch(error){$('#form-error').textContent=t(error.message);}
  });
  $('#quick-form').addEventListener('submit',event=>{event.preventDefault();try{const input={title:$('#quick-title').value,notes:'',due:view==='today'?day:'',priority:'medium'};tasks.unshift(M.create(input,id()));$('#quick-title').value='';if(view==='done'||view==='planned')view='all';$('#search').value='';$('#priority-filter').value='all';persist();render();}catch(error){toast(t(error.message));}$('#quick-title').focus();});
  $('#search').addEventListener('input',render);$('#priority-filter').addEventListener('change',render);$('#sort').addEventListener('change',render);
  $('#undo').addEventListener('click',()=>{const action=undoAction;clearTimeout(toastTimer);undoAction=null;$('#toast').hidden=true;action?.();});
  $('#dismiss-toast').addEventListener('click',()=>{clearTimeout(toastTimer);$('#toast').hidden=true;undoAction=null;});
  $('#clear-demo').addEventListener('click',()=>$('#confirm-dialog').showModal());
  $('#confirm-dialog').addEventListener('close',()=>{if($('#confirm-dialog').returnValue==='remove'){const samples=tasks.filter(t=>t.sample);tasks=tasks.filter(t=>!t.sample);persist();render();if(storageHealthy)toast(t('Przykładowe zadania usunięte.'),()=>{const ids=new Set(tasks.map(t=>t.id));tasks.push(...samples.filter(t=>!ids.has(t.id)));persist();render();});}});
  $('#export').addEventListener('click',()=>{const data=JSON.stringify({version:1,exportedAt:new Date().toISOString(),tasks},null,2);const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=node('a');a.href=url;a.download=`taskly-${M.localDate()}.json`;a.hidden=true;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);});
  document.addEventListener('keydown',event=>{if(event.ctrlKey||event.metaKey||event.altKey||event.repeat||$('dialog[open]')||event.target.closest('input,textarea,select,[contenteditable]'))return;if(event.key.toLowerCase()==='n'){event.preventDefault();openEditor();}if(event.key==='/'){event.preventDefault();$('#search').focus();}});
  window.addEventListener('storage',event=>{if(event.key!==KEY&&event.key!==null)return;try{tasks=event.newValue?M.decode(event.newValue):[];render();toast(t('Lista została zaktualizowana w innym oknie.'));}catch{toast(t('Nie udało się odczytać zmian z innego okna.'));}});
  function updateDay(){day=M.localDate();$('#today-label').textContent=new Intl.DateTimeFormat(I.language,{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());render();}
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateDay();});setInterval(()=>{if(day!==M.localDate())updateDay();},30000);
  document.addEventListener('taskly:language',()=>{
    $('#toast').hidden=true; clearTimeout(toastTimer); undoAction=null;
    $('#form-error').textContent='';
    $('#save-status').textContent=storageHealthy?t('Zapis na tym urządzeniu'):t('Brak trwałego zapisu — eksportuj');
    updateDay();
  });
  updateDay();
})();
