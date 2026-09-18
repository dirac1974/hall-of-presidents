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
function sbRpc(fn, args, token){
  return fetch(SB_URL+"/rest/v1/rpc/"+fn, {
    method: "POST",
    headers: {
      apikey: SB_KEY,
      Authorization: "Bearer "+(token || SB_KEY),
      "Content-Type": "application/json"
    },
    body: JSON.stringify(args || {})
  }).then(function(r){ return r.ok ? r.json() : null; });
}
function cloudGet(username){
  return sbRpc("yomple_player_find", { p_table: "hop_players", p_username: username })
    .catch(function(){ return null; });
}
/* Rows come back without a PIN. When one is set the PIN must be typed, and the
   server compares it; the typed PIN is then cached locally as before. */
function yompleClaim(table, row){
  if (!row) return Promise.resolve(null);
  if (!row.has_pin) return Promise.resolve(row);
  var typed = null;
  try { typed = window.prompt("Enter the family PIN for "+(row.display_name || row.username)); } catch (e) {}
  if (!typed) return Promise.resolve(null);
  return sbRpc("yomple_player_claim", { p_table: table, p_username: row.username, p_pin: typed })
    .then(function(full){ if (full) full.pin = typed; return full; })
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
  sbRpc("yomple_player_upsert", {
    p_table: "hop_players",
    p_username: body.username,
    p_pin: body.pin || null,
    p_row: {
      display_name: body.display_name,
      avatar: body.avatar,
      family_code: body.family_code || null,
      progress: body.progress,
      fun: body.fun
    }
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
    existing.pin = row.pin || existing.pin || "";
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
    return yompleClaim("hop_players", row).then(function(full){
      if (!full) { toast("PIN did not match", "warm"); return; }
      applyCloudRow(full);
      toast("Welcome back, "+full.display_name+"!", "success");
      setTimeout(showHome, 500);
    });
  });
}
