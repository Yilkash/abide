/* ---------- small helpers ---------- */
let toastTimer;
function toast(html) { const t = $("toast"); t.innerHTML = html; t.classList.add("show"); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2000); }
let askDone = null;
function ask({ title, text, yes = "Yes", no = "Go back", danger = false }) {
  $("askTitle").textContent = title; $("askText").textContent = text; $("askYes").textContent = yes; $("askNo").textContent = no;
  $("ask").classList.toggle("danger", danger); $("ask").classList.add("open"); $("askScrim").classList.add("open");
  return new Promise((r) => (askDone = r));
}
function closeAsk(a) { $("ask").classList.remove("open"); $("askScrim").classList.remove("open"); if (askDone) { askDone(a); askDone = null; } }
$("askYes").onclick = () => closeAsk(true); $("askNo").onclick = () => closeAsk(false); $("askScrim").onclick = () => closeAsk(false);
function openSheet(html, wire) { $("sheetBody").innerHTML = `<div class="grab"></div>${html}`; $("scrim").classList.add("open"); $("sheet").classList.add("open"); wire && wire($("sheetBody")); }
function closeSheet() { $("scrim").classList.remove("open"); $("sheet").classList.remove("open"); }
$("scrim").onclick = closeSheet;
