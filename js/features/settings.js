// Settings.

Object.assign(VIEWS, {
  settings() {
    setTitle("Settings");
    const dark = document.documentElement.dataset.theme === "dark";
    const el = main(`
      <div class="h" style="margin-top:12px">You</div>
      <div class="card pad">
        <label class="label" for="sName" style="margin-top:0">Your name (for the greeting)</label><input class="field" id="sName" value="${esc(settings.name)}" />
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px"><span>Dark mode</span><button class="switch ${dark ? "on" : ""}" id="sDark" role="switch" aria-checked="${dark}" aria-label="Dark mode"></button></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px"><span>Bible text size</span><span><button class="btn small" data-font="-1">A−</button> <b style="display:inline-block;width:36px;text-align:center">${settings.font}</b> <button class="btn small" data-font="1">A+</button></span></div>
      </div>
      <div class="h">Privacy</div>
      <div class="card pad">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><span><b>PIN lock</b><br><span class="muted" style="font-size:13px">${lockSet ? "On: prayer list, journal, dreams and Body need your PIN" : "Off: anyone holding your phone can open everything"}</span></span>${ICONS.lock}</div>
        ${lockSet
          ? `<div style="display:flex;gap:8px;margin-top:12px"><button class="btn small" id="pinChange">Change PIN</button><button class="btn small danger" id="pinRemove">Turn off</button></div>`
          : `<button class="btn primary block" id="pinSet" style="margin-top:12px">Set a PIN</button>`}
        <p class="note">The Bible, reading plan and scriptures stay open. Backups are not locked, so keep backup files private.</p>
      </div>
      <div class="h">Bible version</div>
      <div class="card pad">
        <div class="chips"><button class="chip ${settings.version === "niv" ? "on" : ""}" data-version="niv">NIV</button><button class="chip ${settings.version === "kjv" ? "on" : ""}" data-version="kjv">KJV</button></div>
        ${nivReady()
          ? `<p class="note" style="margin-top:12px"><b style="color:var(--ok)">NIV connected</b> (${esc(niv.name)}). ${apiCalls[monthKey()] || 0} of 5,000 free requests used this month.</p>
             <div style="display:flex;gap:8px;margin-top:10px"><button class="btn small" id="nivTest">Test NIV connection</button><button class="btn small danger" id="nivRemove">Remove key</button></div>
             <p class="note serif hidden" id="nivResult" style="font-size:15px;color:var(--ink)"></p>`
          : `<p class="note" style="margin-top:12px">The NIV is free for personal, non-commercial apps through <b>api.bible</b>. Set it up once:</p>
             <ol class="note" style="padding-left:18px;line-height:1.7">
               <li>Create a free account at <a href="https://api.bible/sign-up" target="_blank" rel="noopener" style="color:var(--brand)">api.bible/sign-up</a>.</li>
               <li>Choose the free <b>Starter (non-commercial)</b> plan and add <b>NIV</b> to your Bibles.</li>
               <li>Copy your API key and paste it here. It stays on this phone only.</li>
             </ol>
             <input class="field" id="nivKey" type="password" autocomplete="off" placeholder="Paste your api.bible key" />
             <button class="btn primary block" id="nivConnect" style="margin-top:10px">Connect the NIV</button>
             <p class="note hidden" id="nivResult"></p>`}
        <p class="note">Until the NIV is connected, or when a chapter needs data you don't have, the app shows the KJV.</p>
      </div>
      <div class="h">Reading times</div>
      <div class="card pad">
        ${SESSION.map((s, k) => `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:${k ? 12 : 0}px"><span>${s.key}</span><select class="field" style="width:auto;padding:8px 10px" data-time="${k}">${[...Array(24)].map((_, h) => `<option value="${h}" ${settings.times[k] === h ? "selected" : ""}>${hourLabel(h)}</option>`).join("")}</select></div>`).join("")}
      </div>
      <div class="h">Reminders</div>
      <div class="card pad">
        <label style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><input type="checkbox" id="remBody" ${settings.remindBody ? "checked" : ""} style="width:20px;height:20px" /> Include my training days at <select class="field" id="bodyTime" style="width:auto;padding:6px 8px">${[...Array(24)].map((_, h) => `<option value="${h}" ${(settings.bodyTime ?? 17) === h ? "selected" : ""}>${hourLabel(h)}</option>`).join("")}</select></label>
        <label style="display:flex;align-items:center;gap:10px"><input type="checkbox" id="remFast" ${settings.remindFasts !== false ? "checked" : ""} style="width:20px;height:20px" /> Include my fasting days</label>
        <button class="btn primary block" id="remAdd" style="margin-top:12px">Add reminders to my calendar</button>
        <p class="note">You get a calendar file. Open it and your phone asks <b>which calendar</b> to add it to — only you choose. Reminders run until ${niceDate(PLAN_END, { day: "numeric", month: "long", year: "numeric" })}.</p>
        <p class="note hidden" id="remHelp"></p>
        <p class="note">Changed your times? Tap again — it updates the same reminders. To stop them (or to drop fasting after adding it), delete the Abide events in your calendar app.</p>
      </div>
      <div class="h">Fasting</div>
      <div class="card pad">
        <div class="chips" style="flex-wrap:wrap">${DAY_NAMES.map((d, k) => `<button class="chip ${settings.fastDays.includes(k) ? "on" : ""}" data-fd="${k}">${d.slice(0, 3)}</button>`).join("")}</div>
        <div style="display:flex;gap:10px;align-items:center;margin-top:12px"><span>From</span><select class="field" style="width:auto;padding:8px 10px" id="fStart">${[...Array(24)].map((_, h) => `<option value="${h}" ${settings.fastStart === h ? "selected" : ""}>${hourLabel(h)}</option>`).join("")}</select><span>to</span><select class="field" style="width:auto;padding:8px 10px" id="fEnd">${[...Array(24)].map((_, h) => `<option value="${h}" ${settings.fastEnd === h ? "selected" : ""}>${hourLabel(h)}</option>`).join("")}</select></div>
      </div>
      <div class="h">App</div>
      <div class="card pad">
        <button class="btn primary block" id="install">Install on this phone</button>
        <p class="note hidden" id="installHelp"></p>
        <div style="height:10px"></div>
        <button class="btn block" id="backup">Download a backup</button>
        <div style="height:10px"></div>
        <button class="btn block" id="restoreBtn">Restore from a backup</button><input type="file" id="restore" accept="application/json,.json" class="hidden" />
        <p class="note">Everything is saved on this phone only. Download a backup now and then, and before changing phones.</p>
        <div style="height:10px"></div>
        <div class="h" style="margin:4px 0 8px">Already read some of the Bible?</div>
        <div style="display:flex;gap:8px"><select class="field" id="upToBook" style="flex:1">${NAMES.map((n, b) => `<option value="${b}">${n}</option>`).join("")}</select><select class="field" id="upToCh" style="width:90px"></select></div>
        <button class="btn block" id="markUpTo" style="margin-top:10px">Mark everything up to here as read</button>
        <p class="note">Your plan then continues from the next chapter, still finishing by ${niceDate(PLAN_END, { day: "numeric", month: "long", year: "numeric" })}.</p>
        <div style="height:10px"></div>
        <button class="btn danger block" id="resetPlan">Start the reading plan again</button>
      </div>
      <p class="note" style="text-align:center;margin-top:18px">${nivReady() && niv.copyright ? esc(niv.copyright) + "<br>" : ""}King James Version: public domain.</p>
      <div style="height:16px"></div>`);
    $("sName").oninput = (e) => { settings.name = e.target.value.trim(); save("settings", settings); $("hello").textContent = $("hello").textContent.split(",")[0] + (settings.name ? ", " + settings.name : ""); };
    $("sDark").onclick = () => { setTheme(document.documentElement.dataset.theme !== "dark"); render(); };
    el.querySelectorAll("[data-font]").forEach((b) => (b.onclick = () => { settings.font = Math.min(26, Math.max(14, settings.font + +b.dataset.font)); applyFont(); save("settings", settings); render(); }));
    el.querySelectorAll("[data-time]").forEach((s) => (s.onchange = () => { settings.times[+s.dataset.time] = +s.value; settings.times.sort((a, b) => a - b); save("settings", settings); toast("Saved"); }));
    el.querySelectorAll("[data-fd]").forEach((b) => (b.onclick = () => { const d = +b.dataset.fd; settings.fastDays = settings.fastDays.includes(d) ? settings.fastDays.filter((x) => x !== d) : [...settings.fastDays, d].sort(); save("settings", settings); render(); }));
    $("fStart").onchange = (e) => { settings.fastStart = +e.target.value; save("settings", settings); toast("Saved"); };
    $("fEnd").onchange = (e) => { settings.fastEnd = +e.target.value; save("settings", settings); toast("Saved"); };
    $("remFast").onchange = (e) => { settings.remindFasts = e.target.checked; save("settings", settings); };
    $("remBody").onchange = (e) => { settings.remindBody = e.target.checked; save("settings", settings); };
    $("bodyTime").onchange = (e) => { settings.bodyTime = +e.target.value; save("settings", settings); };
    $("remAdd").onclick = () => {
      downloadReminders($("remFast").checked);
      const help = $("remHelp");
      help.innerHTML = /iphone|ipad|ipod/i.test(navigator.userAgent)
        ? "Tap <b>abide-reminders.ics</b> when it appears, then <b>Add All</b>."
        : "Open <b>abide-reminders.ics</b> from your downloads (or the bar at the bottom), choose <b>Calendar</b>, pick <b>your</b> account, then <b>Import</b>.";
      help.classList.remove("hidden");
    };
    el.querySelectorAll("[data-version]").forEach((b) => (b.onclick = () => { settings.version = b.dataset.version; save("settings", settings); render(); }));
    $("nivConnect") && ($("nivConnect").onclick = async () => {
      const key = $("nivKey").value.trim(), out = $("nivResult");
      if (!key) return $("nivKey").focus();
      $("nivConnect").disabled = true; $("nivConnect").textContent = "Connecting…";
      try { const text = await connectNiv(key); settings.version = "niv"; save("settings", settings); toast("NIV connected"); render(); $("nivResult").textContent = `John 3:16 — ${text}`; $("nivResult").classList.remove("hidden"); }
      catch (e) { niv = { key: "", bibleId: "", name: "", copyright: "" }; save("niv", niv); out.textContent = e.message; out.style.color = "var(--warn)"; out.classList.remove("hidden"); $("nivConnect").disabled = false; $("nivConnect").textContent = "Connect the NIV"; }
    });
    $("nivTest") && ($("nivTest").onclick = async () => {
      const out = $("nivResult"); out.classList.remove("hidden"); out.textContent = "Checking…";
      try { delete nivVerses["John 3:16"]; const e = await nivVerse({ ref: "John 3:16", b: 42, c: 3, v: 16 }); reportFums(e.t); out.textContent = `John 3:16 — ${e.text}`; }
      catch (e) { out.textContent = e.message; out.style.color = "var(--warn)"; }
    });
    $("nivRemove") && ($("nivRemove").onclick = async () => {
      if (!(await ask({ title: "Remove the NIV key?", text: "The app will use the KJV until you connect again.", yes: "Remove", danger: true }))) return;
      niv = { key: "", bibleId: "", name: "", copyright: "" }; nivChapters = {}; nivVerses = {}; save("niv", niv); save("nivChapters", {}); save("nivVerses", {}); render();
    });
    $("pinSet") && ($("pinSet").onclick = setPinSheet);
    $("pinChange") && ($("pinChange").onclick = () => (unlocked ? setPinSheet() : go("lock", { next: "settings" })));
    $("pinRemove") && ($("pinRemove").onclick = async () => {
      if (!unlocked) return go("lock", { next: "settings" });
      if (!(await ask({ title: "Turn off the PIN?", text: "Your prayer list, journal and dreams will open without a PIN.", yes: "Turn off", danger: true }))) return;
      lockSet = null; try { localStorage.removeItem("abide.lock"); } catch {} toast("PIN lock off"); render();
    });
    $("install").onclick = install;
    $("backup").onclick = backup;
    $("restoreBtn").onclick = () => $("restore").click();
    $("restore").onchange = restore;
    const fillCh = () => { const b = +$("upToBook").value; $("upToCh").innerHTML = BIBLE[b].map((_, c) => `<option value="${c + 1}">${c + 1}</option>`).join(""); };
    const firstUnread = CH.findIndex((_, i) => !read.has(i));
    $("upToBook").value = firstUnread > 0 ? CH[firstUnread - 1].b : 0; fillCh();
    if (firstUnread > 0) $("upToCh").value = CH[firstUnread - 1].c;
    $("upToBook").onchange = fillCh;
    $("markUpTo").onclick = async () => {
      const b = +$("upToBook").value, c = +$("upToCh").value, last = chIndex(b, c);
      if (!(await ask({ title: `Mark up to ${NAMES[b]} ${c} as read?`, text: `Everything from Genesis 1 to ${NAMES[b]} ${c} is marked as read, and today's reading starts from ${last + 1 < CH.length ? chName(last + 1) : "the end"}.`, yes: "Mark as read" }))) return;
      for (let i = 0; i <= last; i++) read.add(i);
      save("read", [...read]);
      // Count the pace from here, so chapters read before don't show as "ahead".
      pre = read.size; start = todayKey(); save("pre", pre); save("start", start);
      delete days[todayKey()]; save("days", days);
      toast(`Marked up to ${NAMES[b]} ${c}`);
      go("today", {}, false);
    };
    $("resetPlan").onclick = async () => {
      if (!(await ask({ title: "Start again?", text: "Your chapters read and today's plan are cleared, and the plan starts from Genesis today. Your prayers, journal, lessons and fasts stay.", yes: "Start again", danger: true }))) return;
      read = new Set(); days = {}; log = {}; pre = 0; start = todayKey(); save("read", []); save("days", {}); save("log", {}); save("pre", 0); save("start", start); toast("Plan restarted"); go("today", {}, false);
    };
    renderInstall();
  },
});
