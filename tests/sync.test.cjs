const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync('index.html','utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
let tick,emptied;const displayed=[];let now=100000;
const audio={paused:false,readyState:3,currentTime:100,buffered:{length:1,start:()=>90,end:()=>106},addEventListener(n,f){emptied=f}};
const ctx=vm.createContext({audio,Date:{parse:Date.parse,now:()=>now},Number,Image:class{},document:{querySelector:()=>({})},setInterval(f){tick=f},currentTrack:{title:'Old',start_time:'1970-01-01T00:01:00Z'},trackKey:t=>t.title+'|'+t.start_time,updateHistory(d){ctx.currentTrack=d.current_track;displayed.push(d.current_track.title)},artworkURL:()=>'',hideArtwork(){},preloadArtwork(){}});
vm.runInContext(script.slice(script.indexOf('let pendingTracks'),script.indexOf('async function updateTrack')),ctx);
const data={current_track:{title:'New',start_time:'1970-01-01T00:01:39Z'}};
ctx.syncTrack(data);assert.equal(displayed.length,0);
now=102000;ctx.syncTrack(data);assert.equal(vm.runInContext('pendingTracks.length',ctx),1);
audio.currentTime=106;tick();assert.equal(displayed.length,0);
audio.paused=true;audio.currentTime=107;tick();assert.equal(displayed.length,0);
audio.paused=false;tick();assert.deepEqual(displayed,['New']);
ctx.syncTrack({current_track:{title:'Next'}});assert.equal(vm.runInContext('pendingTracks.length',ctx),1);emptied();assert.equal(vm.runInContext('pendingTracks.length',ctx),0);
console.log('PASS: buffer-aware artwork delay, repeated polls preserve deadline, pause freezes updates, media-time transition, reset on reconnect');

