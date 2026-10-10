/* ---------- start ---------- */
$("backBtn").innerHTML = ICONS.back;
$("backBtn").onclick = back;
document.querySelectorAll("nav button").forEach((b) => (b.onclick = () => { trail.length = 0; go(b.dataset.tab, {}, false); }));
// Open straight to a section from a reminder link, e.g. …/#today
let first = "today";
try { first = location.hash.slice(1) || localStorage.getItem("abide.tab") || "today"; } catch {}
route = { view: VIEWS[first] && TAB_OF[first] === first ? first : "today" };
// A reminder link (…/#today) opened while the app is already open.
addEventListener("hashchange", () => { const h = location.hash.slice(1); if (VIEWS[h] && TAB_OF[h] === h) { trail.length = 0; go(h, {}, false); } });
render();
checkForUpdate();
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
