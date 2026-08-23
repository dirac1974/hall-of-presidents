var soundOff = localStorage.getItem("hop-mute") === "1";
var audioCtx = null;
function ensureAudio(){
  if (soundOff) return null;
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
document.addEventListener("pointerdown", function(){ ensureAudio(); }, {passive:true});

function tone(freq, t, dur, type, vol){
  var ctx = ensureAudio(); if (!ctx) return;
  var o = ctx.createOscillator();
  var g = ctx.createGain();
  o.type = type || "sine";
  o.frequency.setValueAtTime(freq, ctx.currentTime + t);
  g.gain.setValueAtTime(0.0001, ctx.currentTime + t);
  g.gain.linearRampToValueAtTime(vol || 0.07, ctx.currentTime + t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t + dur);
  o.connect(g); g.connect(ctx.destination);
  o.start(ctx.currentTime + t);
  o.stop(ctx.currentTime + t + dur + 0.03);
}
function cueCorrect(){ tone(660,0,.09,"triangle",.05); tone(880,.07,.1,"sine",.04); }
function cueCombo(n){
  if (n===3){ tone(523,0,.12); tone(659,.1,.12); tone(784,.2,.22); }
  else if (n===5){ tone(392,0,.1); tone(523,.1,.1); tone(659,.2,.1); tone(784,.32,.14); tone(1046,.46,.28); }
  else if (n===8){ tone(523,0,.1); tone(659,.08,.1); tone(784,.16,.1); tone(1046,.26,.14); tone(784,.42,.1); tone(1046,.54,.12); tone(1318,.68,.32,"triangle",.08); }
}
function cueParade(shine){
  var notes = shine ? [392,523,659,784,659,784,1046,1318] : [392,494,587,698,784];
  notes.forEach(function(f,i){ tone(f, i*0.13, 0.16, i===notes.length-1?"triangle":"sine", .06); });
}
function toggleSound(){
  soundOff = !soundOff;
  localStorage.setItem("hop-mute", soundOff ? "1" : "0");
  if (!soundOff) { ensureAudio(); cueCorrect(); }
  renderSoundChip();
}
function renderSoundChip(){
  var el = document.getElementById("sound-chip");
  if (el) el.textContent = soundOff ? "🔇" : "🔊";
}

function eraReady(era, minState){
  var prog = getActiveProgress();
  for (var n=era.a;n<=era.b;n++){
    if (!prog[n] || prog[n].state < minState) return false;
  }
  return true;
}
function marked(list, id){ return (list||[]).indexOf(id) !== -1; }
function mark(listName, id){
  var f = funStore();
  if (!f[listName]) f[listName] = [];
  if (f[listName].indexOf(id)===-1){ f[listName].push(id); saveStore(); }
}
function checkParades(){
  if (typeof ERAS==="undefined") return;
  var f = funStore();
  for (var i=0;i<ERAS.length;i++){
    var e = ERAS[i];
    if (eraReady(e,3) && !marked(f.shineWings, e.id)) {
      mark("shineWings", e.id);
      addStars(20);
      startParade(e, true);
      return;
    }
    if (eraReady(e,2) && !marked(f.solidWings, e.id)) {
      mark("solidWings", e.id);
      addStars(10);
      startParade(e, false);
      return;
    }
  }
}
function startParade(era, shine){
  var box = document.getElementById("parade");
  if (!box) return;
  var title = shine ? era.ico+" "+era.name+" wing is SHINING!" : era.ico+" "+era.name+" wing is marching!";
  var sub = shine ? "Every portrait in this room glows. +20 stars" : "This room is getting solid. +10 stars";
  document.getElementById("parade-title").textContent = title;
  document.getElementById("parade-sub").textContent = sub;
  var line = document.getElementById("parade-line");
  line.innerHTML = "";
  line.style.animation = "none";
  void line.offsetWidth;
  line.style.animation = "march 9s linear forwards";
  for (var n=era.a;n<=era.b;n++){
    var p = PRESIDENTS[n-1];
    var f = document.createElement("div");
    f.className = "float";
    var src = presImg(n, 200);
    f.innerHTML = (src? '<img src="'+src+'" alt="">' : '<div style="font-size:2rem">'+p.emoji+'</div>') +
      '<div class="fnum">#'+p.n+'</div><div class="fn">'+p.short+'</div>';
    line.appendChild(f);
  }
  box.classList.add("show");
  cueParade(shine);
  burst();
  var t = setTimeout(endParade, 9200);
  box.dataset.tid = t;
}
function endParade(){
  var box = document.getElementById("parade");
  if (!box) return;
  clearTimeout(Number(box.dataset.tid||0));
  box.classList.remove("show");
  if (typeof showHome==="function") showHome();
}

if (typeof recordCorrect === "function") {
  var _rc = recordCorrect;
  recordCorrect = function(p){
    _rc(p);
    cueCorrect();
    if (sessionCombo===3 || sessionCombo===5 || sessionCombo===8) cueCombo(sessionCombo);
    checkParades();
  };
}
renderSoundChip();
