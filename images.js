const IMG_VER = "8309";
const IMG_IDS = {
  1:"1CV9HkoC4lMIihbPiygQMGMATvAOEeeGX",
  2:"1qa74L1N69Mv-Bpe05pKAPUpMHQ1KkIvo",
  3:"1HoCU4dWKnvZvbJI-KXq61Z8q8ocAxtgS",
  4:"1n6_F5e7NqQ-dPicn-68J4KcgfONH5WHt",
  5:"1S47fkJS7U9UG-OCO9FuQiazomlLnmkIW",
  6:"1wJleyzQPplaujd8C_KFjMxyD8HQDhNu4",
  7:"1CHimHJ6Z7ASWtaaaf2Dehu_EYsUQvw-z",
  8:"1XaTkMg4i1jBX5Zemk9WUaLZ0MMCO65dn",
  9:"1svv-kZgFKsJJlw5irQwBRm1xP5CGLm9t",
  10:"1t2Ls8F4gbN7Z0tGHzXbYnloqkBtdbmb-",
  11:"1KtyxhDtvbuCM_wtNm2CKsJRrV6XC-Fol",
  12:"1w1BFKzzRuz4KmpdyKXamxZPckNI6FimM",
  13:"1onzzMvySWkQvKrmocg1RkHL8339OkRC_",
  14:"1rhmvPK6MBN4SiHzzjnV_nIhIpWETVxsM",
  15:"1P9sCh4bhwETM5K2ymzvtxrxveyxlyf8d",
  16:"1nquprQ1h2dKcfx3hm9bIReIHCwC5yJZq",
  17:"1SK3CIbL-9UUPLyqY3--hWZux1RhNowZz",
  18:"1Mpi0OCh7f-fO5p9cWrAmu2PmlkCLa9nY",
  19:"1Sl46Di0cwgIn1ofRUaTzxjzkqTd0Oh-g",
  20:"1gHf7Dkkoyk-o-s3YNXLTVuR4B_-39EZV",
  21:"12mia_GfpemFTfh0r3mMEuMpEVi2WvBve",
  22:"1STitEB7w8jMeyqH8wFzEKdK6TjHHUwSA",
  23:"1sfcSrEFhMnr0xM5N5VQ91jyQy93FeVH1",
  24:"1YVzF1ORJxzRcxcdDBTha4Nxv5ch_Eq12",
  25:"1sWtQ5D75kohONJWA1-DzYh4U0k4pL1OE",
  26:"1KrOXhWI58jUvdU7bf-Y6PRPRIitlekLL",
  27:"1olAfCISnI_cDmzdyeFl_yo9KI61CDtTH",
  28:"1VjZ7iRstmay1JbYtIbarR1tPu72fEQF9",
  29:"14o6kb1EMFlwz1wJ-5dnSGUFH-L6DI23Z",
  30:"1QBmGeCXpFfLU7KzjWZ7BHWMQ4PsT2yVE",
  31:"15j-dKE2aiH4iDIp5MfZKIjbdx9rg69sd",
  32:"1qqckqnK9McQqrV5yM1-uSyDve-denyXp",
  33:"1y-HccB6OGWcKqWP2J9obeP_6DJBCGaTR",
  34:"1YhyFLn4PK0zX0UG27wJDqR1WQgWFHF6q",
  35:"1NO9mjyLPqqMtxMHh2Pt8HY9VTbq48nhs",
  36:"1uFPXYa5cFTiX_J5ISdzo00HBv7v_0V6S",
  37:"1WaWtsADxJ2nm6QiqKcrSvSSvV8_B0KK8",
  38:"17hguDbR1osNP9-WrADo-hcaQ9NnhJ0Aa",
  39:"1J2X9juapsuIKhl_e37YrIotWZGKsnEga",
  40:"1-A2brTivxZvMbJvDgSh9DMkh5kqJOgYa",
  41:"1LnLrtDnCLGZZJnLE7ijNzHeEAcpFpIBU",
  42:"1BKJJS4uDJEqb0IopWiV2s7Flz3KM0oZC",
  43:"1e2dpXlbaCnBzUYe1F-Av8PAScUSYI5hL",
  44:"1sdFHhEdJGvJJOPLjRlf9-qOHKigdCKTQ",
  45:"1xPmD1MVuRa-Gx0FeBAgPfwpWftxsjGLR",
  46:"1koEKdQpl8nl_vW666VdHrrAdOk9Ep2hV",
  47:"1UB503X611LNQDrKbmzbY1qV_6rMIa0SO"
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
