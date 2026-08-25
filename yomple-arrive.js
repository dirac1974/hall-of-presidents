(function(){
  var q = new URLSearchParams(location.search);
  var u = (typeof slugName==="function" ? slugName(q.get("u")||q.get("who")||"") : String(q.get("u")||"").toLowerCase());
  var f = String(q.get("f")||q.get("family")||"").trim().toUpperCase();
  if (!u || u==="player") {
    if (store.activeId && typeof showHome==="function") showHome();
    return;
  }
  if (f && f.indexOf("-")>0) store.familyCode = f;
  function go(){ if (typeof showHome==="function") showHome(); }
  var local = (store.profiles||[]).find(function(p){
    return p.username === u || (typeof slugName==="function" && slugName(p.name)===u);
  });
  if (local) {
    store.activeId = local.id;
    if (!local.username) local.username = u;
    localStorage.setItem("presidents-palace-v2", JSON.stringify(store));
    go();
    return;
  }
  function adoptIdentity(row){
    row = row || {};
    var id = "u-"+(row.username||u);
    var existing = (store.profiles||[]).find(function(p){ return p.id===id || p.username===(row.username||u); });
    if (existing) {
      existing.username = row.username || u;
      existing.name = row.display_name || row.name || existing.name || u;
      existing.avatar = row.avatar || existing.avatar;
      store.activeId = existing.id;
    } else {
      store.profiles = store.profiles || [];
      store.profiles.push({
        id: id,
        name: row.display_name || row.name || u,
        username: row.username || u,
        avatar: row.avatar || "\u2b50",
        pin: row.pin || "",
        created: Date.now()
      });
      store.activeId = id;
    }
    if (row.family_code) store.familyCode = row.family_code;
    localStorage.setItem("presidents-palace-v2", JSON.stringify(store));
  }
  function finish(row){
    if (row && row.progress && typeof applyCloudRow==="function") applyCloudRow(row);
    else adoptIdentity(row);
    go();
  }
  if (typeof cloudGet !== "function") { finish({ username:u, display_name:u }); return; }
  var landed = false;
  cloudGet(u).then(function(row){
    if (row) { landed = true; finish(row); return null; }
    var sisters = ["bloom_players","garden_players","star_players"];
    var chain = Promise.resolve(null);
    sisters.forEach(function(table){
      chain = chain.then(function(found){
        if (found) return found;
        return fetch(SB_URL+"/rest/v1/"+table+"?username=eq."+encodeURIComponent(u), { headers: sbHeaders() })
          .then(function(r){ return r.json(); })
          .then(function(rows){ return (rows && rows[0]) || null; })
          .catch(function(){ return null; });
      });
    });
    return chain;
  }).then(function(row){
    if (landed) return;
    finish(row || { username:u, display_name:u });
  }).catch(function(){ finish({ username:u, display_name:u }); });
})();
