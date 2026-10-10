// Abide: Bible in a set time, healing scriptures, fasting, prayer and messages. Everything stays on this phone.
const APP_VERSION = "abide-v10"; // must match CACHE in sw.js; bump both together
const PLAN_END = "2027-03-31";

/* ---------- storage ---------- */
const $ = (id) => document.getElementById(id);
function load(key, fallback) { try { const v = localStorage.getItem("abide." + key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
function save(key, value) { try { localStorage.setItem("abide." + key, JSON.stringify(value)); return true; } catch { toast("Could not save on this phone"); return false; } }
try { navigator.storage?.persist?.(); } catch {}
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const todayKey = () => new Date().toLocaleDateString("en-CA");
const parseDay = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
const dayDiff = (a, b) => Math.round((parseDay(b) - parseDay(a)) / 864e5);
const shiftDay = (k, n) => { const d = parseDay(k); d.setDate(d.getDate() + n); return d.toLocaleDateString("en-CA"); };
const niceDate = (k, opts = { weekday: "long", day: "numeric", month: "long" }) => parseDay(k).toLocaleDateString("en-GB", opts);
const hourLabel = (h) => (h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`);

const DEFAULT_SETTINGS = { name: "", version: "niv", font: 18, times: [6, 13, 20], fastDays: [3, 5], fastStart: 6, fastEnd: 15 };
let settings = { ...DEFAULT_SETTINGS, ...load("settings", {}) };
let read = new Set(load("read", []));            // chapter numbers (0..1188) read
let days = load("days", {});                     // date -> today's reading, fixed once the day starts
let log = load("log", {});                       // date -> chapters read that day
let fasts = load("fasts", {});                   // date -> { done, focus, note }
let prayers = load("prayers", []);
let body = { stage: 0, stageSince: null, sessions: {}, pain: {}, waist: [], calm: [], avoid: [], ...load("body", {}) };
const saveBody = () => save("body", body);
let declared = load("declared", {}); // date -> refs declared that day
let lockSet = load("lock", null);    // {salt, hash, hint}; never included in backups
let unlocked = false, hiddenAt = 0, pinTries = 0, pinWaitUntil = 0;
let journal = load("journal", {});
let lessons = load("lessons", []);
let favs = new Set(load("favs", []));
let savedMsgs = load("saved", []);
let dreams = load("dreams", []);
let pre = load("pre", 0);                     // chapters already read when the plan (re)started
let start = load("start", null);
if (!start) { start = todayKey(); save("start", start); }
