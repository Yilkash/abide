// Sunday school lesson notes.
function editLesson(l) {
  const isNew = !l;
  l = l || { id: Date.now().toString(36), date: shiftDay(todayKey(), (7 - parseDay(todayKey()).getDay()) % 7 || 7), title: "", text: "", notes: "" };
  openSheet(`
    <h3>${isNew ? "New lesson" : "Lesson"}</h3>
    <label class="label" for="lTitle">Topic</label><input class="field" id="lTitle" value="${esc(l.title)}" placeholder="e.g. Jesus the Healer" />
    <label class="label" for="lDate">Sunday</label><input class="field" id="lDate" type="date" value="${esc(l.date)}" />
    <label class="label" for="lText">Bible text</label><input class="field" id="lText" value="${esc(l.text)}" placeholder="e.g. Mark 5:25–34" />
    <label class="label" for="lNotes">Main points and application</label><textarea class="field" id="lNotes" style="min-height:160px" placeholder="1. …&#10;2. …&#10;3. …&#10;&#10;How will the class live it this week?">${esc(l.notes)}</textarea>
    <div class="two">${isNew ? '<button class="btn" id="lCancel">Cancel</button>' : '<button class="btn danger" id="lDelete">Delete</button>'}<button class="btn primary" id="lSave">Save</button></div>`, (s) => {
    s.querySelector("#lCancel") && (s.querySelector("#lCancel").onclick = closeSheet);
    s.querySelector("#lDelete") && (s.querySelector("#lDelete").onclick = async () => { if (await ask({ title: "Delete this lesson?", text: l.title, yes: "Delete", danger: true })) { lessons = lessons.filter((x) => x.id !== l.id); save("lessons", lessons); closeSheet(); render(); } });
    s.querySelector("#lSave").onclick = () => {
      const title = s.querySelector("#lTitle").value.trim(); if (!title) return s.querySelector("#lTitle").focus();
      Object.assign(l, { title, date: s.querySelector("#lDate").value, text: s.querySelector("#lText").value.trim(), notes: s.querySelector("#lNotes").value });
      if (isNew) lessons.unshift(l);
      lessons.sort((a, b) => (a.date < b.date ? 1 : -1)); save("lessons", lessons); closeSheet(); toast("Lesson saved"); render();
    };
  });
}

Object.assign(VIEWS, {
  lessons() {
    setTitle("Sunday school");
    const el = main(`
      <div style="height:12px"></div>
      <button class="btn primary block" id="newLesson">+ Prepare a lesson</button>
      <div class="h"><span>Lessons</span><small>${lessons.length || ""}</small></div>
      <div class="card">${lessons.length ? lessons.map((l) => `<div class="row tap" data-l="${l.id}"><div class="what"><b>${esc(l.title)}</b><span>${l.date ? niceDate(l.date, { weekday: "short", day: "numeric", month: "short" }) : ""}${l.text ? " · " + esc(l.text) : ""}</span></div><span class="chev">${ICONS.chev}</span></div>`).join("") : '<div class="empty">Plan your next class: topic, Bible text, main points and how the class will live it out.</div>'}</div>
      <p class="note">"Study to shew thyself approved unto God, a workman that needeth not to be ashamed, rightly dividing the word of truth." 2 Timothy 2:15</p>
      <div style="height:16px"></div>`);
    $("newLesson").onclick = () => editLesson();
    el.querySelectorAll("[data-l]").forEach((r) => (r.onclick = () => editLesson(lessons.find((l) => l.id === r.dataset.l))));
  },
});
