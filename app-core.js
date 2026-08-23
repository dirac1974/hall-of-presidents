const AVATARS = ["🦁","🐻","🦊","🐼","🦄","🐸","🐧","🐯","🐨","🐙","🦋","🌟","🚀","🎈","🎨","📚"];
let store = { profiles: [], activeId: null, progress: {} };

function loadStore() {
  try {
    var raw = localStorage.getItem("presidents-palace-v2");
    if (raw) store = JSON.parse(raw);
    else {
      var old = localStorage.getItem("presidents-palace-v1");
      if (old) {
        var oldProgress = JSON.parse(old);
        var id = "migrated-" + Date.now();
        store.profiles = [{ id: id, name: "Player 1", avatar: "🌟", created: Date.now() }];
        store.activeId = id;
        store.progress = {};
        store.progress[id] = oldProgress;
        saveStore();
        localStorage.removeItem("presidents-palace-v1");
      }
    }
  } catch (e) {}
  if (!store.profiles) store.profiles = [];
  if (!store.progress) store.progress = {};
}
function saveStore() { localStorage.setItem("presidents-palace-v2", JSON.stringify(store)); }
function getActiveProgress() {
  if (!store.activeId) return {};
  if (!store.progress[store.activeId]) store.progress[store.activeId] = {};
  PRESIDENTS.forEach(function(p){
    if (!store.progress[store.activeId][p.n]) {
      store.progress[store.activeId][p.n] = { state: 0, consec: 0, introduced: false };
    }
  });
  return store.progress[store.activeId];
}
function getActiveProfile() {
  return store.profiles.find(function(p){ return p.id === store.activeId; }) || null;
}
function resetCurrentProfile() {
  if (!store.activeId) return;
  store.progress[store.activeId] = {};
  for (var i = 0; i < 3; i++) {
    if (PRESIDENTS[i]) store.progress[store.activeId][PRESIDENTS[i].n] = { state: 0, consec: 0, introduced: true };
  }
  saveStore();
}
function resetProgress(){ resetCurrentProfile(); }
function getSolidCount(){ return Object.values(getActiveProgress()).filter(function(s){ return s.state >= 2; }).length; }
function getShiningCount(){ return Object.values(getActiveProgress()).filter(function(s){ return s.state >= 3; }).length; }
function getIntroducedCount(){ return Object.values(getActiveProgress()).filter(function(s){ return s.introduced; }).length; }
function nextToIntroduce(){
  var prog = getActiveProgress();
  for (var i=0;i<PRESIDENTS.length;i++){ if (!prog[PRESIDENTS[i].n].introduced) return PRESIDENTS[i]; }
  return null;
}
function getCooking(){
  var prog = getActiveProgress();
  return PRESIDENTS.filter(function(p){ return prog[p.n].introduced && prog[p.n].state < 2; }).slice(0,3);
}
function stateLabel(s){ return ["new","practicing","getting solid","shining"][s] || "new"; }
function stateClass(s){ return ["new","practicing","solid","shining"][s] || "new"; }

function renderHall(){
  var hall = document.getElementById("hall");
  hall.innerHTML = "";
  var prog = getActiveProgress();
  PRESIDENTS.forEach(function(p){
    var st = prog[p.n];
    var div = document.createElement("div");
    div.className = "portrait state-"+st.state;
    div.innerHTML = '<div class="num">#'+p.n+'</div><div class="name">'+p.short+'</div><div class="status status-'+stateClass(st.state)+'">'+stateLabel(st.state)+'</div>';
    div.onclick = function(){
      if (st.introduced || st.state > 0) showLearnCard(p, true);
      else toast("This portrait is still waiting to be placed!", "warm");
    };
    hall.appendChild(div);
  });
}
function renderPips(){
  var solid = getSolidCount();
  var pips = document.getElementById("pips");
  pips.innerHTML = "";
  for (var i=0;i<10;i++){
    var pip = document.createElement("div");
    pip.className = "pip" + (i < solid ? " filled" : "");
    pips.appendChild(pip);
  }
}
function updateMission(){
  var solid = getSolidCount();
  var next = nextToIntroduce();
  var cooking = getCooking();
  var text = "";
  if (solid >= 10) text = "🎉 <strong>"+solid+" presidents getting solid!</strong> Keep shining!";
  else if (cooking.length > 0) text = "Keep practicing <strong>"+cooking.map(function(p){return "#"+p.n+" "+p.short;}).join(", ")+"</strong> until they get solid.";
  else if (next) text = "Ready for the next one? Let’s place <strong>#"+next.n+" "+next.short+"</strong> in the palace!";
  else text = "All portraits are shining! You are a true Memory Builder. 🌟";
  document.getElementById("mission-text").innerHTML = text;
}
function updateCurrentKidBadge(){
  var profile = getActiveProfile();
  var badge = document.getElementById("current-kid-badge");
  if (profile) { badge.innerHTML = '<span class="av">'+profile.avatar+'</span> '+profile.name; badge.style.display = "inline-flex"; }
  else badge.style.display = "none";
}
function toast(msg, type){
  var t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "show " + (type||"");
  setTimeout(function(){ t.className = ""; }, 2600);
}
function showScreen(id){
  document.querySelectorAll(".screen").forEach(function(s){ s.classList.remove("active"); });
  document.getElementById(id).classList.add("active");
  var nav = document.getElementById("main-nav");
  nav.style.display = (id==="screen-home"||id==="screen-learn"||id==="screen-practice"||id==="screen-parent") ? "flex" : "none";
  document.querySelectorAll("nav button").forEach(function(b){ b.classList.remove("active"); });
  if (id==="screen-home") document.getElementById("nav-home").classList.add("active");
  if (id==="screen-learn") document.getElementById("nav-learn").classList.add("active");
  if (id==="screen-practice") document.getElementById("nav-practice").classList.add("active");
}
function showHome(){
  if (!store.activeId) { showProfiles(); return; }
  renderHall(); renderPips(); updateMission(); updateCurrentKidBadge();
  showScreen("screen-home");
}
function showProfiles(){
  var grid = document.getElementById("profile-grid");
  grid.innerHTML = "";
  store.profiles.forEach(function(p){
    var card = document.createElement("div");
    card.className = "profile-card";
    card.innerHTML = '<div class="avatar">'+p.avatar+'</div><div class="pname">'+p.name+'</div>';
    card.onclick = function(){
      store.activeId = p.id; saveStore();
      var prog = getActiveProgress();
      var anyIntro = Object.values(prog).some(function(s){ return s.introduced; });
      if (!anyIntro) {
        for (var i=0;i<3;i++){ if (PRESIDENTS[i]) prog[PRESIDENTS[i].n].introduced = true; }
        saveStore();
      }
      showHome();
    };
    grid.appendChild(card);
  });
  showScreen("screen-profiles");
}
function showCreateProfile(){
  document.getElementById("new-name").value = "";
  var choices = document.getElementById("avatar-choices");
  choices.innerHTML = "";
  var selected = AVATARS[0];
  AVATARS.forEach(function(a){
    var span = document.createElement("span");
    span.textContent = a;
    if (a===selected) span.classList.add("selected");
    span.onclick = function(){
      selected = a;
      choices.dataset.selected = a;
      choices.querySelectorAll("span").forEach(function(s){ s.classList.remove("selected"); });
      span.classList.add("selected");
    };
    choices.appendChild(span);
  });
  choices.dataset.selected = selected;
  showScreen("screen-create");
}
function createProfile(){
  var name = document.getElementById("new-name").value.trim() || "Memory Builder";
  var avatar = document.getElementById("avatar-choices").dataset.selected || "🌟";
  var id = "p" + Date.now();
  store.profiles.push({ id:id, name:name, avatar:avatar, created: Date.now() });
  store.activeId = id;
  store.progress[id] = {};
  for (var i=0;i<3;i++){
    if (PRESIDENTS[i]) store.progress[id][PRESIDENTS[i].n] = { state:0, consec:0, introduced:true };
  }
  saveStore();
  toast("Welcome, "+name+"! Your Hall is ready.", "success");
  setTimeout(showHome, 800);
}
function showParent(){
  var profile = getActiveProfile();
  document.getElementById("stats-text").innerHTML =
    "<strong>"+(profile ? profile.avatar+" "+profile.name : "Current kid")+"</strong><br><br>" +
    "Introduced: "+getIntroducedCount()+" / 47<br>Getting solid (≥2): "+getSolidCount()+"<br>Shining (mastered): "+getShiningCount()+
    "<br><br><em>Kids never see these numbers. Their view is only soft pips and glowing portraits.</em>";
  showScreen("screen-parent");
}
