// Service Worker A'ini Retail ERP
// Cakupan: cache shell PWA (index.html, manifest, icon) saja.
// Konten app (POS, dsb) tetap 100% diambil live dari Google Apps Script exec URL
// lewat iframe -> business logic GAS TIDAK disentuh/cache di sini.

const CACHE_NAME = "aini-erp-shell-v1";
const SHELL_FILES = [
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Hanya intercept request untuk file SHELL (same-origin, ada di daftar).
  // Request ke script.google.com / googleusercontent.com (isi app GAS di dalam iframe)
  // dibiarkan lewat langsung (network), tidak dicache -> data POS selalu real-time.
  const isShellRequest = url.origin === self.location.origin;

  if (!isShellRequest) return; // biarkan browser handle request iframe GAS apa adanya

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => caches.match("./index.html"));
    })
  );
});
