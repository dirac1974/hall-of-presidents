var testQueue = [];
var testP = null;
var testHints = 0;
var testListening = false;
var testRec = null;
var testSpeechPass = 0;

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
    if (p.n>=26 && p.n<=32) return "Think early 1900s \u2014 roses, taffy, a cooler.";
    if (p.n>=35 && p.n<=40) return "This door is in the modern hallway, after the two Roosevelts.";
    if (prev) return "He comes right after #"+prev.n+". Picture that door, then the next one.";
    return "Picture the silly scene that lives on this door.";
  }
  if (n===2) {
    if (prev && next) return "He stands between #"+prev.n+" and #"+next.n+".";
    return "The last name has "+last.replace(/ /g,"").length+" letters.";
  }
  return "The last name starts with \u201c"+last.charAt(0).toUpperCase()+"\u201d and has "+last.replace(/ /g,"").length+" letters.";
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
    '<input id="test-guess" type="text" autocomplete="off" autocapitalize="words" enterkeyhint="done" placeholder="Last name is enough" ' +
    'style="width:100%;padding:12px;border-radius:12px;border:2px solid var(--wood);font-size:1.1rem;">' +
    '<p id="test-hint" class="hint" style="min-height:1.4em;margin-top:8px;"></p>' +
    '<div class="btn-row" style="margin-top:12px;">' +
    '<button type="button" class="btn primary" onclick="submitTest()">Check</button>' +
    (voice ? '<button type="button" class="btn" id="test-mic" onclick="listenTest()">\ud83c\udfa4 Speak</button>' : '') +
    '<button type="button" class="btn secondary" onclick="leaveTest()">Hall</button>' +
    '</div>';
  showScreen("screen-test");
  var nav = document.getElementById("main-nav");
  if (nav) nav.style.display = "flex";
  setTimeout(function(){
    var el = document.getElementById("test-guess");
    if (!el) return;
    el.addEventListener("keydown", function(e){ if (e.key==="Enter"){ e.preventDefault(); submitTest(); } });
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
    (typeof factBlock==="function" ? factBlock(p, true) : "") +
    '<div class="btn-row" style="margin-top:12px;"><button type="button" class="btn primary" onclick="nextTest()">Next door</button></div>';
}
function submitTest(){
  if (!testP) return;
  var input = document.getElementById("test-guess");
  var guess = (input && input.value) || "";
  if (!foldName(guess)) { toast("Type a name, or tap Speak", "warm"); return; }
  if (nameMatches(guess, testP)) {
    if (typeof bumpGood==="function") bumpGood(testP);
    toast("#"+testP.n+" "+testP.short+" \u2014 yes", "success");
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
  var input = document.getElementById("test-guess");
  if (input) input.blur();
  if (testListening && testRec) {
    try { testRec.stop(); } catch(e){}
    testListening = false;
    var mic0 = document.getElementById("test-mic");
    if (mic0) mic0.textContent = "\ud83c\udfa4 Speak";
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
  var mic = document.getElementById("test-mic");
  if (mic) mic.textContent = "Listening\u2026";
  toast("Listening \u2014 say the last name", "warm");
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
      if (mic) mic.textContent = "\ud83c\udfa4 Speak";
      submitTest();
    }
  };
  testRec.onerror = function(ev){
    testListening = false;
    if (mic) mic.textContent = "\ud83c\udfa4 Speak";
    var err = (ev && ev.error) || "";
    if (err === "not-allowed" || err === "service-not-allowed") {
      toast("Allow the microphone, then tap Speak again.", "warm");
    } else if (err === "no-speech") {
      toast("Did not catch that. Tap Speak and try once more.", "warm");
    } else if (err !== "aborted") {
      toast("Could not hear that. Type the last name.", "warm");
    }
  };
  testRec.onend = function(){
    var wasListening = testListening;
    testListening = false;
    if (mic) mic.textContent = "\ud83c\udfa4 Speak";
    if (!gotFinal) {
      if (foldName(heard) || (input && foldName(input.value))) {
        submitTest();
      } else if (wasListening && testSpeechPass <= 2) {
        toast("Mic is on. Tap Speak once more, then say the name.", "warm");
      }
    }
  };
  try {
    testRec.start();
  } catch (e) {
    testListening = false;
    if (mic) mic.textContent = "\ud83c\udfa4 Speak";
    toast("Mic did not start. Type the last name.", "warm");
  }
}
function leaveTest(){
  if (testRec) try { testRec.abort(); } catch(e){}
  testListening = false;
  testP = null; testQueue = [];
  if (typeof leaveWalk==="function") leaveWalk();
  else if (typeof showHome==="function") showHome();
}
