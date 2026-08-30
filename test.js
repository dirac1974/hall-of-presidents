var testQueue = [];
var testP = null;
var testHints = 0;
var testListening = false;
var testRec = null;
var testSpeechPass = 0;
var testTotal = 0;
var testStep = 0;
var testMode = "exam"; // practice | exam
var testSpeakOn = localStorage.getItem("hop-speak-on") === "1";
var testRestarting = false;

var NAME_NICKS = {
  washington: ["george","gw"],
  adams: ["john adams","john","quincy"],
  jefferson: ["thomas","tom","tj"],
  madison: ["james madison"],
  monroe: ["james monroe"],
  jackson: ["andrew jackson","old hickory"],
  "van buren": ["vanburen","martin","buren"],
  harrison: ["william henry","benjamin","william"],
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
  mckinley: ["william mckinley","mckinley"],
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
  bush: ["george bush","hw bush","w bush","george"],
  clinton: ["bill","william clinton"],
  obama: ["barack","barry"],
  trump: ["donald","don"],
  biden: ["joe","joseph"]
};

function foldName(s){
  return String(s||"").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[.'\u2019]/g,"")
    .replace(/\b(president|the|jr|sr|ii|iii|iv|1st|2nd|first|second)\b/g,"")
    .replace(/[^a-z0-9 ]+/g," ")
    .replace(/\s+/g," ")
    .trim();
}
function lastNameOf(p){
  var full = foldName(p.name);
  if (full.indexOf("van buren") >= 0) return "van buren";
  if (full.indexOf("mc kinley") >= 0 || full.indexOf("mckinley") >= 0) return "mckinley";
  var parts = full.split(" ");
  return parts[parts.length - 1] || "";
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
  var last = lastNameOf(p);
  var short = foldName(String(p.short||"").replace(/\([^)]*\)/g,"").replace(/\d+/g,""));
  if (g === full || g === last || g === short) return true;
  if (closeEnough(g, full) || closeEnough(g, last) || closeEnough(g, short)) return true;
  var bits = g.split(" ").filter(Boolean);
  if (bits.length) {
    var gLast = bits[bits.length - 1];
    if (closeEnough(gLast, last)) return true;
    if (last.indexOf(" ") >= 0 && closeEnough(bits.slice(-2).join(" "), last)) return true;
  }
  var gCompact = g.replace(/ /g,"");
  var lastCompact = last.replace(/ /g,"");
  if (lastCompact.length >= 4 && gCompact.indexOf(lastCompact) >= 0) return true;
  if (lastCompact.length >= 4 && lastCompact.indexOf(gCompact) >= 0 && gCompact.length >= lastCompact.length - 1) return true;
  var nicks = NAME_NICKS[last] || NAME_NICKS[last.split(" ").pop()] || [];
  for (var i=0;i<nicks.length;i++){
    if (g === nicks[i] || closeEnough(g, nicks[i])) return true;
  }
  return false;
}
function hintFor(p, n){
  var last = lastNameOf(p);
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
    return "The last name has "+last.replace(/ /g,"").length+" letters.";
  }
  return "The last name starts with “"+last.charAt(0).toUpperCase()+"” and has "+last.replace(/ /g,"").length+" letters.";
}
function hasVoice(){
  return ("SpeechRecognition" in window) || ("webkitSpeechRecognition" in window);
}
function startTest(){ showTestMenu(); }
function showTestMenu(){
  stopListen(true);
  var box = document.getElementById("test-card");
  var h = document.querySelector("#screen-test h1");
  var s = document.querySelector("#screen-test .subtitle");
  if (h) h.textContent = "Test";
  if (s) s.textContent = "Practice with choices, or take the real test.";
  box.innerHTML =
    '<p class="walk-prompt">How do you want to go?</p>' +
    '<div class="btn-row" style="flex-direction:column;align-items:stretch;gap:10px">' +
    '<button type="button" class="btn primary" onclick="startPracticeTest()">Practice test · #1–#47</button>' +
    '<p class="hint" style="margin:0">Multiple choice, in order. The photo opens after a correct answer.</p>' +
    '<button type="button" class="btn" onclick="startExamTest()">Actual test · number only</button>' +
    '<p class="hint" style="margin:0">Type or speak the name. No photo on the question.</p>' +
    '<button type="button" class="btn secondary" onclick="leaveTest()">Hall</button>' +
    '</div>';
  showScreen("screen-test");
}
function beginQueue(mode){
  testMode = mode;
  testQueue = PRESIDENTS.slice();
  testTotal = testQueue.length;
  testStep = 0;
  testHints = 0;
  nextTest();
}
function startPracticeTest(){ beginQueue("practice"); }
function startExamTest(){ beginQueue("exam"); }
function nextTest(){
  if (!testQueue.length) {
    toast(testMode==="practice" ? "Practice walk finished." : "You named them in order. Back to the Hall.", "success");
    if (typeof showHome==="function") showHome();
    return;
  }
  testP = testQueue.shift();
  testStep += 1;
  testHints = 0;
  if (testMode === "practice") renderPracticeAsk();
  else renderExamAsk();
}
function renderPracticeAsk(){
  var p = testP;
  var h = document.querySelector("#screen-test h1");
  var s = document.querySelector("#screen-test .subtitle");
  if (h) h.textContent = "Practice test";
  if (s) s.textContent = "#"+p.n+" · door "+testStep+" of "+testTotal;
  document.getElementById("test-card").innerHTML =
    '<div class="big-num">#'+p.n+'</div>' +
    '<p class="walk-prompt">Which president is number '+p.n+'?</p>' +
    '<div class="options" id="test-opts"></div>' +
    '<div class="btn-row" style="margin-top:12px"><button type="button" class="btn secondary" onclick="leaveTest()">Hall</button></div>';
  generateOptions(p).forEach(function(opt){
    var b = document.createElement("div");
    b.className = "opt"; b.textContent = opt.label;
    b.onclick = function(){ answerPractice(opt.correct, b, p); };
    document.getElementById("test-opts").appendChild(b);
  });
  showScreen("screen-test");
}
function answerPractice(ok, btn, p){
  document.querySelectorAll("#test-opts .opt").forEach(function(o){ o.style.pointerEvents="none"; });
  if (ok) {
    btn.classList.add("correct");
    if (typeof bumpGood==="function") bumpGood(p);
    toast("#"+p.n+" "+p.short+" — yes", "success");
    setTimeout(function(){ renderTestCard(p); }, 500);
  } else {
    btn.classList.add("wrong");
    document.querySelectorAll("#test-opts .opt").forEach(function(o){
      if (o.textContent === p.name) o.classList.add("correct");
    });
    if (typeof bumpMiss==="function") bumpMiss(p);
    toast("Almost… picture the memory image for #"+p.n, "warm");
    setTimeout(function(){ renderTestCard(p); }, 900);
  }
}
function renderExamAsk(){
  var p = testP;
  var h = document.querySelector("#screen-test h1");
  var s = document.querySelector("#screen-test .subtitle");
  if (h) h.textContent = "Test";
  if (s) s.textContent = "Number only · door "+testStep+" of "+testTotal;
  var voice = hasVoice();
  document.getElementById("test-card").innerHTML =
    '<div class="big-num" style="font-size:4.2rem">#'+p.n+'</div>' +
    '<p class="walk-prompt">Who is number '+p.n+'?</p>' +
    '<input id="test-guess" type="text" autocomplete="off" autocapitalize="words" enterkeyhint="done" placeholder="Type the name" ' +
    'style="width:100%;padding:12px;border-radius:12px;border:2px solid var(--wood);font-size:1.1rem;">' +
    '<p id="test-hint" class="hint" style="min-height:1.4em;margin-top:8px;"></p>' +
    '<div class="btn-row" style="margin-top:12px;flex-wrap:wrap">' +
    '<button type="button" class="btn primary" onclick="submitTest()">Check</button>' +
    (voice ? '<button type="button" class="btn" id="test-mic" onclick="toggleTestSpeak()">'+speakLabel()+'</button>' : '') +
    '<button type="button" class="btn secondary" onclick="leaveTest()">Hall</button>' +
    '</div>';
  showScreen("screen-test");
  setTimeout(function(){
    var el = document.getElementById("test-guess");
    if (!el) return;
    el.addEventListener("keydown", function(e){ if (e.key==="Enter"){ e.preventDefault(); submitTest(); } });
    if (testSpeakOn) listenTest(true);
  }, 80);
}
function speakLabel(){
  return testSpeakOn ? "🎙️ Speak on" : "🎙️ Speak off";
}
function paintMic(){
  var mic = document.getElementById("test-mic");
  if (!mic) return;
  if (testListening) mic.textContent = "Listening…";
  else mic.textContent = speakLabel();
}
function toggleTestSpeak(){
  testSpeakOn = !testSpeakOn;
  localStorage.setItem("hop-speak-on", testSpeakOn ? "1" : "0");
  if (testSpeakOn) listenTest(true);
  else stopListen(true);
  paintMic();
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
    (typeof factBlock==="function" ? factBlock(p, true) : "") +
    '<div class="btn-row" style="margin-top:12px;"><button type="button" class="btn primary" onclick="nextTest()">Next door</button></div>';
}
function submitTest(){
  if (!testP || testMode !== "exam") return;
  var input = document.getElementById("test-guess");
  var guess = (input && input.value) || "";
  if (!foldName(guess)) { toast("Type a name, or turn Speak on", "warm"); return; }
  if (nameMatches(guess, testP)) {
    if (typeof bumpGood==="function") bumpGood(testP);
    toast("#"+testP.n+" "+testP.short+" — yes", "success");
    nextTest();
    return;
  }
  testHints += 1;
  if (typeof bumpMiss==="function") bumpMiss(testP);
  var hintEl = document.getElementById("test-hint");
  if (testHints <= 3) {
    if (hintEl) hintEl.textContent = "Hint "+testHints+" of 3: "+hintFor(testP, testHints);
    toast("Not yet. Stay with the number.", "warm");
  } else {
    if (hintEl) hintEl.textContent = "Three hints used. Picture the scene, then try the last name again.";
    toast("Keep the picture. Last name is enough.", "warm");
  }
  if (testSpeakOn) setTimeout(function(){ listenTest(true); }, 400);
}
function stopListen(keepPref){
  testRestarting = true;
  try { if (testRec) testRec.abort(); } catch(e){}
  testListening = false;
  testRestarting = false;
  if (!keepPref) {}
  paintMic();
}
function listenTest(auto){
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast("This browser cannot hear yet. Type the name.", "warm"); return; }
  if (!auto) testSpeakOn = true;
  localStorage.setItem("hop-speak-on", testSpeakOn ? "1" : "0");
  var input = document.getElementById("test-guess");
  if (input) input.blur();
  if (testListening && testRec) {
    if (!auto) { testSpeakOn = false; localStorage.setItem("hop-speak-on","0"); stopListen(true); }
    return;
  }
  try { if (testRec) testRec.abort(); } catch(e){}
  testRec = new SR();
  testRec.lang = "en-US";
  testRec.continuous = false;
  testRec.interimResults = true;
  testRec.maxAlternatives = 3;
  var gotFinal = false;
  var heard = "";
  testListening = true;
  testSpeechPass += 1;
  paintMic();
  if (!auto) toast("Listening — say the last name", "warm");
  testRec.onresult = function(ev){
    heard = "";
    for (var i = ev.resultIndex; i < ev.results.length; i++) {
      heard += ev.results[i][0].transcript;
      if (ev.results[i].isFinal) gotFinal = true;
    }
    heard = String(heard||"").trim();
    if (input && heard) input.value = heard;
    if (gotFinal && foldName(heard)) {
      try { testRec.stop(); } catch(e){}
      testListening = false;
      submitTest();
    }
  };
  testRec.onerror = function(ev){
    testListening = false;
    paintMic();
    var err = (ev && ev.error) || "";
    if (err === "not-allowed" || err === "service-not-allowed") {
      testSpeakOn = false;
      localStorage.setItem("hop-speak-on","0");
      toast("Allow the microphone, then turn Speak on.", "warm");
    } else if (err === "no-speech" && testSpeakOn) {
      setTimeout(function(){ if (testSpeakOn && document.getElementById("test-guess")) listenTest(true); }, 250);
    }
  };
  testRec.onend = function(){
    testListening = false;
    paintMic();
    if (gotFinal) return;
    if (foldName(heard) || (input && foldName(input.value))) {
      submitTest();
      return;
    }
    if (testSpeakOn && document.getElementById("test-guess") && testMode==="exam") {
      setTimeout(function(){ if (testSpeakOn && document.getElementById("test-guess")) listenTest(true); }, 280);
    }
  };
  try {
    testRec.start();
  } catch (e) {
    testListening = false;
    paintMic();
    if (testSpeakOn) setTimeout(function(){ if (testSpeakOn) listenTest(true); }, 400);
  }
}
function leaveTest(){
  testSpeakOn = testSpeakOn;
  stopListen(true);
  testP = null; testQueue = [];
  if (typeof leaveWalk==="function") leaveWalk();
  else if (typeof showHome==="function") showHome();
}
