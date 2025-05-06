/**
 * Firebase Realtime Database cache provider implementation
 */

// Firebase Realtime Database configuration
const FIREBASE_REALTIME_DB_BASE_URL = "-default-rtdb.firebaseio.com";
const FIREBASE_REALTIME_DB_COLLECTION = "/cache";

// Script properties for storing service account credentials
const FIREBASE_SERVICE_ACCOUNT_CREDS = "SERVICE_ACCOUNT_CREDS";
const FIREBASE_SERVICE_ACCOUNT_KEY = "private_key";
const FIREBASE_SERVICE_ACCOUNT_EMAIL = "client_email";
const FIREBASE_BILLING_PROJECT_ID = "project_id";

/**
 * Returns the URL for a file in a firebase database.
 * @param {string} key The cache key
 * @returns {string} The url for the file in the database
 */
function buildFirebaseUrl(key) {
  const serviceAccountCreds = getFirebaseServiceAccountCreds();
  const projectId = serviceAccountCreds[FIREBASE_BILLING_PROJECT_ID];

  if (key) {
    key = "/" + key;
  }
  const urlElements = [
    "https://",
    projectId,
    FIREBASE_REALTIME_DB_BASE_URL,
    FIREBASE_REALTIME_DB_COLLECTION,
    key,
    ".json",
  ];
  const url = urlElements.join("");
  return url;
}

/**
 * Retrieves service account credentials from script properties
 * @returns {Object} Service account credentials object
 */
function getFirebaseServiceAccountCreds() {
  return JSON.parse(
    PropertiesService.getScriptProperties().getProperty(
      FIREBASE_SERVICE_ACCOUNT_CREDS
    )
  );
}

/**
 * Creates an OAuth2 service for Firebase
 * @returns {Object} OAuth2 service
 */
function getFirebaseOauthService() {
  const serviceAccountCreds = getFirebaseServiceAccountCreds();
  const serviceAccountKey = serviceAccountCreds[FIREBASE_SERVICE_ACCOUNT_KEY];
  const serviceAccountEmail =
    serviceAccountCreds[FIREBASE_SERVICE_ACCOUNT_EMAIL];

  return OAuth2.createService("FirebaseCache")
    .setAuthorizationBaseUrl("https://accounts.google.com/o/oauth2/auth")
    .setTokenUrl("https://accounts.google.com/o/oauth2/token")
    .setPrivateKey(serviceAccountKey)
    .setIssuer(serviceAccountEmail)
    .setPropertyStore(PropertiesService.getScriptProperties())
    .setCache(CacheService.getScriptCache())
    .setScope([
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/firebase.database",
    ]);
}

/**
 * Generic method for handling the Firebase Realtime Database REST API.
 * @param {string} method Method for the REST API: `get`, `put`, or `delete`
 * @param {string} url REST endpoint
 * @param {string} [data] Data to be stored for `put` method
 * @returns {undefined|object} Returns data from the REST endpoint for `get` method
 */
function firebaseRestApi(method, url, data) {
  const oAuthToken = getFirebaseOauthService().getAccessToken();

  const responseOptions = {
    headers: {
      Authorization: "Bearer " + oAuthToken,
    },
    method: method,
    contentType: "application/json",
    muteHttpExceptions: true,
  };

  // Add payload for put method
  if (method === "put") {
    responseOptions["payload"] = JSON.stringify(data);
  }

  const response = UrlFetchApp.fetch(url, responseOptions);

  // Return value only for `get`
  if (method === "get") {
    if (response.getResponseCode() !== 200) {
      Logger.log(
        `Firebase API error: ${response.getResponseCode()} - ${response.getContentText()}`
      );
      return null;
    }

    const responseObject = JSON.parse(response.getContentText());
    if (responseObject === null) {
      return null;
    } else {
      return responseObject;
    }
  }

  return response.getResponseCode() === 200;
}

/**
 * Firebase cache provider implementation
 */
const firebaseCache = {
  /**
   * Gets data from Firebase cache
   * @param {string} key Cache key
   * @returns {Object|null} Cached data or null if not found
   */
  get: function (key) {
    Logger.log(`[Firebase] Getting data for key: ${key}`);
    const url = buildFirebaseUrl(key);
    return firebaseRestApi("get", url);
  },

  /**
   * Gets all cache keys from Firebase
   * @returns {Object|null} Object with keys as properties or null if error
   */
  getKeys: function () {
    Logger.log("[Firebase] Fetching all cache keys");
    // For Firebase, getting all keys is the same as getting with an empty key
    return this.get("");
  },

  /**
   * Puts data in Firebase cache
   * @param {string} key Cache key
   * @param {Object} data Data to cache
   * @returns {boolean} Success flag
   */
  put: function (key, data) {
    Logger.log(`[Firebase] Storing data for key: ${key}`);
    const url = buildFirebaseUrl(key);
    return firebaseRestApi("put", url, data);
  },

  /**
   * Deletes data from Firebase cache
   * @param {string} key Cache key
   * @returns {boolean} Success flag
   */
  delete: function (key) {
    Logger.log(`[Firebase] Deleting data for key: ${key}`);
    const url = buildFirebaseUrl(key);
    return firebaseRestApi("delete", url);
  },
};
