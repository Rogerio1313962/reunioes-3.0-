/* Reuniões 3.0 — modo offline para publicação HTTPS (GitHub Pages).
   Não armazena senhas nem endpoints do PC. */
const VERSION='reunioes3-offline-v11-20261121';
const ASSETS=['./','./index.html','./reunioes-app.js','./reunioes-telao.js','./style.css','./logo.png','./manifest.webmanifest','./Biblia_ACF.json','./Biblia_ARA.json'];
self.addEventListener('install',evt=>{evt.waitUntil((async()=>{const cache=await caches.open(VERSION);await cache.addAll(ASSETS);await self.skipWaiting()})())});
self.addEventListener('activate',evt=>{evt.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('reunioes3-offline-')&&key!==VERSION)await caches.delete(key);await self.clients.claim()})())});
self.addEventListener('fetch',evt=>{
 const req=evt.request;if(req.method!=='GET'||new URL(req.url).pathname.includes('/api/'))return;
 evt.respondWith((async()=>{const cache=await caches.open(VERSION);try{const res=await fetch(req);if(res.ok&&new URL(req.url).origin===self.location.origin)cache.put(req,res.clone());return res}catch(e){const old=await cache.match(req,{ignoreSearch:true});if(old)return old;if(req.mode==='navigate'){const page=await cache.match('./index.html');if(page)return page}throw e}})());
});
