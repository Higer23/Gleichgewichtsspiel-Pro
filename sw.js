/**
 * sw.js — Service Worker
 * Das Gleichgewichtsspiel Pro Edition
 * Enables offline gameplay and asset caching.
 * Author: Higer
 */

const CACHE_NAME   = 'gleichgewicht-pro-v2';
const STATIC_CACHE = 'gleichgewicht-static-v2';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/gameLogic.js',
  '/js/ui.js',
  '/js/storage.js',
  '/js/i18n.js',
  '/js/audio.js',
  '/js/stats.js',
  '/manifest.json',
];

// External CDN URLs to cache on first fetch
const CDN_CACHE_PATTERNS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com',
  'cdn.tailwindcss.com',
];

// ─── Install ─────────────────────────────────────────────────
self.addEventListener('install', (e) => {
  console.log('[SW] Installing...', CACHE_NAME);
  e.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[SW] Pre-cache failed:', err))
  );
});

// ─── Activate ────────────────────────────────────────────────
self.addEventListener('activate', (e) => {
  console.log('[SW] Activating...', CACHE_NAME);
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== CACHE_NAME)
          .map((k) => { console.log('[SW] Deleting old cache:', k); return caches.delete(k); })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch Strategy ──────────────────────────────────────────
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Skip non-GET and chrome-extension requests
  if (e.request.method !== 'GET' || url.protocol === 'chrome-extension:') return;

  // CDN resources: Cache-first
  if (CDN_CACHE_PATTERNS.some((p) => url.hostname.includes(p))) {
    e.respondWith(
      caches.match(e.request).then((cached) =>
        cached ?? fetch(e.request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
          }
          return res;
        }).catch(() => cached)
      )
    );
    return;
  }

  // Local assets: Network-first (fallback to cache)
  if (url.origin === self.location.origin) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(e.request).then((cached) =>
            cached ?? caches.match('/index.html')
          )
        )
    );
  }
});
