function nextMove(){
  var intro = getIntroducedCount();
  var cooking = (typeof getCooking==="function") ? getCooking() : [];
  var nxt = (typeof nextToIntroduce==="function") ? nextToIntroduce() : null;
  var solid = (typeof getSolidCount==="function") ? getSolidCount() : 0;
  if (intro < 3 && nxt) {
    return {
      why: "First look at the silly picture. Say the number and the name out loud.",
      label: "Place #"+nxt.n+" "+nxt.short,
      go: function(){ showLearnCard(nxt); }
    };
  }
  if (cooking.length && cooking.length < 3) {
    var p = cooking[0];
    return {
      why: "Walk the doors in order. Picture the memory image as you go.",
      label: "Walk from #"+p.n+" "+p.short,
      go: startWalk
    };
  }
  if (intro >= 4 && solid >= 3 && typeof startTest==="function") {
    return {
      why: "No choices this time. Look at the number and name the door.",
      label: "Test the doors you know",
      go: startTest
    };
  }
  if (intro >= 4) {
    return {
      why: "Put four presidents in the real order — that is how the hallway sticks.",
      label: "Line up the next four",
      go: startLineUp
    };
  }
  if (cooking.length) {
    return {
      why: "Walk the doors in order. Picture the memory image as you go.",
      label: "Walk from #"+cooking[0].n+" "+cooking[0].short,
      go: startWalk
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
    why: "The Hall is shining. Name the doors with no hints from a list.",
    label: "Test the whole palace",
    go: typeof startTest==="function" ? startTest : startWalk
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
