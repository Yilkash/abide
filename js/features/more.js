// More tab: the list of other sections.

Object.assign(VIEWS, {
  more() {
    setTitle("More");
    const nf = nextFast(), done = Object.values(fasts).filter((f) => f.done).length;
    const items = [
      ["fasting", "plate", "Fasting", `${settings.fastDays.map((d) => DAY_NAMES[d]).join(" & ")} · ${hourLabel(settings.fastStart)}–${hourLabel(settings.fastEnd)} · ${done} completed`],
      ["prayer", "hand", "Prayer list", `${prayers.filter((p) => !p.answered).length} praying · ${prayers.filter((p) => p.answered).length} answered`],
      ["dreams", "night", "Dreams", `${dreams.length} recorded${dreams.filter((d) => d.status === "fulfilled").length ? ` · ${dreams.filter((d) => d.status === "fulfilled").length} came to pass` : ""}`],
      ["journal", "pen", "Journal", "What God is showing you"],
      ["lessons", "people", "Sunday school", `${lessons.length} lesson${lessons.length === 1 ? "" : "s"} prepared`],
      ["body", "dumbbell", "Body", "Training plan, back to the ball, waist and foods"],
      ["declare", "speak", "Speak it", `${DECLARATIONS.length} healing declarations · ${declareStreak()} day${declareStreak() === 1 ? "" : "s"} in a row`],
      ["settings", "gear", "Settings", "Name, PIN lock, reminders, text size, backup"],
    ];
    const el = main(`<div style="height:12px"></div><div class="card">${items.map(([v, ic, t, s]) => `
      <div class="row tap" data-v="${v}"><div class="ico" style="width:40px;height:40px;border-radius:12px;background:var(--surface-2);color:var(--brand);display:grid;place-items:center">${ICONS[ic]}</div><div class="what"><b>${t}</b><span>${s}</span></div><span class="chev">${ICONS.chev}</span></div>`).join("")}</div>
      ${nf ? `<p class="note">Next fast: ${nf === todayKey() ? "today" : niceDate(nf)}.</p>` : ""}`);
    el.querySelectorAll("[data-v]").forEach((r) => (r.onclick = () => go(r.dataset.v)));
  },
});
