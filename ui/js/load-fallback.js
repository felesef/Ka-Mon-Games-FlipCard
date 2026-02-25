(function () {
  setTimeout(function () {
    if (typeof window.newGame !== "function") {
      var el = document.createElement("p");
      el.style.cssText = "background:#c00;color:#fff;padding:12px;text-align:center;margin:0;";
      el.textContent = "App failed to load. Open from http://localhost:3000 (run npm start in project root).";
      document.body.insertBefore(el, document.body.firstChild);
    }
  }, 3000);
})();
