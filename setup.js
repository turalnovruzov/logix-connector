/**
 * This file contains utility functions for setting up the Firebase cache.
 * These functions are for development/setup purposes only and not used during normal connector operation.
 */

/**
 * Function to store Firebase service account credentials in script properties.
 * Run this function once to set up Firebase authentication.
 *
 * @param {string} credentialsJson The JSON string of the service account credentials
 */
function storeServiceAccountCredentials(credentialsJson) {
  // Validate that the input is valid JSON
  try {
    const parsedJson = JSON.parse(credentialsJson);

    // Check that required fields exist
    if (
      !parsedJson.private_key ||
      !parsedJson.client_email ||
      !parsedJson.project_id
    ) {
      throw new Error("Missing required fields in service account credentials");
    }

    // Store the credentials in script properties
    PropertiesService.getScriptProperties().setProperty(
      SERVICE_ACCOUNT_CREDS,
      credentialsJson
    );

    Logger.log("Service account credentials stored successfully");
    return true;
  } catch (error) {
    Logger.log("Error storing service account credentials: " + error);
    return false;
  }
}

/**
 * Function to test Firebase connection
 * Run this after setting up the service account to verify it works
 */
function testFirebaseConnection() {
  try {
    // Test authentication
    const authToken = getOauthService().getAccessToken();
    Logger.log("Authentication successful. Token received.");

    // Test write to Firebase
    const testKey = "test_connection";
    const testUrl = buildFirebaseUrl(testKey);
    const testData = {
      timestamp: new Date().getTime(),
      message: "Test connection successful",
    };

    // Try to write data
    putInCache(testUrl, testData);
    Logger.log("Data write successful");

    // Try to read data back
    const readData = getFromCache(testUrl);
    Logger.log("Data read successful: " + JSON.stringify(readData));

    // Try to delete the test data
    deleteFromCache(testUrl);
    Logger.log("Data delete successful");

    return "Firebase connection test completed successfully";
  } catch (error) {
    Logger.log("Firebase connection test failed: " + error);
    return "Firebase connection test failed: " + error;
  }
}

/**
 * Function to clear all cached data
 * WARNING: This will delete all data in the cache collection
 */
function clearAllCachedData() {
  try {
    // Get the root URL to fetch all cache entries
    const rootUrl = buildFirebaseUrl("");

    // First, get all the data to identify keys
    const cacheData = getFromCache(rootUrl);

    if (!cacheData) {
      Logger.log("No cached data found to clear");
      return true;
    }

    let deletedCount = 0;
    let failedCount = 0;

    // Delete each key individually
    for (const key in cacheData) {
      try {
        const keyUrl = buildFirebaseUrl(key);
        deleteFromCache(keyUrl);
        deletedCount++;
      } catch (err) {
        Logger.log(`Failed to delete key ${key}: ${err}`);
        failedCount++;
      }
    }

    Logger.log(
      `Cache clearing completed. Deleted: ${deletedCount}, Failed: ${failedCount}`
    );
    return true;
  } catch (error) {
    Logger.log("Error clearing cached data: " + error);
    return false;
  }
}

/**
 * Function to manually run the cache refresh operation
 * Useful for testing without waiting for the trigger
 */
function manuallyRefreshAllCaches() {
  try {
    const results = refreshAllCaches();
    Logger.log(`Manual cache refresh completed: ${JSON.stringify(results)}`);
    return results;
  } catch (error) {
    Logger.log("Error during manual cache refresh: " + error);
    return {
      success: false,
      error: error.toString(),
    };
  }
}
