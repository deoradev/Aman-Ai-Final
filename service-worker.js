const CACHE_NAME = 'amandigitalcare-cache-v21'; // Incremented cache version

// Essential app shell files to be pre-cached.
// Other assets will be cached at runtime.
const URLS_TO_CACHE = [
  // With the new root scope, we can and should cache the main entry point.
  '/index.html', 
  '/Aman-Ai--main/manifest.json',
  '/Aman-Ai--main/assets/favicon.svg',
  '/Aman-Ai--main/locales/en.json',
  '/Aman-Ai--main/assets/icons/icon-192x192.png',
  '/Aman-Ai--main/assets/icons/icon-512x512.png'
];

// Install event: Pre-cache the app shell.
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(err => {
        console.error('[Service Worker] Pre-caching failed:', err);
      })
  );
});

// Activate event: Clean up old caches.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      ).then(() => {
        return self.clients.claim();
      }).then(() => {
        self.clients.matchAll().then(clients => {
          clients.forEach(client => client.postMessage({ type: 'APP_UPDATED' }));
        });
      });
    })
  );
});


// Fetch event: Implement robust caching strategies.
self.addEventListener('fetch', event => {
  const { request } = event;

  // Ignore non-GET requests (e.g., POST to APIs).
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignore requests for browser extensions.
  if (request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Strategy 1: Network First for Navigation
  // Ensures users always get the latest version of the app page.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // If fetch is successful, cache the response for offline use.
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // If network fails, serve the main index.html from cache.
          // This allows the React app to load and handle its own routing, including showing an offline page.
          // This now works because index.html is pre-cached.
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Strategy 2: Stale-While-Revalidate for assets (CSS, JS, Fonts, etc.)
  // Provides a fast response from cache while updating in the background.
  if (request.destination === 'script' || request.destination === 'style' || request.destination === 'font') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(request).then(cachedResponse => {
          const fetchPromise = fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(err => {
            console.warn(`[Service Worker] Fetch failed for ${request.url}`, err);
          });
          // Return cached response immediately if available, otherwise wait for network.
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }
  
  // Strategy 3: Cache First for Images and other static assets
  // Serves images from cache immediately if available. Good for performance.
  if (request.destination === 'image' || request.url.includes('/assets/')) {
     event.respondWith(
      caches.match(request)
        .then(response => {
          return response || fetch(request).then(networkResponse => {
            if (networkResponse.ok) {
                return caches.open(CACHE_NAME).then(cache => {
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
  
});


// --- PUSH NOTIFICATION LISTENERS ---
self.addEventListener('push', event => {
  let data = { title: 'New message', body: 'You have a new message from Aman Digital Care.' };
  try {
    if(event.data) {
        data = event.data.json();
    }
  } catch (e) {
    console.error('Push event data parsing error:', e);
  }

  const options = {
    body: data.body,
    icon: '/Aman-Ai--main/assets/icons/icon-192x192.png',
    badge: '/Aman-Ai--main/assets/icons/icon-96x96.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === self.registration.scope && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(self.registration.scope);
      }
    })
  );
});
