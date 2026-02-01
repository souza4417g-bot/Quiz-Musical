
const CACHE_NAME = 'super-quiz-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptação de requisições (Estratégia: Stale-While-Revalidate)
// Tenta servir do cache rapidinho, mas busca a versão nova no fundo para a próxima vez
self.addEventListener('fetch', (event) => {
  // Não cacheia requisições de API do Deezer ou Google Scripts para garantir dados frescos
  if (event.request.url.includes('api.deezer.com') || event.request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        const fetchPromise = fetch(event.request).then(
          (networkResponse) => {
            // Verifica se a resposta é válida
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clona a resposta para salvar no cache
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        );

        // Retorna a versão em cache se existir, senão espera a rede
        return response || fetchPromise;
      })
  );
});
