const CACHE_NAME = 'zadachi-cache-v11'; // Повысили версию до v11 для новой кнопки автопереноса
const urlsToCache = [
  './index.html',
  './logo4c.jpg',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Кэш v11 открыт, загружаем ресурсы в обход старого кэша...');
        // Добавляем ?t=... к каждому URL, чтобы точно скачать новые файлы (пробитие кэша)
        return Promise.all(
          urlsToCache.map(url => {
            return fetch(url + '?t=' + new Date().getTime())
              .then(response => {
                if (!response.ok) throw new Error('Ошибка загрузки: ' + url);
                return cache.put(url, response);
              });
          })
        );
      })
  );
});

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
    }).then(() => self.clients.claim())
  );
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

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
