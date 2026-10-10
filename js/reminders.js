/* ---------- reminders as a calendar file ----------
   Builds an .ics the owner opens themselves, so they choose the calendar. Times are "floating"
   (no time zone), so 6am means 6am on their phone. Fixed UIDs and a rising SEQUENCE mean that
   importing it again updates the same events instead of adding copies. */
function icsText(s) { return String(s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1"); }
function icsFold(line) {
  // Lines longer than 75 bytes continue on the next line after a space (RFC 5545 §3.1).
  const enc = new TextEncoder(), out = []; let cur = "", n = 0;
  for (const ch of line) { const b = enc.encode(ch).length; if (n + b > (out.length ? 74 : 75)) { out.push(cur); cur = ""; n = 0; } cur += ch; n += b; }
  out.push(cur); return out.join("\r\n ");
}
const icsDate = (d) => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
const icsTime = (h, m = 0) => `T${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}00`;
function buildReminders(includeFasts) {
  const today = parseDay(todayKey()), stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const seq = Math.floor(Date.now() / 1000), until = PLAN_END.replace(/-/g, "") + "T235959";
  const url = "https://yilkash.github.io/abide/#today";
  const ev = [];
  const add = (uid, title, start, end, rrule, desc, alarms) => ev.push([
    "BEGIN:VEVENT", `UID:${uid}@yilkash.github.io`, `SEQUENCE:${seq}`, `DTSTAMP:${stamp}`, `DTSTART:${start}`, `DTEND:${end}`, `RRULE:${rrule}`,
    `SUMMARY:${icsText(title)}`, `DESCRIPTION:${icsText(desc)}`, `URL:${url}`, "TRANSP:TRANSPARENT",
    ...alarms.flatMap((t) => ["BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsText(title)}`, `TRIGGER:${t}`, "END:VALARM"]), "END:VEVENT"].join("\n"));
  const words = [
    ["morning", "🌅 Abide · Morning Word", "Give God the first place today. Open today's morning reading."],
    ["afternoon", "☀️ Abide · Afternoon Word", "Pause with God. Read this afternoon's chapters and speak one healing scripture."],
    ["night", "🌙 Abide · Night Word & prayer", "Before you get too tired: read tonight's chapters and pray for the people on your prayer list."],
  ];
  words.forEach(([id, title, desc], k) => {
    const h = settings.times[k];
    add(`abide-${id}`, title, icsDate(today) + icsTime(h), icsDate(today) + icsTime(h, 30), `FREQ=DAILY;UNTIL=${until}`, `${desc} ${url}`, ["PT0M"]);
  });
  if (includeFasts && settings.fastDays.length) {
    const first = parseDay(nextFast());
    const days = settings.fastDays.map((d) => ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][d]).join(",");
    const end = Math.max(settings.fastEnd, settings.fastStart + 1);
    add("abide-fast", `🙏 Abide · Fasting (${hourLabel(settings.fastStart)}–${hourLabel(settings.fastEnd)})`, icsDate(first) + icsTime(settings.fastStart), icsDate(first) + icsTime(Math.min(end, 23), end > 23 ? 59 : 0),
      `FREQ=WEEKLY;BYDAY=${days};UNTIL=${until}`, `Set your focus in Abide and break your fast at ${hourLabel(settings.fastEnd)}. "Howbeit this kind goeth not out but by prayer and fasting." Matthew 17:21 ${url}`, ["PT0M", "-PT10H"]);
  }
  if (settings.remindBody) {
    // Strength and walk/jog days that aren't fasting days.
    const days = [1, 2, 4, 6].filter((d) => !settings.fastDays.includes(d));
    if (days.length) {
      let first = today; while (!days.includes(first.getDay())) first = new Date(first.getFullYear(), first.getMonth(), first.getDate() + 1);
      const h = settings.bodyTime ?? 17;
      add("abide-body", "💪 Abide · Training", icsDate(first) + icsTime(h), icsDate(first) + icsTime(Math.min(23, h + 1)),
        `FREQ=WEEKLY;BYDAY=${days.map((d) => ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][d]).join(",")};UNTIL=${until}`, `Open Body in Abide for today's training. ${url.replace("#today", "")}`, ["PT0M"]);
    }
  }
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Abide//Reminders//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Abide", ...ev.join("\n").split("\n"), "END:VCALENDAR"];
  return lines.map(icsFold).join("\r\n") + "\r\n";
}
function downloadReminders(includeFasts) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([buildReminders(includeFasts)], { type: "text/calendar;charset=utf-8" }));
  a.download = "abide-reminders.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 60000);
}
