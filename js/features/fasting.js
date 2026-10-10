/* ---------- fasting ---------- */
const isFastDay = (k) => settings.fastDays.includes(parseDay(k).getDay());
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const FAST_FOCUS = ["Healing and the sick on my list", "More of God's power", "Intimacy with the Holy Spirit", "Direction and wisdom", "My family", "My Sunday school class", "Souls to be saved", "Breaking every stronghold"];
function nextFast(from = todayKey()) { for (let i = 0; i < 8; i++) { const k = shiftDay(from, i); if (isFastDay(k)) return k; } return null; }

function fastCard(t) {
  const f = fasts[t] || {}, h = new Date().getHours() + new Date().getMinutes() / 60;
  const s = settings.fastStart, e = settings.fastEnd;
  const v = DATA.themes["Prayer & fasting"][dayNumber() % DATA.themes["Prayer & fasting"].length];
  const mins = Math.max(0, Math.round((e - h) * 60));
  const status = f.done ? "Fast completed. Well done!" : h < s ? `Starts at ${hourLabel(s)}` : h < e ? `Break your fast at ${hourLabel(e)} · ${Math.floor(mins / 60)}h ${mins % 60}m to go` : `Finished at ${hourLabel(e)}. Did you complete it?`;
  return `<div class="fast" data-fastcard>
    <div class="t"><div><b>Fasting today</b><div class="left">${status}</div></div>${f.done ? '<span class="tag ok">Done</span>' : ""}</div>
    <label class="label" for="fFocus">Focus of this fast</label>
    <input class="field" id="fFocus" list="focusList" value="${esc(f.focus || "")}" placeholder="e.g. ${FAST_FOCUS[dayNumber() % FAST_FOCUS.length]}" />
    <datalist id="focusList">${FAST_FOCUS.map((x) => `<option value="${esc(x)}">`).join("")}</datalist>
    <div class="scr" data-vref="${esc(v.ref)}"><span class="vtext">${esc(verseText(v).text)}</span><em>${esc(v.ref)} <span class="vver">${verseText(v).ver}</span></em></div>
    ${f.done ? "" : `<div style="margin-top:12px"><button class="btn gold block" data-fastdone>I completed today's fast</button></div>`}
  </div>`;
}
function wireFast(el, t) {
  const focus = el.querySelector("#fFocus");
  if (focus) focus.onchange = () => { fasts[t] = { ...(fasts[t] || {}), focus: focus.value.trim() }; save("fasts", fasts); };
  const done = el.querySelector("[data-fastdone]");
  if (done) done.onclick = () => openSheet(`
    <h3>Fast completed</h3>
    <label class="label" for="fNote">What did God show you? (optional)</label><textarea class="field serif" id="fNote" style="min-height:90px"></textarea>
    <div class="two"><button class="btn" id="fCancel">Cancel</button><button class="btn gold" id="fSave">Save</button></div>`, (s) => {
    s.querySelector("#fCancel").onclick = closeSheet;
    s.querySelector("#fSave").onclick = () => { fasts[t] = { ...(fasts[t] || {}), focus: focus?.value.trim() || fasts[t]?.focus || "", done: true, note: s.querySelector("#fNote").value.trim() }; save("fasts", fasts); closeSheet(); toast("Fast completed. God bless you!"); render(); };
  });
}

Object.assign(VIEWS, {
  fasting() {
    setTitle("Fasting");
    const t = todayKey();
    const week = [...Array(7)].map((_, k) => shiftDay(t, k - parseDay(t).getDay())).filter(isFastDay);
    const past = Object.entries(fasts).filter(([, f]) => f.done || f.note).sort((a, b) => (a[0] < b[0] ? 1 : -1));
    const el = main(`
      ${isFastDay(t) ? `<div style="height:12px"></div>${fastCard(t)}` : ""}
      <div class="h">This week</div>
      <div class="card">${week.map((k) => `<div class="row"><div class="what"><b>${niceDate(k)}</b><span>${hourLabel(settings.fastStart)} – ${hourLabel(settings.fastEnd)}${fasts[k]?.focus ? " · " + esc(fasts[k].focus) : ""}</span></div>${fasts[k]?.done ? '<span class="tag ok">Done</span>' : k < t ? '<span class="tag plain">Missed</span>' : k === t ? '<span class="tag gold">Today</span>' : '<span class="tag plain">Coming</span>'}</div>`).join("")}</div>
      <div class="h">Scriptures for fasting</div>
      <div class="card">${DATA.themes["Prayer & fasting"].slice(0, 6).map((v) => `<div class="verse-card" data-vref="${esc(v.ref)}"><div class="vt vtext">${esc(verseText(v).text)}</div><div class="vr"><b>${esc(v.ref)} <span class="vver" style="color:var(--muted);font-weight:500">${verseText(v).ver}</span></b></div></div>`).join("")}</div>
      <div class="h"><span>Fasts completed</span><small>${Object.values(fasts).filter((f) => f.done).length}</small></div>
      <div class="card">${past.length ? past.map(([k, f]) => `<div class="row"><div class="what"><b>${niceDate(k, { weekday: "short", day: "numeric", month: "short" })}</b><span>${esc(f.focus || "")}${f.note ? " — " + esc(f.note) : ""}</span></div>${f.done ? '<span class="tag ok">Done</span>' : ""}</div>`).join("") : '<div class="empty">Your completed fasts will show here.</div>'}</div>
      <p class="note">Change fasting days and hours in Settings. Drink water and take care if you have a health condition.</p>
      <div style="height:16px"></div>`);
    wireFast(el, t);
    fillVerses(DATA.themes["Prayer & fasting"].slice(0, 6), el);
  },
});
