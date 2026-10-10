/* ---------- theme, font, install, update ---------- */
function setTheme(dark) {
  if (dark) document.documentElement.dataset.theme = "dark"; else delete document.documentElement.dataset.theme;
  try { localStorage.setItem("abide.theme", dark ? "dark" : "light"); } catch {}
  $("themeColor").content = dark ? "#110e1c" : "#f6f4fb";
  $("themeBtn").innerHTML = dark ? ICONS.sunSmall : ICONS.moon;
}
const applyFont = () => document.documentElement.style.setProperty("--read-size", settings.font + "px");
$("themeBtn").onclick = () => { setTheme(document.documentElement.dataset.theme !== "dark"); if (route.view === "settings") render(); };
setTheme(document.documentElement.dataset.theme === "dark");
applyFont();

let installPrompt = null;
// "Installed" is remembered when the browser confirms it, so the button stays right in the browser
// tab too. If the browser offers to install again, the app was removed, so forget it.
const installed = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
const wasInstalled = () => { try { return localStorage.getItem("abide.installed") === "1"; } catch { return false; } };
function renderInstall() {
  const b = $("install"); if (!b) return;
  if (installed() || wasInstalled()) { b.textContent = installed() ? "Installed ✓" : "Installed ✓ · open it from your home screen"; b.disabled = true; $("installHelp")?.classList.add("hidden"); }
  else { b.textContent = "Install on this phone"; b.disabled = false; }
}
addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installPrompt = e; try { localStorage.removeItem("abide.installed"); } catch {} renderInstall(); });
addEventListener("appinstalled", () => { installPrompt = null; try { localStorage.setItem("abide.installed", "1"); } catch {} toast("Installed"); renderInstall(); });
async function install() {
  // The browser's install box can be shown only once per visit; after that, show the menu steps.
  if (installPrompt) { const p = installPrompt; installPrompt = null; try { p.prompt(); await p.userChoice; } catch {} renderInstall(); return; }
  const help = $("installHelp");
  help.innerHTML = /iphone|ipad|ipod/i.test(navigator.userAgent) ? "In Safari, tap <b>Share</b>, then <b>Add to Home Screen</b>." : "Tap your browser's menu <b>⋮</b>, then <b>Install app</b> or <b>Add to Home screen</b>.";
  help.classList.remove("hidden");
}
async function checkForUpdate() {
  try {
    const text = await (await fetch("sw.js?check=" + Date.now(), { cache: "no-store" })).text();
    const live = (text.match(/CACHE = "([^"]+)"/) || [])[1];
    $("updateBar").classList.toggle("hidden", !live || live === APP_VERSION);
  } catch {}
}
$("updateBar").onclick = () => location.reload();
document.addEventListener("visibilitychange", () => { if (!document.hidden) { checkForUpdate(); if (route.view === "today") render(); } });
setInterval(checkForUpdate, 10 * 60 * 1000);
