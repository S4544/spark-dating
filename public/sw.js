const CACHE_NAME = "spark-v2";
const STATIC = ["/", "/index.html", "/manifest.json", "/offline.html"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || e.request.url.includes("/api/")) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(cached => {
        if (cached) return cached;
        if (e.request.mode === "navigate") return caches.match("/offline.html");
        return undefined;
      }))
  );
});

self.addEventListener("push", e => {
  const d = e.data?.json() || {};
  e.waitUntil(self.registration.showNotification(d.title || "Spark 🔥", {
    body: d.body || "You have a new notification!",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-96.png",
    vibrate: [200, 100, 200],
    data: { url: d.url || "/" }
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data?.url || "/"));
});
