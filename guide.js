function nextMove(){
  var intro = getIntroducedCount();
  var cooking = (typeof getCooking==="function") ? getCooking() : [];
  var nxt = (typeof nextToIntroduce==="function") ? nextToIntroduce() : null;
  if (intro < 3 && nxt) {
    return {
      why: "First look at the silly picture. Say the number and the name out loud.",
      label: "Place #"+nxt.n+" "+nxt.short,
      go: function(){ showLearnCard(nxt); }
    };
  }
  if (cooking.length) {
    var p = cooking[0];
    return {
      why: "Walk the doors in order. Picture the memory image as you go.",
      label: "Walk from #"+p.n+" "+p.short,
      go: startWalk
    };
  }
  if (intro >= 4) {
    return {
      why: "Put four presidents in the real order — that is how the hallway sticks.",
      label: "Line up the next four",
      go: startLineUp
    };
  }
  if (nxt) {
    return {
      why: "A new door is ready. Place the portrait, then walk it.",
      label: "Place #"+nxt.n+" "+nxt.short,
      go: function(){ showLearnCard(nxt); }
    };
  }
  return {
    why: "The Hall is shining. Walk it once more to keep it bright.",
    label: "Walk the whole palace",
    go: startWalk
  };
}
function paintNext(){
  var box = document.getElementById("next-card");
  var why = document.getElementById("next-why");
  var btn = document.getElementById("next-btn");
  if (!box || !btn) return;
  var m = nextMove();
  if (why) why.textContent = m.why;
  btn.textContent = "Do this next · "+m.label;
  btn.onclick = m.go;
}
function showHowTo(){
  showScreen("screen-howto");
  var nav = document.getElementById("main-nav");
  if (nav) nav.style.display = "flex";
}
if (typeof updateMission === "function") {
  var _um = updateMission;
  updateMission = function(){
    _um();
    paintNext();
  };
}
if (typeof showHome === "function") {
  var _sh = showHome;
  showHome = function(){
    _sh();
    paintNext();
  };
}
