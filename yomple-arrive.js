function findAnyYomplePerson(username){
  if (typeof cloudGetTable !== "function") {
    var sisters = ["hop_players","bloom_players","garden_players","star_players","field_players"];
    var chain = Promise.resolve(null);
    sisters.forEach(function(table){
      chain = chain.then(function(found){
        if (found) return found;
        return fetch(SB_URL+"/rest/v1/"+table+"?username=eq."+encodeURIComponent(username), { headers: sbHeaders() })
          .then(function(r){ return r.json(); })
          .then(function(rows){ return (rows && rows[0]) ? { table: table, row: rows[0] } : null; })
          .catch(function(){ return null; });
      });
    });
    return chain;
  }
  var tables = ["hop_players","bloom_players","garden_players","star_players","field_players"];
  var chain = Promise.resolve(null);
  tables.forEach(function(table){
    chain = chain.then(function(found){
      if (found) return found;
      return cloudGetTable(table, username).then(function(row){ return row ? { table: table, row: row } : null; });
    });
  });
  return chain;
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
    if (hit.table === "hop_players" && typeof applyCloudRow === "function") applyCloudRow(hit.row);
    else {
      adoptPerson(hit.row, {});
      if (typeof cloudSaveActive === "function") cloudSaveActive();
    }
    return land();
  }).catch(function(){
    adoptPerson({ username: username, display_name: raw, family_code: store.familyCode || f }, {});
    return land();
  });
}
if (typeof showProfiles === "function") {
  var _showProfilesHub = showProfiles;
  showProfiles = function(){
    _showProfilesHub();
    if (window.YOMPLE_HANDSHAKE) hideHubFind();
  };
}
document.addEventListener("DOMContentLoaded", function(){
  consumeYompleHandoff();
});
