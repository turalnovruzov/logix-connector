// Firebase Realtime Database caching implementation

var FIREBASE_REALTIME_DB_BASE_URL = "-default-rtdb.firebaseio.com";
var FIREBASE_REALTIME_DB_COLLECTION = "/cache";
var CACHE_EXPIRATION_HOURS = 1; // Cache expiration in hours

// Script properties for storing service account credentials
var SERVICE_ACCOUNT_CREDS = "SERVICE_ACCOUNT_CREDS";
var SERVICE_ACCOUNT_KEY = "private_key";
var SERVICE_ACCOUNT_EMAIL = "client_email";
var BILLING_PROJECT_ID = "project_id";

var scriptProperties = PropertiesService.getScriptProperties();

/**
 * Returns the URL for a file in a firebase database.
 * @param {string} key The cache key
 * @returns {string} The url for the file in the database
 */
function buildFirebaseUrl(key) {
  var serviceAccountCreds = getServiceAccountCreds();
  var projectId = serviceAccountCreds[BILLING_PROJECT_ID];

  if (key) {
    key = "/" + key;
  }
  var urlElements = [
    "https://",
    projectId,
    FIREBASE_REALTIME_DB_BASE_URL,
    FIREBASE_REALTIME_DB_COLLECTION,
    key,
    ".json",
  ];
  var url = urlElements.join("");
  return url;
}

/**
 * Retrieves service account credentials from script properties
 * @returns {Object} Service account credentials object
 */
function getServiceAccountCreds() {
  return JSON.parse(scriptProperties.getProperty(SERVICE_ACCOUNT_CREDS));
}

/**
 * Creates an OAuth2 service for Firebase
 * @returns {Object} OAuth2 service
 */
function getOauthService() {
  var serviceAccountCreds = getServiceAccountCreds();
  var serviceAccountKey = serviceAccountCreds[SERVICE_ACCOUNT_KEY];
  var serviceAccountEmail = serviceAccountCreds[SERVICE_ACCOUNT_EMAIL];

  return OAuth2.createService("FirebaseCache")
    .setAuthorizationBaseUrl("https://accounts.google.com/o/oauth2/auth")
    .setTokenUrl("https://accounts.google.com/o/oauth2/token")
    .setPrivateKey(serviceAccountKey)
    .setIssuer(serviceAccountEmail)
    .setPropertyStore(scriptProperties)
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
function firebaseCache(method, url, data) {
  var oAuthToken = getOauthService().getAccessToken();

  var responseOptions = {
    headers: {
      Authorization: "Bearer " + oAuthToken,
    },
    method: method,
    contentType: "application/json",
  };

  // Add payload for put method
  if (method === "put") {
    responseOptions["payload"] = JSON.stringify(data);
  }

  var response = UrlFetchApp.fetch(url, responseOptions);

  // Return value only for `get`
  if (method === "get") {
    var responseObject = JSON.parse(response);
    if (responseObject === null) {
      return null;
    } else {
      return responseObject;
    }
  }
}

/**
 * Gets data from cache
 * @param {string} url Firebase URL
 * @returns {Object|null} Cached data or null if not found
 */
function getFromCache(url) {
  return firebaseCache("get", url);
}

/**
 * Deletes data from cache
 * @param {string} url Firebase URL
 */
function deleteFromCache(url) {
  return firebaseCache("delete", url);
}

/**
 * Puts data in cache
 * @param {string} url Firebase URL
 * @param {Object} data Data to cache
 */
function putInCache(url, data) {
  return firebaseCache("put", url, data);
}

/**
 * Checks if cache is expired (older than CACHE_EXPIRATION_HOURS)
 * @param {number} timestamp Cache timestamp
 * @returns {boolean} True if cache is expired
 */
function isCacheExpired(timestamp) {
  var now = new Date().getTime();
  var expirationMs = CACHE_EXPIRATION_HOURS * 60 * 60 * 1000;
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
  var sortedFields = requestedFields.slice().sort().join(",");
  return `${districtId}_${sortedFields}`;
}
