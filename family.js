function ensureFamily(){
  if (!store.familyCode) {
    var words = ["OAK","MAPLE","PINE","CEDAR","ELM","BIRCH","WILLOW","ASPEN","LAUREL","HOLLY"];
    var chars = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
    var tail = "";
    for (var i=0;i<4;i++) tail += chars.charAt(Math.floor(Math.random()*chars.length));
    store.familyCode = words[Math.floor(Math.random()*words.length)] + "-" + tail;
    if (typeof saveStore === "function") saveStore();
    else localStorage.setItem("presidents-palace-v2", JSON.stringify(store));
    upsertFamilyRow();
  }
  return store.familyCode;
}
function upsertFamilyRow(){
  if (!store.familyCode) return;
  fetch(SB_URL+"/rest/v1/hop_families", {
    method: "POST",
    headers: sbHeaders({ Prefer: "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify({
      family_code: store.familyCode,
      parent_email: store.parentEmail || null,
      updated_at: new Date().toISOString()
    })
  }).catch(function(){});
}
function paintFamilyPanel(){
  ensureFamily();
  var el = document.getElementById("family-code-value");
  if (el) el.textContent = store.familyCode;
  var em = document.getElementById("parent-email");
  if (em && store.parentEmail) em.value = store.parentEmail;
}
if (typeof showParent === "function") {
  var _showParent = showParent;
  showParent = function(){
    _showParent();
    paintFamilyPanel();
  };
}
function saveParentEmail(){
  var em = (document.getElementById("parent-email") && document.getElementById("parent-email").value || "").trim().toLowerCase();
  if (!em || em.indexOf("@") < 1) { toast("Add a parent email first", "warm"); return; }
  store.parentEmail = em;
  ensureFamily();
  saveStore();
  upsertFamilyRow();
  toast("Parent email saved for this household", "success");
}
function emailCodeToMyself(){
  ensureFamily();
  var em = (document.getElementById("parent-email") && document.getElementById("parent-email").value || store.parentEmail || "").trim();
  var kids = (store.profiles||[]).map(function(p){ return p.name; }).join(", ") || "(no players yet)";
  var body = "Hall of Presidents / Yomple family code:\n\n"+store.familyCode+"\n\nPlayers: "+kids+"\n\nOn a new device: Parent recovery → type this code. Do not share it with the kids.";
  var href = "mailto:"+encodeURIComponent(em)+"?subject="+encodeURIComponent("Our Hall of Presidents family code")+"&body="+encodeURIComponent(body);
  window.location.href = href;
}
function sendEmailOtp(){
  var em = (document.getElementById("recover-email") && document.getElementById("recover-email").value || "").trim().toLowerCase();
  if (!em || em.indexOf("@") < 1) { toast("Type the parent email", "warm"); return; }
  toast("Sending a one-time code…");
  fetch(SB_URL+"/auth/v1/otp", {
    method: "POST",
    headers: { apikey: SB_KEY, Authorization: "Bearer "+SB_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email: em, create_user: true })
  }).then(function(r){
    if (!r.ok) throw new Error("otp");
    document.getElementById("otp-row").style.display = "block";
    toast("Check that inbox for a 6-digit code", "success");
  }).catch(function(){
    toast("Inbox send did not go through. Email the family code to yourself from Parent / Progress instead.", "warm");
  });
}
function verifyEmailOtp(){
  var em = (document.getElementById("recover-email") && document.getElementById("recover-email").value || "").trim().toLowerCase();
  var token = (document.getElementById("recover-otp") && document.getElementById("recover-otp").value || "").trim();
  if (!token) { toast("Type the code from the email", "warm"); return; }
  fetch(SB_URL+"/auth/v1/verify", {
    method: "POST",
    headers: { apikey: SB_KEY, Authorization: "Bearer "+SB_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ type: "email", email: em, token: token })
  }).then(function(r){ return r.json(); }).then(function(auth){
    if (!auth || auth.error || (!auth.access_token && !auth.token)) throw new Error("bad otp");
    return fetch(SB_URL+"/rest/v1/hop_families?parent_email=eq."+encodeURIComponent(em), { headers: sbHeaders() }).then(function(r){ return r.json(); });
  }).then(function(rows){
    if (!rows || !rows.length) {
      toast("That email is not linked to a household yet. Open Parent / Progress on the old device and save the email.", "warm");
      return;
    }
    restoreFamily(rows[0].family_code);
  }).catch(function(){
    toast("That code did not match. Try again, or use the family code from your self-email.", "warm");
  });
}
function restoreFamily(code){
  code = String(code || (document.getElementById("restore-code") && document.getElementById("restore-code").value) || "").trim().toUpperCase();
  if (!code || code.indexOf("-") < 0) { toast("Type the family code (like MAPLE-K7Q2)", "warm"); return; }
  toast("Finding this household…");
  fetch(SB_URL+"/rest/v1/hop_players?family_code=eq."+encodeURIComponent(code), { headers: sbHeaders() })
    .then(function(r){ return r.json(); })
    .then(function(rows){
      store.familyCode = code;
      if (!rows || !rows.length) {
        saveStore();
        upsertFamilyRow();
        toast("Code saved. No players under it yet — create them here.", "warm");
        showCreateProfile();
        return;
      }
      rows.forEach(function(row, i){
        applyCloudRow(row);
        if (i === 0) store.activeId = "u-"+row.username;
      });
      store.familyCode = code;
      saveStore();
      toast("Household restored — "+rows.length+" player"+(rows.length===1?"":"s"), "success");
      setTimeout(showProfiles, 500);
    })
    .catch(function(){ toast("Could not reach the cloud just now", "warm"); });
}
function showRecover(){
  showScreen("screen-recover");
  var nav = document.getElementById("main-nav");
  if (nav) nav.style.display = "none";
}

if (typeof payloadForActive === "function") {
  var _payload = payloadForActive;
  payloadForActive = function(){
    var body = _payload();
    if (body) body.family_code = ensureFamily();
    return body;
  };
}
if (typeof createProfile === "function") {
  var _create = createProfile;
  createProfile = function(){
    ensureFamily();
    return _create.apply(this, arguments);
  };
}
if (store && store.profiles && store.profiles.length) ensureFamily();
