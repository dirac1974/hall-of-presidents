const IMG_VER = "8308";
const IMG_IDS = {
  1:"1TD9UsI14L1fsPHnnCsqG9HHdrLD1IfDH",
  2:"1mea_p_THjTZrBn2qRFUuWs15U-Kw8a7P",
  3:"1xZD0tEPdWuCdPrr7r6IhAnMFfAKqIsbE",
  4:"1reK28OwyDJiJyxWLhCNuJTIPu2VojjeO",
  5:"1FbCrHjAoDlLBQTg39b_-moGnBWLYtVlc",
  6:"13wXe1nLx-BoABjp8KE7wujYIo8ngHRMI",
  7:"1WWK6JlniNHP8-L-LNPiDS45Ggu0_tcTs",
  8:"176PQFzEo2F8SQXY2a2a8WdhqUL0FEI1G",
  9:"19b3RQ3TohL5-FtHUiSjqEZEVk1340oXm",
  10:"1ahTNWv1xbElqT57EtXMKzmTUfEhYd6wZ",
  11:"1NhyAvxF6si38gHBOsNn3cRjbZvkTYcnA",
  12:"1GoMkoVqhAl797d08xsOVMUzhzhBGO95i",
  13:"1AO0F9rtDzWUaLyB_OqoYNn5yMyk9WY7F",
  14:"1sKVUSE-C_zv3GQ1lLG67Z8ZpoDgDIw01",
  15:"1dsJYTLyIGOBt8e4QZ3--dJW3tzXSIhDI",
  16:"1YXdMfhh2XfUrgU9heHbwbTxOhiRm7YeE",
  17:"1SK3CIbL-9UUPLyqY3--hWZux1RhNowZz",
  18:"1kmpMzkFazKrksIA61_uVknlL-fuuewWQ",
  19:"1mQZ6O6Lhd8amNgkrk3Gmmcc4rDpG2Wk4",
  20:"1yzpPZgy_ma0CDRtDdrI3iiihCzguwaie",
  21:"12mia_GfpemFTfh0r3mMEuMpEVi2WvBve",
  22:"1RufaeaLDyKSS_f_6YoDhuTDdXKdeoxIx",
  23:"1sfcSrEFhMnr0xM5N5VQ91jyQy93FeVH1",
  24:"1k-0fTgeZiys0SBsrzHyaWaa_jcZsh3j0",
  25:"1sWtQ5D75kohONJWA1-DzYh4U0k4pL1OE",
  26:"1KrOXhWI58jUvdU7bf-Y6PRPRIitlekLL",
  27:"1olAfCISnI_cDmzdyeFl_yo9KI61CDtTH",
  28:"1GqXIgKqBzdoZ18qNW2OtjF-qlZn1d5UR",
  29:"1K66MYdDxmoRoQA7dBTdkP01l0PF41FRM",
  30:"1BcozAW76m-jj1qgJx9APcKIppJVCvVVq",
  31:"1Zcnaz2sfLvgDuf8t7Z4Z2-VRDfw4rLFm",
  32:"1k3KD837EbvYisXvTVdmmRAuX8uYfeh5S",
  33:"1gNEC9KquDtfwKOf01KpSUseFMNEtw7pl",
  34:"1T6lAnftYRXdvEKszws7tPFER1ymhFALe",
  35:"1EVIPL92t5F1l2Kk7-96Gy2kHrG8lQXYu",
  36:"1Y5b2ksJmQ1d9N12L9nZoqgHooX-FngN_",
  37:"1TAC3l8JA0u_rF7DcN_B-ieMe6YR7tFXp",
  38:"1rw2qp5Iwtt5vXrHvpJqo7RbWkl6e6NOp",
  39:"13A_8K2Lpz6jlbGsrWZvD3Y0-r7kbp-Uq",
  40:"1BsTBShEwZ7FY6JpTaFnDR_IdHj7fg4gk",
  41:"1yWKNs3BJDJNHpkh75Lqdu7GXKEfpM4nh",
  42:"1pgisXvq0ew_p59YL0kKER9SAQN-8MbzQ",
  43:"1eZcShS8KcPM9jSUttRFVD0d8oZeCvHf8",
  44:"1geeV36kIyHB5RttqwnCCQKNwcw3Djki-",
  45:"1cCmq2hRQ0x6sGPyrFJv_GKNuoCg4YABo",
  46:"1KP9BRU-2OfkO2Fgr84-ES26Wk6pkVJvH",
  47:"183M2jiTkREPi6OIDW6rYlR7hFaNe65n7"
};
const IMG_LOCAL = { 29: "images/pres-29.svg" };

function pad2(n){ return (n<10?"0":"")+n; }
function personOf(n){
  return (typeof PRESIDENTS!=="undefined" && PRESIDENTS[n-1]) || { n:n, short:"#"+n, emoji:"\ud83c\udff4" };
}
function localCardSrc(n){
  var p = personOf(n);
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520">' +
    '<rect width="400" height="520" rx="28" fill="#c9a36a"/>' +
    '<rect x="18" y="18" width="364" height="484" rx="20" fill="#f6ead2"/>' +
    '<text x="200" y="210" text-anchor="middle" font-size="92">'+(p.emoji||"")+'</text>' +
    '<text x="200" y="300" text-anchor="middle" font-family="Georgia,serif" font-size="28" fill="#5a3a1c">#'+n+'</text>' +
    '<text x="200" y="348" text-anchor="middle" font-family="Georgia,serif" font-size="26" fill="#3d2b1a">'+(p.short||"")+'</text>' +
    '</svg>';
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
function presImg(n, w){
  if (IMG_LOCAL[n]) return IMG_LOCAL[n] + "?v=" + IMG_VER;
  var id = IMG_IDS[n];
  if (!id) return localCardSrc(n);
  var sz = w || 600;
  if (n >= 29) return "https://drive.google.com/thumbnail?id=" + id + "&sz=w" + sz + "&v=" + IMG_VER;
  return "https://lh3.googleusercontent.com/d/" + id + "=s" + sz + "#v" + IMG_VER;
}
function presImgAlt(n, w){
  var id = IMG_IDS[n];
  if (!id) return localCardSrc(n);
  var sz = w || 600;
  if (n >= 29) return "https://lh3.googleusercontent.com/d/" + id + "=s" + sz;
  return "https://drive.google.com/thumbnail?id=" + id + "&sz=w" + sz + "&v=" + IMG_VER;
}
function imgFail(el){
  var n = Number(el.dataset.n||0);
  var tried = Number(el.dataset.tried||0);
  el.dataset.tried = String(tried + 1);
  if (tried === 0) {
    var alt = presImgAlt(n, Number(el.dataset.w||600));
    if (alt && alt !== el.src) { el.src = alt; return; }
  }
  if (tried === 1) {
    el.src = localCardSrc(n);
    return;
  }
  el.style.display = "none";
  var em = el.nextElementSibling;
  if (em && em.classList && em.classList.contains("emoji")) em.style.display = "block";
}
function imgTag(n, w, style){
  var src = presImg(n, w);
  if (!src) return "";
  var st = style || "width:100%;max-width:280px;border-radius:14px;margin:10px auto;display:block;";
  return '<img alt="" data-n="'+n+'" data-w="'+(w||600)+'" referrerpolicy="no-referrer" loading="eager" src="'+src+'" onerror="imgFail(this)" style="'+st+'">';
}
