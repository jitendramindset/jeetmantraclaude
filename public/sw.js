// Cache version: bump CACHE_NAME to evict old cached assets
// Current: jm-shell-v6 (bumped to fix stale app-shell.js issue)
// JeetMantra service worker.
// Strategy:
//   - HTML documents (navigations / *.html): NETWORK-FIRST, so a freshly
//     deployed page is always served and never goes stale. Falls back to
//     cache only when offline.
//   - /api/*: network-first (stash GET responses for offline read).
//   - Other static assets (css/js/img/fonts): cache-first for speed.
// Bump CACHE_NAME whenever shell assets change so the old cache is evicted.
const CACHE_NAME = 'jm-shell-v6';
const SHELL = [
  '/login.html', '/signup.html', '/manifest.json'
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

function isHtml(req, url) {
  return req.mode === 'navigate'
    || req.destination === 'document'
    || url.pathname.endsWith('.html')
    || url.pathname === '/';
}

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  // Skip cross-origin (Jitsi, Razorpay, KaTeX CDN) and non-GET.
  if (url.origin !== self.location.origin || req.method !== 'GET') return;

  // HTML pages: NETWORK-FIRST — always fetch the latest, cache as fallback.
  if (isHtml(req, url)) {
    e.respondWith(
      fetch(req).then(r => {
        const clone = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(req, clone).catch(()=>{}));
        return r;
      }).catch(() => caches.match(req).then(c => c || caches.match('/login.html')))
    );
    return;
  }

  // API + health: never cache — mutable data must always come from the network.
  // Offline reads are handled by the JMOffline localStorage layer (offline-sync.js).
  if (url.pathname.startsWith('/api/') || url.pathname === '/health') {
    e.respondWith(fetch(req));
    return;
  }

  // Other static assets: cache-first.
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(r => {
      if (r.ok) { const clone = r.clone(); caches.open(CACHE_NAME).then(c => c.put(req, clone).catch(()=>{})); }
      return r;
    })).catch(() => {
      // For non-HTML assets, fail silently
      return new Response('', { status: 404 });
    })
  );
});
