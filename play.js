var ERAS = [
  { id:"founders", name:"Founders", ico:"🏰", a:1, b:8 },
  { id:"growing", name:"Growing", ico:"🌳", a:9, b:16 },
  { id:"union", name:"Union", ico:"⚖️", a:17, b:24 },
  { id:"century", name:"Century", ico:"🚂", a:25, b:32 },
  { id:"world", name:"World", ico:"🌍", a:33, b:40 },
  { id:"now", name:"Now", ico:"🚀", a:41, b:47 }
];
var ZONES = [
  { id:"early", name:"Early", label:"1–12", a:1, b:12 },
  { id:"union", name:"Union", label:"13–24", a:13, b:24 },
  { id:"century", name:"Century", label:"25–36", a:25, b:36 },
  { id:"now", name:"Now", label:"37–47", a:37, b:47 }
];
var sessionCombo = 0;

function todayKey(){
  var d = new Date();
  return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
}
function funStore(){
  if (!store.fun) store.fun = {};
  if (!store.activeId) return { stars:0, best:0, day:"", q:0, goal:3, kind:"correct" };
  if (!store.fun[store.activeId]) {
    store.fun[store.activeId] = { stars:0, best:0, day:"", q:0, goal:3, kind:"correct" };
  }
  var f = store.fun[store.activeId];
  if (f.day !== todayKey()) {
    var kinds = ["correct","place","solid"];
    f.kind = kinds[Math.floor(Math.random()*kinds.length)];
    f.goal = f.kind==="solid" ? 1 : 3;
    f.q = 0;
    f.day = todayKey();
    saveStore();
  }
  return f;
}
function questLabel(f){
  if (f.kind==="place") return "Today’s quest: place "+f.goal+" new portraits";
  if (f.kind==="solid") return "Today’s quest: make "+f.goal+" portrait solid";
  return "Today’s quest: get "+f.goal+" practice answers right";
}
function addStars(n){
  var f = funStore();
  f.stars = (f.stars||0) + n;
  saveStore();
}
function bumpQuest(kind, n){
  var f = funStore();
  if (f.kind !== kind) return;
  if (f.q >= f.goal) return;
  f.q = Math.min(f.goal, (f.q||0) + (n||1));
  saveStore();
  if (f.q >= f.goal) {
    addStars(8);
    toast("Quest complete! +8 stars ⭐", "success");
    burst();
  }
}
function burst(){
  var box = document.createElement("div");
  box.className = "burst";
  document.body.appendChild(box);
  var bits = ["⭐","✨","🌟","🎉","👑"];
  for (var i=0;i<14;i++){
    var s = document.createElement("span");
    s.className = "spark";
    s.textContent = bits[i%bits.length];
    s.style.left = (40+Math.random()*20)+"%";
    s.style.top = "55%";
    s.style.setProperty("--dx", (Math.random()*240-120)+"px");
    s.style.setProperty("--dy", (-80-Math.random()*160)+"px");
    box.appendChild(s);
  }
  setTimeout(function(){ box.remove(); }, 950);
}
function eraOpen(era){
  var prog = getActiveProgress();
  for (var n=era.a; n<=era.b; n++){
    if (!prog[n] || !prog[n].introduced) return false;
  }
  return true;
}
function renderPlayHud(){
  var f = funStore();
  var sc = document.getElementById("star-count");
  if (sc) sc.textContent = f.stars||0;
  var cc = document.getElementById("combo-count");
  var chip = document.getElementById("combo-chip");
  if (cc) cc.textContent = sessionCombo;
  if (chip) chip.className = sessionCombo>=2 ? "hud-chip on" : "hud-chip";
  var dq = document.getElementById("daily-quest");
  if (dq){
    var pct = Math.min(100, Math.round(100*(f.q||0)/f.goal));
    dq.innerHTML = questLabel(f) + " · "+(f.q||0)+"/"+f.goal +
      '<div class="bar"><span style="width:'+pct+'%"></span></div>';
  }
  var row = document.getElementById("era-row");
  if (row){
    row.innerHTML = "";
    ERAS.forEach(function(e){
      var open = eraOpen(e);
      var d = document.createElement("div");
      d.className = "era"+(open?" open":"");
      d.innerHTML = '<span class="eico">'+(open?e.ico:"🔒")+'</span>'+e.name;
      d.onclick = function(){
        var hall = document.getElementById("hall");
        var card = hall && hall.children[e.a-1];
        if (card) card.scrollIntoView({behavior:"smooth", inline:"center"});
        toast(open ? (e.ico+" "+e.name+" wing is open!") : ("Place presidents #"+e.a+"–#"+e.b+" to open "+e.name), open?"success":"warm");
      };
      row.appendChild(d);
    });
  }
  var zones = document.getElementById("zone-row");
  if (zones){
    zones.innerHTML = "";
    ZONES.forEach(function(z){
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn secondary zone-btn";
      b.textContent = z.name+" · #"+z.label;
      b.onclick = function(){ startZoneWalk(z); };
      zones.appendChild(b);
    });
  }
}

if (typeof updateMission === "function") {
  var _mission = updateMission;
  updateMission = function(){
    _mission();
    renderPlayHud();
  };
}
if (typeof recordCorrect === "function") {
  var _ok = recordCorrect;
  recordCorrect = function(p){
    sessionCombo += 1;
    var f = funStore();
    if (sessionCombo > (f.best||0)) { f.best = sessionCombo; saveStore(); }
    addStars(sessionCombo>=5 ? 3 : 1);
    bumpQuest("correct", 1);
    var before = getActiveProgress()[p.n].state;
    _ok(p);
    var after = getActiveProgress()[p.n].state;
    if (after>=2 && before<2) bumpQuest("solid", 1);
    if (sessionCombo===3) { toast("3 in a row! Keep the picture moving!", "success"); burst(); }
    if (sessionCombo===5) { toast("5 combo! The palace is lighting up!", "success"); burst(); }
    if (sessionCombo===8) { toast("8 combo! Memory champion energy!", "success"); burst(); addStars(5); }
    renderPlayHud();
  };
}
if (typeof recordMiss === "function") {
  var _miss = recordMiss;
  recordMiss = function(p){
    sessionCombo = 0;
    _miss(p);
    renderPlayHud();
  };
}
if (typeof showLearnCard === "function") {
  var _learn = showLearnCard;
  showLearnCard = function(p){
    var was = !!(getActiveProgress()[p.n] && getActiveProgress()[p.n].introduced);
    _learn(p);
    if (!was) { addStars(1); bumpQuest("place", 1); }
  };
}
