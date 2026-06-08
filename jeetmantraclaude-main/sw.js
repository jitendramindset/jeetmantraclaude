// JeetMantra service worker — minimal offline shell.
// Strategy: cache-first for static assets, network-first for /api.
const CACHE_NAME = 'jm-shell-v1';
const SHELL = [
  '/', '/dashboard.html', '/login.html', '/signup.html',
  '/marketplace.html', '/liveRoom.html',
  '/forgot-password.html', '/reset-password.html', '/verify-email.html',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(SHELL).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Skip cross-origin (Jitsi, Razorpay, KaTeX CDN).
  if (url.origin !== self.location.origin) return;
  // API: network-first; fall back to cache if offline.
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request).then(r => {
        // Stash GET responses for offline read.
        if (e.request.method === 'GET' && r.ok) {
          const clone = r.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone).catch(()=>{}));
        }
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // Static: cache-first.
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(r => {
      if (r.ok && e.request.method === 'GET') {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone).catch(()=>{}));
      }
      return r;
    }).catch(() => caches.match('/dashboard.html')))
  );
});
