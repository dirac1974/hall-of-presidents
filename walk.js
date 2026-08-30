var walkRoom = 1, walkRun = 0, walkUntil = 47;
var lineTarget = [], linePicked = [];
var walkTimer = null;

function leaveWalk(){
  if (walkTimer) { clearTimeout(walkTimer); walkTimer = null; }
  showHome();
}

if (typeof showScreen === "function") {
  var _show = showScreen;
  showScreen = function(id){
    _show(id);
    var nav = document.getElementById("main-nav");
    if (nav && (id==="screen-walk" || id==="screen-line" || id==="screen-howto" || id==="screen-home" || id==="screen-test")) {
      nav.style.display = "flex";
    }
  };
}
function bumpGood(p){
  var st = getActiveProgress()[p.n];
  st.introduced = true;
  st.consec = (st.consec || 0) + 1;
  if (st.state === 0) st.state = 1;
  if (st.state === 1 && st.consec >= 2) st.state = 2;
  if (st.state === 2 && st.consec >= 3) st.state = 3;
  saveStore();
  if (typeof sessionCombo !== "undefined") sessionCombo += 1;
  if (typeof addStars === "function") addStars(1);
  if (typeof cueCorrect === "function") cueCorrect();
  if (typeof renderPlayHud === "function") renderPlayHud();
  if (typeof checkParades === "function") checkParades();
}
function bumpMiss(p){
  getActiveProgress()[p.n].consec = 0;
  saveStore();
  if (typeof sessionCombo !== "undefined") sessionCombo = 0;
  if (typeof renderPlayHud === "function") renderPlayHud();
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
  var any = PRESIDENTS.some(function(p){ return getActiveProgress()[p.n].introduced; });
  if (!any) { startLearn(); return; }
  startWalkFrom(firstUnlit().n, 47);
}
function startZoneWalk(zone){
  if (!zone) return startWalk();
  toast("Training "+zone.name+" · #"+zone.a+"–#"+zone.b, "success");
  startWalkFrom(zone.a, zone.b);
}
function startWalkFrom(fromN, untilN){
  if (walkTimer) { clearTimeout(walkTimer); walkTimer = null; }
  walkRoom = Math.max(1, fromN || 1);
  walkUntil = untilN || 47;
  walkRun = 0;
  renderWalk();
}
function renderWalk(){
  if (walkRoom > walkUntil) {
    toast("That zone is done. Back to the Hall.", "success");
    if (typeof burst==="function") burst();
    showHome();
    return;
  }
  var p = PRESIDENTS[walkRoom-1];
  if (!p) { toast("You walked the whole palace!", "success"); if (typeof burst==="function") burst(); showHome(); return; }
  var st = getActiveProgress()[p.n];
  if (!st.introduced) {
    st.introduced = true;
    saveStore();
  }
  document.getElementById("walk-title").textContent = "Room #"+p.n;
  var pic = imgTag(p.n, 500, "width:100%;height:150px;object-fit:cover;display:block;");
  document.getElementById("walk-card").innerHTML =
    '<div class="door" id="the-door"><div class="door-num">#'+p.n+'</div>' +
    '<div class="door-face">'+(pic || '<div style="font-size:3rem">'+p.emoji+'</div>')+'</div>' +
    '<div class="door-knob"></div></div>' +
    '<p class="walk-prompt">Who lives in this picture?</p><div class="options" id="walk-opts"></div>';
  generateOptions(p).forEach(function(opt){
    var b = document.createElement("div");
    b.className = "opt"; b.textContent = opt.label;
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
    bumpGood(p);
    walkRun += 1;
    toast("#"+p.n+" "+p.short+" — the path continues", "success");
    walkTimer = setTimeout(function(){
      walkTimer = null;
      walkRoom += 1;
      renderWalk();
    }, 1050);
  } else {
    btn.classList.add("wrong");
    bumpMiss(p);
    toast("Picture it: "+p.mnemonic, "warm");
    walkTimer = setTimeout(function(){ walkTimer = null; showLearnCard(p); }, 1100);
  }
}
function startLineUp(){
  var intro = PRESIDENTS.filter(function(p){ return getActiveProgress()[p.n].introduced; });
  if (intro.length < 4) { toast("Place 4 portraits first, then line them up!", "warm"); startLearn(); return; }
  if (walkTimer) { clearTimeout(walkTimer); walkTimer = null; }
  var startAt = Math.max(0, Math.min(firstUnlit().n-1, intro.length-4));
  lineTarget = PRESIDENTS.slice(startAt, startAt+4);
  linePicked = [];
  var pool = document.getElementById("line-pool");
  pool.innerHTML = ""; pool.dataset.built = "";
  renderLine();
}
function renderLine(){
  document.getElementById("line-title").textContent = "Line them up · #"+lineTarget[0].n+"–#"+lineTarget[3].n;
  var slots = document.getElementById("line-slots");
  slots.innerHTML = "";
  linePicked.forEach(function(p){
    var c = document.createElement("div"); c.className = "chip"; c.textContent = "#"+p.n+" "+p.short; slots.appendChild(c);
  });
  var pool = document.getElementById("line-pool");
  if (!pool.dataset.built) {
    var mix = lineTarget.slice().sort(function(){ return Math.random()-0.5; });
    mix.forEach(function(p){
      var d = document.createElement("div");
      d.className = "line-card"; d.dataset.n = p.n;
      d.innerHTML = (imgTag(p.n, 220, "width:100%;height:78px;object-fit:cover;border-radius:8px;display:block;margin-bottom:4px;") || '<div style="font-size:2rem">'+p.emoji+'</div>') + p.short;
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
    bumpMiss(need);
    toast("Next is #"+need.n+". Picture "+need.mnemonic, "warm");
    return;
  }
  el.className = "line-card used";
  linePicked.push(p);
  bumpGood(p);
  if (linePicked.length === 4) {
    document.getElementById("line-pool").dataset.built = "";
    toast("Perfect order! The hallway is clear.", "success");
    if (typeof burst==="function") burst();
    walkTimer = setTimeout(function(){ walkTimer = null; showHome(); }, 1100);
  } else renderLine();
}
