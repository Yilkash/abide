// Private pages behind an optional 4-digit PIN. It keeps a casual look away; it is not encryption.
const PRIVATE = ["prayer", "journal", "dreams", "dream", "body"];
async function pinHash(pin, salt) {
  const data = new TextEncoder().encode(`abide:${salt}:${pin}`);
  if (crypto?.subtle) return [...new Uint8Array(await crypto.subtle.digest("SHA-256", data))].map((b) => b.toString(16).padStart(2, "0")).join("");
  let h = 2166136261; for (const b of data) { h ^= b; h = Math.imul(h, 16777619); } return "f" + (h >>> 0).toString(16);
}
const isLocked = () => !!lockSet && !unlocked;
document.addEventListener("visibilitychange", () => {
  if (document.hidden) hiddenAt = Date.now();
  else if (lockSet && unlocked && Date.now() - hiddenAt > 2 * 60 * 1000) { unlocked = false; if (PRIVATE.includes(route.view)) render(); }
});
function pinPad(el, onDone) {
  let pin = "";
  const dots = el.querySelector(".dots");
  const paint = () => dots.querySelectorAll("i").forEach((d, k) => d.classList.toggle("on", k < pin.length));
  el.querySelectorAll("[data-k]").forEach((b) => (b.onclick = async () => {
    const k = b.dataset.k;
    if (k === "del") pin = pin.slice(0, -1);
    else if (pin.length < 4) pin += k;
    paint();
    if (pin.length === 4) { const p = pin; pin = ""; setTimeout(paint, 180); await onDone(p, () => { dots.classList.remove("shake"); void dots.offsetWidth; dots.classList.add("shake"); }); }
  }));
}
const keypadHtml = () => `<div class="dots"><i></i><i></i><i></i><i></i></div><div class="msg" id="pinMsg"></div>
  <div class="keypad">${["1","2","3","4","5","6","7","8","9","","0","del"].map((k) => k ? `<button data-k="${k}" aria-label="${k === "del" ? "Delete" : k}">${k === "del" ? "⌫" : k}</button>` : '<button class="blank" tabindex="-1"></button>').join("")}</div>`;
// Set or change the PIN: enter it twice, with an optional hint.
function setPinSheet() {
  let first = null;
  openSheet(`<h3 id="pinTitle">Choose a 4-digit PIN</h3><p class="note" id="pinSub" style="margin-top:0">It locks your prayer list, journal, dreams and Body on this phone.</p><div class="lock" style="padding-top:0">${keypadHtml()}</div>
    <label class="label" for="pinHint">Hint (optional, shown if you forget)</label><input class="field" id="pinHint" maxlength="40" placeholder="e.g. my old jersey number" value="${esc(lockSet?.hint || "")}" />
    <button class="btn block" id="pinCancel" style="margin-top:12px">Cancel</button>`, (sh) => {
    sh.querySelector("#pinCancel").onclick = closeSheet;
    pinPad(sh, async (pin, shake) => {
      if (!first) { first = pin; sh.querySelector("#pinTitle").textContent = "Enter it again"; sh.querySelector("#pinMsg").textContent = ""; return; }
      if (pin !== first) { first = null; shake(); sh.querySelector("#pinTitle").textContent = "Choose a 4-digit PIN"; sh.querySelector("#pinMsg").textContent = "The two PINs didn't match. Try again."; return; }
      const salt = Math.random().toString(36).slice(2, 10);
      lockSet = { salt, hash: await pinHash(pin, salt), hint: sh.querySelector("#pinHint").value.trim() };
      save("lock", lockSet); unlocked = true; closeSheet(); toast("PIN set. Your private pages are locked."); render();
    });
  });
}

Object.assign(VIEWS, {
  lock() {
    setTitle("Private");
    const next = route.next || "more";
    const waitLeft = () => Math.ceil((pinWaitUntil - Date.now()) / 1000);
    const el = main(`<div class="lock"><div class="ic">${ICONS.lock}</div><b style="font-size:18px">Enter your PIN</b><p class="note" style="text-align:center">Your prayer list, journal, dreams and Body are locked.</p>${keypadHtml()}
      <button class="btn small" id="forgotPin" style="margin-top:18px">Forgot PIN?</button><p class="note hidden" id="hintNote" style="text-align:center"></p></div>`);
    pinPad(el, async (pin, shake) => {
      if (Date.now() < pinWaitUntil) { $("pinMsg").textContent = `Wait ${waitLeft()} seconds, then try again.`; return; }
      if ((await pinHash(pin, lockSet.salt)) === lockSet.hash) { unlocked = true; pinTries = 0; route = { ...route, view: next }; delete route.next; render(); return; }
      shake(); pinTries++;
      if (pinTries >= 5) { pinWaitUntil = Date.now() + 30000; pinTries = 0; $("pinMsg").textContent = "Too many tries. Wait 30 seconds."; }
      else $("pinMsg").textContent = "Wrong PIN. Try again.";
    });
    $("forgotPin").onclick = async () => {
      const n = $("hintNote");
      if (lockSet.hint && n.classList.contains("hidden")) { n.textContent = `Your hint: ${lockSet.hint}`; n.classList.remove("hidden"); return; }
      if (!(await ask({ title: "Remove the lock?", text: "Without the PIN, the only way in is to remove the lock and delete your private pages: prayer list, journal and dreams. Your Bible reading and everything else stay. A backup file can bring them back.", yes: "Delete and unlock", danger: true }))) return;
      prayers = []; journal = {}; dreams = []; save("prayers", prayers); save("journal", journal); save("dreams", dreams);
      lockSet = null; try { localStorage.removeItem("abide.lock"); } catch {}
      unlocked = false; toast("Lock removed"); go("more", {}, false);
    };
  },
});
