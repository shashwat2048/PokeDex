// Service Worker Registration Utility
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service Worker not supported in this browser');
    return null;
  }

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('[SW] Service Worker registered successfully:', registration.scope);

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000); // Check every hour

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('[SW] New Service Worker found, installing...');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[SW] New Service Worker installed, update available');
          
          // Notify user about update (optional)
          if (confirm('A new version of Pokédex Swift is available! Reload to update?')) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        }
      });
    });

    // Handle controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Service Worker controller changed');
    });

    return registration;
  } catch (error) {
    console.error('[SW] Service Worker registration failed:', error);
    return null;
  }
}

// Unregister service worker (useful for debugging)
export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const unregistered = await registration.unregister();
      console.log('[SW] Service Worker unregistered:', unregistered);
      return unregistered;
    }
    return false;
  } catch (error) {
    console.error('[SW] Failed to unregister Service Worker:', error);
    return false;
  }
}

// Clear all caches
export async function clearAllCaches() {
  if (!('caches' in window)) {
    console.log('[SW] Cache API not supported');
    return false;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('[SW] All caches cleared');
    return true;
  } catch (error) {
    console.error('[SW] Failed to clear caches:', error);
    return false;
  }
}

// Check if app is running as PWA
export function isPWA() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true ||
         document.referrer.includes('android-app://');
}

// Prompt user to install PWA
export function promptPWAInstall() {
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    console.log('[PWA] Install prompt available');
    
    // Show custom install button or prompt
    return deferredPrompt;
  });

  return deferredPrompt;
}

// Get cache statistics
export async function getCacheStats() {
  if (!('caches' in window)) {
    return null;
  }

  try {
    const cacheNames = await caches.keys();
    const stats = await Promise.all(
      cacheNames.map(async (cacheName) => {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        return {
          name: cacheName,
          size: keys.length
        };
      })
    );
    
    return {
      totalCaches: cacheNames.length,
      caches: stats,
      totalEntries: stats.reduce((sum, cache) => sum + cache.size, 0)
    };
  } catch (error) {
    console.error('[SW] Failed to get cache stats:', error);
    return null;
  }
}

