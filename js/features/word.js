// Scriptures tab: the themed verses.

Object.assign(VIEWS, {
  word() {
    setTitle("Scriptures");
    const themes = Object.keys(DATA.themes);
    const theme = route.theme || "Healing";
    const list = theme === "Saved" ? allVerses.filter((v) => favs.has(v.ref)) : DATA.themes[theme];
    const el = main(`
      <div class="chips" style="margin:12px 0 14px">${["Saved", ...themes].map((t) => `<button class="chip ${t === theme ? "on" : ""}" data-theme="${esc(t)}">${t === "Saved" ? "★ Saved" : esc(t)}</button>`).join("")}</div>
      ${theme === "Healing" ? '<p class="note" style="margin:0 2px 12px">Read them out loud. Faith comes by hearing (Romans 10:17).</p>' : ""}
      <div class="card">${list.length ? list.map((v) => `
        <div class="verse-card">
          <div data-vref="${esc(v.ref)}"><div class="vt vtext">${esc(verseText(v).text)}</div>
          <div class="vr"><b>${esc(v.ref)} <span class="vver" style="color:var(--muted);font-weight:500">${verseText(v).ver}</span></b><span><button class="icon-btn ${favs.has(v.ref) ? "on" : ""}" data-fav="${esc(v.ref)}" aria-label="Save">${favs.has(v.ref) ? ICONS.starOn : ICONS.star}</button><button class="icon-btn" data-meditate="${esc(v.ref)}" aria-label="Meditate on this">${ICONS.leaf}</button><button class="icon-btn" data-ctx="${v.b},${v.c},${v.v}" aria-label="Read the chapter">${ICONS.book}</button></span></div></div>
        </div>`).join("") : '<div class="empty">Tap the ★ on any scripture to keep it here.</div>'}</div>
      <div style="height:16px"></div>`);
    fillVerses(list, el);
    wireMeditate(el);
    el.querySelectorAll("[data-theme]").forEach((b) => (b.onclick = () => { route.theme = b.dataset.theme; render(); }));
    el.querySelectorAll("[data-fav]").forEach((b) => (b.onclick = () => { const r = b.dataset.fav; favs.has(r) ? favs.delete(r) : favs.add(r); save("favs", [...favs]); render(); }));
    el.querySelectorAll("[data-ctx]").forEach((b) => (b.onclick = async () => { const [bk, c, v] = b.dataset.ctx.split(",").map(Number); await bibleReady; go("read", { i: chIndex(bk, c), v }); }));
  },
});
