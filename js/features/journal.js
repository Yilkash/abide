// Journal.

Object.assign(VIEWS, {
  journal() {
    setTitle("Journal");
    const t = todayKey();
    const past = Object.keys(journal).filter((k) => k !== t && journal[k].trim()).sort().reverse();
    const el = main(`
      <div class="h" style="margin-top:12px"><span>${niceDate(t)}</span><small id="jSaved"></small></div>
      <textarea class="field serif" id="jText" placeholder="What did God show you today? A verse, a word, an answered prayer…">${esc(journal[t] || "")}</textarea>
      <div class="h"><span>Earlier</span><small>${past.length || ""}</small></div>
      <div class="card">${past.length ? past.map((k) => `<div class="verse-card"><div class="muted" style="font-size:12px;font-weight:600;margin-bottom:4px">${niceDate(k)}</div><div class="vt" style="white-space:pre-wrap">${esc(journal[k])}</div></div>`).join("") : '<div class="empty">Your past entries will show here.</div>'}</div>
      <div style="height:16px"></div>`);
    let timer;
    $("jText").oninput = (e) => { clearTimeout(timer); timer = setTimeout(() => { journal[t] = e.target.value; save("journal", journal); $("jSaved").textContent = "Saved"; }, 400); };
  },
});
