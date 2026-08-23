var walkRoom = 1, walkRun = 0;
var lineTarget = [], linePicked = [];

if (typeof showScreen === "function") {
  var _show = showScreen;
  showScreen = function(id){
    _show(id);
    if (id==="screen-walk" || id==="screen-line") {
      document.getElementById("main-nav").style.display = "flex";
    }
  };
}
function firstUnlit(){
  var prog = getActiveProgress();
  for (var i=0;i<PRESIDENTS.length;i++){
    var st = prog[PRESIDENTS[i].n];
    if (!st.introduced || st.state < 2) return PRESIDENTS[i];
  }
  return PRESIDENTS[0];
}
function startWalk(){
  var pool = PRESIDENTS.filter(function(p){ return getActiveProgress()[p.n].introduced; });
  if (pool.length < 1) { startLearn(); return; }
  walkRoom = firstUnlit().n;
  walkRun = 0;
  renderWalk();
}
function renderWalk(){
  var p = PRESIDENTS[walkRoom-1];
  if (!p) { toast("You walked the whole palace!", "success"); if (typeof burst==="function") burst(); showHome(); return; }
  var prog = getActiveProgress();
  if (!prog[p.n].introduced) {
    toast("A new door. Place this portrait first.", "warm");
    showLearnCard(p);
    return;
  }
  document.getElementById("walk-title").textContent = "Room #"+p.n;
  var src = presImg(p.n, 500);
  var card = document.getElementById("walk-card");
  card.innerHTML =
    '<div class="door" id="the-door"><div class="door-num">#'+p.n+'</div>' +
    '<div class="door-face">'+(src?'<img id="door-art" src="'+src+'" alt="">':'<div style="font-size:3rem">'+p.emoji+'</div>')+'</div>' +
    '<div class="door-knob"></div></div>' +
    '<p class="walk-prompt">Who lives behind this door?</p>' +
    '<div class="options" id="walk-opts"></div>';
  generateOptions(p).forEach(function(opt){
    var b = document.createElement("div");
    b.className = "opt";
    b.textContent = opt.label;
    b.onclick = function(){ answerWalk(opt.correct, b, p); };
    document.getElementById("walk-opts").appendChild(b);
  });
  showScreen("screen-walk");
}
function answerWalk(ok, btn, p){
  document.querySelectorAll("#walk-opts .opt").forEach(function(o){ o.style.pointerEvents="none"; });
  if (ok) {
    btn.classList.add("correct");
    document.getElementById("the-door").classList.add("open");
    if (typeof recordCorrect==="function") recordCorrect(p);
    walkRun += 1;
    toast("#"+p.n+" "+p.short+" — the path continues", "success");
    setTimeout(function(){
      if (walkRun >= 6) { toast("Great walk! Rest in the Hall.", "success"); showHome(); }
      else { walkRoom += 1; renderWalk(); }
    }, 1100);
  } else {
    btn.classList.add("wrong");
    if (typeof recordMiss==="function") recordMiss(p);
    toast("Picture it: "+p.mnemonic, "warm");
    setTimeout(function(){ showLearnCard(p); }, 1200);
  }
}
function startLineUp(){
  var intro = PRESIDENTS.filter(function(p){ return getActiveProgress()[p.n].introduced; });
  if (intro.length < 4) { toast("Place 4 portraits first, then line them up!", "warm"); startLearn(); return; }
  var maxStart = intro.length - 4;
  var startAt = Math.min(firstUnlit().n-1, maxStart);
  if (startAt < 0) startAt = 0;
  lineTarget = PRESIDENTS.slice(startAt, startAt+4);
  linePicked = [];
  renderLine();
}
function renderLine(){
  document.getElementById("line-title").textContent = "Line them up: #"+lineTarget[0].n+"–#"+lineTarget[3].n;
  var slots = document.getElementById("line-slots");
  slots.innerHTML = "";
  linePicked.forEach(function(p){
    var c = document.createElement("div");
    c.className = "chip";
    c.textContent = "#"+p.n+" "+p.short;
    slots.appendChild(c);
  });
  var pool = document.getElementById("line-pool");
  if (!pool.dataset.built) {
    pool.innerHTML = "";
    var shuffle = lineTarget.slice().sort(function(){ return Math.random()-0.5; });
    shuffle.forEach(function(p){
      var d = document.createElement("div");
      d.className = "line-card";
      d.dataset.n = p.n;
      var src = presImg(p.n, 240);
      d.innerHTML = (src?'<img src="'+src+'" alt="">':'<div style="font-size:2rem">'+p.emoji+'</div>')+p.short;
      d.onclick = function(){ pickLine(p, d); };
      pool.appendChild(d);
    });
    pool.dataset.built = "1";
  }
  showScreen("screen-line");
}
function pickLine(p, el){
  var need = lineTarget[linePicked.length];
  if (p.n !== need.n) {
    el.classList.add("bad");
    setTimeout(function(){ el.classList.remove("bad"); }, 360);
    toast("Next is #"+need.n+". Picture "+need.mnemonic, "warm");
    if (typeof recordMiss==="function") recordMiss(need);
    return;
  }
  el.className = "line-card used";
  linePicked.push(p);
  if (typeof recordCorrect==="function") recordCorrect(p);
  if (linePicked.length === 4) {
    document.getElementById("line-pool").dataset.built = "";
    toast("Perfect order! The hallway is clear.", "success");
    if (typeof burst==="function") burst();
    setTimeout(showHome, 1200);
  } else {
    renderLine();
  }
}
