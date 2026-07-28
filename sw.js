const CACHE_NAME = 'zadachi-cache-v1';
const urlsToCache = [
  './index.html',
  './logo4c.jpg',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Кэш открыт, ресурсы загружены');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Если файл есть в кэше — возвращаем его, иначе делаем запрос в сеть
        return response || fetch(event.request);
      })
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Клик по уведомлению:', event.notification);
  
  // Закрываем системное уведомление после клика
  event.notification.close();

  // Фокусируемся на открытой вкладке с приложением или открываем новую
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