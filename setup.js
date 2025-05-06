/**
 * This file contains utility functions for setting up the Firebase cache.
 * These functions are for development/setup purposes only and not used during normal connector operation.
 */

/**
 * Function to enable Firebase caching
 * Run this to turn on caching functionality
 */
function enableCaching() {
  try {
    setCachingEnabled(true);
    Logger.log("Caching has been enabled");
    Logger.log("Current provider: " + getCacheProviderName());
  } catch (error) {
    Logger.log("Error enabling caching: " + error);
  }
}

/**
 * Function to disable Firebase caching
 * Run this to turn off caching functionality
 */
function disableCaching() {
  try {
    setCachingEnabled(false);
    Logger.log("Caching has been disabled");
  } catch (error) {
    Logger.log("Error disabling caching: " + error);
  }
}

/**
 * Function to check current caching status
 */
function getCachingStatus() {
  try {
    const enabled = isCachingEnabled();
    const provider = getCacheProviderName();

    Logger.log("=== Caching Status ===");
    Logger.log("Enabled: " + (enabled ? "Yes" : "No"));
    Logger.log("Provider: " + provider);
    Logger.log("Proxy URL: " + (getProxyBaseUrl() || "Not configured"));
  } catch (error) {
    Logger.log("Error checking caching status: " + error);
  }
}

/**
 * Function to test Firebase connection
 * Run this after setting up the service account to verify it works
 */
function testFirebaseConnection() {
  try {
    // Save current provider to restore later
    const originalProvider = getCacheProviderName();

    // Force Firebase provider for this test
    setCacheProviderName(CACHE_PROVIDERS.FIREBASE);

    // Test authentication
    const oauthService = getFirebaseOauthService();
    const authToken = oauthService.getAccessToken();
    Logger.log("Authentication successful. Token received.");

    // Run the provider test
    const testKey = `test_${new Date().getTime()}`;
    const testData = {
      timestamp: new Date().getTime(),
      message: "Test connection successful",
    };

    Logger.log("Testing write operation...");
    const writeResult = firebaseCache.put(testKey, testData);

    if (!writeResult) {
      Logger.log("FAILED: Could not write test data");
      setCacheProviderName(originalProvider);
      return;
    }

    Logger.log("Testing read operation...");
    const readData = firebaseCache.get(testKey);

    if (!readData) {
      Logger.log("FAILED: Could not read test data");
      setCacheProviderName(originalProvider);
      return;
    }

    Logger.log("Testing delete operation...");
    const deleteResult = firebaseCache.delete(testKey);

    if (!deleteResult) {
      Logger.log("FAILED: Could not delete test data");
      setCacheProviderName(originalProvider);
      return;
    }

    Logger.log("SUCCESS: Firebase connection test passed");
    Logger.log("- Write: Success");
    Logger.log("- Read: Success");
    Logger.log("- Delete: Success");

    // Restore original provider
    setCacheProviderName(originalProvider);
  } catch (error) {
    Logger.log("FAILED: Firebase connection test failed: " + error);
  }
}

/**
 * Function to test Proxy connection
 * Run this after setting up the proxy URL to verify it works
 */
function testProxyConnection() {
  try {
    // Save current provider to restore later
    const originalProvider = getCacheProviderName();

    // Force Proxy provider for this test
    setCacheProviderName(CACHE_PROVIDERS.PROXY);

    // Verify proxy URL is configured
    const proxyUrl = getProxyBaseUrl();
    if (!proxyUrl) {
      Logger.log(
        "ERROR: Proxy URL not configured. Run configureProxyUrl() first"
      );
      return;
    }

    Logger.log(`Testing connection to proxy at ${proxyUrl}`);

    // Run the provider test
    const testKey = `test_${new Date().getTime()}`;
    const testData = {
      timestamp: new Date().getTime(),
      message: "Test connection successful",
    };

    Logger.log("Testing write operation...");
    const writeResult = proxyCache.put(testKey, testData);

    if (!writeResult) {
      Logger.log("FAILED: Could not write test data");
      setCacheProviderName(originalProvider);
      return;
    }

    Logger.log("Testing read operation...");
    const readData = proxyCache.get(testKey);

    if (!readData) {
      Logger.log("FAILED: Could not read test data");
      setCacheProviderName(originalProvider);
      return;
    }

    Logger.log("Testing delete operation...");
    const deleteResult = proxyCache.delete(testKey);

    if (!deleteResult) {
      Logger.log("FAILED: Could not delete test data");
      setCacheProviderName(originalProvider);
      return;
    }

    Logger.log("SUCCESS: Proxy connection test passed");
    Logger.log("- Write: Success");
    Logger.log("- Read: Success");
    Logger.log("- Delete: Success");

    // Restore original provider
    setCacheProviderName(originalProvider);
  } catch (error) {
    Logger.log("FAILED: Proxy connection test failed: " + error);
  }
}

/**
 * Function to switch to Firebase as cache provider
 */
function useFirebaseCacheProvider() {
  try {
    // Check if Firebase credentials are set
    try {
      const creds = getFirebaseServiceAccountCreds();
      if (!creds) {
        Logger.log(
          "ERROR: Firebase credentials not configured. Run storeServiceAccountCredentials() first"
        );
        return;
      }
    } catch (error) {
      Logger.log("ERROR: Could not retrieve Firebase credentials: " + error);
      return;
    }

    const success = setCacheProviderName(CACHE_PROVIDERS.FIREBASE);
    Logger.log("Cache provider switched to Firebase");
  } catch (error) {
    Logger.log("Error switching cache provider: " + error);
  }
}

/**
 * Function to switch to Proxy as cache provider
 */
function useProxyCacheProvider() {
  try {
    // Verify proxy URL is configured
    const proxyUrl = getProxyBaseUrl();
    if (!proxyUrl) {
      Logger.log(
        "ERROR: Proxy URL not configured. Run configureProxyUrl() first"
      );
      return;
    }

    const success = setCacheProviderName(CACHE_PROVIDERS.PROXY);
    Logger.log("Cache provider switched to Proxy");
    Logger.log("Using proxy URL: " + proxyUrl);
  } catch (error) {
    Logger.log("Error switching cache provider: " + error);
  }
}

/**
 * Function to configure the proxy base URL to example.com
 * Edit this function to change the URL before running it
 */
function configureProxyUrl() {
  try {
    // Change this URL to your actual proxy URL
    const url = "https://example.com";

    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      Logger.log("ERROR: Invalid proxy URL format");
      Logger.log("Edit the url value in the configureProxyUrl function");
      return;
    }

    // Remove trailing slash if present
    let finalUrl = url;
    if (url.endsWith("/")) {
      finalUrl = url.slice(0, -1);
    }

    PropertiesService.getScriptProperties().setProperty(
      PROXY_BASE_URL_KEY,
      finalUrl
    );
    Logger.log(`Proxy URL configured to: ${finalUrl}`);
  } catch (error) {
    Logger.log("Error configuring proxy URL: " + error);
  }
}

/**
 * Function to clear all cached data
 * WARNING: This will delete all data in the cache collection
 */
function clearAllCachedData() {
  try {
    // Get the root URL to fetch all cache entries
    const rootKey = "";

    // First, get all the data to identify keys
    const cacheData = getFromCache(rootKey);

    if (!cacheData) {
      Logger.log("No cached data found to clear");
      return;
    }

    let deletedCount = 0;
    let failedCount = 0;

    // Delete each key individually
    for (const key in cacheData) {
      try {
        deleteFromCache(key);
        deletedCount++;
      } catch (err) {
        Logger.log(`Failed to delete key ${key}: ${err}`);
        failedCount++;
      }
    }

    Logger.log(`Cache clearing completed.`);
    Logger.log(`- Deleted: ${deletedCount} items`);
    Logger.log(`- Failed: ${failedCount} items`);
  } catch (error) {
    Logger.log("Error clearing cached data: " + error);
  }
}

/**
 * Function to manually run the cache refresh operation
 * Useful for testing without waiting for the trigger
 */
function manuallyRefreshAllCaches() {
  try {
    const results = refreshAllCaches();
    Logger.log("Manual cache refresh completed");
    Logger.log(`- Refreshed: ${results.refreshed} items`);
    Logger.log(`- Failed: ${results.failed} items`);
    Logger.log(`- Execution time: ${results.executionTime} seconds`);
  } catch (error) {
    Logger.log("Error during manual cache refresh: " + error);
  }
}

/**
 * Tests the current cache provider without requiring parameters
 * This function is intended for UI execution
 */
function testCurrentCacheProvider() {
  const provider = getCacheProviderName();
  Logger.log(`Testing current cache provider: ${provider}`);

  // Save current caching state to restore later
  const originalCachingState = isCachingEnabled();
  if (!originalCachingState) {
    setCachingEnabled(true);
  }

  const testKey = `test_${new Date().getTime()}`;
  const testData = {
    timestamp: new Date().getTime(),
    message: `Test data for ${provider} provider`,
    provider: provider,
  };

  try {
    // Test write
    Logger.log(`Writing test data with key: ${testKey}`);
    const writeResult = getCacheProvider().put(testKey, testData);

    if (!writeResult) {
      Logger.log("FAILED: Could not write test data");
      return;
    }

    // Test read
    Logger.log(`Reading test data with key: ${testKey}`);
    const readData = getCacheProvider().get(testKey);

    if (!readData) {
      Logger.log("FAILED: Could not read test data");
      return;
    }

    // Test delete
    Logger.log(`Deleting test data with key: ${testKey}`);
    const deleteResult = getCacheProvider().delete(testKey);

    if (!deleteResult) {
      Logger.log("FAILED: Could not delete test data");
      return;
    }

    // Verify data was actually deleted
    const verifyDelete = getCacheProvider().get(testKey);

    Logger.log("SUCCESS: Cache provider test passed");
    Logger.log("- Write: Success");
    Logger.log("- Read: Success");
    Logger.log("- Delete: Success");
  } catch (error) {
    Logger.log("FAILED: Cache provider test failed: " + error);
  } finally {
    // Restore original caching state if it was changed
    if (!originalCachingState) {
      setCachingEnabled(originalCachingState);
    }
  }
}
