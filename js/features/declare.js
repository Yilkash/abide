// "Speak it": first-person healing declarations. The scripture under each one is the verse itself,
// taken from the verified Healing theme (never typed by hand); the declaration is how it is spoken over yourself.
const DECLARATIONS = [
  ["Isaiah 53:4-5", "Jesus carried my sickness and my pain. By His stripes I am healed."],
  ["1 Peter 2:24", "By His wounds I was healed. Healing is mine today."],
  ["Exodus 15:26", "The LORD is my healer. I listen to His voice and walk in His health."],
  ["Exodus 23:25", "I serve the LORD my God. He blesses my food and my water and takes sickness away from me."],
  ["Psalms 103:2-3", "I will not forget His benefits. He forgives all my sins and heals all my diseases."],
  ["Psalms 107:20", "God sends His word and heals me. He delivers me from destruction."],
  ["Psalms 118:17", "I shall not die, but live, and declare the works of the LORD."],
  ["Proverbs 4:20-22", "God's words are life to me and health to all my body."],
  ["Isaiah 58:8", "My light breaks forth and my health springs forth speedily."],
  ["Jeremiah 17:14", "Heal me, O LORD, and I shall be healed. You are my praise."],
  ["Jeremiah 30:17", "The LORD restores my health and heals my wounds."],
  ["Malachi 4:2", "The Sun of righteousness rises over me with healing in His wings. I go forth and grow strong."],
  ["Romans 8:11", "The Spirit who raised Jesus from the dead lives in me and gives life to my body."],
  ["Deuteronomy 7:15", "The LORD takes away from me all sickness."],
  ["3 John 1:2", "I prosper and I am in health, even as my soul prospers."],
].map(([ref, say]) => ({ say, v: DATA.themes["Healing"].find((x) => x.ref === ref) })).filter((d) => d.v);
const declarationOfDay = () => DECLARATIONS[dayNumber() % DECLARATIONS.length];
const declaredToday = () => declared[todayKey()] || [];
function markDeclared(ref) {
  const t = todayKey();
  declared[t] = [...new Set([...(declared[t] || []), ref])];
  save("declared", declared);
}
function declareStreak() {
  let n = 0, d = todayKey();
  if (!declared[d]?.length) d = shiftDay(d, -1);
  while (declared[d]?.length) { n++; d = shiftDay(d, -1); }
  return n;
}
function speak(text) {
  if (!("speechSynthesis" in window)) return toast("Reading aloud isn't available on this phone");
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US"; u.rate = 0.92;
  speechSynthesis.speak(u);
}

Object.assign(VIEWS, {
  declare() {
    setTitle("Speak it");
    const today = declarationOfDay(), done = declaredToday(), st = declareStreak();
    const card = (d, big) => {
      const isDone = done.includes(d.v.ref);
      return big
        ? `<div class="declare" data-vref="${esc(d.v.ref)}"><div class="kicker">Declare today</div><div class="say">${esc(d.say)}</div><div class="scr vtext">${esc(verseText(d.v).text)}</div><div class="ref">${esc(d.v.ref)} · <span class="vver">${verseText(d.v).ver}</span></div>
           <div class="acts"><button class="btn" data-speak="${esc(d.v.ref)}">${ICONS.speak} Read aloud</button><button class="btn ${isDone ? "done" : ""}" data-done="${esc(d.v.ref)}">${isDone ? "Declared ✓" : "I declared it"}</button></div></div>`
        : `<div class="verse-card decl-row" data-vref="${esc(d.v.ref)}"><div class="say">${esc(d.say)}</div><div class="scr vtext">${esc(verseText(d.v).text)}</div>
           <div class="vr"><b>${esc(d.v.ref)} <span class="vver" style="color:var(--muted);font-weight:500">${verseText(d.v).ver}</span></b><span style="display:flex;gap:6px"><button class="btn small" data-speak="${esc(d.v.ref)}" aria-label="Read aloud">${ICONS.speak}</button><button class="btn small ${isDone ? "" : "primary"}" data-done="${esc(d.v.ref)}">${isDone ? "✓" : "Declare"}</button></span></div></div>`;
    };
    const el = main(`<div style="height:12px"></div>${card(today, true)}
      <div class="card pad" style="margin-top:12px;display:flex;justify-content:space-between;align-items:center"><span><b>${st}</b> day${st === 1 ? "" : "s"} in a row</span><span class="muted" style="font-size:13px">${done.length} declared today</span></div>
      <div class="h"><span>All declarations</span><small>${DECLARATIONS.length}</small></div>
      <div class="card">${DECLARATIONS.filter((d) => d !== today).map((d) => card(d, false)).join("")}</div>
      <p class="note">Say them out loud, slowly, over yourself. "Death and life are in the power of the tongue." Proverbs 18:21</p>
      <div style="height:16px"></div>`);
    fillVerses(DECLARATIONS.map((d) => d.v), el);
    el.querySelectorAll("[data-speak]").forEach((b) => (b.onclick = () => { const d = DECLARATIONS.find((x) => x.v.ref === b.dataset.speak); speak(`${d.say} ... ${verseText(d.v).text} ... ${d.v.ref.replace(":", ", verse ")}`); }));
    el.querySelectorAll("[data-done]").forEach((b) => (b.onclick = () => { markDeclared(b.dataset.done); toast("Amen! Declared over yourself."); render(); }));
  },
});
