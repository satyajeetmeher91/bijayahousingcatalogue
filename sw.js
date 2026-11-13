// Lets a HOSTED copy of the app open without internet. Put this file in the same folder as index.htm.
// (Not needed when the app is an APK with the files inside it.)
const V = 'stock-check-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k !== V) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const h = new URL(r.url).hostname;
  if (h === 'script.google.com' || h.endsWith('googleusercontent.com') || h === 'drive.google.com') return;   // data and photos are handled by the app itself
  e.respondWith(fetch(r).then(res => {
    if (res.ok || res.type === 'opaque') { const c = res.clone(); caches.open(V).then(ch => ch.put(r, c)); }
    return res;
  }).catch(async () => (await caches.match(r)) || (r.mode === 'navigate' ? ((await caches.match('./index.htm')) || (await caches.match('./'))) : Response.error())));
});
