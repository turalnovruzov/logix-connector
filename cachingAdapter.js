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
 * Gets all cache keys and their values from the current provider
 * @returns {Object|null} Object with keys as properties or null if error/disabled
 */
function getAllCacheKeys() {
  // Skip if caching is disabled
  if (!isCachingEnabled()) {
    Logger.log("Cache keys fetch skipped - caching disabled");
    return null;
  }

  return getCacheProvider().getKeys();
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

/**
 * Refreshes all cached data in Firebase to ensure users always get fast responses.
 * Intended to be run on a time-based trigger every 30 minutes.
 * @return {Object} Results of the refresh operation
 */
function refreshAllCaches() {
  const startTime = new Date();
  Logger.log("Starting cache refresh operation");

  // First check if caching is enabled
  if (!isCachingEnabled()) {
    Logger.log("Cache refresh skipped - caching is disabled");
    return {
      success: true,
      refreshed: 0,
      failed: 0,
      message: "Caching is disabled",
    };
  }

  // Get all cached data from the current provider
  const cacheData = getAllCacheKeys();

  if (!cacheData) {
    Logger.log("No cached data found to refresh");
    return {
      success: true,
      refreshed: 0,
      failed: 0,
      message: "No cached data found",
    };
  }

  let refreshedCount = 0;
  let failedCount = 0;
  const results = [];

  // Process each cache entry
  for (const key in cacheData) {
    try {
      Logger.log(`Processing cache key: ${key}`);

      // Extract district DB number from the beginning of the key
      // The cache key starts with the district DB number followed by an underscore
      const firstUnderscorePos = key.indexOf("_");
      if (firstUnderscorePos === -1) {
        Logger.log(`No district DB number found in key: ${key}`);
        failedCount++;
        continue;
      }

      const districtDbNumber = key.substring(0, firstUnderscorePos);

      // Extract field names by removing the district DB number and the first underscore
      const fieldsStr = key.substring(firstUnderscorePos + 1);
      const requestedFieldIds = fieldsStr.split(",");

      // Fetch fresh data from API directly using district DB number
      Logger.log(
        `Fetching fresh data for district DB ${districtDbNumber} with ${requestedFieldIds.length} fields`
      );
      const apiResponse = fetchFromLogixApi(
        requestedFieldIds,
        districtDbNumber
      );

      if (!apiResponse.success) {
        Logger.log(`API error for key ${key}: ${apiResponse.error}`);
        failedCount++;
        continue;
      }

      // Update cache with fresh data
      const cacheData = {
        data: apiResponse.data,
        timestamp: new Date().getTime(),
      };

      putInCache(key, cacheData);
      Logger.log(`Successfully refreshed cache for key: ${key}`);
      refreshedCount++;

      results.push({
        key: key,
        status: "success",
        rowCount: apiResponse.data.length,
      });

      // Add a small delay to avoid hitting API rate limits
      Utilities.sleep(500);
    } catch (error) {
      Logger.log(`Error refreshing cache for key ${key}: ${error.message}`);
      failedCount++;
      results.push({
        key: key,
        status: "failed",
        error: error.message,
      });
    }
  }

  const executionTime = (new Date() - startTime) / 1000;
  Logger.log(
    `Cache refresh completed in ${executionTime} seconds. Refreshed: ${refreshedCount}, Failed: ${failedCount}`
  );

  return {
    success: true,
    refreshed: refreshedCount,
    failed: failedCount,
    executionTime: executionTime,
    results: results,
  };
}
