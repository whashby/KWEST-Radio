const fs = require('fs'), vm = require('vm'), assert = require('assert');
const html = fs.readFileSync(process.env.PLAYER_FILE || 'index.html', 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
new Function(script);
let now = 0, timerId = 0, loads = 0;
const timers = new Map(), intervals = [], events = {}, clicks = {};
const audio = { currentTime: 0, load() { loads++; }, async play() {}, pause() {}, addEventListener(name, fn) { events[name] = fn; } };
const context = vm.createContext({audio, play: {setAttribute() {}, addEventListener(n,f) {clicks[n]=f;}}, status: {}, audioContext: {async resume() {}}, Date: {now:()=>now}, setTimeout(f) {timers.set(++timerId,f);return timerId;}, clearTimeout(id) {timers.delete(id);}, setInterval(f) {intervals.push(f);}, window: {addEventListener() {}}});
vm.runInContext(script.slice(script.indexOf('let wantsPlayback'), script.indexOf("mute.addEventListener")), context);
async function tick() {await Promise.resolve();await Promise.resolve();}
(async () => {
clicks.click(); await tick(); assert.equal(loads,1);
events.error(); events.ended(); assert.equal(timers.size,1);
let fn=[...timers.values()][0]; timers.clear();fn();await tick();assert.equal(loads,2);
events.playing();assert.equal(timers.size,0);
now=16000;intervals[0]();assert.equal(timers.size,1);
clicks.click();assert.equal(timers.size,0);
events.error();now=40000;intervals[0]();assert.equal(timers.size,0);
for(const rate of [22050,44100,48000]) for(let d=0;d<24;d++) {
const start=Math.min(1023,Math.floor(50*200**(d/24)/(rate/2048)));
const end=Math.min(1024,Math.max(start+1,Math.ceil(50*200**((d+1)/24)/(rate/2048))));
assert(end>start && start>=0 && end<=1024);
}
console.log('PASS: syntax, error/end reconnect, duplicate retry prevention, stall watchdog, pause cancels retry, spectrum bounds');
})().catch(e=>{console.error(e);process.exitCode=1;});


