(function () {
  var original = renderHall;
  renderHall = function () {
    original();
    var portraits = document.querySelectorAll("#hall .portrait");
    portraits.forEach(function (div, i) {
      var p = PRESIDENTS[i];
      if (!p) return;
      var hold = document.createElement("div");
      hold.innerHTML = imgTag(p.n, 240, "width:100%;height:88px;object-fit:cover;border-radius:8px;margin:4px 0;background:#efe0c8;");
      var img = hold.firstChild;
      if (!img) return;
      img.loading = "eager";
      var nameEl = div.querySelector(".name");
      if (nameEl) div.insertBefore(img, nameEl);
    });
  };
})();
