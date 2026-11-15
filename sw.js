/* PAKISTAN FF GUILD - service worker (offline support). Bump V to force an update. */
const V = "pff-v5";
const CORE = ["./", "index.html", "manifest.json",
  "icon-192.png", "icon-512.png", "icon-180.png", "icon-maskable-512.png"];
const OPTIONAL = ["ahmad ff.jpg", "introvert ff.jpg", "hammad ff.jpg", "onefire ff.jpg"]
  .concat(["moon-ff", "astrovert-ff", "itachi-ff", "white-ff", "ghost-ff", "kpkyasirff", "legend-ff", "hk-gamer-f", "saad-rehman", "a-dna", "anas-ff", "last-hope-ff", "x9-bra9d", "the-1st-hope", "zain-ff", "hisoka-ff", "ahmad-ff", "cradee-ff", "omnivert-ff", "hammad-ff", "x7-ego", "introvert-ff", "aziz-ff", "zalim-f", "konkhar-ff", "owii-brand", "dp-hasnan", "jerryff", "muzi-ff", "aftaj-jutt", "dictator-ff", "gangster-ff", "moderator-fi", "sbghat-ff", "blue-roxy", "speedy-ff", "shisuff", "strangerff", "toxic", "eclair", "onlyerrors", "rana-ff", "aurora", "rose-ff", "tw-flexy", "naruto", "kashif-ff", "7xs-onefirex", "nk-broken", "royal", "jano-gaim", "try-talha", "agent-ff"].concat(["ambivert-ff"]).map(s => s + ".jpg"))
  .map(encodeURI);

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await Promise.allSettled(CORE.concat(OPTIONAL).map(u => c.add(new Request(u, { cache: "reload" }))));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== V) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function swr(e) {
  const c = await caches.open(V);
  const hit = await c.match(e.request, { ignoreSearch: true });
  const net = fetch(e.request).then(r => {
    if (r && (r.ok || r.type === "opaque")) c.put(e.request, r.clone());
    return r;
  }).catch(() => null);
  e.waitUntil(net);
  return hit || (await net) || Response.error();
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const u = new URL(req.url);

  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const r = await fetch(req);
        const c = await caches.open(V);
        if (r.ok) c.put("index.html", r.clone());
        return r;
      } catch (_) {
        const c = await caches.open(V);
        return (await c.match("index.html")) || (await c.match("./")) || Response.error();
      }
    })());
    return;
  }

  if (u.origin === location.origin ||
      u.hostname === "fonts.googleapis.com" || u.hostname === "fonts.gstatic.com") {
    e.respondWith(swr(e));
  }
});
