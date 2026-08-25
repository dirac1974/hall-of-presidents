if (typeof updateMission === "function") {
  var _updateMissionSafe = updateMission;
  updateMission = function(){
    if (!document.getElementById("mission-text")) {
      if (typeof paintNext === "function") paintNext();
      return;
    }
    _updateMissionSafe();
  };
}
if (typeof showHome === "function") {
  var _showHomeSafe = showHome;
  showHome = function(){
    if (typeof walkTimer !== "undefined" && walkTimer) {
      clearTimeout(walkTimer);
      walkTimer = null;
    }
    try { _showHomeSafe(); }
    catch (e) {
      if (typeof paintNext === "function") paintNext();
      showScreen("screen-home");
    }
  };
}
