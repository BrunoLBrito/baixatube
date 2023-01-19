const CACHE_NAME = 'v1'

const urlsToCache = ['/', 'index.html', 'style.css']

self.addEventListener('install', e => {
	console.log('install')
	e.waitUntil(
		caches.open(CACHE_NAME).then(cache => {
			console.log('cache opened')
			return cache.addAll(urlsToCache)
		})
	)
})

// self.addEventListener('fetch', e => {
// 	// console.log(`Intercepting fetch request for: `, e)
// 	e.respondWith(
// 		caches.match(e.request).then(response => {
// 			return response || fetch(e.request)
// 		})
// 	)
// })

self.addEventListener('activate', e => {
	e.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', e => {
	let request = e.request
	let url = new URL(request.url)

	if (url.origin === location.origin) {
		e.respondWith(networkFirst(request))
	} else {
		e.respondWith(cacheFirst(request))
	}
})

async function cacheFirst(request) {
	const cachedResponse = await caches.match(request)
	return cachedResponse || fetch(request)
}

async function networkFirst(request) {
	const dynamicCache = await caches.open(CACHE_NAME)
	try {
		const networkResponse = await fetch(request)
		dynamicCache.put(request, networkResponse.clone())
		return networkResponse
	} catch (err) {
		const cachedResponse = await dynamicCache.match(request)
		return cachedResponse || (await caches.match('./fallback.json'))
	}
}
