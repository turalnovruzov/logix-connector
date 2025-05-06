/**
 * Caching adapter that delegates to the configured cache provider
 */

// Cache provider constants
const CACHE_PROVIDERS = {
  FIREBASE: "firebase",
  PROXY: "proxy",
};

// Cache expiration setting in hours (used by all providers)
const CACHE_EXPIRATION_HOURS = 1;

// Script property for caching enabled flag
const CACHING_ENABLED = "CACHING_ENABLED";

/**
 * Gets the appropriate cache provider based on configuration
 * @returns {Object} Cache provider implementation
 */
function getCacheProvider() {
  const providerName = getCacheProviderName();

  switch (providerName) {
    case CACHE_PROVIDERS.FIREBASE:
      return firebaseCache;
    case CACHE_PROVIDERS.PROXY:
      return proxyCache;
    default:
      Logger.log(
        `Unknown cache provider: ${providerName}, falling back to Firebase`
      );
      return firebaseCache;
  }
}

/**
 * Checks if caching is enabled
 * @returns {boolean} True if caching is enabled
 */
function isCachingEnabled() {
  const cachingEnabled =
    PropertiesService.getScriptProperties().getProperty(CACHING_ENABLED);
  // Default to disabled if not set
  return cachingEnabled === "true";
}

/**
 * Sets the caching enabled/disabled state
 * @param {boolean} enabled Whether caching should be enabled
 */
function setCachingEnabled(enabled) {
  PropertiesService.getScriptProperties().setProperty(
    CACHING_ENABLED,
    enabled.toString()
  );
  Logger.log("Caching " + (enabled ? "enabled" : "disabled"));
  return enabled;
}

/**
 * Gets data from cache using the configured provider
 * @param {string} key Cache key
 * @returns {Object|null} Cached data or null if not found
 */
function getFromCache(key) {
  // Skip if caching is disabled
  if (!isCachingEnabled()) {
    Logger.log("Cache read skipped - caching disabled");
    return null;
  }

  return getCacheProvider().get(key);
}

/**
 * Puts data in cache using the configured provider
 * @param {string} key Cache key
 * @param {Object} data Data to cache
 * @returns {boolean} Success flag
 */
function putInCache(key, data) {
  // Skip if caching is disabled
  if (!isCachingEnabled()) {
    Logger.log("Cache write skipped - caching disabled");
    return false;
  }

  return getCacheProvider().put(key, data);
}

/**
 * Deletes data from cache using the configured provider
 * @param {string} key Cache key
 * @returns {boolean} Success flag
 */
function deleteFromCache(key) {
  // Skip if caching is disabled
  if (!isCachingEnabled()) {
    Logger.log("Cache delete skipped - caching disabled");
    return false;
  }

  return getCacheProvider().delete(key);
}

/**
 * Checks if cache is expired (older than CACHE_EXPIRATION_HOURS)
 * @param {number} timestamp Cache timestamp
 * @returns {boolean} True if cache is expired
 */
function isCacheExpired(timestamp) {
  const now = new Date().getTime();
  const expirationMs = CACHE_EXPIRATION_HOURS * 60 * 60 * 1000;
  return now - timestamp > expirationMs;
}

/**
 * Generates a cache key from a district ID and requested fields
 * @param {string} districtId District ID
 * @param {Array} requestedFields Array of requested field IDs
 * @returns {string} Cache key
 */
function generateCacheKey(districtId, requestedFields) {
  // Sort fields to ensure consistent caching regardless of field order
  const sortedFields = requestedFields.slice().sort().join(",");
  return `${districtId}_${sortedFields}`;
}
