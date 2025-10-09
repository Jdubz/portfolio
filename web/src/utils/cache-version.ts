/**
 * Cache Version Utilities
 *
 * Handles cache versioning and invalidation for hard refreshes.
 */

export const CACHE_VERSION_KEY = 'app-cache-version';

/**
 * Get the current cache version from environment
 */
export function getCurrentCacheVersion(): string {
  return process.env.GATSBY_CACHE_VERSION || '0.0.0';
}

/**
 * Get the stored cache version from localStorage
 */
export function getStoredCacheVersion(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(CACHE_VERSION_KEY);
  } catch (error) {
    console.warn('Failed to read cache version from localStorage:', error);
    return null;
  }
}

/**
 * Store the current cache version in localStorage
 */
export function storeCacheVersion(version: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(CACHE_VERSION_KEY, version);
  } catch (error) {
    console.warn('Failed to store cache version in localStorage:', error);
  }
}

/**
 * Check if cache needs to be invalidated
 *
 * Returns true if:
 * - No stored version exists
 * - Stored version differs from current version
 * - Current version contains 'bust' (cache bust flag)
 */
export function shouldInvalidateCache(): boolean {
  const currentVersion = getCurrentCacheVersion();
  const storedVersion = getStoredCacheVersion();

  // No stored version - first visit or localStorage cleared
  if (!storedVersion) {
    return true;
  }

  // Version changed
  if (storedVersion !== currentVersion) {
    return true;
  }

  // Explicit cache bust
  if (currentVersion.includes('bust')) {
    return true;
  }

  return false;
}

/**
 * Invalidate all caches and perform hard refresh
 */
export async function invalidateAllCaches(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  console.log('🔄 Invalidating all caches...');

  try {
    // Clear service worker caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          console.log(`  Deleting cache: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
    }

    // Unregister service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => {
          console.log('  Unregistering service worker');
          return registration.unregister();
        })
      );
    }

    // Clear localStorage (except user preferences)
    const preserveKeys = ['theme', 'cookie-consent', 'analytics-consent'];
    const toRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !preserveKeys.includes(key)) {
        toRemove.push(key);
      }
    }

    toRemove.forEach(key => localStorage.removeItem(key));

    // Clear sessionStorage
    sessionStorage.clear();

    console.log('✅ Cache invalidation complete');
  } catch (error) {
    console.error('Failed to invalidate caches:', error);
  }
}

/**
 * Initialize cache version check on app load
 *
 * Call this in your root layout or gatsby-browser.js
 */
export async function initCacheVersionCheck(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const currentVersion = getCurrentCacheVersion();
  const storedVersion = getStoredCacheVersion();

  console.log(`📦 Cache version check:`, {
    current: currentVersion,
    stored: storedVersion,
  });

  if (shouldInvalidateCache()) {
    console.log('🔥 Cache version mismatch - invalidating caches');

    await invalidateAllCaches();

    // Store new version
    storeCacheVersion(currentVersion);

    // Show toast/notification to user (optional)
    if (storedVersion && storedVersion !== currentVersion) {
      console.log(`📢 App updated: ${storedVersion} → ${currentVersion}`);

      // You can dispatch a custom event here for a UI notification
      window.dispatchEvent(
        new CustomEvent('app-updated', {
          detail: { from: storedVersion, to: currentVersion },
        })
      );
    }
  } else {
    console.log('✅ Cache version up to date');
  }
}

/**
 * Force a hard refresh with cache invalidation
 */
export async function forceHardRefresh(): Promise<void> {
  await invalidateAllCaches();
  window.location.reload();
}
