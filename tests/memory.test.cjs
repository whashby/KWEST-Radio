const fs = require('fs'), vm = require('vm'), assert = require('assert');
const script = fs.readFileSync('index.html', 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];

// Visualizer allocates one backing store/gradient per size and no idle frames.
{
  let nextId = 0, gradients = 0;
  const frames = new Map(), audioEvents = {}, windowEvents = {}, documentEvents = {};
  const audio = { paused: true, addEventListener(name, fn) { audioEvents[name] = fn; } };
  const canvas = { clientWidth: 100, clientHeight: 40, width: 0, height: 0 };
  const document = { hidden: false, addEventListener(name, fn) { documentEvents[name] = fn; } };
  const ctx = { setTransform(){}, clearRect(){}, fillRect(){}, createLinearGradient() { gradients++; return { addColorStop(){} }; } };
  const context = vm.createContext({audio,canvas,document,ctx,screen:{style:{setProperty(){}}},window:{devicePixelRatio:4,addEventListener(name,fn){windowEvents[name]=fn;}},analyser:null,frequencies:null,requestAnimationFrame(fn){frames.set(++nextId,fn);return nextId;},cancelAnimationFrame(id){frames.delete(id);}});
  vm.runInContext(script.slice(script.indexOf('let animationFrame'),script.indexOf('const autoplay =')),context);
  assert.equal(frames.size,0); assert.equal(canvas.width,200); assert.equal(canvas.height,80);
  audio.paused=false; audioEvents.playing(); assert.equal(frames.size,1);
  const [id,fn]=[...frames][0]; frames.delete(id);fn();assert.equal(gradients,1);
  audio.paused=true;audioEvents.pause();assert.equal(frames.size,0);
  audio.paused=false;audioEvents.playing();document.hidden=true;documentEvents.visibilitychange();assert.equal(frames.size,0);
  document.hidden=false;documentEvents.visibilitychange();assert.equal(frames.size,1);
  canvas.clientWidth=120;windowEvents.resize();assert.equal(gradients,2);assert.equal(frames.size,1);
}

// Closing the playlist releases all rows (and their image elements).
{
  let toggle;
  const playlist={open:false,addEventListener(name,fn){toggle=fn;}};
  const list={children:[],append(child){this.children.push(child);},replaceChildren(){this.children=[];}};
  const element=()=>({append(){},remove(){}});
  const context=vm.createContext({document:{querySelector:s=>s==='.recent'?playlist:list,createElement:element},recentTracks:Array.from({length:200},(_,i)=>({title:'Track '+i})),artworkURL:()=>'',trackTime:()=>''});
  vm.runInContext(script.slice(script.indexOf('function renderHistory()'),script.indexOf('let updatingTrack')),context);
  assert.equal(list.children.length,0);
  playlist.open=true;toggle();assert.equal(list.children.length,200);
  playlist.open=false;toggle();assert.equal(list.children.length,0);
  playlist.open=true;toggle();assert.equal(list.children.length,200);
}

// Replacing an in-flight artwork preload releases its handlers and source.
{
  const images=[];
  class Image { constructor(){images.push(this);} removeAttribute(){this.src='';} }
  const artwork={src:'current',hidden:false};
  const context=vm.createContext({Image,artwork,hideArtwork(){}});
  vm.runInContext(script.slice(script.indexOf("let pendingArtwork"),script.indexOf('function trackKey')),context);
  context.preloadArtwork('first');const first=images[0];const staleCallback=first.onload;
  context.preloadArtwork('second');assert.equal(first.onload,null);assert.equal(first.src,'');
  staleCallback();assert.equal(artwork.src,'current');
  images[1].onload();assert.equal(artwork.src,'second');
  assert.equal(vm.runInContext('pendingImage',context),null);
}
console.log('PASS: idle visualizer stops, gradient reused, DPI capped, playlist rows released, obsolete preloads cleared');
