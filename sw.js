// Čuva igru i slike znakova na uređaju da bi radila bez interneta.
const CACHE = "kviz-milioner-v1";
const SHELL = ["./", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png"];

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
});
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const save = r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; };
  const local = new URL(e.request.url).origin === location.origin;
  e.respondWith(local
    // fajlovi igre: prvo mreža (da stigne nova verzija), bez mreže iz keša
    ? fetch(e.request).then(save).catch(() => caches.match(e.request, { ignoreSearch: true }))
    // slike znakova: prvo keš, pa mreža
    : caches.match(e.request).then(hit => hit || fetch(e.request).then(save)));
});
