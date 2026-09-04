var testStreak = 0;

function mcFun(){
  if (typeof funStore !== "function") return { mcBest: 0 };
  var f = funStore();
  if (typeof f.mcBest !== "number") f.mcBest = 0;
  return f;
}
function streakBarHtml(){
  var n = testStreak;
  var best = mcFun().mcBest || 0;
  var stars = "";
  for (var i = 1; i <= n; i++){
    if (i % 5 === 0) stars += '<span class="streak-star boost">\uD83C\uDF1F</span>';
    else stars += '<span class="streak-star">\u2B50</span>';
  }
  if (!n) stars = '<span class="streak-empty">Stars grow with each right answer</span>';
  return '<div class="streak-row" id="streak-row">' +
    '<div class="streak-stars">' + stars + '</div>' +
    '<div class="streak-meta">Streak ' + n + (best ? (' \u00b7 Best ' + best) : '') + '</div>' +
    '</div>';
}
function notePracticeStreak(ok){
  if (!ok) { testStreak = 0; return { best:false, milestone:false }; }
  testStreak += 1;
  var f = mcFun();
  var prev = f.mcBest || 0;
  var isBest = testStreak > prev;
  if (isBest) {
    f.mcBest = testStreak;
    if (typeof saveStore === "function") saveStore();
  }
  return { best: isBest && prev >= 1, milestone: testStreak % 5 === 0 };
}
function insertStreakBar(){
  var card = document.getElementById("test-card");
  if (!card) return;
  var old = document.getElementById("streak-row");
  if (old) old.remove();
  card.insertAdjacentHTML("afterbegin", streakBarHtml());
}

if (typeof showTestMenu === "function") {
  var _menu = showTestMenu;
  showTestMenu = function(){
    _menu();
    var box = document.getElementById("test-card");
    var best = mcFun().mcBest || 0;
    if (!box || !best || box.innerHTML.indexOf("Best practice streak") >= 0) return;
    var p = box.querySelector(".walk-prompt");
    if (!p) return;
    var h = document.createElement("p");
    h.className = "hint";
    h.textContent = "Best practice streak: " + best;
    p.insertAdjacentElement("afterend", h);
  };
}
if (typeof beginQueue === "function") {
  var _begin = beginQueue;
  beginQueue = function(mode){
    testStreak = 0;
    _begin(mode);
  };
}
if (typeof renderPracticeAsk === "function") {
  var _ask = renderPracticeAsk;
  renderPracticeAsk = function(){
    _ask();
    insertStreakBar();
  };
}
if (typeof renderTestCard === "function") {
  var _card = renderTestCard;
  renderTestCard = function(p){
    _card(p);
    if (testMode === "practice") insertStreakBar();
  };
}
if (typeof answerPractice === "function") {
  var _ans = answerPractice;
  answerPractice = function(ok, btn, p){
    document.querySelectorAll("#test-opts .opt").forEach(function(o){ o.style.pointerEvents="none"; });
    var streakNote = notePracticeStreak(ok);
    if (ok) {
      btn.classList.add("correct");
      if (typeof bumpGood==="function") bumpGood(p);
      if (streakNote.best) {
        toast("New best streak \u2014 "+testStreak+" in a row!", "success");
        if (typeof burst==="function") burst();
      } else if (streakNote.milestone) {
        toast(testStreak+" in a row! Boosted star!", "success");
        if (typeof burst==="function") burst();
      } else {
        toast("#"+p.n+" "+p.short+" \u2014 yes", "success");
      }
      setTimeout(function(){ renderTestCard(p); }, 500);
    } else {
      btn.classList.add("wrong");
      document.querySelectorAll("#test-opts .opt").forEach(function(o){
        if (o.textContent === p.name) o.classList.add("correct");
      });
      if (typeof bumpMiss==="function") bumpMiss(p);
      toast("Almost\u2026 picture the memory image for #"+p.n, "warm");
      setTimeout(function(){ renderTestCard(p); }, 900);
    }
  };
}
if (typeof leaveTest === "function") {
  var _leave = leaveTest;
  leaveTest = function(){
    testStreak = 0;
    _leave();
  };
}
