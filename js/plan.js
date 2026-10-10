/* ---------- the reading plan ----------
   Each day takes an even share of what's left (by verses, so long chapters count for more) and
   splits it into morning, afternoon and night. A missed day is shared out over the days that remain. */
function planFor(day) {
  if (days[day]) return days[day];
  const unread = CH.map((_, i) => i).filter((i) => !read.has(i));
  const left = Math.max(1, dayDiff(day, PLAN_END) + 1);
  const remV = unread.reduce((s, i) => s + CH[i].n, 0);
  const target = remV / left;
  const take = [];
  let acc = 0;
  for (const i of unread) {
    if (take.length && acc + CH[i].n / 2 > target) break;
    take.push(i); acc += CH[i].n;
  }
  const parts = [[], [], []];
  let run = 0;
  for (const i of take) { const p = Math.min(2, Math.floor(((run + CH[i].n / 2) / Math.max(acc, 1)) * 3)); parts[p].push(i); run += CH[i].n; }
  // Never leave a part empty when there are enough chapters to go round.
  for (let p = 0; p < 3; p++) if (!parts[p].length) { const from = parts.reduce((m, x, k) => (x.length > parts[m].length ? k : m), 0); if (parts[from].length > 1) parts[p].push(p < from ? parts[from].shift() : parts[from].pop()); }
  parts.forEach((x) => x.sort((a, b) => a - b));
  days[day] = { parts };
  if (day === todayKey()) save("days", days);
  return days[day];
}
function markRead(i, on = true) {
  if (on === read.has(i)) return;
  const t = todayKey();
  if (on) { read.add(i); log[t] = (log[t] || 0) + 1; } else { read.delete(i); log[t] = Math.max(0, (log[t] || 0) - 1); }
  save("read", [...read]); save("log", log);
}
function streak() {
  let n = 0, d = todayKey();
  if (!log[d]) d = shiftDay(d, -1);
  while (log[d] > 0) { n++; d = shiftDay(d, -1); }
  return n;
}
function onTrack() {
  const total = dayDiff(start, PLAN_END) + 1;
  const passed = Math.min(total, dayDiff(start, todayKey()) + 1);
  // Only days already gone count; today's reading isn't late until tomorrow.
  const expected = pre + Math.round(((CH.length - pre) * (passed - 1)) / total);
  return read.size - expected; // negative = behind
}
