/* ---------- messages ---------- */
const PREACHERS = [
  { name: "Benson Idahosa", title: "Archbishop", q: "Archbishop Benson Idahosa", about: "Faith, miracles and bold evangelism", initials: "BI" },
  { name: "Andrew Wommack", title: "", q: "Andrew Wommack", about: "Grace, faith and divine healing", initials: "AW" },
  { name: "Joshua Selman", title: "Apostle", q: "Apostle Joshua Selman", about: "The spirit realm, the Holy Spirit and kingdom power", initials: "JS" },
  { name: "Rick Warren", title: "Pastor", q: "Rick Warren sermon", about: "Purpose, serving God and spiritual growth", initials: "RW" },
  { name: "Kenneth E. Hagin", title: "", q: "Kenneth E Hagin", about: "Faith and the authority of the believer", initials: "KH" },
  { name: "T.L. Osborn", title: "", q: "T.L. Osborn", about: "Healing evangelism and miracles", initials: "TO" },
  { name: "Reinhard Bonnke", title: "", q: "Reinhard Bonnke", about: "The Holy Spirit, evangelism and miracles", initials: "RB" },
  { name: "Smith Wigglesworth", title: "", q: "Smith Wigglesworth sermon", about: "Faith and healing (sermons read aloud)", initials: "SW" },
];
const TOPICS = ["faith", "healing", "the spirit realm", "the Kingdom of God", "the Holy Spirit", "prayer", "fasting", "God's creation", "serving God", "the power of God"];
const yt = (q) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q);
const dayNumber = () => Math.floor(parseDay(todayKey()) / 864e5);
function messageOfDay() { const n = dayNumber(); return { p: PREACHERS[n % PREACHERS.length], topic: TOPICS[(n * 3) % TOPICS.length] }; }

Object.assign(VIEWS, {
  messages() {
    setTitle("Messages");
    const msg = messageOfDay();
    const el = main(`
      <div style="height:12px"></div>
      <div class="hero">
        <div class="kicker">Message for today</div>
        <div class="verse" style="font-size:20px">${msg.p.title ? msg.p.title + " " : ""}${msg.p.name} on ${msg.topic}</div>
        <a class="btn gold" style="position:relative;z-index:1" href="${yt(msg.p.q + " " + msg.topic)}" target="_blank" rel="noopener">Watch on YouTube ${ICONS.ext}</a>
      </div>
      <div class="h">By topic</div>
      <div class="chips">${TOPICS.map((t) => `<a class="chip" style="text-decoration:none;color:inherit" href="${yt(t + " sermon")}" target="_blank" rel="noopener">${t[0].toUpperCase() + t.slice(1)}</a>`).join("")}</div>
      <div class="h">Men of God</div>
      <div class="card">${PREACHERS.map((p) => `
        <div class="preacher"><div class="avatar">${p.initials}</div>
          <div class="what" style="flex:1;min-width:0"><b>${p.title ? p.title + " " : ""}${p.name}</b><div class="muted" style="font-size:13px">${p.about}</div></div>
          <a class="btn small" href="${yt(p.q)}" target="_blank" rel="noopener">Watch</a></div>`).join("")}</div>
      <div class="h"><span>Messages that blessed me</span><button id="addMsg">+ Add</button></div>
      <div class="card">${savedMsgs.length ? savedMsgs.map((m, k) => `
        <div class="row"><div class="what"><b>${esc(m.title)}</b><span>${esc(m.note || m.url)}</span></div>
        ${m.url ? `<a class="btn small" href="${esc(m.url)}" target="_blank" rel="noopener">Open</a>` : ""}<button class="icon-btn" data-del="${k}" aria-label="Remove">${ICONS.x}</button></div>`).join("") : '<div class="empty">When a message blesses you, tap + Add and paste its YouTube link so you can return to it.</div>'}</div>
      <div style="height:16px"></div>`);
    $("addMsg").onclick = () => openSheet(`
      <h3>Save a message</h3>
      <label class="label" for="mTitle">Title</label><input class="field" id="mTitle" placeholder="e.g. Andrew Wommack — God wants you well" />
      <label class="label" for="mUrl">YouTube link (optional)</label><input class="field" id="mUrl" placeholder="Paste the link" inputmode="url" />
      <label class="label" for="mNote">What blessed you (optional)</label><input class="field" id="mNote" />
      <div class="two"><button class="btn" id="mCancel">Cancel</button><button class="btn primary" id="mSave">Save</button></div>`, (s) => {
      s.querySelector("#mCancel").onclick = closeSheet;
      s.querySelector("#mSave").onclick = () => {
        const title = s.querySelector("#mTitle").value.trim(); if (!title) return s.querySelector("#mTitle").focus();
        let url = s.querySelector("#mUrl").value.trim(); if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;
        savedMsgs.unshift({ title, url, note: s.querySelector("#mNote").value.trim(), at: todayKey() }); save("saved", savedMsgs); closeSheet(); render();
      };
    });
    el.querySelectorAll("[data-del]").forEach((b) => (b.onclick = async () => { if (await ask({ title: "Remove this message?", text: savedMsgs[+b.dataset.del].title, yes: "Remove", danger: true })) { savedMsgs.splice(+b.dataset.del, 1); save("saved", savedMsgs); render(); } }));
  },
});
