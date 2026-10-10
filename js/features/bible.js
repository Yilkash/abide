// Bible tab: books, chapters and the reader.

Object.assign(VIEWS, {
  bible() {
    setTitle("Bible");
    const testament = route.nt ? 39 : 0, count = route.nt ? 27 : 39;
    const el = main(`
      <div class="h" style="margin-top:12px"><div class="chips"><button class="chip ${route.nt ? "" : "on"}" data-t="0">Old Testament</button><button class="chip ${route.nt ? "on" : ""}" data-t="1">New Testament</button></div></div>
      <div class="books">${NAMES.slice(testament, testament + count).map((n, k) => {
        const b = testament + k, total = BIBLE[b].length, done = CH.filter((x, i) => x.b === b && read.has(i)).length;
        return `<button class="book" data-b="${b}"><b>${n}</b><span>${done ? `${done} of ${total} read` : `${total} chapter${total === 1 ? "" : "s"}`}</span><div class="bar"><i style="width:${(done / total) * 100}%"></i></div></button>`;
      }).join("")}</div>
      <div style="height:16px"></div>`);
    el.querySelectorAll("[data-t]").forEach((b) => (b.onclick = () => { route.nt = b.dataset.t === "1"; render(); }));
    el.querySelectorAll("[data-b]").forEach((b) => (b.onclick = () => go("book", { b: +b.dataset.b })));
  },
  book() {
    const b = route.b;
    setTitle(NAMES[b]);
    const el = main(`
      <div class="h" style="margin-top:12px"><span>Chapters</span><small>${CH.filter((x, i) => x.b === b && read.has(i)).length} of ${BIBLE[b].length} read</small></div>
      <div class="chapters">${BIBLE[b].map((_, c) => { const i = chIndex(b, c + 1); return `<button class="${read.has(i) ? "read" : ""}" data-i="${i}">${c + 1}</button>`; }).join("")}</div>
      <div style="height:16px"></div>`);
    el.querySelectorAll("[data-i]").forEach((x) => (x.onclick = () => go("read", { i: +x.dataset.i })));
  },
  read() {
    const i = route.i, ch = CH[i];
    setTitle(chName(i));
    const id = `${USFM[ch.b]}.${ch.c}`;
    const wantNiv = useNiv();
    const cached = wantNiv && fresh(nivChapters[id]) ? nivChapters[id] : null;
    if (wantNiv && !cached && navigator.onLine && !route.nivFailed) {
      main('<div class="loading">Opening the NIV…</div>');
      const r = route;
      nivChapter(i).then(() => { if (route === r) render(); }).catch((e) => { if (route === r) { route.nivFailed = e.message; render(); } });
      return;
    }
    const showNiv = !!cached;
    const verses = showNiv ? cached.verses : BIBLE[ch.b][ch.c - 1].map((t, k) => [k + 1, t]);
    if (showNiv) reportFums(cached.t);
    const notice = wantNiv && !showNiv ? (route.nivFailed ? `Couldn't open the NIV: ${esc(route.nivFailed)}. Showing the KJV.` : "The NIV needs data for this chapter. Showing the KJV.") : "";
    const sess = route.session != null ? planFor(todayKey()).parts[route.session] : null;
    const pos = sess ? sess.indexOf(i) : -1;
    const nextInSession = sess && pos >= 0 ? sess[pos + 1] : undefined;
    const isRead = read.has(i);
    const el = main(`
      <div class="reader-head">
        <span class="context">${sess && pos >= 0 ? `${SESSION[route.session].key} reading · ${pos + 1} of ${sess.length}` : showNiv ? "New International Version" : "King James Version"}</span>
        <span style="display:flex;gap:6px">${nivReady() ? `<span class="chips" style="gap:4px"><button class="chip ${showNiv ? "on" : ""}" data-ver="niv" style="padding:6px 10px">NIV</button><button class="chip ${showNiv ? "" : "on"}" data-ver="kjv" style="padding:6px 10px">KJV</button></span>` : ""}<button class="btn small" data-font="-1" aria-label="Smaller text">A−</button><button class="btn small" data-font="1" aria-label="Bigger text">A+</button></span>
      </div>
      ${notice ? `<p class="note" style="margin:0 0 12px">${notice}</p>` : ""}
      <div class="reader">${verses.map(([n, v]) => `<p id="v${n}" class="${route.v === n ? "hl" : ""}"><sup>${n}</sup>${esc(v)}</p>`).join("")}</div>
      ${showNiv && niv.copyright ? `<p class="note" style="font-size:11px">${esc(niv.copyright)}</p>` : ""}
      <div class="reader-foot">
        <button class="btn" data-nav="-1" ${i === 0 ? "disabled" : ""} aria-label="Previous chapter">${ICONS.back}</button>
        ${sess && pos >= 0
          ? `<button class="btn primary" id="doneNext">${nextInSession !== undefined ? "Done · next chapter" : `Finish ${SESSION[route.session].key.toLowerCase()} reading`}</button>`
          : `<button class="btn ${isRead ? "" : "primary"}" id="toggleRead">${isRead ? "Read ✓ (tap to undo)" : "Mark as read"}</button>`}
        <button class="btn" data-nav="1" ${i === CH.length - 1 ? "disabled" : ""} aria-label="Next chapter">${ICONS.chev}</button>
      </div>
      <div style="height:16px"></div>`);
    if (route.v) setTimeout(() => $("v" + route.v)?.scrollIntoView({ block: "center" }), 60);
    el.querySelectorAll("[data-font]").forEach((b) => (b.onclick = () => { settings.font = Math.min(26, Math.max(14, settings.font + +b.dataset.font)); applyFont(); save("settings", settings); }));
    el.querySelectorAll("[data-nav]").forEach((b) => (b.onclick = () => { route = { view: "read", i: i + +b.dataset.nav }; render(); window.scrollTo(0, 0); }));
    el.querySelectorAll("[data-ver]").forEach((b) => (b.onclick = () => { settings.version = b.dataset.ver; save("settings", settings); delete route.nivFailed; render(); }));
    $("toggleRead") && ($("toggleRead").onclick = () => { markRead(i, !isRead); render(); });
    $("doneNext") && ($("doneNext").onclick = () => {
      markRead(i);
      if (nextInSession !== undefined) { route = { view: "read", i: nextInSession, session: route.session }; render(); window.scrollTo(0, 0); }
      else { toast(`${SESSION[route.session].key} reading done. God bless you!`); trail.length = 0; go("today", {}, false); }
    });
  },
});
