(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.WorkspaceModel=factory();})(typeof globalThis!=='undefined'?globalThis:this,()=>{
  const dateString=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  function monthDate(value){
    if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)||value<'1900-01'||value>'9999-12')throw new Error('monthError');
    return new Date(Number(value.slice(0,4)),Number(value.slice(5))-1,1,12);
  }
  function calendar(value){
    const first=monthDate(value),offset=(first.getDay()+6)%7;
    return Array.from({length:42},(_,i)=>{const d=new Date(first);d.setDate(1-offset+i);return {date:dateString(d),day:d.getDate(),inMonth:d.getMonth()===first.getMonth()};});
  }
  function monthly(tasks,month){
    monthDate(month);
    const rows=tasks.filter(t=>!t.sample&&(t.due||dateString(new Date(t.createdAt))).slice(0,7)===month);
    const done=rows.filter(t=>t.completed).length;
    return {rows,total:rows.length,done,open:rows.length-done,percent:rows.length?Math.round(done/rows.length*100):0,
      priorities:['high','medium','low'].map(priority=>({priority,total:rows.filter(t=>t.priority===priority).length,done:rows.filter(t=>t.priority===priority&&t.completed).length})),
      undated:rows.filter(t=>!t.due).length};
  }
  return {calendar,monthly,monthDate};
});
