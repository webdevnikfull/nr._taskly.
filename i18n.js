/* Static text bindings never touch input values or saved task data. */
(() => {
  'use strict';
  const dictionaries=window.TasklyTranslations;
  const languages=Object.keys(dictionaries);
  let language='pl';
  try { const saved=localStorage.getItem('taskly.language.v1'); if(languages.includes(saved))language=saved; } catch {}
  function t(key,values={}) {
    let value=dictionaries[language][key] || key;
    return value.replace(/\{(\w+)\}/g,(match,name)=>Object.hasOwn(values,name)?String(values[name]):match);
  }
  const texts=[], attributes=[];
  const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);
  let current;
  while((current=walker.nextNode())) {
    if(current.parentElement?.closest('script,style,#language'))continue;
    const key=current.textContent.trim();
    if(dictionaries.pl[key])texts.push({node:current,key,original:current.textContent});
  }
  for(const element of document.querySelectorAll('[aria-label],[placeholder],[title],meta[name="description"]')) {
    for(const name of ['aria-label','placeholder','title','content']) {
      const key=element.getAttribute(name);
      if(key && dictionaries.pl[key])attributes.push({element,name,key});
    }
  }
  function apply(value) {
    language=languages.includes(value)?value:'pl';
    document.documentElement.lang=language;
    for(const item of texts)if(item.node.isConnected)item.node.textContent=item.original.replace(item.key,t(item.key));
    for(const item of attributes)item.element.setAttribute(item.name,t(item.key));
    document.getElementById('language').value=language;
    try {localStorage.setItem('taskly.language.v1',language);} catch {}
  }
  window.TasklyI18n={t,get language(){return language;},languages};
  apply(language);
  document.getElementById('language').addEventListener('change',event=>{
    apply(event.target.value);
    document.dispatchEvent(new CustomEvent('taskly:language'));
  });
})();
