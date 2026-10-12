// Scope-specific caches keep other GitHub Pages projects untouched.
export function workerSource(version: string, shell: string[]): string {
  return `
const PREFIX = 'flink-ab-shell::' + new URL(self.registration.scope).pathname + '::';
const CACHE = PREFIX + ${JSON.stringify(version)};
const SHELL = ${JSON.stringify(shell)};
self.addEventListener('install', event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL))));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('message', event => { if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put('index.html', copy))); }
      return response;
    }).catch(() => caches.open(CACHE).then(cache => cache.match('index.html', {ignoreVary:true}))));
  } else if (/\\.(js|css|woff2|png|svg|jpg)$/.test(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(async cache => {
      // Static public files are identical for every Origin; local preview adds Vary: Origin.
      const cached = await cache.match(event.request, {ignoreVary:true});
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok && response.type === 'basic') await cache.put(event.request, response.clone());
      return response;
    }));
  }
});
`;
}
