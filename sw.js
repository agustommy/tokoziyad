// 1. UBAH VERSI INI SETIAP KALI ADA PERUBAHAN TAMPILAN (misal: v3, v4, v5, dst)
const CACHE_NAME = 'kasir-cache-v10'; 

self.addEventListener('install', e => {
  self.skipWaiting(); // Langsung aktifkan service worker baru
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(['./']))
  );
});

// 2. HAPUS CACHE LAMA SAAT VERSI BARU AKTIF
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // Hapus kasir-cache-v2 atau versi sebelumnya
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
