const fs=require('fs'),vm=require('vm'),assert=require('assert');
const script=fs.readFileSync(process.env.PLAYER_FILE || 'index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
function setup(){
 let now=0,id=0,seconds=0,plays=0,loads=0;const intervals=new Map(),timeouts=new Map();
 const audio={currentTime:0,readyState:3,buffered:{length:1,start:()=>0,end:()=>seconds},load(){loads++},async play(){plays++},pause(){},addEventListener(){}};
 const c=vm.createContext({audio,play:{setAttribute(){},addEventListener(){}},status:{},Date:{now:()=>now},audioContext:{async resume(){}},window:{addEventListener(){}},setInterval(f){intervals.set(++id,f);return id},clearInterval(id){intervals.delete(id)},setTimeout(f){timeouts.set(++id,f);return id},clearTimeout(id){timeouts.delete(id)}});
 vm.runInContext(script.slice(script.indexOf('let wantsPlayback'),script.indexOf("mute.addEventListener")),c);
 vm.runInContext('wantsPlayback=true',c);
 return {c,audio,intervals,timeouts,set seconds(v){seconds=v},set now(v){now=v},get plays(){return plays},get loads(){return loads},tick(){for(const f of [...intervals.values()])f()}};
}
async function settle(){for(let i=0;i<10;i++)await Promise.resolve()}
(async()=>{
 const ready=setup();const done=ready.c.connect(true);await settle();assert.equal(ready.loads,1);assert.equal(ready.plays,0);assert.equal(ready.audio.preload,'auto');ready.seconds=2;ready.tick();await settle();assert.equal(ready.plays,0);ready.seconds=3;ready.tick();await done;assert.equal(ready.plays,1);
 const cancel=setup();const stopped=cancel.c.connect(true);vm.runInContext('wantsPlayback=false;++attempt',cancel.c);cancel.tick();await stopped;assert.equal(cancel.plays,0);
 const partial=setup();const fallback=partial.c.connect(true);partial.seconds=1;partial.now=12001;partial.tick();await fallback;assert.equal(partial.plays,1);
 const empty=setup();empty.audio.readyState=0;const failed=empty.c.connect(true);empty.now=12001;empty.tick();await failed;assert.equal(empty.plays,0);assert.equal(empty.timeouts.size,1);
 console.log('PASS: three-second prebuffer before autoplay, pause cancellation, bounded fallback, empty-stream retry');
})().catch(e=>{console.error(e);process.exitCode=1});


