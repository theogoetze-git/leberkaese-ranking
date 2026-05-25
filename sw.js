// Leberkäse Ranking – Service Worker
const CACHE = 'lk-v1';
const ASSETS = ['./', './index.html', './icon.svg', './manifest.json', './photos.json', './forum.json'];

// Installation: Assets cachen für Offline-Nutzung
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

// Netzwerk-first, Fallback auf Cache
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Freitags-Alarm: wird vom App-Code per postMessage getriggert
self.addEventListener('message', e => {
  if (e.data?.type === 'FRIDAY_REMINDER') {
    self.registration.showNotification('🧱 Hoaßa Ziegel-Alarm!', {
      body: 'Es ist Freitag – die Fleischereien warten. Zeit für den Leistungskäse!',
      icon: './icon.svg',
      badge: './icon.svg',
      tag: 'friday-reminder',
      renotify: true,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'open', title: '🗺️ Zur App' },
        { action: 'dismiss', title: 'Später' }
      ]
    });
  }
});

// Klick auf Notification öffnet die App
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes('leberkaese'));
      if (existing) return existing.focus();
      return clients.openWindow('./');
    })
  );
});

// Täglicher Check via Background Sync (wo unterstützt)
self.addEventListener('periodicsync', e => {
  if (e.tag === 'friday-check') {
    e.waitUntil(checkAndNotify());
  }
});

async function checkAndNotify() {
  const now = new Date();
  if (now.getDay() !== 5) return; // nur Freitag
  const hour = now.getHours();
  if (hour < 11 || hour > 13) return;
  await self.registration.showNotification('🧱 Hoaßa Ziegel-Alarm!', {
    body: 'Es ist Freitag – die Fleischereien warten. Zeit für den Leistungskäse!',
    icon: './icon.svg',
    badge: './icon.svg',
    tag: 'friday-reminder',
  });
}
