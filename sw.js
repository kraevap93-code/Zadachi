const CACHE_NAME = 'zadachi-cache-v2'; // Изменили v1 на v2! Это заставит телефон обновить кэш
const urlsToCache = [
  './index.html',
  './logo4c.jpg',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  // Заставляем новый Service Worker активироваться сразу
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Кэш v2 открыт, новые ресурсы загружены');
        return cache.addAll(urlsToCache);
      })
  );
});

// Добавляем логику удаления старого кэша (v1)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Клик по уведомлению:', event.notification);
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});
