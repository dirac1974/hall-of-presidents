function startLearn() {
  var target = null;
  var cooking = getCooking();
  if (cooking.length > 0) {
    target = cooking.sort(function(a,b){
      var pa = getActiveProgress()[a.n];
      var pb = getActiveProgress()[b.n];
      return pa.state - pb.state || pa.consec - pb.consec;
    })[0];
  } else target = nextToIntroduce();
  if (!target) { toast("Everything is already shining! 🌟", "success"); return; }
  showLearnCard(target);
}
function showLearnCard(p) {
  var prog = getActiveProgress();
  prog[p.n].introduced = true;
  saveStore();
  var card = document.getElementById("learn-card");
  var pic = imgTag(p.n, 500, "width:100%;max-width:280px;border-radius:14px;margin:10px auto;display:block;box-shadow:0 4px 12px rgba(0,0,0,0.15);");
  var imgHtml = pic
    ? pic + '<div class="emoji" style="display:none;font-size:3.2rem;margin:8px 0;">'+p.emoji+'</div>'
    : '<div class="emoji" style="font-size:3.2rem;margin:8px 0;">'+p.emoji+'</div>';
  card.innerHTML =
    '<div class="big-num">#'+p.n+'</div><div class="big-name">'+p.name+'</div>' +
    '<div class="mnemonic-box">'+imgHtml+'<p style="margin-top:8px;"><strong>Memory picture:</strong><br>'+p.mnemonic+'</p></div>' +
    '<p class="hint">Say the number and name out loud while you picture it. Make it silly and moving!</p>';
  document.getElementById("btn-got-it").onclick = function(){ gotIt(p); };
  showScreen("screen-learn");
}
function gotIt(p) {
  var st = getActiveProgress()[p.n];
  if (st.state === 0) { st.state = 1; st.consec = 0; }
  saveStore();
  toast("#"+p.n+" "+p.short+" is practicing!", "success");
  setTimeout(function(){ if (Math.random() > 0.4) startPracticeFor(p); else showHome(); }, 900);
}
function startPractice() {
  var prog = getActiveProgress();
  var pool = PRESIDENTS.filter(function(p){ return prog[p.n].introduced; });
  if (pool.length < 2) { toast("Place a few more presidents first!", "warm"); startLearn(); return; }
  var cooking = getCooking();
  var target = (cooking.length > 0 && Math.random() > 0.3) ? cooking[Math.floor(Math.random()*cooking.length)] : pool[Math.floor(Math.random()*pool.length)];
  startPracticeFor(target);
}
function startPracticeFor(p) {
  var mode = Math.random() > 0.4 ? "number" : "next";
  var prev = PRESIDENTS.find(function(x){ return x.n === p.n - 1; });
  var prog = getActiveProgress();
  if (mode === "next" && (!prev || !prog[prev.n].introduced)) mode = "number";
  document.getElementById("practice-title").textContent = mode === "number" ? "Who is this number?" : "Who comes next?";
  var questionHtml = mode === "number"
    ? '<div class="big-num">#'+p.n+'</div><p style="margin:8px 0 12px">Which president is number '+p.n+'?</p>'
    : '<p style="font-size:1.1rem;margin-bottom:12px">Who comes <strong>after</strong><br><strong>'+prev.short+'</strong>?</p>';
  document.getElementById("practice-card").innerHTML = questionHtml + '<div class="options" id="opts"></div>';
  generateOptions(p).forEach(function(opt){
    var btn = document.createElement("div"); btn.className = "opt"; btn.textContent = opt.label;
    btn.onclick = function(){ checkAnswer(opt.correct, btn, p); };
    document.getElementById("opts").appendChild(btn);
  });
  showScreen("screen-practice");
}
function generateOptions(correctP) {
  var prog = getActiveProgress();
  var opts = [{ label: correctP.name, correct: true }];
  PRESIDENTS.filter(function(x){ return x.n !== correctP.n && prog[x.n].introduced; }).sort(function(){ return Math.random()-0.5; }).slice(0,3)
    .forEach(function(o){ opts.push({ label: o.name, correct: false }); });
  while (opts.length < 4) {
    var filler = PRESIDENTS[Math.floor(Math.random()*PRESIDENTS.length)];
    if (!opts.find(function(o){ return o.label === filler.name; })) opts.push({ label: filler.name, correct: false });
  }
  return opts.sort(function(){ return Math.random()-0.5; });
}
function checkAnswer(isCorrect, btn, p) {
  document.querySelectorAll(".opt").forEach(function(o){ o.style.pointerEvents = "none"; });
  if (isCorrect) { btn.classList.add("correct"); recordCorrect(p); }
  else {
    btn.classList.add("wrong");
    document.querySelectorAll(".opt").forEach(function(o){ if (o.textContent === p.name) o.classList.add("correct"); });
    recordMiss(p);
  }
}
function recordCorrect(p) {
  var st = getActiveProgress()[p.n];
  st.consec = (st.consec || 0) + 1;
  if (st.state === 0) st.state = 1;
  if (st.state === 1 && st.consec >= 2) { st.state = 2; toast("✨ #"+p.n+" "+p.short+" is getting solid!", "success"); }
  else if (st.state === 2 && st.consec >= 3) { st.state = 3; toast("🌟 #"+p.n+" "+p.short+" is SHINING!", "success"); }
  else toast("Yes! #"+p.n+" "+p.short, "success");
  saveStore();
  setTimeout(function(){ if (getCooking().length > 0 || nextToIntroduce()) startPractice(); else showHome(); }, 1400);
}
function recordMiss(p) {
  getActiveProgress()[p.n].consec = 0;
  toast("Almost… picture the memory image for #"+p.n, "warm");
  saveStore();
  setTimeout(startPractice, 1800);
}
loadStore();
if (store.profiles.length === 0) showCreateProfile();
else if (!store.activeId) showProfiles();
else showHome();
