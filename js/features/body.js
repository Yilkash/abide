// Body: a weekly training plan built around the fasting days. Kept private behind the PIN.
const MOVES = [
  { name: "Squats", reps: 12, step: 2, unit: "", tip: "Sit back as if into a chair, chest up." },
  { name: "Push-ups", reps: 8, step: 2, unit: "", tip: "On your knees is fine at first." },
  { name: "Reverse lunges", reps: 8, step: 2, unit: " each leg", tip: "Step back, knee towards the floor." },
  { name: "Glute bridges", reps: 12, step: 2, unit: "", tip: "On your back, push your hips up and squeeze. Only on an empty stomach." },
  { name: "Bird-dog", reps: 8, step: 2, unit: " each side", tip: "On hands and knees, stretch the opposite arm and leg. Core work that doesn't press on your stomach." },
  { name: "Wall sit", reps: 30, step: 5, unit: " seconds", tip: "Back flat on the wall, thighs level with the floor." },
];
const ROUNDS = 3;
const STAGES = [
  { weeks: "Weeks 1–2", what: "Brisk walking, 20–30 minutes" },
  { weeks: "Weeks 3–4", what: "Walk-jog: 1 minute easy jog + 2 minutes walk, 8 times" },
  { weeks: "Weeks 5–6", what: "Easy jog 15–20 minutes, plus light ball work" },
  { weeks: "Weeks 7–8", what: "Short sprints with long rests; small-sided games for 20–30 minutes" },
  { weeks: "Week 9 on", what: "Normal training and matches, if you've stayed pain-free" },
];
// Each finished strength workout counts; every two (about a week) adds a little to each exercise.
const strengthLevel = () => Math.min(10, Math.floor(Object.values(body.sessions).filter((x) => x.kind === "strength" && x.rounds >= ROUNDS).length / 2));
const movesNow = () => MOVES.map((m) => ({ ...m, n: m.reps + m.step * strengthLevel() }));
function dayKind(k) {
  if (isFastDay(k)) return "fast";
  return ["rest", "strength", "cardio", "walk", "strength", "stretch", "cardio"][parseDay(k).getDay()];
}
const KIND = {
  strength: { title: "Strength workout", sub: `${MOVES.length} exercises × ${ROUNDS} rounds · about 25 minutes` },
  cardio: { title: "Walk or jog", sub: "" },
  walk: { title: "Easy walk", sub: "20 minutes at a comfortable pace" },
  fast: { title: "Fast day: go gentle", sub: "An easy 20-minute walk after you break your fast, or just stretching" },
  stretch: { title: "Stretch & breathe", sub: "10 minutes of stretching and belly breathing" },
  rest: { title: "Rest day", sub: "Rest well. Enjoy church and family." },
};
function kindInfo(k) {
  const kind = dayKind(k), info = { ...KIND[kind], kind };
  if (kind === "cardio") info.sub = STAGES[body.stage].what + (parseDay(k).getDay() === 6 ? ", plus ball work" : "");
  return info;
}
let restTimer = null;

Object.assign(VIEWS, {
  body() {
    setTitle("Body");
    clearInterval(restTimer);
    const t = todayKey(), info = kindInfo(t), sess = body.sessions[t] || {}, moves = movesNow();
    const done = info.kind === "strength" ? (sess.rounds || 0) >= ROUNDS : !!sess.done;
    const pain = body.pain[t];
    const last14 = [...Array(14)].map((_, k) => shiftDay(t, k - 13));
    const waist = body.waist.slice().sort((a, b) => (a.date < b.date ? -1 : 1));
    const w0 = waist[0], wN = waist.at(-1);
    const wMin = Math.min(...waist.map((w) => w.cm)), wMax = Math.max(...waist.map((w) => w.cm));
    const spark = waist.length > 1 ? `<svg viewBox="0 0 300 70" width="100%" height="70" preserveAspectRatio="none" style="margin-top:10px"><polyline fill="none" stroke="var(--brand)" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" points="${waist.map((w, k) => `${(k / (waist.length - 1)) * 296 + 2},${wMax === wMin ? 35 : 6 + ((wMax - w.cm) / (wMax - wMin)) * 58}`).join(" ")}"/></svg>` : "";
    const chips = (list, key) => `<div class="food-chips">${list.length ? list.map((f, k) => `<span class="chip">${esc(f)}<button data-food-del="${key}:${k}" aria-label="Remove ${esc(f)}">×</button></span>`).join("") : '<span class="muted" style="font-size:13px">Nothing yet.</span>'}</div>
      <div style="display:flex;gap:8px;margin-top:10px"><input class="field" id="food-${key}" placeholder="${key === "calm" ? "A food that settles you" : "A food that hurts you"}" maxlength="40" style="flex:1" /><button class="btn small" data-food-add="${key}">Add</button></div>`;
    const el = main(`<div style="height:12px"></div>
      <div class="train">
        <div class="kicker">Today · ${DAY_NAMES[parseDay(t).getDay()]}</div>
        <h2>${info.title}${done ? " ✓" : ""}</h2>
        <p>${esc(info.sub)}</p>
        ${info.kind === "strength" ? `<div class="rounds">${[...Array(ROUNDS)].map((_, k) => `<i class="${k < (sess.rounds || 0) ? "on" : ""}"></i>`).join("")}</div>
          <div class="rest-clock hidden" id="restClock"></div>
          <div style="display:flex;gap:8px;margin-top:14px">${done ? `<button class="btn block ghost" id="undoRound">Undo last round</button>` : `<button class="btn block" id="roundDone">Round ${(sess.rounds || 0) + 1} of ${ROUNDS} done</button>`}</div>`
        : info.kind === "rest" ? "" : `<div style="display:flex;gap:8px;margin-top:14px"><button class="btn block ${done ? "ghost" : ""}" id="dayDone">${done ? "Done ✓ (tap to undo)" : "I did it"}</button></div>`}
      </div>
      ${info.kind === "strength" ? `<div class="h"><span>Each round</span><small>Level ${strengthLevel() + 1}</small></div>
        <div class="card">${moves.map((m) => `<div class="row move"><div class="what"><b>${m.name}</b><span>${m.tip}</span></div><span class="reps">${m.n}${m.unit}</span></div>`).join("")}</div>
        <p class="note">Rest 1 minute between rounds. Every week of workouts adds a little to each exercise.</p>` : ""}
      ${done || pain != null ? `<div class="h"><span>How was the pain?</span><small>0 = none, 10 = worst</small></div>
        <div class="card pad"><div class="painpick">${[...Array(11)].map((_, n) => `<button class="${pain === n ? "on" : ""}" data-pain="${n}">${n}</button>`).join("")}</div></div>` : ""}
      <div class="h"><span>Back to the ball</span><small>${STAGES[body.stage].weeks}</small></div>
      <div class="card steps">${STAGES.map((st, k) => `<div class="step ${k < body.stage ? "past" : k === body.stage ? "now" : ""}"><div class="num">${k < body.stage ? "✓" : k + 1}</div><div><b>${st.weeks}</b><span>${st.what}</span></div></div>`).join("")}</div>
      <div style="display:flex;gap:8px;margin-top:10px">${body.stage > 0 ? '<button class="btn small" id="stageBack">Pain came back: step back</button>' : ""}${body.stage < STAGES.length - 1 ? '<button class="btn small primary" id="stageNext">A full week without pain: next step</button>' : ""}</div>
      <div class="h"><span>Pain after exercise</span><small>last 14 days</small></div>
      <div class="card pad"><div class="bars14">${last14.map((k) => { const v = body.pain[k]; return `<div><i class="${v == null ? "none" : ""}" style="height:${v == null ? 2 : Math.max(4, v * 10)}%" title="${niceDate(k)}${v == null ? "" : ": " + v}"></i>${parseDay(k).getDate()}</div>`; }).join("")}</div></div>
      <div class="h"><span>Waist</span><small>${waist.length > 1 ? `${(wN.cm - w0.cm > 0 ? "+" : "") + (wN.cm - w0.cm).toFixed(1)} cm since ${niceDate(w0.date, { day: "numeric", month: "short" })}` : "measure once a week"}</small></div>
      <div class="card pad">
        <div style="display:flex;gap:8px"><input class="field" id="waistCm" type="number" inputmode="decimal" step="0.5" min="40" max="200" placeholder="Around the belly button, cm" style="flex:1" /><button class="btn small primary" id="waistSave">Save</button></div>
        ${spark}
        ${waist.length ? `<div class="note">${waist.slice(-4).reverse().map((w) => `${niceDate(w.date, { day: "numeric", month: "short" })}: <b>${w.cm} cm</b>`).join(" · ")}</div>` : ""}
      </div>
      <div class="h"><span>Foods that settle me</span></div>
      <div class="card pad">${chips(body.calm, "calm")}<p class="note">When the pain starts, reach for one of these, in a small portion.</p></div>
      <div class="h"><span>Foods to avoid</span></div>
      <div class="card pad">${chips(body.avoid, "avoid")}</div>
      <div class="h">Train safely</div>
      <div class="card pad" style="font-size:14px;line-height:1.6">
        • Train before breakfast or 2–3 hours after eating, never on a full stomach.<br>
        • Skip sit-ups, crunches, heavy straining and head-down positions for now.<br>
        • Do the lying-down exercises only when your stomach is empty.<br>
        • 5 minutes of slow belly breathing every day.<br>
        • Sip water; don't gulp.<br>
        • <b>Stop and get checked</b> if you get chest pain with breathlessness, sweating or dizziness.
      </div>
      <p class="note">"Know ye not that your body is the temple of the Holy Ghost which is in you?" 1 Corinthians 6:19</p>
      <div style="height:16px"></div>`);
    const day = () => (body.sessions[t] = body.sessions[t] || { kind: info.kind });
    $("roundDone") && ($("roundDone").onclick = () => {
      const x = day(); x.kind = "strength"; x.rounds = Math.min(ROUNDS, (x.rounds || 0) + 1); saveBody();
      if (x.rounds >= ROUNDS) { toast("Workout done. Well done!"); return render(); }
      render();
      let left = 60; const c = $("restClock"); c.classList.remove("hidden");
      const tick = () => { if (!$("restClock")) return clearInterval(restTimer); c.textContent = left ? `Rest ${left}s` : "Go!"; if (!left) { clearInterval(restTimer); try { navigator.vibrate?.(250); } catch {} } left--; };
      tick(); restTimer = setInterval(tick, 1000);
    });
    $("undoRound") && ($("undoRound").onclick = () => { const x = day(); x.rounds = Math.max(0, (x.rounds || 0) - 1); saveBody(); render(); });
    $("dayDone") && ($("dayDone").onclick = () => { const x = day(); x.done = !x.done; saveBody(); if (x.done) toast("Well done!"); render(); });
    el.querySelectorAll("[data-pain]").forEach((b) => (b.onclick = () => { body.pain[t] = +b.dataset.pain; saveBody(); render(); }));
    $("stageNext") && ($("stageNext").onclick = async () => {
      if (!(await ask({ title: "Move to the next step?", text: `Only after a full week at "${STAGES[body.stage].what}" without pain. Next: ${STAGES[body.stage + 1].what}.`, yes: "Next step" }))) return;
      body.stage++; body.stageSince = t; saveBody(); toast("Next step. Keep going!"); render();
    });
    $("stageBack") && ($("stageBack").onclick = () => { body.stage--; body.stageSince = t; saveBody(); toast("Stepped back. No shame in it; build up again."); render(); });
    $("waistSave").onclick = () => {
      const cm = Math.round(parseFloat($("waistCm").value) * 2) / 2;
      if (!(cm >= 40 && cm <= 200)) return $("waistCm").focus();
      body.waist = body.waist.filter((w) => w.date !== t).concat({ date: t, cm }); saveBody(); toast("Saved"); render();
    };
    el.querySelectorAll("[data-food-add]").forEach((b) => (b.onclick = () => {
      const key = b.dataset.foodAdd, v = $("food-" + key).value.trim();
      if (!v) return $("food-" + key).focus();
      if (!body[key].some((f) => f.toLowerCase() === v.toLowerCase())) body[key].push(v);
      saveBody(); render();
    }));
    el.querySelectorAll("[data-food-del]").forEach((b) => (b.onclick = () => { const [key, k] = b.dataset.foodDel.split(":"); body[key].splice(+k, 1); saveBody(); render(); }));
  },
});
