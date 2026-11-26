/**
 * Consultation prompt for SEO pages.
 * Shows at 50% scroll or after 30 seconds, whichever comes first.
 * Dismissal lasts 7 days. A CTA click lasts 30 days. Both use localStorage.
 */
(function () {
  var DWELL_MS = 30000;
  var DISMISS_MS = 7 * 24 * 60 * 60 * 1000;
  var CTA_MS = 30 * 24 * 60 * 60 * 1000;
  var STORAGE_KEY = "protechConsultCooldown";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pathName() {
    var path = window.location.pathname || "/";
    if (path.length > 1 && path.charAt(path.length - 1) === "/") path = path.slice(0, -1);
    path = path.replace(/\/index\.html$/, "").replace(/\.html$/, "");
    return path || "/";
  }

  function isExcluded() {
    var path = pathName();
    if (path === "/" || path === "/index") return true;
    var blocked = ["/contact", "/en/contact", "/cn/contact", "/admin", "/blog-post"];
    for (var i = 0; i < blocked.length; i++) {
      if (path === blocked[i] || path.indexOf(blocked[i] + "/") === 0) return true;
    }
    return false;
  }

  function cooldownActive() {
    try {
      return parseInt(window.localStorage.getItem(STORAGE_KEY) || "0", 10) > Date.now();
    } catch (err) {
      return false;
    }
  }

  function remember(ms) {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now() + ms));
    } catch (err) {}
  }

  function language() {
    var lang = (document.documentElement.getAttribute("lang") || "").toLowerCase();
    var path = pathName();
    if (lang.indexOf("en") === 0 || path === "/en" || path.indexOf("/en/") === 0) return "en";
    if (lang === "zh-tw" || lang === "zh-hant" || path.indexOf("/zh-tw") !== -1) return "zh-Hant";
    if (lang.indexOf("zh") === 0 || path === "/cn" || path.indexOf("/cn/") === 0) return "zh-Hans";
    return "ja";
  }

  function copyFor(lang) {
    if (lang === "en") {
      return { label: "Consultation", text: "Ask about Xiaohongshu, Dianping, or a custom Japan trip.", cta: "Free Consultation", close: "Close", href: "/en/contact" };
    }
    if (lang === "zh-Hans") {
      return { label: "咨询", text: "欢迎咨询小红书、大众点评或日本行程安排。", cta: "免费咨询", close: "关闭", href: "/cn/contact" };
    }
    if (lang === "zh-Hant") {
      return { label: "諮詢", text: "歡迎諮詢小紅書、大眾點評或日本行程安排。", cta: "免費諮詢", close: "關閉", href: "/cn/contact" };
    }
    return { label: "ご相談", text: "小紅書・大衆点評・訪日旅行のご相談を受け付けています。", cta: "無料相談する", close: "閉じる", href: "/contact" };
  }

  function injectStyles() {
    if (document.getElementById("protech-consult-style")) return;
    var style = document.createElement("style");
    style.id = "protech-consult-style";
    style.textContent = [
      "#protech-consult{position:fixed;z-index:70;right:16px;bottom:16px;width:min(340px,calc(100vw - 32px));pointer-events:none;font-family:\"Noto Sans JP\",\"Noto Sans SC\",\"Noto Sans TC\",sans-serif;opacity:0;transform:translateY(8px);transition:opacity .28s ease,transform .28s ease;}",
      "#protech-consult.is-in{opacity:1;transform:none;}",
      "#protech-consult.is-out{opacity:0;transform:translateY(8px);}",
      "#protech-consult .protech-consult__card{pointer-events:auto;background:#fff;color:#001A33;border:1px solid rgba(0,26,51,.08);border-radius:16px;box-shadow:0 12px 32px rgba(0,26,51,.16);padding:16px 16px 14px;}",
      "#protech-consult .protech-consult__label{margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#B4495A;}",
      "#protech-consult .protech-consult__text{margin:0 0 12px;font-size:13px;line-height:1.6;color:#334155;}",
      "#protech-consult .protech-consult__actions{display:flex;align-items:center;gap:8px;}",
      "#protech-consult .protech-consult__cta{display:inline-flex;align-items:center;justify-content:center;flex:1;background:#B4495A;color:#fff;text-decoration:none;border-radius:999px;padding:10px 14px;font-size:12px;font-weight:700;letter-spacing:.04em;}",
      "#protech-consult .protech-consult__cta:hover{opacity:.88;}",
      "#protech-consult .protech-consult__close{display:inline-flex;align-items:center;gap:4px;background:transparent;border:0;color:#475569;font-size:12px;font-weight:700;cursor:pointer;padding:8px;}",
      "@media (max-width:640px){#protech-consult{left:8px;right:8px;bottom:8px;width:auto;max-height:72px;}#protech-consult .protech-consult__card{display:flex;flex-wrap:nowrap;align-items:center;gap:8px;max-height:72px;overflow:hidden;box-sizing:border-box;padding:8px 10px;border-radius:14px;}#protech-consult .protech-consult__label{display:none;}#protech-consult .protech-consult__text{flex:1 1 auto;margin:0;font-size:12px;line-height:1.3;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;}#protech-consult .protech-consult__actions{flex:0 0 auto;}#protech-consult .protech-consult__cta{padding:6px 8px;}}",
      "@media (prefers-reduced-motion:reduce){#protech-consult{transition:none;transform:none;}}"
    ].join("");
    document.head.appendChild(style);
  }

  function dismiss(root, ms) {
    remember(ms);
    root.classList.remove("is-in");
    root.classList.add("is-out");
    var remove = function () {
      if (root.parentNode) root.parentNode.removeChild(root);
    };
    if (reduce) { remove(); return; }
    root.addEventListener("transitionend", remove, { once: true });
    window.setTimeout(remove, 360);
  }

  function show(copy) {
    if (document.getElementById("protech-consult")) return;
    injectStyles();
    var root = document.createElement("aside");
    root.id = "protech-consult";
    root.setAttribute("role", "complementary");
    root.setAttribute("aria-label", copy.cta);
    var card = document.createElement("div");
    card.className = "protech-consult__card";
    var label = document.createElement("p");
    label.className = "protech-consult__label";
    label.textContent = copy.label;
    var text = document.createElement("p");
    text.className = "protech-consult__text";
    text.textContent = copy.text;
    var actions = document.createElement("div");
    actions.className = "protech-consult__actions";
    var cta = document.createElement("a");
    cta.className = "protech-consult__cta";
    cta.href = copy.href;
    cta.textContent = copy.cta;
    cta.addEventListener("click", function () { remember(CTA_MS); });
    var close = document.createElement("button");
    close.type = "button";
    close.className = "protech-consult__close";
    close.setAttribute("aria-label", copy.close);
    close.appendChild(document.createTextNode("×"));
    var closeWord = document.createElement("span");
    closeWord.textContent = copy.close;
    close.appendChild(closeWord);
    close.addEventListener("click", function () { dismiss(root, DISMISS_MS); });
    actions.appendChild(cta);
    actions.appendChild(close);
    card.appendChild(label);
    card.appendChild(text);
    card.appendChild(actions);
    root.appendChild(card);
    document.body.appendChild(root);
    if (reduce) root.classList.add("is-in");
    else requestAnimationFrame(function () { root.classList.add("is-in"); });
  }

  function start() {
    if (isExcluded() || cooldownActive()) return;
    var copy = copyFor(language());
    var shown = false;
    function fire() {
      if (shown || cooldownActive()) return;
      shown = true;
      show(copy);
    }
    window.setTimeout(fire, DWELL_MS);
    window.addEventListener("scroll", function onScroll() {
      var doc = document.documentElement;
      var max = Math.max(doc.scrollHeight, document.body.scrollHeight) - window.innerHeight;
      var y = window.scrollY || doc.scrollTop || document.body.scrollTop || 0;
      if (max > 8 && y / max >= 0.5) {
        window.removeEventListener("scroll", onScroll);
        fire();
      }
    }, { passive: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
