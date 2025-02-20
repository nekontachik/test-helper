/// <reference lib="webworker" />
/// <reference lib="es2015" />

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin, Queue } from 'workbox-background-sync';

// Define types for service worker
declare let self: ServiceWorkerGlobalScope;
declare let __WB_MANIFEST: Array<{ url: string; revision: string | null }>;

// Create queues
const uploadQueue = new Queue('uploadQueue', {
  maxRetentionTime: 24 * 60
});

const testResultQueue = new Queue('testResultQueue', {
  maxRetentionTime: 24 * 60
});

// Precache static assets
precacheAndRoute(__WB_MANIFEST);

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

// Handle API requests
registerRoute(
  ({ url }) => url.pathname.startsWith('/api') && !url.pathname.includes('/uploads'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60,
      }),
    ],
  })
);

// Handle uploads
registerRoute(
  ({ url }) => url.pathname.includes('/uploads'),
  new NetworkOnly({
    plugins: [
      new BackgroundSyncPlugin('uploadQueue', {
        maxRetentionTime: 24 * 60,
        onSync: async ({ queue }) => {
          try {
            await queue.replayRequests();
          } catch (error) {
            console.error('Upload sync failed:', error);
          }
        }
      })
    ]
  })
);

// Handle test results
registerRoute(
  ({ url }) => url.pathname.includes('/test-runs') && url.pathname.includes('/results'),
  new NetworkOnly({
    plugins: [
      new BackgroundSyncPlugin('testResultQueue', {
        maxRetentionTime: 24 * 60,
        onSync: async ({ queue }) => {
          try {
            await queue.replayRequests();
          } catch (error) {
            console.error('Test result sync failed:', error);
          }
        }
      })
    ]
  })
);

// Listen for sync events
self.addEventListener('sync', (event) => {
  if (event.tag === 'uploadQueue') {
    event.waitUntil(uploadQueue.replayRequests());
  } else if (event.tag === 'testResultQueue') {
    event.waitUntil(testResultQueue.replayRequests());
  }
}); 