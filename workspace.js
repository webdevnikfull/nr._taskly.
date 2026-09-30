(() => {
 'use strict';
 const $=s=>document.querySelector(s), A=TasklyApp, M=WorkspaceModel, X=WorkspaceText.t, I=TasklyI18n;
 let selectedDay=TaskModel.localDate(), calMonth=selectedDay.slice(0,7), reportMonth=calMonth, authMode='login', activeView=location.hash.slice(1)||'all';
 const element=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls||'';if(text!==undefined)n.textContent=text;return n;};
 const monthTitle=month=>new Intl.DateTimeFormat(I.language,{month:'long',year:'numeric'}).format(M.monthDate(month));
 const dayTitle=date=>new Intl.DateTimeFormat(I.language,{weekday:'long',day:'numeric',month:'long'}).format(new Date(date+'T12:00:00'));
 const userName=()=>TasklyProfiles.current()?.name||X('guest');
 const displayTitle=task=>task.sample?I.t(task.title):task.title;
 const priorityLabel=priority=>I.t({high:'Wysoki',medium:'Średni',low:'Niski'}[priority]);
 function navigate(view){A.changeView(view);if(location.hash!=='#'+view)location.hash=view;}
 function clock(){
  const now=new Date();$('#live-clock').textContent=new Intl.DateTimeFormat(I.language,{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(now);
  $('#live-clock').dateTime=now.toISOString();$('#clock-zone').textContent=X('clock');
 }
 function profileUI(){
  const current=TasklyProfiles.current();$('#profile-name').textContent=current?.name||X('login');
  $('.workspace strong').textContent=current?.name||I.t('Moja przestrzeń');
  $('.workspace .avatar').textContent=current?current.name.slice(0,2).toUpperCase():'NR';
  $('#profile-title').textContent=X(current?'profile':authMode);
  $('#profile-inputs').hidden=!!current;$('.profile-tabs').hidden=!!current;$('#profile-submit').hidden=!!current;$('#profile-logout').hidden=!current;
  $('#profile-submit').textContent=X(authMode);$('#account-password').autocomplete=authMode==='register'?'new-password':'current-password';
  document.querySelectorAll('[data-auth]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.auth===authMode)));
 }
 function focusUI(){
  const tasks=TaskModel.visible(A.getTasks(),{view:'all',sort:'priority'}), counts=TaskModel.counts(A.getTasks(),TaskModel.localDate());
  $('#focus-copy').textContent=tasks.length?displayTitle(tasks[0]):X('allClear');
  $('#focus-action').disabled=!tasks.length;$('#focus-action').title=tasks.length?X('focusCopy'):X('allClear');
  $('#focus-progress').style.width=`${counts.total?Math.round(counts.done/counts.total*100):0}%`;
 }
 function renderCalendar(){
  $('#calendar-month').value=calMonth;$('#calendar-month-title').textContent=monthTitle(calMonth);
  $('#calendar-prev').disabled=calMonth==='1900-01';$('#calendar-next').disabled=calMonth==='9999-12';
  $('#calendar-weekdays').replaceChildren(...Array.from({length:7},(_,i)=>element('span','',new Intl.DateTimeFormat(I.language,{weekday:'short'}).format(new Date(2026,8,28+i)))));
  const all=A.getTasks(), today=TaskModel.localDate();
  $('#calendar-days').replaceChildren(...M.calendar(calMonth).map(cell=>{
   const tasks=all.filter(t=>t.due===cell.date),open=tasks.filter(t=>!t.completed).length;
   const b=element('button','calendar-day'+(cell.inMonth?'':' outside')+(cell.date===today?' is-today':'')+(cell.date===selectedDay?' selected':''));b.type='button';b.dataset.date=cell.date;b.disabled=cell.date<'1900-01-01'||cell.date>'9999-12-31';
   b.setAttribute('aria-pressed',String(cell.date===selectedDay));b.setAttribute('aria-label',`${dayTitle(cell.date)} · ${X('open')}: ${open} · ${X('done')}: ${tasks.length-open}`);
   b.append(element('span','day-number',cell.day));
   if(tasks.length){const marks=element('span','day-count');if(open)marks.append(element('i','',String(open)));if(tasks.length>open)marks.append(element('i','done',String(tasks.length-open)));b.append(marks);}
   b.addEventListener('click',()=>{selectedDay=cell.date;if(cell.date.slice(0,7)!==calMonth)calMonth=cell.date.slice(0,7);renderCalendar();$(`[data-date="${selectedDay}"]`)?.focus();});
   return b;
  }));
  $('#selected-day').textContent=dayTitle(selectedDay);
  const tasks=all.filter(t=>t.due===selectedDay).sort((a,b)=>Number(a.completed)-Number(b.completed));
  $('#day-tasks').replaceChildren(...(tasks.length?tasks.map(A.row):[element('p','agenda-empty',X('noTasks'))]));
  const undated=all.filter(t=>!t.due&&!t.completed);$('#undated-count').textContent=undated.length;$('#undated-tasks').replaceChildren(...undated.map(A.row));
 }
 function renderReport(){
  const report=M.monthly(A.getTasks(),reportMonth);$('#report-month').value=reportMonth;
  $('#report-month-title').textContent=monthTitle(reportMonth);$('#report-profile').textContent=userName();
  for(const field of ['total','done','open'])$('#report-'+field).textContent=report[field];
  $('#report-percent').textContent=report.percent+'%';$('#report-ring').style.setProperty('--progress',`${report.percent}%`);
  $('#report-ring').setAttribute('aria-label',`${X('completion')}: ${report.percent}%`);
  $('#report-bars').replaceChildren(...report.priorities.map(p=>{
   const row=element('div','report-bar-row'),head=element('div','bar-label');head.append(element('span','',priorityLabel(p.priority)),element('strong','',`${p.done} / ${p.total}`));
   const track=element('div','bar-track'),fill=element('i');fill.style.width=`${p.total?p.done/p.total*100:0}%`;track.append(fill);row.append(head,track);return row;
  }));
  $('#report-generated').textContent=`${X('generated')}: ${new Intl.DateTimeFormat(I.language,{dateStyle:'long',timeStyle:'short'}).format(new Date())} · ${X('createdFallback')}: ${report.undated}`;
 }
 function apply(){
  document.querySelectorAll('[data-x]').forEach(n=>n.textContent=X(n.dataset.x));
  document.querySelectorAll('[data-x-label]').forEach(n=>n.setAttribute('aria-label',X(n.dataset.xLabel)));
  $('#calendar-prev').setAttribute('aria-label',X('previous'));$('#calendar-next').setAttribute('aria-label',X('next'));$('#add-day').setAttribute('aria-label',X('addDay'));
  $('#export').setAttribute('aria-label',X('reportTitle'));$('#export').title=X('reportTitle');$('#profile-open').setAttribute('aria-label',X('profileAction'));$('#date-calendar').title=X('calendar');
  profileUI();focusUI();clock();renderCalendar();renderReport();
  if(['calendar','reports'].includes(activeView))$('#breadcrumb-view').textContent=X(activeView);
 }
 document.addEventListener('taskly:render',event=>{activeView=event.detail.view;profileUI();focusUI();if(activeView==='calendar')renderCalendar();if(activeView==='reports')renderReport();});
 document.addEventListener('taskly:language',apply);
 $('#date-calendar').addEventListener('click',()=>{selectedDay=TaskModel.localDate();calMonth=selectedDay.slice(0,7);navigate('calendar');$('#calendar-panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
 $('#export').addEventListener('click',()=>navigate('reports'));
 $('#focus-action').addEventListener('click',()=>{const next=TaskModel.visible(A.getTasks(),{sort:'priority'})[0];if(next)A.openEditor(next);});
 for(const [id,delta] of [['calendar-prev',-1],['calendar-next',1]])$('#'+id).addEventListener('click',()=>{const date=M.monthDate(calMonth);date.setMonth(date.getMonth()+delta);calMonth=TaskModel.localDate(date).slice(0,7);renderCalendar();});
 $('#calendar-month').addEventListener('change',event=>{try{M.monthDate(event.target.value);calMonth=event.target.value;renderCalendar();}catch{event.target.value=calMonth;A.toast(X('monthError'));}});
 $('#calendar-today').addEventListener('click',()=>{selectedDay=TaskModel.localDate();calMonth=selectedDay.slice(0,7);renderCalendar();});
 $('#add-day').addEventListener('click',()=>{A.openEditor();$('#task-due').value=selectedDay;});
 $('#report-month').addEventListener('change',event=>{try{M.monthDate(event.target.value);reportMonth=event.target.value;renderReport();}catch{event.target.value=reportMonth;A.toast(X('monthError'));}});
 $('#report-print').addEventListener('click',()=>{renderReport();document.body.classList.add('printing-report');window.print();});
 window.addEventListener('afterprint',()=>document.body.classList.remove('printing-report'));
 $('#profile-open').addEventListener('click',()=>{profileUI();$('#profile-error').textContent='';$('#profile-dialog').showModal();if(!TasklyProfiles.current())$('#account-name').focus();});
 $('#profile-close').addEventListener('click',()=>$('#profile-dialog').close());
 $('#profile-dialog').addEventListener('close',()=>{$('#account-password').value='';$('#profile-error').textContent='';});
 document.querySelectorAll('[data-auth]').forEach(b=>b.addEventListener('click',()=>{authMode=b.dataset.auth;$('#profile-error').textContent='';profileUI();}));
 $('#profile-form').addEventListener('submit',async event=>{
  event.preventDefault();const previous=TasklyProfiles.current();$('#profile-submit').disabled=true;$('#profile-error').textContent='';
  try{await TasklyProfiles[authMode]($('#account-name').value,$('#account-password').value);A.switchProfile();profileUI();renderCalendar();renderReport();}
  catch(error){TasklyProfiles.restore(previous);$('#profile-error').textContent=X(WorkspaceText.keys.includes(error.message)?error.message:'storageError');}
  finally{$('#profile-submit').disabled=false;}
 });
 $('#profile-logout').addEventListener('click',()=>{const previous=TasklyProfiles.current();try{TasklyProfiles.logout();A.switchProfile();profileUI();renderCalendar();renderReport();}catch{TasklyProfiles.restore(previous);$('#profile-error').textContent=X('storageError');}});
 $('#report-download').addEventListener('click',()=>{
  const report=M.monthly(A.getTasks(),reportMonth), canvas=document.createElement('canvas');canvas.width=1400;canvas.height=1150;const c=canvas.getContext('2d');
  const text=(value,x,y,size=22,color='#637594',weight='400')=>{c.fillStyle=color;c.font=`${weight} ${size}px "Segoe UI",Arial,sans-serif`;c.fillText(String(value),x,y);};
  const wrap=(value,x,y,maxWidth,size=18)=>{c.font=`${size}px "Segoe UI",Arial,sans-serif`;const words=value.split(' ');let line='';for(const word of words){if(c.measureText(line+word).width>maxWidth&&line){text(line,x,y,size);y+=29;line='';}line+=word+' ';}if(line)text(line,x,y,size);return y+29;};
  c.fillStyle='#f4f7fd';c.fillRect(0,0,1400,1150);c.fillStyle='#fff';c.beginPath();c.roundRect(45,45,1310,1060,28);c.fill();
  text('taskly.',90,124,44,'#142b70','700');text(X('reportTitle').toUpperCase(),90,172,16);text(monthTitle(reportMonth),90,247,44,'#142b70','600');text(userName(),90,283,21);
  c.lineWidth=24;c.strokeStyle='#e8edf7';c.beginPath();c.arc(1130,221,78,0,Math.PI*2);c.stroke();if(report.percent){c.strokeStyle='#5478c7';c.beginPath();c.arc(1130,221,78,-Math.PI/2,-Math.PI/2+2*Math.PI*report.percent/100);c.stroke();}c.textAlign='center';text(report.percent+'%',1130,236,36,'#142b70','600');c.textAlign='left';
  ['total','done','open'].forEach((key,index)=>{const x=90+index*414;c.fillStyle=index===1?'#142b70':'#f1f5fc';c.beginPath();c.roundRect(x,338,392,156,18);c.fill();text(X(key),x+24,378,20,index===1?'#cfddfa':'#637594');text(report[key],x+24,454,57,index===1?'#fff':'#142b70','600');});
  text(X('byPriority'),90,556,25,'#142b70','600');report.priorities.forEach((p,index)=>{const y=607+index*88;text(priorityLabel(p.priority),90,y,21,'#334f7c');c.textAlign='right';text(`${p.done} / ${p.total}`,1300,y,21);c.textAlign='left';c.fillStyle='#e8eef8';c.fillRect(90,y+18,1210,12);c.fillStyle='#597fc9';c.fillRect(90,y+18,1210*(p.total?p.done/p.total:0),12);});
  let y=wrap(X('reportBasis'),90,905,1200);y=wrap(X('excluded'),90,y,1200);text(`${X('generated')}: ${new Intl.DateTimeFormat(I.language,{dateStyle:'medium',timeStyle:'short'}).format(new Date())}`,90,1043,16);
  canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`taskly-report-${reportMonth}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);},'image/png');
 });
 setInterval(()=>{if(!document.hidden)clock();},1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)clock();});
 apply();
})();
