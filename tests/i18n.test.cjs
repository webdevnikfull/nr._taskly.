const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../translations.js'),'utf8'),context);
const dictionaries=context.window.TasklyTranslations;
test('all seven languages contain every translation and preserve placeholders',()=>{
  assert.deepEqual(Object.keys(dictionaries),['pl','en','de','es','fr','uk','ru']);
  const keys=Object.keys(dictionaries.pl).sort();
  for(const [lang,values] of Object.entries(dictionaries)){
    assert.deepEqual(Object.keys(values).sort(),keys,lang);
    for(const key of keys){
      assert.ok(values[key].trim(),`${lang}: ${key}`);
      assert.deepEqual((values[key].match(/\{\w+\}/g)||[]).sort(),(key.match(/\{\w+\}/g)||[]).sort(),`${lang}: ${key}`);
    }
  }
});
test('locale-aware sorting does not modify stored task content',()=>{
  const M=require('../model.js');
  const tasks=['Żółw','École','Завдання'].map((title,i)=>M.create({title,priority:'medium'},String(i),i));
  const before=JSON.stringify(tasks);
  for(const locale of Object.keys(dictionaries))assert.equal(M.visible(tasks,{sort:'title',locale}).length,3);
  assert.equal(JSON.stringify(tasks),before);
});
