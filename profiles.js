/* Device-local profiles. Password verifiers are hashed; task data is not encrypted. */
(() => {
  const REGISTRY='taskly.profiles.v1', SESSION='taskly.profile.session.v1';
  const hex=bytes=>Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');
  function list(){
    const raw=localStorage.getItem(REGISTRY);if(raw===null)return [];
    const rows=JSON.parse(raw);
    if(!Array.isArray(rows)||rows.some(p=>typeof p.id!=='string'||typeof p.name!=='string'||!/^\w{32}$/.test(p.salt)||!/^\w{64}$/.test(p.hash)))throw new Error('storageError');
    return rows;
  }
  function current(){try{const id=sessionStorage.getItem(SESSION);return list().find(p=>p.id===id)||null;}catch{return null;}}
  async function digest(password,salt){
    if(!crypto.subtle)throw new Error('secureContext');
    const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
    return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:Uint8Array.from(salt.match(/../g),s=>parseInt(s,16)),iterations:210000,hash:'SHA-256'},key,256));
  }
  async function register(name,password){
    name=name.trim();if(name.length<2||name.length>40||password.length<8||password.length>128)throw new Error('credentialsRules');
    const normalized=name.toLocaleLowerCase('en');
    if(list().some(p=>p.name.toLocaleLowerCase('en')===normalized))throw new Error('profileExists');
    const salt=hex(crypto.getRandomValues(new Uint8Array(16)));
    const record={id:crypto.randomUUID(),name,salt,hash:await digest(password,salt)};
    const fresh=list();if(fresh.some(p=>p.name.toLocaleLowerCase('en')===normalized))throw new Error('profileExists');
    localStorage.setItem(REGISTRY,JSON.stringify([...fresh,record]));
    sessionStorage.setItem(SESSION,record.id);return record;
  }
  async function login(name,password){
    const record=list().find(p=>p.name.toLocaleLowerCase('en')===name.trim().toLocaleLowerCase('en'));
    if(!record||await digest(password,record.salt)!==record.hash)throw new Error('invalidCredentials');
    sessionStorage.setItem(SESSION,record.id);return record;
  }
  function logout(){sessionStorage.removeItem(SESSION);}
  window.TasklyProfiles={current,register,login,logout,restore:profile=>profile?sessionStorage.setItem(SESSION,profile.id):logout(),key:()=>current()?`taskly.profile.${current().id}.tasks.v1`:'taskly.tasks.v1'};
})();
