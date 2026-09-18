function findAnyYomplePerson(username){
  return sbRpc("yomple_player_find_any", { p_username: username, p_prefer: "hop_players" })
    .then(function(row){ return row ? { table: row.table, row: row } : null; })
    .catch(function(){ return null; });
}
function adoptPerson(row, progress){
  row = row || {};
  var username = row.username || slugName(row.display_name || row.name || "player");
  var id = "u-"+username;
  var existing = (store.profiles||[]).find(function(p){ return p.id===id || p.username===username; });
  if (existing) {
    existing.name = row.display_name || row.name || existing.name;
    existing.avatar = row.avatar || existing.avatar;
    existing.username = username;
    existing.pin = row.pin || existing.pin || "";
    id = existing.id;
  } else {
    store.profiles = store.profiles || [];
    store.profiles.push({
      id: id,
      name: row.display_name || row.name || username,
      username: username,
      avatar: row.avatar || "\ud83c\udfdb",
      pin: row.pin || "",
      created: Date.now()
    });
  }
  store.activeId = id;
  if (!store.progress) store.progress = {};
  if (progress && Object.keys(progress).length) store.progress[id] = progress;
  else if (!store.progress[id]) store.progress[id] = {};
  if (row.family_code) store.familyCode = row.family_code;
  localStorage.setItem("presidents-palace-v2", JSON.stringify(store));
  return id;
}
function hideHubFind(){
  var card = document.getElementById("find-card") || document.querySelector("#screen-profiles .card");
  if (card) card.style.display = "none";
}
function consumeYompleHandoff(){
  var q = new URLSearchParams(location.search);
  var raw = (q.get("u") || "").trim();
  var f = (q.get("f") || "").trim();
  var fromHub = q.get("from") === "yomple" || !!raw;
  if (f && f.indexOf("-") > 0) store.familyCode = f.toUpperCase();
  if (!raw) return Promise.resolve(false);
  var username = slugName(raw);
  window.YOMPLE_HANDSHAKE = true;
  window.YOMPLE_FROM_HUB = fromHub;
  if (fromHub) hideHubFind();
  function land(){
    if (typeof showHome === "function") showHome();
    return true;
  }
  var local = (store.profiles||[]).find(function(p){
    return p.username === username || slugName(p.name) === username;
  });
  if (local) {
    store.activeId = local.id;
    if (!local.username) local.username = username;
    localStorage.setItem("presidents-palace-v2", JSON.stringify(store));
    return Promise.resolve(land());
  }
  return findAnyYomplePerson(username).then(function(hit){
    if (!hit) {
      adoptPerson({ username: username, display_name: raw, avatar: "\ud83c\udfdb", family_code: store.familyCode || f }, {});
      if (typeof cloudSaveActive === "function") cloudSaveActive();
      return land();
    }
    return yompleClaim(hit.table, hit.row).then(function(full){
      if (!full) return land();
      if (hit.table === "hop_players" && typeof applyCloudRow === "function") applyCloudRow(full);
      else {
        adoptPerson(full, {});
        if (typeof cloudSaveActive === "function") cloudSaveActive();
      }
      return land();
    });
  }).catch(function(){
    adoptPerson({ username: username, display_name: raw, family_code: store.familyCode || f }, {});
    return land();
  });
}
if (typeof showProfiles === "function") {
  var _showProfilesHub = showProfiles;
  showProfiles = function(){
    _showProfilesHub();
    if (window.YOMPLE_HANDSHAKE || window.YOMPLE_FROM_HUB) hideHubFind();
  };
}
function startHallHandoff(){
  consumeYompleHandoff();
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startHallHandoff);
} else {
  startHallHandoff();
}
