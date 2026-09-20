/* Pure task operations shared by the browser and the regression tests. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TaskModel = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const PRIORITIES = ['high', 'medium', 'low'];
  function localDate(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '1900-01-01') return false;
    const date = new Date(value + 'T12:00:00');
    return !Number.isNaN(date.getTime()) && localDate(date) === value;
  }
  function validate(input) {
    const title = String(input.title || '').trim();
    if (!title) throw new Error('Wpisz nazwę zadania.');
    if (title.length > 160) throw new Error('Nazwa może mieć maksymalnie 160 znaków.');
    const notes = String(input.notes || '').trim();
    if (notes.length > 2000) throw new Error('Notatka może mieć maksymalnie 2000 znaków.');
    const due = String(input.due || '');
    if (due && !validDate(due)) throw new Error('Wybierz prawidłową datę.');
    if (!PRIORITIES.includes(input.priority)) throw new Error('Wybierz priorytet zadania.');
    return {title, notes, due, priority:input.priority};
  }
  function create(input, id, now = Date.now()) {
    return {...validate(input), id, completed:false, createdAt:now, updatedAt:now, sample:false};
  }
  function counts(tasks, today) {
    return { all:tasks.filter(t=>!t.completed).length, today:tasks.filter(t=>!t.completed && t.due===today).length,
      planned:tasks.filter(t=>!t.completed && t.due).length, done:tasks.filter(t=>t.completed).length,
      overdue:tasks.filter(t=>!t.completed && t.due && t.due<today).length, total:tasks.length };
  }
  function visible(tasks, {view='all', search='', priority='all', sort='newest', today=localDate()} = {}) {
    const query=search.trim().toLocaleLowerCase('pl');
    return tasks.filter(t => (view==='done' ? t.completed : !t.completed)
      && (view!=='today' || t.due===today) && (view!=='planned' || !!t.due)
      && (priority==='all' || t.priority===priority)
      && (!query || `${t.title} ${t.notes}`.toLocaleLowerCase('pl').includes(query)))
      .sort((a,b)=> {
        let order=0;
        if(sort==='due') order=(a.due||'9999-99-99').localeCompare(b.due||'9999-99-99');
        if(sort==='priority') order=PRIORITIES.indexOf(a.priority)-PRIORITIES.indexOf(b.priority);
        if(sort==='title') order=a.title.localeCompare(b.title,'pl');
        return order || b.createdAt-a.createdAt || a.id.localeCompare(b.id);
      });
  }
  function decode(text) {
    const saved=JSON.parse(text);
    if(saved.version!==1 || !Array.isArray(saved.tasks) || saved.tasks.length>10000) throw new Error('Nieobsługiwany format danych.');
    const ids=new Set();
    return saved.tasks.map(t=> {
      if(typeof t.id!=='string' || !t.id || ids.has(t.id) || typeof t.completed!=='boolean' || !Number.isFinite(t.createdAt) || !Number.isFinite(t.updatedAt)) throw new Error('Nieprawidłowe dane zadania.');
      ids.add(t.id);
      return {...validate(t), id:t.id, completed:t.completed, createdAt:t.createdAt, updatedAt:t.updatedAt, sample:t.sample===true};
    });
  }
  return {localDate, validDate, validate, create, counts, visible, decode};
});
