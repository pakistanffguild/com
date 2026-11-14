/* PAKISTAN FF GUILD - PWA + photos. Load at the very end of index.html: <script src="pwa.js"></script> */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };

  /* ---------- 1) Member & leader photos ---------- */
  var EXT = ["jpg", "jpeg", "png", "webp"];
  /* leaders: exact file names you already use */
  var LEAD = { "AHMAD FF": "ahmad ff", "INTROVERT FF": "introvert ff", "HAMMAD FF": "hammad ff", "AMBIVERT FF": "onefire ff" };
  var slug = function (n) { return n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); };

  function candidates(name) {
    var c = [], b = LEAD[name.toUpperCase()];
    if (b) EXT.forEach(function (e) { c.push(b + "." + e); });
    EXT.forEach(function (e) { c.push("members/" + slug(name) + "." + e); });
    if (b) EXT.forEach(function (e) { c.push("members/" + b + "." + e); });
    return c;
  }
  function attach(box, name) {
    if (!box || box.dataset.p) return;
    box.dataset.p = "1";
    box.querySelectorAll("img").forEach(function (x) { x.remove(); });
    var list = candidates(name), k = 0, img = new Image();
    img.alt = name; img.decoding = "async"; img.loading = "lazy";
    img.onerror = function () { k++; if (k < list.length) img.src = encodeURI(list[k]); else img.remove(); };
    img.src = encodeURI(list[0]);
    box.appendChild(img);
  }
  function photos() {
    document.querySelectorAll(".mc").forEach(function (c) {
      var b = c.querySelector("b"); if (b) attach(c.querySelector(".av i"), b.textContent.trim());
    });
    document.querySelectorAll("#tm .gc").forEach(function (c) {
      var h = c.querySelector("h3"); if (h) attach(c.querySelector(".av i"), h.textContent.trim());
    });
  }
  var st = document.createElement("style");
  st.textContent = ".av i img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:50%;background:#14141c}";
  document.head.appendChild(st);
  photos();

  /* ---------- 2) App icons / meta for iOS + Android ---------- */
  function meta(n, v) { if (!document.querySelector('meta[name="' + n + '"]')) { var m = document.createElement("meta"); m.name = n; m.content = v; document.head.appendChild(m); } }
  function link(r, h, s) { if (!document.querySelector('link[rel="' + r + '"]')) { var l = document.createElement("link"); l.rel = r; l.href = h; if (s) l.sizes = s; document.head.appendChild(l); } }
  link("apple-touch-icon", "icons/icon-180.png", "180x180");
  link("icon", "icons/icon-192.png");
  meta("mobile-web-app-capable", "yes");
  meta("apple-mobile-web-app-capable", "yes");
  meta("apple-mobile-web-app-title", "PK FF GUILD");
  meta("apple-mobile-web-app-status-bar-style", "black-translucent");

  /* ---------- 3) Service worker (offline) ---------- */
  if ("serviceWorker" in navigator) {
    addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
  addEventListener("offline", function () { if (typeof toast === "function") toast("📴 Offline mode - saved pages still work", true); });
  addEventListener("online", function () { if (typeof toast === "function") toast("✅ Back online"); });

  /* ---------- 4) Install banner ---------- */
  var ib = $("#install"), dp = null, KEY = "pffInstallHide";
  if (!ib) return;
  var standalone = function () { return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true; };
  var snoozed = function () { try { return +localStorage.getItem(KEY) > Date.now(); } catch (e) { return false; } };
  var snooze = function () { try { localStorage.setItem(KEY, Date.now() + 3 * 864e5); } catch (e) {} };
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  function banner(text, btn) {
    ib.innerHTML = "<span>" + text + "</span><span style='display:flex;gap:8px;align-items:center'>" +
      (btn ? "<b id='ixgo' style='background:#fff;color:#c40500;padding:6px 14px;border-radius:20px;font-size:13px'>Install</b>" : "") +
      "<button id='ix' aria-label='Close'>✕</button></span>";
    ib.style.display = "flex";
  }
  addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); dp = e;
    if (standalone() || snoozed()) { ib.style.display = "none"; return; }
    banner("📲 Install PAKISTAN FF GUILD app", true);
  });
  ib.onclick = function (e) {
    if (e.target.closest("#ix")) { ib.style.display = "none"; snooze(); return; }
    if (dp) {
      dp.prompt();
      dp.userChoice.then(function (r) { if (r.outcome !== "accepted") snooze(); dp = null; ib.style.display = "none"; });
    }
  };
  addEventListener("appinstalled", function () {
    ib.style.display = "none";
    if (typeof toast === "function") toast("✅ App installed!");
  });
  if (ios && !standalone() && !snoozed()) {
    setTimeout(function () { banner("📲 Install: tap <b>Share ⬆</b> then <b>Add to Home Screen</b>", false); }, 2500);
  }
})();
