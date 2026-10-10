// Keeps Abide working with no network: serve the saved copy, refresh it when online.
// Bump together with APP_VERSION in js/core.js. Every new file must be listed in FILES.
const CACHE = "abide-v10";
const FILES = [
  "./",
  "index.html",
  "css/app.css",
  "js/core.js",
  "js/data.js",
  "js/icons.js",
  "js/bible.js",
  "js/niv.js",
  "js/plan.js",
  "js/ui.js",
  "js/router.js",
  "js/features/lock.js",
  "js/features/today.js",
  "js/features/declare.js",
  "js/features/body.js",
  "js/features/bible.js",
  "js/features/word.js",
  "js/features/messages.js",
  "js/features/meditate.js",
  "js/features/dreams.js",
  "js/features/fasting.js",
  "js/features/prayer.js",
  "js/features/journal.js",
  "js/features/lessons.js",
  "js/features/more.js",
  "js/reminders.js",
  "js/backup.js",
  "js/features/settings.js",
  "js/shell.js",
  "js/main.js",
  "kjv.json",
  "manifest.webmanifest",
  "icon-192.png",
  "icon-512.png",
];
// "reload" and "no-cache" skip the browser's HTTP cache, so a new version never mixes old and new files.
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" }))))); self.skipWaiting(); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // Update checks always go to the network and are never saved.
  if (url.searchParams.has("check")) return;
  // NIV text from api.bible is cached by the app under its own rules, never here.
  if (url.hostname.endsWith("api.bible")) return;
  // The Bible never changes: serve it from the phone first.
  if (url.pathname.endsWith("/kjv.json")) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; })));
    return;
  }
  e.respondWith(
    fetch(e.request.mode === "navigate" || url.origin !== location.origin ? e.request : new Request(e.request, { cache: "no-cache" }))
      .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html")))
  );
});
