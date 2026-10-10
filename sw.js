// Keeps Abide working with no network: serve the saved copy, refresh it when online.
// Bump together with APP_VERSION in index.html.
const CACHE = "abide-v8";
const FILES = ["./", "index.html", "kjv.json", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES))); self.skipWaiting(); });
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
    fetch(e.request)
      .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html")))
  );
});
