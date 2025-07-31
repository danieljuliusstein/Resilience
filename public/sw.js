// Service Worker for Image Caching and Performance Optimization
const CACHE_NAME = 'resilience-images-v1';
const STATIC_CACHE = 'resilience-static-v1';
const IMAGE_CACHE = 'resilience-images-v1';

// Cache strategies
const CACHE_STRATEGIES = {
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first'
};

// Cache time limits (in milliseconds)
const CACHE_TIMES = {
  IMAGES: 7 * 24 * 60 * 60 * 1000, // 7 days
  STATIC: 30 * 24 * 60 * 60 * 1000, // 30 days
  API: 5 * 60 * 1000 // 5 minutes
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/src/index.css',
        '/src/main.tsx',
        // Add more static assets as needed
      ]);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== IMAGE_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else {
    event.respondWith(handleStaticRequest(request));
  }
});

// Image caching with stale-while-revalidate
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Check if cache is stale
    const cachedDate = cachedResponse.headers.get('sw-cached-date');
    if (cachedDate && Date.now() - parseInt(cachedDate) > CACHE_TIMES.IMAGES) {
      // Cache is stale, fetch new version in background
      fetchAndCache(request, cache);
    }
    return cachedResponse;
  }
  
  // Not in cache, fetch and cache
  return fetchAndCache(request, cache);
}

// API requests with network-first strategy
async function handleApiRequest(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      const responseToCache = response.clone();
      responseToCache.headers.set('sw-cached-date', Date.now().toString());
      cache.put(request, responseToCache);
    }
    
    return response;
  } catch (error) {
    // Network failed, try cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Static assets with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseToCache = response.clone();
      responseToCache.headers.set('sw-cached-date', Date.now().toString());
      cache.put(request, responseToCache);
    }
    return response;
  } catch (error) {
    // Return offline fallback for HTML pages
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/');
    }
    throw error;
  }
}

// Helper function to fetch and cache
async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const responseToCache = response.clone();
      responseToCache.headers.set('sw-cached-date', Date.now().toString());
      cache.put(request, responseToCache);
    }
    
    return response;
  } catch (error) {
    // Return offline image fallback
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#f3f4f6"/><text x="200" y="150" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="16">Image not available</text></svg>',
      {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}

// Performance monitoring
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    getCacheInfo().then((info) => {
      event.ports[0].postMessage(info);
    });
  }
});

// Get cache statistics
async function getCacheInfo() {
  const cacheNames = await caches.keys();
  const info = {};
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    info[cacheName] = {
      size: keys.length,
      urls: keys.map(request => request.url)
    };
  }
  
  return info;
}