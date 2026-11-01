const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const snippet=script.slice(script.indexOf('const themeToggle'),script.indexOf("const play ="));
const stored=new Map();
function boot(blockStorage=false) {
 const attrs={},root={},meta={};let click,message='';
 const toggle={setAttribute(k,v){attrs[k]=v},addEventListener(n,f){click=f}};
 const c=vm.createContext({document:{documentElement:{setAttribute(k,v){root[k]=v}},querySelector:s=>s==='#theme-toggle'?toggle:{setAttribute(k,v){meta[k]=v}}},localStorage:{getItem:k=>{if(blockStorage)throw Error('blocked');return stored.get(k)},setItem(k,v){if(blockStorage)throw Error('blocked');stored.set(k,v)}},setControl(b,icon,label){b.icon=icon;b.label=label},setPlaybackStatus(s){message=s}});
 vm.runInContext(snippet,c);
 return {root,meta,toggle,attrs,click:()=>click(),get message(){return message}};
}
const light=boot();assert.equal(light.root['data-theme'],'light');light.click();assert.equal(light.root['data-theme'],'dark');assert.equal(light.attrs['aria-checked'],'true');assert.equal(light.toggle.icon,'sun');assert.equal(stored.get('kwest-dark-mode'),'true');
const reloaded=boot();assert.equal(reloaded.root['data-theme'],'dark');reloaded.click();assert.equal(stored.get('kwest-dark-mode'),'false');assert.equal(reloaded.toggle.icon,'moon');
const blocked=boot(true);blocked.click();assert.equal(blocked.root['data-theme'],'dark');assert(blocked.message.includes('cannot be saved'));
assert(html.includes('opacity: calc(.4 + var(--energy, 0) * .12)'));
console.log('PASS: light/dark toggle, remembered preference on reload, icon/label state, unavailable storage fallback, enhanced background opacity');

