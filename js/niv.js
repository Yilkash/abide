/* ---------- NIV through api.bible ----------
   Biblica lets free, non-commercial apps with no AI show the NIV through api.bible's Starter plan.
   The owner's own API key is typed into Settings and stays on this phone. api.bible's rules:
   cache fewer than 500 verses in a row, refresh at least every 14 days, report views with FUMS,
   and show the copyright notice. So only today's reading and the chapter on screen are kept. */
const API = "https://rest.api.bible/v1";
const USFM = ["GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA","1KI","2KI","1CH","2CH","EZR","NEH","EST","JOB","PSA","PRO","ECC","SNG","ISA","JER","LAM","EZK","DAN","HOS","JOL","AMO","OBA","JON","MIC","NAM","HAB","ZEP","HAG","ZEC","MAL","MAT","MRK","LUK","JHN","ACT","ROM","1CO","2CO","GAL","EPH","PHP","COL","1TH","2TH","1TI","2TI","TIT","PHM","HEB","JAS","1PE","2PE","1JN","2JN","3JN","JUD","REV"];
const FRESH_MS = 13 * 864e5;          // refresh before api.bible's 14-day limit
const MAX_CACHED_VERSES = 480;        // stay under 500 verses
const MONTHLY_LIMIT = 4800;           // Starter plan allows 5,000 calls a month
let niv = load("niv", { key: "", bibleId: "", name: "", copyright: "" });
let nivChapters = load("nivChapters", {});   // "GEN.1" -> { verses: [[n, text]...], at, t }
let nivVerses = load("nivVerses", {});       // "Isaiah 53:4-5" -> { text, at, t }
let apiCalls = load("apiCalls", {});          // "2026-10" -> calls made
const nivReady = () => !!(niv.key && niv.bibleId);
const useNiv = () => settings.version === "niv" && nivReady();
const fresh = (e) => e && Date.now() - e.at < FRESH_MS;
const monthKey = () => todayKey().slice(0, 7);
async function apiGet(path) {
  if ((apiCalls[monthKey()] || 0) >= MONTHLY_LIMIT) throw new Error("This month's free NIV limit is used up");
  apiCalls[monthKey()] = (apiCalls[monthKey()] || 0) + 1; save("apiCalls", apiCalls);
  const res = await fetch(API + path, { headers: { "api-key": niv.key } });
  if (res.status === 401 || res.status === 403) throw new Error("api.bible didn't accept the key, or NIV isn't on your plan");
  if (!res.ok) throw new Error(`api.bible error ${res.status}`);
  return res.json();
}
// Turn api.bible's plain text ("[1] In the beginning… [2] Now the earth…") into numbered verses.
function parseVerses(content) {
  const bits = String(content || "").split(/\[(\d+)(?:-\d+)?\]/);
  const out = [];
  for (let k = 1; k < bits.length; k += 2) { const t = bits[k + 1].replace(/\s+/g, " ").trim(); if (t) out.push([+bits[k], t]); }
  return out.length ? out : [[1, String(content || "").replace(/\s+/g, " ").trim()]];
}
const TEXT_OPTS = "content-type=text&include-titles=false&include-notes=false&include-chapter-numbers=false&fums-version=3";
async function nivChapter(i) {
  const id = `${USFM[CH[i].b]}.${CH[i].c}`;
  if (fresh(nivChapters[id])) return nivChapters[id];
  const r = await apiGet(`/bibles/${niv.bibleId}/chapters/${id}?${TEXT_OPTS}&include-verse-numbers=true`);
  if (r.data?.copyright) { niv.copyright = r.data.copyright.replace(/\s+/g, " ").trim(); save("niv", niv); }
  nivChapters[id] = { verses: parseVerses(r.data?.content), at: Date.now(), t: r.meta?.fumsToken || "" };
  pruneNiv(id);
  return nivChapters[id];
}
// Keep only today's reading and the chapter just opened, under 500 verses in all.
function pruneNiv(keepId) {
  const today = new Set((days[todayKey()]?.parts || []).flat().map((i) => `${USFM[CH[i].b]}.${CH[i].c}`));
  for (const [id, e] of Object.entries(nivChapters)) if (!fresh(e)) delete nivChapters[id];
  const size = () => Object.values(nivChapters).reduce((s, e) => s + e.verses.length, 0);
  const order = Object.entries(nivChapters).filter(([id]) => id !== keepId).sort((a, b) => (today.has(a[0]) - today.has(b[0])) || a[1].at - b[1].at);
  while (size() > MAX_CACHED_VERSES && order.length) delete nivChapters[order.shift()[0]];
  save("nivChapters", nivChapters);
}
const passageId = (v) => { const end = +(v.ref.match(/-(\d+)$/)?.[1] || v.v); const a = `${USFM[v.b]}.${v.c}.${v.v}`; return end > v.v ? `${a}-${USFM[v.b]}.${v.c}.${end}` : a; };
async function nivVerse(v) {
  if (fresh(nivVerses[v.ref])) return nivVerses[v.ref];
  const r = await apiGet(`/bibles/${niv.bibleId}/passages/${passageId(v)}?${TEXT_OPTS}&include-verse-numbers=false`);
  nivVerses[v.ref] = { text: String(r.data?.content || "").replace(/\s+/g, " ").trim(), at: Date.now(), t: r.meta?.fumsToken || "" };
  for (const [k, e] of Object.entries(nivVerses)) if (!fresh(e)) delete nivVerses[k];
  save("nivVerses", nivVerses);
  return nivVerses[v.ref];
}
// A themed verse in the chosen version: the NIV when we have it, otherwise the KJV.
function verseText(v) { const e = useNiv() && fresh(nivVerses[v.ref]) ? nivVerses[v.ref] : null; return e ? { text: e.text, ver: "NIV", t: e.t } : { text: v.text, ver: "KJV" }; }
// Fetch the NIV for verses on screen, then swap their text in place.
async function fillVerses(list, box) {
  if (!useNiv() || !navigator.onLine) return;
  const tokens = [];
  for (const v of list) {
    if (fresh(nivVerses[v.ref])) { tokens.push(nivVerses[v.ref].t); continue; }
    try { const e = await nivVerse(v); tokens.push(e.t); } catch (err) { console.warn(err.message); break; }
    box.querySelectorAll(`[data-vref="${CSS.escape(v.ref)}"]`).forEach((el) => { const x = verseText(v); el.querySelector(".vtext").textContent = x.text; el.querySelector(".vver").textContent = x.ver; });
  }
  reportFums(tokens);
}
// api.bible's Fair Use Management System: report each NIV passage shown.
let fumsLoaded = false;
function reportFums(tokens) {
  tokens = [].concat(tokens).filter(Boolean);
  if (!tokens.length || !navigator.onLine) return;
  if (!fumsLoaded) {
    fumsLoaded = true;
    window.fumsData = window.fumsData || [];
    window.fums = window.fums || function () { window.fumsData.push(arguments); };
    const s = document.createElement("script"); s.src = "https://pkg.api.bible/fumsV3.min.js"; s.async = true; document.head.appendChild(s);
  }
  window.fums("trackView", tokens);
}
// Fetch today's reading in the background so it can be read later without data.
let prefetching = false;
async function prefetchToday() {
  if (!useNiv() || !navigator.onLine || prefetching) return;
  prefetching = true;
  try { for (const i of planFor(todayKey()).parts.flat()) await nivChapter(i); } catch (e) { console.warn(e.message); }
  prefetching = false;
}
async function connectNiv(key) {
  niv = { key, bibleId: "", name: "", copyright: "" };
  const list = await apiGet("/bibles?language=eng");
  const all = list.data || [];
  const pick = all.find((b) => /^NIV/i.test(b.abbreviation || "") || /^NIV/i.test(b.abbreviationLocal || "")) || all.find((b) => /new international version/i.test(`${b.name} ${b.nameLocal}`));
  if (!pick) throw new Error("The NIV isn't on this key yet. In api.bible, add NIV to your Bibles, then try again");
  niv.bibleId = pick.id; niv.name = pick.nameLocal || pick.name || "NIV";
  const test = await apiGet(`/bibles/${niv.bibleId}/passages/JHN.3.16?${TEXT_OPTS}&include-verse-numbers=false`);
  if (test.data?.copyright) niv.copyright = test.data.copyright.replace(/\s+/g, " ").trim();
  save("niv", niv);
  reportFums(test.meta?.fumsToken);
  return String(test.data?.content || "").replace(/\s+/g, " ").trim();
}
