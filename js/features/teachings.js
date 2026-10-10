// Healing teachings: the main points of T.L. Osborn's "Healing the Sick", summarised in our own words
// (the book is under copyright, so none of its text is here). Each point lists the scriptures it rests on
// by reference only; the verse text is taken from kjv.json when shown, never typed by hand.
const TEACHINGS = [
  { id: "will", title: "It is God's will to heal you",
    point: "Settle this first: healing is God's will, not a maybe. When a leper asked Jesus \"if thou wilt\", Jesus answered \"I will\" and healed him. You cannot boldly believe for something you are not sure God wants to give.",
    act: "Read Matthew 8:2-3 out loud and put your own name in it.",
    refs: ["Matthew 8:2-3", "3 John 1:2", "Exodus 15:26"] },
  { id: "cross", title: "Jesus carried your sickness",
    point: "At the cross Jesus dealt with sickness as surely as He dealt with sin. Healing is part of what He paid for, so you receive it the same way you received forgiveness: by believing what He already did.",
    act: "Thank Him today for your healing as something already paid for.",
    refs: ["Isaiah 53:4-5", "Matthew 8:16-17", "1 Peter 2:24"] },
  { id: "same", title: "Jesus is the same today",
    point: "Everything Jesus did in the Gospels shows what He is like now. He never changed, so what He did for the sick then, He does for the sick today.",
    act: "Read one healing in the Gospels and say: \"He is the same for me today.\"",
    refs: ["Hebrews 13:8", "Acts 10:38", "Matthew 4:23-24"] },
  { id: "all", title: "He healed them all",
    point: "Again and again the Gospels say Jesus healed all who came to Him. Nobody was turned away to stay sick for their own good. That \"all\" includes you.",
    act: "Underline every \"all\" and \"every\" in these verses.",
    refs: ["Matthew 12:15", "Luke 6:19", "Matthew 9:35"] },
  { id: "enemy", title: "Sickness is from the enemy",
    point: "Scripture calls sickness oppression of the devil and a bondage, not a blessing from God. Jesus came to destroy the devil's works. So resist sickness; don't accept it as God's will.",
    act: "Say out loud: \"Sickness is not from God. I resist it in Jesus' name.\"",
    refs: ["Acts 10:38", "Luke 13:16", "John 10:10", "1 John 3:8"] },
  { id: "hear", title: "Faith comes by hearing",
    point: "Faith for healing grows from hearing God's promises, again and again, until they are more real to you than what you feel. Feed on them daily, as you would on food.",
    act: "Read today's healing scriptures out loud three times.",
    refs: ["Romans 10:17", "Proverbs 4:20-22", "Psalms 107:20"] },
  { id: "word", title: "God's Word is His promise to you",
    point: "God's promise is as good as God Himself. He watches over His word to perform it, and none of His promises fail. Treat each healing verse as God speaking to you personally.",
    act: "Pick one healing verse and carry it with you all day.",
    refs: ["Jeremiah 1:12", "Numbers 23:19", "Isaiah 55:11"] },
  { id: "receive", title: "Believe you receive when you pray",
    point: "Faith counts it done when you pray, before you see or feel anything. Ask once, then thank God that it is done, instead of begging Him over and over.",
    act: "Pray once for your healing, then spend the rest of the time thanking Him.",
    refs: ["Mark 11:24", "Hebrews 11:1", "1 John 5:14-15"] },
  { id: "act", title: "Act on your faith",
    point: "Faith shows itself by doing. The ten lepers were healed as they went, before they saw any change. Do something you could not do before, as far as you safely can, because you believe.",
    act: "Do one thing today that shows you believe you are healed.",
    refs: ["Luke 17:12-14", "James 2:17", "Mark 2:11-12"] },
  { id: "symptoms", title: "Don't be moved by symptoms",
    point: "Abraham did not consider his own body; he considered the promise. Symptoms may linger, but hold on to what God said rather than what you feel, and keep confessing it.",
    act: "When a symptom shows up today, answer it with a scripture.",
    refs: ["Romans 4:19-21", "2 Corinthians 4:18", "Hebrews 10:23"] },
  { id: "name", title: "The name of Jesus and laying on of hands",
    point: "Jesus gave believers His name and told them to lay hands on the sick. You don't have to wait for a famous preacher; any believer can pray for the sick in Jesus' name.",
    act: "Lay your hand where it hurts, or on someone sick, and pray in Jesus' name.",
    refs: ["Mark 16:17-18", "John 14:13-14", "Acts 3:6"] },
  { id: "hindrances", title: "Clear the way",
    point: "Unforgiveness and sin you are holding on to can block faith. Confess, forgive, and receive God's forgiveness, then stand before Him with a clear conscience to receive.",
    act: "Forgive anyone you are holding something against, by name, today.",
    refs: ["Mark 11:25", "1 John 1:9", "James 5:14-16"] },
  { id: "keep", title: "Keep your healing",
    point: "After you receive, the enemy may try to bring the sickness back. Resist him, stay in the Word and keep thanking God. Don't give back what Jesus gave you.",
    act: "Write down your healing testimony in the journal, and thank God for it.",
    refs: ["James 4:7", "1 Peter 5:8-9", "Galatians 5:1"] },
  { id: "witness", title: "Healing points people to Jesus",
    point: "In the Bible, healings made people believe the gospel. God heals so that people will know Jesus is alive. Freely you have received, so freely give.",
    act: "Tell someone what God has done for you, or pray for a sick person this week.",
    refs: ["Matthew 10:8", "Mark 16:20", "Acts 8:5-8"] },
];
let teach = { notes: {}, studied: {}, ...load("teach", {}) }; // notes: id -> text; studied: id -> date
const saveTeach = () => save("teach", teach);
const teachingOfDay = () => TEACHINGS[dayNumber() % TEACHINGS.length];
Object.assign(TAB_OF, { teachings: "more", teaching: "more" });

// "Isaiah 53:4-5" -> a verse in the same shape as the themed ones, with its text from the KJV.
const bibleVerses = {};
function bibleVerse(ref) {
  if (bibleVerses[ref]) return bibleVerses[ref];
  const m = ref.match(/^(.+) (\d+):(\d+)(?:-(\d+))?$/), b = m ? NAMES.indexOf(m[1]) : -1;
  const ch = b >= 0 && BIBLE?.[b]?.[+m[2] - 1];
  const lines = ch && ch.slice(+m[3] - 1, +(m[4] || m[3]));
  if (!lines?.length || lines.length !== +(m[4] || m[3]) - +m[3] + 1) return null;
  return (bibleVerses[ref] = { ref, b, c: +m[2], v: +m[3], text: lines.join(" ") });
}
const teachingVerses = (t) => t.refs.map(bibleVerse).filter(Boolean);

Object.assign(VIEWS, {
  teachings() {
    setTitle("Healing teachings");
    if (!BIBLE) { main('<div class="loading">Opening the Bible…</div>'); return bibleReady.then(render); }
    const today = teachingOfDay(), n = Object.keys(teach.studied).length;
    const el = main(`<div style="height:12px"></div>
      <div class="declare tap" data-t="${today.id}"><div class="kicker">Teaching for today</div><div class="say">${esc(today.title)}</div><div class="scr" style="font-family:inherit">${esc(today.point)}</div><div class="ref">${today.refs.map(esc).join(" · ")}</div></div>
      <div class="h"><span>All teachings</span><small>${n} of ${TEACHINGS.length} studied</small></div>
      <div class="card">${TEACHINGS.map((t, i) => `<div class="row tap" data-t="${t.id}"><div class="ico" style="width:34px;height:34px;border-radius:10px;background:var(--surface-2);color:var(--brand);display:grid;place-items:center;font-weight:700;font-size:13px">${teach.studied[t.id] ? ICONS.check : i + 1}</div><div class="what"><b>${esc(t.title)}</b><span>${t.refs.map(esc).join(" · ")}</span></div><span class="chev">${ICONS.chev}</span></div>`).join("")}</div>
      <p class="note">Based on T.L. Osborn's book <i>Healing the Sick</i>, summarised in our own words. Read the book for his full teaching.</p>
      <div style="height:16px"></div>`);
    el.querySelectorAll("[data-t]").forEach((r) => (r.onclick = () => go("teaching", { id: r.dataset.t })));
  },
  teaching() {
    if (!BIBLE) { main('<div class="loading">Opening the Bible…</div>'); return bibleReady.then(render); }
    const i = Math.max(0, TEACHINGS.findIndex((t) => t.id === route.id)), t = TEACHINGS[i], next = TEACHINGS[(i + 1) % TEACHINGS.length];
    const verses = teachingVerses(t), done = !!teach.studied[t.id];
    setTitle(`Teaching ${i + 1} of ${TEACHINGS.length}`);
    const el = main(`<div style="height:12px"></div>
      <div class="card pad"><div class="kicker" style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:700">Healing teaching</div>
        <h2 style="margin:6px 0 10px;font-size:22px;line-height:1.3">${esc(t.title)}</h2>
        <div style="line-height:1.6">${esc(t.point)}</div></div>
      <div class="h"><span>The scriptures</span><button id="tSpeak">Read aloud</button></div>
      <div class="card">${verses.map((v) => `<div class="verse-card" data-vref="${esc(v.ref)}"><div class="vt vtext">${esc(verseText(v).text)}</div>
        <div class="vr"><b>${esc(v.ref)} <span class="vver" style="color:var(--muted);font-weight:500">${verseText(v).ver}</span></b><button class="btn small" data-meditate="${esc(v.ref)}">Meditate</button></div></div>`).join("")}</div>
      <div class="h"><span>Do this today</span></div>
      <div class="card pad">${esc(t.act)}</div>
      <div class="h"><span>My notes</span><small id="tSaved"></small></div>
      <textarea class="field serif" id="tNotes" placeholder="What stood out to you? Notes from your own copy of the book…">${esc(teach.notes[t.id] || "")}</textarea>
      <div class="two" style="margin-top:14px"><button class="btn ${done ? "" : "primary"}" id="tDone">${done ? "Studied ✓" : "Mark as studied"}</button><button class="btn" id="tNext">Next teaching</button></div>
      <div style="height:16px"></div>`);
    fillVerses(verses, el);
    el.querySelectorAll("[data-meditate]").forEach((b) => (b.onclick = () => go("meditate", { ref: b.dataset.meditate })));
    $("tSpeak").onclick = () => speak([t.title, t.point, ...verses.map((v) => `${verseText(v).text} ... ${v.ref.replace(":", ", verse ")}`)].join(" ... "));
    let timer;
    $("tNotes").oninput = (e) => { clearTimeout(timer); timer = setTimeout(() => { const s = e.target.value; if (s.trim()) teach.notes[t.id] = s; else delete teach.notes[t.id]; saveTeach(); $("tSaved").textContent = "Saved"; }, 400); };
    $("tDone").onclick = () => { if (done) delete teach.studied[t.id]; else { teach.studied[t.id] = todayKey(); toast("Well done. Keep it in your heart."); } saveTeach(); render(); };
    $("tNext").onclick = () => { route = { view: "teaching", id: next.id }; render(); window.scrollTo(0, 0); };
  },
});
