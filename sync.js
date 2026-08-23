var SB_URL = "https://digcgqltrlmhgmzgmvwc.supabase.co";
var SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpZ2NncWx0cmxtaGdtemdtdndjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1ODY4NjEsImV4cCI6MjA4OTE2Mjg2MX0.suxy0jXsIJqrJYbQuCc54sHbN5miCICxLUdOc9gUTkY";
var cloudTimer = null;

function slugName(s){
  return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,18) || "player";
}
function sbHeaders(extra){
  var h = {
    apikey: SB_KEY,
    Authorization: "Bearer "+SB_KEY,
    "Content-Type": "application/json",
    Prefer: "return=representation"
  };
  if (extra) Object.keys(extra).forEach(function(k){ h[k] = extra[k]; });
  return h;
}
function cloudGet(username){
  return fetch(SB_URL+"/rest/v1/hop_players?username=eq."+encodeURIComponent(username), { headers: sbHeaders() })
    .then(function(r){ return r.json(); })
    .then(function(rows){ return (rows && rows[0]) || null; })
    .catch(function(){ return null; });
}
function payloadForActive(){
  var p = getActiveProfile();
  if (!p) return null;
  if (!p.username) p.username = slugName(p.name);
  return {
    username: p.username,
    display_name: p.name,
    avatar: p.avatar || "🌟",
    pin: p.pin || null,
    progress: store.progress[p.id] || {},
    fun: (store.fun && store.fun[p.id]) || {},
    updated_at: new Date().toISOString()
  };
}
function cloudSaveActive(){
  var body = payloadForActive();
  if (!body) return;
  fetch(SB_URL+"/rest/v1/hop_players", {
    method: "POST",
    headers: sbHeaders({ Prefer: "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify(body)
  }).catch(function(){});
}
function scheduleCloudSave(){
  clearTimeout(cloudTimer);
  cloudTimer = setTimeout(cloudSaveActive, 700);
}
if (typeof saveStore === "function") {
  var _save = saveStore;
  saveStore = function(){
    _save();
    scheduleCloudSave();
  };
}
function applyCloudRow(row){
  var id = "u-"+row.username;
  var existing = store.profiles.find(function(p){ return p.id === id || p.username === row.username; });
  if (existing) {
    existing.name = row.display_name;
    existing.avatar = row.avatar;
    existing.username = row.username;
    existing.pin = row.pin || "";
    id = existing.id;
  } else {
    store.profiles.push({ id:id, name:row.display_name, avatar:row.avatar, username:row.username, pin:row.pin||"", created: Date.now() });
  }
  store.activeId = id;
  store.progress[id] = row.progress || {};
  if (!store.fun) store.fun = {};
  store.fun[id] = row.fun || {};
  var rawSave = _save || function(){ localStorage.setItem("presidents-palace-v2", JSON.stringify(store)); };
  rawSave();
}
function createProfile(){
  var name = document.getElementById("new-name").value.trim() || "Memory Builder";
  var avatar = document.getElementById("avatar-choices").dataset.selected || "🌟";
  var pin = (document.getElementById("new-pin") && document.getElementById("new-pin").value.trim()) || "";
  var username = slugName(name);
  cloudGet(username).then(function(exists){
    if (exists) {
      toast("That name is already saved. Use Find my Hall.", "warm");
      return;
    }
    var id = "u-"+username;
    store.profiles.push({ id:id, name:name, avatar:avatar, username:username, pin:pin, created: Date.now() });
    store.activeId = id;
    store.progress[id] = {};
    for (var i=0;i<3;i++){
      if (PRESIDENTS[i]) store.progress[id][PRESIDENTS[i].n] = { state:0, consec:0, introduced:true };
    }
    saveStore();
    toast("Welcome, "+name+"! Hall saved as "+username, "success");
    setTimeout(showHome, 700);
  });
}
function findHall(){
  var input = document.getElementById("find-user");
  var username = slugName(input && input.value);
  if (!username || username==="player") { toast("Type the saved player name", "warm"); return; }
  toast("Looking for "+username+"…");
  cloudGet(username).then(function(row){
    if (!row) { toast("No Hall found for that name", "warm"); return; }
    if (row.pin) {
      var pin = window.prompt("Enter the family PIN for "+row.display_name);
      if (pin !== row.pin) { toast("PIN did not match", "warm"); return; }
    }
    applyCloudRow(row);
    toast("Welcome back, "+row.display_name+"!", "success");
    setTimeout(showHome, 500);
  });
}
