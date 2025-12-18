// Service Worker for Pokédex Swift
const CACHE_NAME = 'pokedex-swift-v1';
const RUNTIME_CACHE = 'pokedex-runtime-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/src/assets/pokeball.png',
  '/src/assets/pokeball2.png',
  '/src/assets/bgMusic.mp3',
  '/src/assets/theme_poke.mp3'
];

// PokeAPI URLs to cache
const POKEAPI_URL = 'https://pokeapi.co/api/v2/';
const POKEMON_SPRITES_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })))
        .catch(err => {
          console.warn('[SW] Failed to cache some static assets:', err);
          // Don't fail the install if some assets can't be cached
        });
    }).then(() => {
      console.log('[SW] Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service Worker activated successfully');
      return self.clients.claim();
    })
  );
});

// Fetch event - cache-first for Pokemon data, network-first for others
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle PokeAPI requests with cache-first strategy
  if (url.origin === 'https://pokeapi.co') {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Cache hit for:', url.pathname);
            // Return cached response but also fetch and update in background
            event.waitUntil(
              fetch(request)
                .then((networkResponse) => {
                  if (networkResponse && networkResponse.status === 200) {
                    cache.put(request, networkResponse.clone());
                  }
                  return networkResponse;
                })
                .catch(() => {
                  // Network failed, but we already returned cache
                })
            );
            return cachedResponse;
          }

          // Not in cache, fetch from network
          console.log('[SW] Fetching from network:', url.pathname);
          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((error) => {
            console.error('[SW] Fetch failed for:', url.pathname, error);
            throw error;
          });
        });
      })
    );
    return;
  }

  // Handle Pokemon sprites with cache-first strategy
  if (url.origin === 'https://raw.githubusercontent.com' && url.pathname.includes('PokeAPI/sprites')) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // For static assets, try cache first, then network
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          // Cache successful responses
          if (networkResponse && networkResponse.status === 200) {
            return caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, networkResponse.clone());
              return networkResponse;
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // For everything else, just fetch
  event.respondWith(fetch(request));
});

// Message event - handle cache clearing
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] Clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('[SW] All caches cleared');
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

// Push notification support (future feature)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New Pokemon discovered!',
    icon: '/src/assets/pokeball2.png',
    badge: '/src/assets/pokeball2.png',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification('Pokédex Swift', options)
  );
});

