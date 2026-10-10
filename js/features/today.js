const SESSION = [
  { key: "Morning", icon: "sunrise", prayer: "Thank God for a new day and give Him the first place. Ask the Holy Spirit to teach you as you read." },
  { key: "Afternoon", icon: "noon", prayer: "Pause and remember God is with you. Speak one healing scripture over yourself and someone you know." },
  { key: "Night", icon: "night", prayer: "Thank Him for today. Pray for the people on your prayer list, then rest in His peace (Psalm 4:8)." },
];
function currentSession() { const h = new Date().getHours(); return h < settings.times[1] ? 0 : h < settings.times[2] ? 1 : 2; }
const allVerses = Object.values(DATA.themes).flat();
const verseOfDay = () => { const pool = [...DATA.themes["Healing"], ...DATA.themes["Faith"], ...DATA.themes["Power & authority"], ...DATA.themes["The Kingdom of God"], ...DATA.themes["The Spirit & the spirit realm"]]; return pool[dayNumber() % pool.length]; };
const THINK = [
  "Read it slowly three times. Which word stands out? Say it out loud.",
  "Picture this promise true in your body and in someone you will pray for.",
  "Turn this verse into a prayer of thanks.",
  "Who needs to hear this today? Share it with them.",
  "Carry this verse with you. Say it at every meal today.",
];

Object.assign(VIEWS, {
  today() {
    setTitle("Today");
    const t = todayKey(), plan = planFor(t), now = currentSession();
    const v = verseOfDay(), med = meditationOfDay();
    const pct = (read.size / CH.length) * 100, diff = onTrack(), st = streak();
    const done = (p) => p.length > 0 && p.every((i) => read.has(i));
    const fast = isFastDay(t) ? fastCard(t) : "";
    const msg = messageOfDay();
    const prayingFor = isLocked() ? "" : prayers.filter((p) => !p.answered).slice(0, 3).map((p) => esc(p.who)).join(", ");
    const dec = declarationOfDay(), decDone = declaredToday().length > 0;
    const el = main(`
      <div style="height:12px"></div>
      <div class="hero">
        <div class="kicker">Word for today</div>
        <div data-vref="${esc(v.ref)}"><div class="verse vtext">${esc(verseText(v).text)}</div>
        <div class="ref">${esc(v.ref)} <span class="vver" style="opacity:.75;font-weight:500">${verseText(v).ver}</span></div></div>
        <div class="think">${THINK[dayNumber() % THINK.length]}</div>
      </div>
      <div class="card shortcuts">
        <button class="sc" data-sc="read"><span class="ic">${ICONS.book}</span>Read</button>
        <button class="sc" data-sc="declare"><span class="ic">${ICONS.speak}</span>Speak it${decDone ? `<span class="ok-dot">${ICONS.check}</span>` : ""}</button>
        <button class="sc" data-sc="prayer"><span class="ic">${ICONS.hand}</span>Pray</button>
        <button class="sc" data-sc="journal"><span class="ic">${ICONS.pen}</span>Journal</button>
      </div>
      <div class="h"><span>Speak it today</span><button data-go="declare">All declarations</button></div>
      <div class="card tap" id="decToday"><div class="verse-card decl-row"><div class="say">${esc(dec.say)}</div><div class="vr" style="margin-top:6px"><b>${esc(dec.v.ref)}</b>${decDone ? '<span class="tag ok">Declared</span>' : '<button class="btn small primary" id="decGo">Speak it</button>'}</div></div></div>
      ${new Date().getHours() < 10 && !dreams.some((d) => d.created?.slice(0, 10) === t) ? `<div class="card pad tap" id="dreamNow" style="display:flex;align-items:center;gap:12px;margin-top:12px"><div style="width:42px;height:42px;border-radius:12px;background:var(--surface-2);color:var(--brand);display:grid;place-items:center">${ICONS.night}</div><div style="flex:1"><b>Had a dream last night?</b><div class="muted" style="font-size:13px">Write it down before it fades</div></div><span class="chev">${ICONS.chev}</span></div>` : ""}
      ${(() => { const bi = kindInfo(t), bs = body.sessions[t] || {}; const bd = bi.kind === "strength" ? (bs.rounds || 0) >= ROUNDS : !!bs.done;
        return `<div class="card pad tap" id="bodyToday" style="display:flex;align-items:center;gap:12px;margin-top:12px"><div style="width:42px;height:42px;border-radius:12px;background:var(--surface-2);color:var(--brand);display:grid;place-items:center">${ICONS.dumbbell}</div><div style="flex:1;min-width:0"><b>${bi.title}${bd ? " ✓" : ""}</b><div class="muted" style="font-size:13px">${bi.kind === "strength" && !bd ? `${bs.rounds || 0} of ${ROUNDS} rounds` : bd ? "Done for today" : "Body · today's training"}</div></div><span class="chev">${ICONS.chev}</span></div>`; })()}
      <div class="h"><span>Meditate today</span><button data-go="word" data-theme-go="Meditation">More verses</button></div>
      <div class="card"><div class="verse-card" data-vref="${esc(med.ref)}">
        <div class="vt vtext">${esc(verseText(med).text)}</div>
        <div class="vr"><b>${esc(med.ref)} <span class="vver" style="color:var(--muted);font-weight:500">${verseText(med).ver}</span></b><button class="btn small primary" data-meditate="${esc(med.ref)}">Meditate</button></div>
      </div></div>
      ${fast ? `<div style="height:12px"></div>${fast}` : ""}
      <div class="h"><span>Today's reading</span><small>${niceDate(t, { weekday: "short", day: "numeric", month: "short" })}</small></div>
      <div class="card">${plan.parts.map((p, k) => `
        <div class="session ${done(p) ? "done" : k === now ? "now" : ""}">
          <div class="ico">${done(p) ? ICONS.check : ICONS[SESSION[k].icon]}</div>
          <div class="body">
            <div class="when">${SESSION[k].key} · ${hourLabel(settings.times[k])}${done(p) ? '<span class="tag ok">Done</span>' : k === now ? '<span class="tag gold">Now</span>' : ""}</div>
            <div class="chs">${p.length ? rangeName(p) : plan.parts.flat().length ? "Meditate on today's reading" : "Nothing left to read"}</div>
            <div class="sub">${p.length ? `${p.length} chapter${p.length === 1 ? "" : "s"} · ${p.filter((i) => read.has(i)).length} read` : ""}</div>
            ${k === 2 ? `<div class="sub" style="margin-top:6px">${SESSION[k].prayer}${prayingFor ? ` Praying for: <b>${prayingFor}</b>.` : ""}</div>` : k === now ? `<div class="sub" style="margin-top:6px">${SESSION[k].prayer}</div>` : ""}
            ${p.length && !done(p) ? `<div class="acts"><button class="btn primary small" data-start="${k}">Start reading</button><button class="btn small" data-mark="${k}">Mark as read</button></div>` : ""}
          </div>
        </div>`).join("")}</div>
      <div class="h"><span>Genesis to Revelation</span><small>by ${niceDate(PLAN_END, { day: "numeric", month: "short", year: "numeric" })}</small></div>
      <div class="card pad">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:8px"><b>${read.size} of ${CH.length} chapters</b><span class="muted">${pct.toFixed(pct < 10 ? 1 : 0)}%</span></div>
        <div class="progress"><i style="width:${pct}%"></i></div>
        <div class="stats">
          <div><b>${st}</b><span>day streak</span></div>
          <div><b>${diff >= 0 ? "On track" : -diff}</b><span>${diff >= 0 ? (diff > 0 ? `${diff} chapters ahead` : "keep going") : "chapters behind"}</span></div>
          <div><b>${Math.max(0, dayDiff(t, PLAN_END) + 1)}</b><span>days left</span></div>
        </div>
        ${diff < 0 ? `<div class="note">No condemnation (Romans 8:1). Missed chapters are shared out over the days ahead, so just keep going.</div>` : ""}
      </div>
      <div class="h"><span>Message for today</span><button data-go="messages">More</button></div>
      <div class="card"><div class="preacher"><div class="avatar">${msg.p.initials}</div><div class="what" style="flex:1;min-width:0"><b>${msg.p.title ? msg.p.title + " " : ""}${msg.p.name}</b><div class="muted" style="font-size:13px">On ${msg.topic}</div></div><a class="btn small primary" href="${yt(msg.p.q + " " + msg.topic)}" target="_blank" rel="noopener">Watch ${ICONS.ext}</a></div></div>
      <div style="height:16px"></div>`);
    fillVerses([v, med], el);
    $("dreamNow") && ($("dreamNow").onclick = () => newDream());
    $("decToday").onclick = () => go("declare");
    $("bodyToday").onclick = () => go("body");
    el.querySelectorAll("[data-sc]").forEach((b) => (b.onclick = () => {
      if (b.dataset.sc !== "read") return go(b.dataset.sc);
      const p = plan.parts[now].length ? plan.parts[now] : plan.parts.flat();
      const first = p.find((i) => !read.has(i));
      first != null ? go("read", { i: first, session: plan.parts[now].includes(first) ? now : undefined }) : go("bible");
    }));
    wireMeditate(el);
    prefetchToday();
    el.querySelectorAll("[data-start]").forEach((b) => (b.onclick = () => { const p = plan.parts[+b.dataset.start]; const first = p.find((i) => !read.has(i)) ?? p[0]; go("read", { i: first, session: +b.dataset.start }); }));
    el.querySelectorAll("[data-mark]").forEach((b) => (b.onclick = () => { plan.parts[+b.dataset.mark].forEach((i) => markRead(i)); toast(`${SESSION[+b.dataset.mark].key} reading done. God bless you!`); render(); }));
    el.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => go(b.dataset.go, b.dataset.themeGo ? { theme: b.dataset.themeGo } : {}, false)));
    wireFast(el, t);
  },
});
