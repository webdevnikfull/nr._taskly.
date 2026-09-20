const test=require('node:test');
const assert=require('node:assert/strict');
const M=require('../model.js');
const task=(id,extra={})=>({...M.create({title:'Zadanie '+id,notes:'',due:'',priority:'medium'},id,1),...extra});
test('rejects whitespace titles, invalid dates and priorities',()=>{
  for(const input of [{title:'   ',priority:'medium'},{title:'a',due:'2026-02-30',priority:'low'},{title:'a',priority:'urgent'}])assert.throws(()=>M.validate(input));
  assert.equal(M.validDate('2024-02-29'),true);assert.equal(M.validDate('2025-02-29'),false);
});
test('trims text and preserves markup as plain data',()=>{
  const t=M.create({title:' <img src=x> ',notes:' note ',due:'',priority:'high'},'id');
  assert.equal(t.title,'<img src=x>');assert.equal(t.notes,'note');assert.equal(t.completed,false);
});
test('today, overdue and completed counts do not overlap incorrectly',()=>{
  const tasks=[task('a',{due:'2026-09-20'}),task('b',{due:'2026-09-19'}),task('c',{completed:true,due:'2026-09-20'}),task('d')];
  assert.deepEqual(M.counts(tasks,'2026-09-20'),{all:3,today:1,planned:2,done:1,overdue:1,total:4});
});
test('combines search, view and priority without mutating source',()=>{
  const tasks=[task('a',{title:'Test UI',priority:'high',due:'2026-09-20'}),task('b',{title:'test UI',completed:true})];
  const before=JSON.stringify(tasks);
  assert.deepEqual(M.visible(tasks,{view:'today',search:'TEST',priority:'high',today:'2026-09-20'}).map(t=>t.id),['a']);
  assert.deepEqual(M.visible(tasks,{view:'done',search:'ui'}).map(t=>t.id),['b']);
  assert.equal(JSON.stringify(tasks),before);
});
test('due sorting places undated tasks last; priority sorts high first',()=>{
  const tasks=[task('a'),task('b',{due:'2026-01-02',priority:'low'}),task('c',{due:'2026-01-01',priority:'high'})];
  assert.deepEqual(M.visible(tasks,{sort:'due'}).map(t=>t.id),['c','b','a']);
  assert.deepEqual(M.visible(tasks,{sort:'priority'}).map(t=>t.id),['c','a','b']);
});
test('storage rejects duplicates and malformed schemas and round trips valid data',()=>{
  assert.throws(()=>M.decode(JSON.stringify({version:1,tasks:[task('a'),task('a')]})));
  assert.throws(()=>M.decode('{bad'));
  assert.throws(()=>M.decode(JSON.stringify({version:2,tasks:[]})));
  const tasks=[task('a',{completed:true})];assert.deepEqual(M.decode(JSON.stringify({version:1,tasks})),tasks);
  assert.deepEqual(M.decode(JSON.stringify({version:1,tasks:[]})),[]);
});
