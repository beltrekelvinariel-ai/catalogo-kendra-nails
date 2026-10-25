/**
 * KENDRA NAILS — SERVICE WORKER (PWA)
 * Soporte offline, caché de recursos estáticos y carga ultra rápida en celulares
 */

const CACHE_NAME = 'kendra-nails-v4';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/config.js',
  './js/app.js',
  './data/designs.json',
  './assets/logo.svg',
  './assets/favicon.svg',
  './assets/images/crops/kendra_logo_circle.png',
  './assets/images/crops/kendra_logo_square.jpg',
  './assets/images/crops/baby_boomer_card.webp',
  './assets/images/crops/french_card.webp',
  './assets/images/crops/porcelanato_1_card.webp',
  './assets/images/crops/porcelanato_2_card.webp',
  './assets/images/crops/fullset_luxury_card.webp',
  './assets/images/crops/fullset_floral_card.webp',
  './assets/images/crops/cover_liso_card.webp',
  './assets/images/crops/acrilico_gel_card.webp',
  './assets/images/crops/pies_gel_card.webp',
  './assets/images/crops/pies_acripies_card.webp',
  './assets/images/crops/guia_largos_kendra.jpg'
];

// Instalación: Precargar assets críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Algunos recursos secundarios no se pudieron precachear:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activación: Limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de Fetch: Stale-While-Revalidate para datos y caché para estáticos
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Ignorar peticiones que no sean GET o que sean de extensiones
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Para datos JSON o llamadas a Google Sheets: Network-First con fallback a caché
  if (url.pathname.endsWith('.json') || url.hostname.includes('google')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const respClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Para recursos estáticos (imágenes, CSS, JS): Cache-First con actualización de fondo
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // En segundo plano revalidar caché si hay red
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      });
    })
  );
});
