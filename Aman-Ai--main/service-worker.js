const CACHE_NAME = 'amandigitalcare-cache-v17'; // Incremented cache version

const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/Aman-Ai--main/assets/favicon.svg',
  '/Aman-Ai--main/locales/en.json', // Only cache the English source file
  'https://cdn.tailwindcss.com',
  // Key CDN imports from importmap
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0/',
  'https://aistudiocdn.com/react-router-dom@^7.9.4',
  'https://aistudiocdn.com/@google/genai@^1.25.0',
  // App Icons
  '/Aman-Ai--main/assets/icons/icon-72x72.png',
  '/Aman-Ai--main/assets/icons/icon-96x96.png',
  '/Aman-Ai--main/assets/icons/icon-128x128.png',
  '/Aman-Ai--main/assets/icons/icon-144x144.png',
  '/Aman-Ai--main/assets/icons/icon-152x152.png',
  '/Aman-Ai--main/assets/icons/icon-180x180.png',
  '/Aman-Ai--main/assets/icons/icon-192x192.png',
  '/Aman-Ai--main/assets/icons/icon-512x512.png',
  '/Aman-Ai--main/assets/icons/icon-maskable-192x192.png',
  '/Aman-Ai--main/assets/icons/icon-maskable-512x512.png',
  // Splash Screens
  '/Aman-Ai--main/assets/splashscreens/iphone_13_pro_max.png',
  '/Aman-Ai--main/assets/splashscreens/iphone_13_pro.png',
  '/Aman-Ai--main/assets/splashscreens/iphone_x.png',
  '/Aman-Ai--main/assets/splashscreens/iphone_8_plus.png',
  '/Aman-Ai--main/assets/splashscreens/iphone_8.png',
  '/Aman-Ai--main/assets/splashscreens/ipad_pro_12.9.png',
  '/Aman-Ai--main/assets/splashscreens/ipad_pro_10.5.png',
  '/Aman-Ai--main/assets/splashscreens/ipad_air.png',
  '/Aman-Ai--main/assets/splashscreens/ipad_mini.png',
];

// Install a service worker
self.addEventListener('install', event => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
    // We only want to cache GET requests.
    if (event.request.method !== 'GET') {
        return;
    }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network, then cache it
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if(!networkResponse || (networkResponse.status !== 200 && networkResponse.status !== 0) || networkResponse.type === 'error') {
              return networkResponse;
            }
            
            // Clone the response because it's a stream and can only be consumed once
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(() => {
            // Fallback for failed fetches, e.g., for navigation requests.
            if (event.request.mode === 'navigate') {
                return caches.match('/index.html');
            }
        });
      }
    )
  );
});


// Update a service worker and remove old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      ).then(() => {
        // Claim clients to ensure the new service worker controls the page.
        return self.clients.claim();
      }).then(() => {
        // After claiming, notify clients that a new version is available.
        self.clients.matchAll().then(clients => {
          clients.forEach(client => client.postMessage({ type: 'APP_UPDATED' }));
        });
      })
    })
  );
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
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-96x96.png'
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
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});