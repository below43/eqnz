const CACHE_VERSION = 1;
const STATIC_CACHE = `static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-v${CACHE_VERSION}`;
const STATIC_FILES = [
    '/',
    '/index.html',
    '/src/styles/main.css',
    '/src/index.js',
    '/src/config/config.js',
    '/src/api/postApi.js',
    '/src/components/PostRenderer.js',
    '/src/components/AuthorInfo.js',
    '/src/components/PostContent.js',
    '/src/utils/urlUtils.js',
    '/src/utils/textUtils.js',
	'/favicon.ico'
];

// Install and cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => cache.addAll(STATIC_FILES))
            .then(() => self.skipWaiting())
    );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name.startsWith('static-') || name.startsWith('dynamic-'))
                    .filter(name => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
                    .map(name => caches.delete(name))
            );
        })
    );
});

// Fetch strategy: Cache first for static, network first for API
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // API requests - Network first, cache fallback
    if (url.pathname.includes('bsky.app')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clonedRes = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => cache.put(event.request, clonedRes));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Static files - Cache first, network fallback
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                
                return fetch(event.request).then(response => {
                    if (!response || response.status !== 200) {
                        return response;
                    }
                    
                    const clonedRes = response.clone();
                    caches.open(DYNAMIC_CACHE)
                        .then(cache => cache.put(event.request, clonedRes));
                    return response;
                });
            })
    );
});