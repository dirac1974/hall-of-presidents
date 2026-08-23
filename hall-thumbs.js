(function () {
  var original = renderHall;
  renderHall = function () {
    original();
    var portraits = document.querySelectorAll("#hall .portrait");
    portraits.forEach(function (div, i) {
      var p = PRESIDENTS[i];
      if (!p) return;
      var src = presImg(p.n, 240);
      if (!src) return;
      var img = document.createElement("img");
      img.src = src;
      img.alt = p.short;
      img.style.cssText = "width:100%;height:92px;object-fit:cover;border-radius:8px;margin:4px 0;";
      img.onerror = function () { this.style.display = "none"; };
      var nameEl = div.querySelector(".name");
      if (nameEl) div.insertBefore(img, nameEl);
    });
  };
})();
