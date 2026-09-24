// Gunakan satu nama statis, Anda tidak perlu lagi mengganti nomor versinya.
const CACHE_NAME = 'kasir-cache-otomatis'; 

self.addEventListener('install', e => {
  // Langsung aktifkan Service Worker baru tanpa menunggu
  self.skipWaiting(); 
  
  // Catatan: Kita hapus cache.addAll() di sini agar browser 
  // tidak secara tidak sengaja mengunci file versi lama dari HTTP Cache.
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          // Hapus semua cache versi lama Anda (kasir-cache-v16, v17, dll)
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); 
          }
        })
      );
    }).then(() => self.clients.claim()) // Langsung ambil alih kontrol halaman
  );
});

self.addEventListener('fetch', e => {
  // Service worker hanya perlu menyimpan cache untuk metode GET
  // Abaikan metode POST/PUT/DELETE agar transaksi kasir/API tidak error
  if (e.request.method !== 'GET') return;

  // STRATEGI: Network-First (Utamakan Jaringan, Cadangan Cache)
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Jika berhasil mengambil file/tampilan terbaru dari server:
        // 1. Gandakan response (karena response hanya bisa dibaca sekali)
        const resClone = res.clone();
        
        // 2. Simpan atau timpa file lama di cache dengan file terbaru ini
        caches.open(CACHE_NAME).then(cache => {
          cache.put(e.request, resClone);
        });
        
        // 3. Tampilkan versi terbaru ke pengguna
        return res;
      })
      .catch(() => {
        // Jika gagal (karena OFFLINE atau server mati):
        // Cari dan tampilkan file terakhir yang ada di dalam cache
        return caches.match(e.request).then(cachedResponse => {
          return cachedResponse;
        });
      })
  );
});
