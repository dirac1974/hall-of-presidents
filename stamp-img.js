function stampImg(img){
  if (!img || img.tagName !== "IMG") return;
  img.setAttribute("referrerpolicy", "no-referrer");
  img.referrerPolicy = "no-referrer";
  if (!img.getAttribute("loading")) img.loading = "lazy";
  if (!img.onerror) img.onerror = function(){ imgFail(img); };
}
function stampAll(){
  document.querySelectorAll("img").forEach(stampImg);
}
if (window.MutationObserver) {
  new MutationObserver(function(muts){
    muts.forEach(function(m){
      m.addedNodes && m.addedNodes.forEach(function(n){
        if (n.tagName === "IMG") stampImg(n);
        if (n.querySelectorAll) n.querySelectorAll("img").forEach(stampImg);
      });
    });
  }).observe(document.documentElement, { childList:true, subtree:true });
}
document.addEventListener("DOMContentLoaded", stampAll);
stampAll();
