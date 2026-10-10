/* ---------- views ---------- */
const TAB_OF = { body: "more", lock: "more", declare: "today", dreams: "more", dream: "more", meditate: "today", today: "today", bible: "bible", book: "bible", read: "bible", word: "word", messages: "messages", more: "more", fasting: "more", prayer: "more", journal: "more", lessons: "more", settings: "more" };
let route = { view: "today" };
const trail = [];
function go(view, params = {}, push = true) {
  if (push && route.view !== view) trail.push(route);
  route = { view, ...params };
  render();
  window.scrollTo(0, 0);
}
function back() { route = trail.pop() || { view: TAB_OF[route.view] }; render(); window.scrollTo(0, 0); }
function render() {
  const v = route.view, tab = TAB_OF[v];
  if (v !== "dream") { dropEmptyDreams(); if (recognizer) { recognizer.stop(); recognizer = null; } }
  document.querySelectorAll("nav button").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
  $("backBtn").classList.toggle("hidden", v === tab);
  document.querySelector("header").classList.toggle("home-head", v === "today");
  $("appIcon").classList.toggle("hidden", v !== "today");
  const h = new Date().getHours();
  $("hello").textContent = `${h < 5 || h >= 21 ? "Good night" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"}${settings.name ? ", " + settings.name : ""}`;
  if (!BIBLE && ["today", "bible", "book", "read", "settings"].includes(v)) { $("main").innerHTML = '<div class="loading">Opening the Bible…</div>'; bibleReady.then(render); return; }
  if (PRIVATE.includes(v) && isLocked()) { route = { view: "lock", next: v, ...(v === "dream" ? { id: route.id } : {}) }; return VIEWS.lock(); }
  if (v !== "declare" && "speechSynthesis" in window) speechSynthesis.cancel();
  VIEWS[v]();
  if (tab === v) try { localStorage.setItem("abide.tab", v); } catch {}
}
const setTitle = (t) => ($("pageTitle").textContent = t);
const main = (html) => { $("main").innerHTML = `<section class="view">${html}</section>`; return $("main"); };

// Each screen adds itself from its own file in js/features/.
const VIEWS = {};
