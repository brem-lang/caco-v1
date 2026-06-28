const CACHE_NAME = "coffee-pos-v1";

const STATIC_ASSETS = [
  "/",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip cross-origin requests and Supabase API calls
  if (url.origin !== self.location.origin) return;

  // Network-first for API/auth routes
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first for static assets
  if (
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|eot)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) => cached ?? fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
      )
    );
    return;
  }

  // Stale-while-revalidate for Next.js static chunks
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const networkFetch = fetch(event.request).then((response) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          return response;
        });
        return cached ?? networkFetch;
      })
    );
    return;
  }

  // Network-first for everything else (pages)
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Coffee Shop POS", {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/favicon-32x32.png",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
