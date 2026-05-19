// ==========================================
// SERVICE WORKER FOR PAKISTAN FF GUILD PWA
// ==========================================

const CACHE_NAME = 'pff-guild-v2';
const OFFLINE_URL = '/com/offline.html';

// Files to cache (Core files)
const urlsToCache = [
  '/com/',
  '/com/index.html',
  '/com/manifest.json',
  '/com/icons/icon-72.png',
  '/com/icons/icon-96.png',
  '/com/icons/icon-128.png',
  '/com/icons/icon-144.png',
  '/com/icons/icon-152.png',
  '/com/icons/icon-192.png',
  '/com/icons/icon-384.png',
  '/com/icons/icon-512.png'
];

// Install event - Cache core files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching core files...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Skip waiting...');
        return self.skipWaiting();
      })
  );
});

// Activate event - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients...');
      return self.clients.claim();
    })
  );
});

// Fetch event - Serve from cache first, then network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Don't cache if not a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone the response
            const responseToCache = networkResponse.clone();
            
            // Cache the fetched resource
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch(() => {
            // If offline and request is for HTML page, show offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
            return new Response('You are offline!', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = {
    title: 'PAKISTAN FF GUILD',
    body: 'New update from your guild!',
    icon: '/com/icons/icon-192.png',
    badge: '/com/icons/icon-96.png',
    tag: 'guild-update',
    url: '/com/'
  };
  
  if (event.data) {
    try {
      data = JSON.parse(event.data.text());
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.badge,
      tag: data.tag,
      data: {
        url: data.url
      }
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/com/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event);
  if (event.tag === 'sync-applications') {
    event.waitUntil(syncApplications());
  }
});

// Function to sync applications
async function syncApplications() {
  console.log('[SW] Syncing applications...');
  // You can add background sync logic here
  return Promise.resolve();
}

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker loaded successfully!');