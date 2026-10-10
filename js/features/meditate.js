// Meditation: one verse a day from the Meditation collection, and a guided screen for any verse.
const meditationOfDay = () => { const list = DATA.themes["Meditation"]; return list[(dayNumber() * 7) % list.length]; };
const findVerse = (ref) => allVerses.find((v) => v.ref === ref);
const wireMeditate = (el) => el.querySelectorAll("[data-meditate]").forEach((b) => (b.onclick = () => go("meditate", { ref: b.dataset.meditate })));
const MEDITATE_STEPS = [
  ["Be still", "Breathe slowly. Invite the Holy Spirit: \"Speak, Lord, for Your servant is listening.\" (1 Samuel 3:9)"],
  ["Read it slowly", "Read the verse three times, out loud. Put the stress on a different word each time."],
  ["Hold on to one word", "Which word or phrase stands out? Repeat it quietly and let it sink in."],
  ["Let it speak", "What does it show you about God? What does it say about you, and what you can do today?"],
  ["Pray and declare it", "Turn it into a prayer of thanks, then speak it over yourself and the people you're praying for."],
];
let medTimer = null;

Object.assign(VIEWS, {
  meditate() {
    const v = findVerse(route.ref) || meditationOfDay();
    setTitle("Meditate");
    const list = DATA.themes["Meditation"];
    const next = list[(list.indexOf(v) + 1) % list.length] || list[0];
    const el = main(`
      <div style="height:12px"></div>
      <div class="hero" data-vref="${esc(v.ref)}">
        <div class="kicker">Meditate on</div>
        <div class="verse vtext" style="font-size:21px">${esc(verseText(v).text)}</div>
        <div class="ref">${esc(v.ref)} <span class="vver" style="opacity:.75;font-weight:500">${verseText(v).ver}</span></div>
      </div>
      <div class="card" style="margin-top:14px">${MEDITATE_STEPS.map(([t, d], k) => `
        <div class="session"><div class="ico" style="font-weight:700">${k + 1}</div><div class="body"><div class="chs" style="font-size:15px">${t}</div><div class="sub">${d}</div></div></div>`).join("")}</div>
      <div class="card pad" style="margin-top:14px;display:flex;align-items:center;justify-content:space-between;gap:12px">
        <div><b>Sit with it</b><div class="muted" style="font-size:13px" id="medClock">5 quiet minutes with this verse</div></div>
        <button class="btn primary small" id="medStart">Start 5 min</button>
      </div>
      <label class="label" for="medNote">What did God show you?</label>
      <textarea class="field serif" id="medNote" style="min-height:100px" placeholder="Write it down so you don't forget"></textarea>
      <div class="two"><button class="btn" id="medNext">Another verse</button><button class="btn primary" id="medSave">Save to journal</button></div>
      <div style="height:16px"></div>`);
    fillVerses([v], el);
    clearInterval(medTimer);
    $("medStart").onclick = () => {
      clearInterval(medTimer);
      const end = Date.now() + 5 * 60 * 1000;
      $("medStart").textContent = "Restart";
      const tick = () => {
        const left = Math.max(0, Math.round((end - Date.now()) / 1000));
        if (!$("medClock")) return clearInterval(medTimer);
        $("medClock").textContent = left ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")} — be still and know that He is God` : "Amen. Write what He showed you below.";
        if (!left) { clearInterval(medTimer); try { navigator.vibrate?.(300); } catch {} }
      };
      tick(); medTimer = setInterval(tick, 1000);
    };
    $("medNext").onclick = () => { route = { view: "meditate", ref: next.ref }; render(); window.scrollTo(0, 0); };
    $("medSave").onclick = () => {
      const note = $("medNote").value.trim();
      if (!note) return $("medNote").focus();
      const t = todayKey();
      journal[t] = `${journal[t] ? journal[t].trimEnd() + "\n\n" : ""}${v.ref}: ${note}`;
      save("journal", journal);
      $("medNote").value = "";
      toast("Saved to your journal");
    };
  },
});
