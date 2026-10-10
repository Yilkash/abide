// Dreams
const FEELINGS = ["peace", "joy", "fear", "confusion", "warning", "urgency"];
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognizer = null;
const firstWords = (t) => { const w = String(t || "").trim().split(/\s+/).slice(0, 7).join(" "); return w && String(t).trim().split(/\s+/).length > 7 ? w + "…" : w; };
function newDream() {
  // Dreams come from the night before, so the date defaults to yesterday before noon.
  const t = todayKey(), d = { id: Date.now().toString(36), date: new Date().getHours() < 12 ? shiftDay(t, -1) : t, title: "", text: "", feelings: [], tags: [], meaning: "", scripture: "", status: "new", created: new Date().toISOString() };
  dreams.unshift(d); save("dreams", dreams);
  go("dream", { id: d.id, fresh: true });
}
// Leaving a dream that was never written in removes it.
function dropEmptyDreams() { const before = dreams.length; dreams = dreams.filter((d) => d.title.trim() || d.text.trim() || d.meaning.trim() || (d.tags || []).length); if (dreams.length !== before) save("dreams", dreams); }

Object.assign(VIEWS, {
  dreams() {
    setTitle("Dreams");
    const q = (route.q || "").toLowerCase(), f = route.f || "";
    const list = dreams.filter((d) => (!q || `${d.title} ${d.text} ${d.meaning} ${d.scripture} ${(d.tags || []).join(" ")}`.toLowerCase().includes(q))
      && (!f || (f.startsWith("#") ? (d.tags || []).includes(f.slice(1)) : d.status === f || (d.feelings || []).includes(f))));
    const counts = {};
    dreams.forEach((d) => (d.tags || []).forEach((t) => (counts[t] = (counts[t] || 0) + 1)));
    const symbols = Object.entries(counts).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 12);
    const filters = [["", "All"], ["praying", "Praying"], ["fulfilled", "Came to pass"], ...FEELINGS.map((x) => [x, x[0].toUpperCase() + x.slice(1)])];
    const el = main(`
      <div style="height:12px"></div>
      <button class="btn primary block" id="addDream">+ Record a dream</button>
      ${dreams.length ? `<input class="field" id="dreamSearch" type="search" placeholder="Search your dreams" value="${esc(route.q || "")}" style="margin-top:12px" />
      <div class="chips" style="margin-top:10px">${filters.map(([k, l]) => `<button class="chip ${f === k ? "on" : ""}" data-f="${esc(k)}">${esc(l)}</button>`).join("")}</div>` : ""}
      ${symbols.length ? `<div class="h"><span>Recurring symbols</span></div><div class="chips" style="flex-wrap:wrap">${symbols.map(([t, n]) => `<button class="chip ${f === "#" + t ? "on" : ""}" data-f="#${esc(t)}">${esc(t)} · ${n}</button>`).join("")}</div>` : ""}
      <div class="h"><span>${f || q ? "Found" : "All dreams"}</span><small>${list.length || ""}</small></div>
      <div class="card">${list.length ? list.map((d) => `
        <div class="row tap" data-d="${d.id}"><div class="what"><b>${esc(d.title || firstWords(d.text) || "Untitled dream")}</b>
          <span>${niceDate(d.date, { weekday: "short", day: "numeric", month: "short" })}${(d.tags || []).length ? " · " + d.tags.map(esc).join(", ") : ""}</span></div>
          ${d.status === "fulfilled" ? '<span class="tag ok">Came to pass</span>' : d.status === "praying" ? '<span class="tag gold">Praying</span>' : ""}<span class="chev">${ICONS.chev}</span></div>`).join("")
        : `<div class="empty">${dreams.length ? "No dreams match." : "When God speaks in the night, write it here. “For God speaketh once, yea twice… in a dream, in a vision of the night.” Job 33:14–15"}</div>`}</div>
      <div class="h"><span>Scriptures on dreams</span><button id="dreamVerses">Open</button></div>
      <p class="note" style="margin-top:0">Test every dream by the Word (1 Thessalonians 5:21) and ask God for wisdom (James 1:5).</p>
      <div style="height:16px"></div>`);
    $("addDream").onclick = () => newDream();
    $("dreamVerses").onclick = () => go("word", { theme: "Dreams & visions" });
    const sb = $("dreamSearch");
    if (sb) sb.oninput = () => { route.q = sb.value; const pos = sb.selectionStart; render(); const n = $("dreamSearch"); n.focus(); n.setSelectionRange(pos, pos); };
    el.querySelectorAll("[data-f]").forEach((b) => (b.onclick = () => { route.f = route.f === b.dataset.f ? "" : b.dataset.f; render(); }));
    el.querySelectorAll("[data-d]").forEach((r) => (r.onclick = () => go("dream", { id: r.dataset.d })));
  },
  dream() {
    const d = dreams.find((x) => x.id === route.id);
    if (!d) return go("dreams", {}, false);
    setTitle(d.title || "Dream");
    const el = main(`
      <div style="height:12px"></div>
      <div style="display:flex;gap:10px">
        <input class="field" id="dTitle" placeholder="Title (optional)" value="${esc(d.title)}" style="flex:1" />
        <input class="field" id="dDate" type="date" value="${esc(d.date)}" style="width:150px" />
      </div>
      <label class="label" for="dText">What did you see?</label>
      <textarea class="field serif" id="dText" style="min-height:200px" placeholder="Write everything you remember: places, people, colours, words spoken, how it ended…">${esc(d.text)}</textarea>
      ${SpeechRec ? `<div style="display:flex;align-items:center;gap:10px;margin-top:8px"><button class="btn small" id="dSpeak">🎤 Speak it</button><span class="muted" style="font-size:12px" id="dSpeakNote">Your phone's voice typing (uses Google)</span></div>` : ""}
      <label class="label">How did it feel?</label>
      <div class="chips" style="flex-wrap:wrap">${FEELINGS.map((x) => `<button class="chip ${(d.feelings || []).includes(x) ? "on" : ""}" data-feel="${x}">${x[0].toUpperCase() + x.slice(1)}</button>`).join("")}</div>
      <label class="label" for="dTag">People and symbols</label>
      <div class="chips" style="flex-wrap:wrap" id="dTags">${(d.tags || []).map((t) => `<button class="chip on" data-untag="${esc(t)}">${esc(t)} ✕</button>`).join("")}</div>
      <input class="field" id="dTag" placeholder="e.g. water, snake, mother — press Enter after each" style="margin-top:8px" />
      <label class="label" for="dMeaning">What I sense it means</label>
      <textarea class="field serif" id="dMeaning" style="min-height:90px" placeholder="Pray first. What is the Holy Spirit showing you?">${esc(d.meaning)}</textarea>
      <label class="label" for="dScripture">Scripture that comes to mind</label>
      <input class="field" id="dScripture" placeholder="e.g. Isaiah 43:2" value="${esc(d.scripture)}" />
      <label class="label">Status</label>
      <div class="chips">${[["new", "Just recorded"], ["praying", "Praying over it"], ["fulfilled", "Came to pass"]].map(([k, l]) => `<button class="chip ${(d.status || "new") === k ? "on" : ""}" data-status="${k}">${l}</button>`).join("")}</div>
      ${d.status === "fulfilled" ? `<div style="display:flex;gap:10px;margin-top:10px"><input class="field" id="dWhen" type="date" value="${esc(d.fulfilledAt || todayKey())}" style="width:150px" /><input class="field" id="dHow" placeholder="How it came to pass" value="${esc(d.fulfilledNote)}" style="flex:1" /></div>` : ""}
      <div class="two"><button class="btn danger" id="dDelete">Delete</button><button class="btn primary" id="dDone">Done</button></div>
      <p class="note" style="text-align:center">Saved as you type, on this phone only.</p>
      <div style="height:16px"></div>`);
    const saveNow = () => { d.updated = new Date().toISOString(); save("dreams", dreams); };
    let timer;
    const bind = (id, key) => { const x = $(id); if (x) x.oninput = () => { d[key] = x.value; clearTimeout(timer); timer = setTimeout(saveNow, 300); if (key === "title") setTitle(x.value || "Dream"); }; };
    bind("dTitle", "title"); bind("dText", "text"); bind("dMeaning", "meaning"); bind("dScripture", "scripture"); bind("dHow", "fulfilledNote");
    $("dDate").onchange = (e) => { d.date = e.target.value || d.date; saveNow(); };
    $("dWhen") && ($("dWhen").onchange = (e) => { d.fulfilledAt = e.target.value; saveNow(); });
    el.querySelectorAll("[data-feel]").forEach((b) => (b.onclick = () => { const x = b.dataset.feel; d.feelings = (d.feelings || []).includes(x) ? d.feelings.filter((y) => y !== x) : [...(d.feelings || []), x]; saveNow(); b.classList.toggle("on"); }));
    el.querySelectorAll("[data-status]").forEach((b) => (b.onclick = () => { saveText(); d.status = b.dataset.status; if (d.status === "fulfilled" && !d.fulfilledAt) d.fulfilledAt = todayKey(); saveNow(); if (d.status === "fulfilled") toast("Praise God!"); render(); }));
    const saveText = () => {
      for (const [id, k] of [["dTitle", "title"], ["dText", "text"], ["dMeaning", "meaning"], ["dScripture", "scripture"], ["dHow", "fulfilledNote"]]) if ($(id)) d[k] = $(id).value;
      // A tag typed but not yet entered is kept too.
      const pending = ($("dTag")?.value || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
      if (pending.length) { d.tags = [...new Set([...(d.tags || []), ...pending])]; $("dTag").value = ""; }
    };
    const addTag = () => { if (!$("dTag").value.trim()) return; saveText(); saveNow(); render(); $("dTag").focus(); };
    $("dTag").onkeydown = (e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } };
    el.querySelectorAll("[data-untag]").forEach((b) => (b.onclick = () => { saveText(); d.tags = d.tags.filter((t) => t !== b.dataset.untag); saveNow(); render(); }));
    $("dDone").onclick = () => { saveText(); saveNow(); back(); };
    $("dDelete").onclick = async () => { if (!(await ask({ title: "Delete this dream?", text: d.title || firstWords(d.text) || "This dream", yes: "Delete", danger: true }))) return; dreams = dreams.filter((x) => x !== d); save("dreams", dreams); back(); };
    // Voice typing: what she says is added to the end of the dream.
    const sp = $("dSpeak");
    if (sp) sp.onclick = () => {
      if (recognizer) { recognizer.stop(); return; }
      recognizer = new SpeechRec(); recognizer.lang = "en-NG"; recognizer.continuous = true; recognizer.interimResults = false;
      recognizer.onresult = (e) => { let add = ""; for (let k = e.resultIndex; k < e.results.length; k++) if (e.results[k].isFinal) add += e.results[k][0].transcript; if (!add.trim()) return; const box = $("dText"); if (!box) return; box.value = (box.value.trimEnd() + (box.value.trim() ? " " : "") + add.trim()).replace(/^./, (c) => c.toUpperCase()); d.text = box.value; saveNow(); };
      recognizer.onend = () => { recognizer = null; if ($("dSpeak")) { $("dSpeak").textContent = "🎤 Speak it"; $("dSpeakNote").textContent = "Your phone's voice typing (uses Google)"; } };
      recognizer.onerror = (e) => { if ($("dSpeakNote")) $("dSpeakNote").textContent = e.error === "not-allowed" ? "Allow the microphone to use voice typing" : "Voice typing stopped — tap to try again"; };
      try { recognizer.start(); sp.textContent = "■ Stop"; $("dSpeakNote").textContent = "Listening… speak your dream"; } catch { recognizer = null; }
    };
    if (route.fresh) { route.fresh = false; setTimeout(() => $("dText")?.focus(), 50); }
  },
});
