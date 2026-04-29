(function () {
  "use strict";

  var APP = window.APP;

  APP.showScreen = function showScreen(el) {
    var screens = document.querySelectorAll(".screen");
    var i;
    for (i = 0; i < screens.length; i++) screens[i].classList.remove("is-active");
    el.classList.add("is-active");
  };

  APP.getQuery = function getQuery(name) {
    try {
      var u = new URL(window.location.href);
      return u.searchParams.get(name);
    } catch (e) {
      return null;
    }
  };

  APP.buildWallViewLink = function buildWallViewLink() {
    try {
      var u = new URL(window.location.href);
      u.searchParams.set("view", "wall");
      u.hash = "#wall";
      return u.toString();
    } catch (e) {
      return window.location.href.split("#")[0] + "?view=wall#wall";
    }
  };

  APP.wait = function wait(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  };
})();
export {};
