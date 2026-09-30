const test=require('node:test'),assert=require('node:assert/strict'),M=require('../workspace-model.js'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
test('calendar starts Monday, includes leap day and spans six complete weeks',()=>{
 const days=M.calendar('2024-02');assert.equal(days.length,42);assert.equal(new Date(days[0].date+'T12:00:00').getDay(),1);assert.ok(days.some(d=>d.date==='2024-02-29'&&d.inMonth));assert.equal(days.filter(d=>d.inMonth).length,29);
 assert.throws(()=>M.calendar('2026-13'));assert.throws(()=>M.monthDate('1899-12'));
});
test('monthly reports use due date first, current status and creation fallback, excluding samples',()=>{
 const make=(due,completed=false,extra={})=>({due,completed,priority:'high',createdAt:new Date(2026,8,10,12).getTime(),...extra});
 const rows=[make('2026-09-15',true),make('2026-09-30'),make('2026-10-01'),make('',false),make('2026-09-01',true,{sample:true}),make('2026-09-02',true,{createdAt:new Date(2026,6,1).getTime()})];
 const report=M.monthly(rows,'2026-09');assert.equal(report.total,4);assert.equal(report.done,2);assert.equal(report.open,2);assert.equal(report.percent,50);assert.equal(report.undated,1);assert.equal(M.monthly([],'2026-09').percent,0);
});
test('workspace translations include every string in all seven languages',()=>{
 const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../workspace-i18n.js'),'utf8'),context);const text=context.window.WorkspaceText;
 assert.equal(Object.keys(text.rows).length,7);for(const [lang,values] of Object.entries(text.rows)){assert.equal(values.length,text.keys.length,lang);assert.ok(values.every(s=>typeof s==='string'&&s.length));}
});
test('local profiles hash passwords, reject invalid login, isolate storage and retain guest key',async()=>{
 const store=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};};
 const context={window:{},localStorage:store(),sessionStorage:store(),crypto:require('node:crypto').webcrypto,TextEncoder,Uint8Array};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../profiles.js'),'utf8'),context);const P=context.window.TasklyProfiles;
 assert.equal(P.key(),'taskly.tasks.v1');await P.register('Test Profile','test-password-2026');const key=P.key();assert.notEqual(key,'taskly.tasks.v1');assert.ok(!context.localStorage.getItem('taskly.profiles.v1').includes('test-password-2026'));
 P.logout();assert.equal(P.key(),'taskly.tasks.v1');await assert.rejects(P.login('Test Profile','wrong-password'));await P.login('test profile','test-password-2026');assert.equal(P.key(),key);
 await assert.rejects(P.register('Test Profile','another-password'));await P.register('Second Profile','second-password-2026');assert.notEqual(P.key(),key);
});
