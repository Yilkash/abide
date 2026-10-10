// Prayer list, with answered prayers.

Object.assign(VIEWS, {
  prayer() {
    setTitle("Prayer list");
    const open = prayers.filter((p) => !p.answered), answered = prayers.filter((p) => p.answered);
    const row = (p) => `<div class="row"><div class="what"><b>${esc(p.who)}</b><span>${esc(p.need || "")}${p.answered ? ` · answered ${niceDate(p.answered, { day: "numeric", month: "short" })}` : ""}</span></div>
      ${p.answered ? "" : `<button class="btn small" data-ans="${p.id}">Answered</button>`}<button class="icon-btn" data-del="${p.id}" aria-label="Remove">${ICONS.x}</button></div>`;
    const el = main(`
      <div style="height:12px"></div>
      <button class="btn primary block" id="addPrayer">+ Add someone to pray for</button>
      <div class="h"><span>Praying for</span><small>${open.length}</small></div>
      <div class="card">${open.length ? open.map(row).join("") : '<div class="empty">Add the sick, your family, your Sunday school class… They also show at night prayer.</div>'}</div>
      ${answered.length ? `<div class="h"><span>Answered prayers</span><small>${answered.length}</small></div><div class="card">${answered.map(row).join("")}</div>` : ""}
      <p class="note">"The prayer of faith shall save the sick, and the Lord shall raise him up." James 5:15</p>
      <div style="height:16px"></div>`);
    $("addPrayer").onclick = () => openSheet(`
      <h3>Pray for</h3>
      <label class="label" for="pWho">Who</label><input class="field" id="pWho" placeholder="Name" />
      <label class="label" for="pNeed">Need</label><input class="field" id="pNeed" placeholder="e.g. healing from malaria" />
      <div class="two"><button class="btn" id="pCancel">Cancel</button><button class="btn primary" id="pSave">Add</button></div>`, (s) => {
      s.querySelector("#pCancel").onclick = closeSheet;
      s.querySelector("#pSave").onclick = () => { const who = s.querySelector("#pWho").value.trim(); if (!who) return s.querySelector("#pWho").focus(); prayers.unshift({ id: Date.now().toString(36), who, need: s.querySelector("#pNeed").value.trim(), added: todayKey() }); save("prayers", prayers); closeSheet(); render(); };
    });
    el.querySelectorAll("[data-ans]").forEach((b) => (b.onclick = () => { prayers.find((p) => p.id === b.dataset.ans).answered = todayKey(); save("prayers", prayers); toast("Praise God!"); render(); }));
    el.querySelectorAll("[data-del]").forEach((b) => (b.onclick = async () => { const p = prayers.find((x) => x.id === b.dataset.del); if (await ask({ title: "Remove from the list?", text: `${p.who}${p.need ? " — " + p.need : ""}`, yes: "Remove", danger: true })) { prayers = prayers.filter((x) => x !== p); save("prayers", prayers); render(); } }));
  },
});
