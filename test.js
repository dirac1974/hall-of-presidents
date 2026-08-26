var testQueue = [];
var testP = null;
var testHints = 0;
var testListening = false;
var testRec = null;

var NAME_NICKS = {
  washington: ["george","gw"],
  adams: ["john adams","john"],
  jefferson: ["thomas","tom","tj"],
  madison: ["james madison"],
  monroe: ["james monroe"],
  jackson: ["andrew jackson","old hickory"],
  "van buren": ["vanburen","martin"],
  harrison: ["william henry","benjamin"],
  tyler: ["john tyler"],
  polk: ["james polk","jk polk"],
  taylor: ["zachary","zach"],
  fillmore: ["millard"],
  pierce: ["franklin pierce"],
  buchanan: ["james buchanan","buck"],
  lincoln: ["abe","abraham"],
  johnson: ["andrew johnson","lyndon","lbj"],
  grant: ["ulysses","us grant"],
  hayes: ["rutherford"],
  garfield: ["james garfield"],
  arthur: ["chester"],
  cleveland: ["grover"],
  mckinley: ["william mckinley"],
  roosevelt: ["teddy","theodore","franklin","fdr"],
  taft: ["william taft","howard taft"],
  wilson: ["woodrow"],
  harding: ["warren"],
  coolidge: ["calvin","silent cal"],
  hoover: ["herbert"],
  truman: ["harry"],
  eisenhower: ["ike","dwight"],
  kennedy: ["jfk","jack"],
  nixon: ["richard","dick"],
  ford: ["gerald"],
  carter: ["jimmy"],
  reagan: ["ronald","ron"],
  bush: ["george bush","hw bush","w bush"],
  clinton: ["bill","william clinton"],
  obama: ["barack","barry"],
  trump: ["donald","don"],
  biden: ["joe","joseph"]
};

function foldName(s){
  return String(s||"").toLowerCase()
    .replace(/[.'’]/g,"")
    .replace(/\b(president|the|jr|sr|ii|iii|iv|1st|2nd|first|second)\b/g,"")
    .replace(/[^a-z0-9 ]+/g," ")
    .replace(/\s+/g," ")
    .trim();
}
function lastWord(s){
  var p = foldName(s).split(" ");
  return p[p.length-1] || "";
}
function editDist(a,b){
  a = foldName(a); b = foldName(b);
  if (a===b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  var prev = [];
  for (var j=0;j<=b.length;j++) prev[j]=j;
  for (var i=1;i<=a.length;i++){
    var cur = [i];
    for (j=1;j<=b.length;j++){
      var cost = a.charAt(i-1)===b.charAt(j-1) ? 0 : 1;
      cur[j] = Math.min(cur[j-1]+1, prev[j]+1, prev[j-1]+cost);
    }
    prev = cur;
  }
  return prev[b.length];
}
function closeEnough(a,b){
  a = foldName(a); b = foldName(b);
  if (!a || !b) return false;
  if (a===b) return true;
  if (a.replace(/ /g,"")===b.replace(/ /g,"")) return true;
  var max = b.length <= 4 ? 1 : (b.length <= 7 ? 2 : 3);
  return editDist(a,b) <= max;
}
function nameMatches(guess, p){
  var g = foldName(guess);
  if (!g) return false;
  var full = foldName(p.name);
  var last = lastWord(p.name);
  var short = foldName(String(p.short).replace(/\(.*\)/g,"").replace(/\d+/g,""));
  if (g===full || g===last || g===short) return true;
  if (closeEnough(g, full) || closeEnough(g, last) || closeEnough(g, short)) return true;
  var bits = g.split(" ");
  if (bits.length > 1 && closeEnough(bits[bits.length-1], last)) return true;
  var nicks = NAME_NICKS[last] || [];
  for (var i=0;i<nicks.length;i++){
    if (g===nicks[i] || closeEnough(g, nicks[i]) || g.indexOf(nicks[i])>=0) return true;
  }
  return false;
}
function hintFor(p, n){
  var last = lastWord(p.name);
  var prev = PRESIDENTS[p.n-2];
  var next = PRESIDENTS[p.n];
  if (n===1) {
    if (p.n<=5) return "He is one of the very first doors in the Hall.";
    if (p.n>=16 && p.n<=19) return "This door sits in the Civil War wing.";
    if (p.n>=26 && p.n<=32) return "Think early 1900s — roses, taffy, a cooler.";
    if (p.n>=35 && p.n<=40) return "This door is in the modern hallway, after the two Roosevelts.";
    if (prev) return "He comes right after #"+prev.n+". Picture that door, then the next one.";
    return "Picture the silly scene that lives on this door.";
  }
  if (n===2) {
    if (prev && next) return "He stands between #"+prev.n+" and #"+next.n+".";
    return "The last name has "+last.length+" letters.";
  }
  return "The last name starts with “"+last.charAt(0).toUpperCase()+"” and has "+last.length+" letters.";
}
function startTest(){
  var intro = PRESIDENTS.filter(function(p){ return getActiveProgress()[p.n].introduced; });
  if (intro.length < 3) {
    toast("Place at least 3 portraits first.", "warm");
    if (typeof startLearn==="function") startLearn();
    return;
  }
  var cook = (typeof getCooking==="function") ? getCooking() : [];
  var rest = intro.filter(function(p){ return cook.indexOf(p)<0; });
  testQueue = cook.concat(rest).slice(0, 8);
  testHints = 0;
  nextTest();
}
function nextTest(){
  if (!testQueue.length) {
    toast("Nice test. Back to the Hall.", "success");
    if (typeof showHome==="function") showHome();
    return;
  }
  testP = testQueue.shift();
  testHints = 0;
  renderTestAsk();
}
function renderTestAsk(){
  var p = testP;
  var box = document.getElementById("test-card");
  var voice = ("SpeechRecognition" in window) || ("webkitSpeechRecognition" in window);
  box.innerHTML =
    '<div class="door" id="test-door"><div class="door-num">#'+p.n+'</div>' +
    '<div class="door-face" style="min-height:88px;color:#ffe6a6;font-weight:800;display:flex;align-items:center;justify-content:center;">Who lives here?</div>' +
    '<div class="door-knob"></div></div>' +
    '<p class="walk-prompt">Say or type the name</p>' +
    '<input id="test-guess" type="text" autocomplete="off" autocapitalize="words" placeholder="last name is enough" ' +
    'style="width:100%;padding:12px;border-radius:12px;border:2px solid var(--wood);font-size:1.1rem;">' +
    '<p id="test-hint" class="hint" style="min-height:1.4em;margin-top:8px;"></p>' +
    '<div class="btn-row" style="margin-top:12px;">' +
    '<button class="btn primary" onclick="submitTest()">Check</button>' +
    (voice ? '<button class="btn" id="test-mic" onclick="listenTest()">🎤 Speak</button>' : '') +
    '<button class="btn secondary" onclick="leaveTest()">Hall</button>' +
    '</div>';
  showScreen("screen-test");
  var nav = document.getElementById("main-nav");
  if (nav) nav.style.display = "flex";
  setTimeout(function(){
    var el = document.getElementById("test-guess");
    if (!el) return;
    el.focus();
    el.addEventListener("keydown", function(e){ if (e.key==="Enter") submitTest(); });
  }, 50);
}
function renderTestCard(p){
  var pic = (typeof imgTag==="function")
    ? imgTag(p.n, 500, "width:100%;max-width:280px;border-radius:14px;margin:10px auto;display:block;")
    : "";
  document.getElementById("test-card").innerHTML =
    '<div class="big-num">#'+p.n+'</div>' +
    '<div class="big-name">'+p.name+'</div>' +
    (pic || '<div style="font-size:3rem">'+p.emoji+'</div>') +
    '<div class="mnemonic-box"><p><strong>Memory picture:</strong><br>'+p.mnemonic+'</p></div>' +
    '<div class="btn-row" style="margin-top:12px;"><button class="btn primary" onclick="nextTest()">Next door</button></div>';
}
function submitTest(){
  if (!testP) return;
  var guess = (document.getElementById("test-guess") && document.getElementById("test-guess").value) || "";
  if (!foldName(guess)) { toast("Type a name, or tap Speak", "warm"); return; }
  if (nameMatches(guess, testP)) {
    if (typeof bumpGood==="function") bumpGood(testP);
    else if (typeof recordCorrect==="function") recordCorrect(testP);
    toast("#"+testP.n+" "+testP.short+" — yes", "success");
    var door = document.getElementById("test-door");
    if (door) door.classList.add("open");
    renderTestCard(testP);
    return;
  }
  testHints += 1;
  if (typeof bumpMiss==="function") bumpMiss(testP);
  var hintEl = document.getElementById("test-hint");
  if (testHints <= 3) {
    if (hintEl) hintEl.textContent = "Hint "+testHints+" of 3: "+hintFor(testP, testHints);
    toast("Not yet. Another look at the door.", "warm");
  } else {
    if (hintEl) hintEl.textContent = "Three hints used. Picture the scene, then try the last name again.";
    toast("Keep the picture. Last name is enough.", "warm");
  }
}
function listenTest(){
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast("This browser cannot hear yet. Type the name.", "warm"); return; }
  if (testListening && testRec) { try { testRec.stop(); } catch(e){} testListening = false; return; }
  testRec = new SR();
  testRec.lang = "en-US";
  testRec.interimResults = false;
  testRec.maxAlternatives = 3;
  testListening = true;
  var mic = document.getElementById("test-mic");
  if (mic) mic.textContent = "Listening…";
  testRec.onresult = function(ev){
    var best = "";
    try { best = ev.results[0][0].transcript; } catch(e){}
    var input = document.getElementById("test-guess");
    if (input) input.value = best;
    submitTest();
  };
  testRec.onerror = function(){ toast("Could not hear that. Try typing.", "warm"); };
  testRec.onend = function(){
    testListening = false;
    if (mic) mic.textContent = "🎤 Speak";
  };
  try { testRec.start(); } catch(e){ testListening = false; toast("Mic did not start. Type instead.", "warm"); }
}
function leaveTest(){
  if (testRec && testListening) try { testRec.stop(); } catch(e){}
  testP = null; testQueue = [];
  if (typeof leaveWalk==="function") leaveWalk();
  else if (typeof showHome==="function") showHome();
}
