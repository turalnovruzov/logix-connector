/**
 * Proxy API cache provider implementation
 */

/**
 * Gets the base URL for the proxy with error checking
 * @returns {string} Base URL for the proxy
 * @throws {Error} If proxy base URL is not configured
 */
function getValidProxyBaseUrl() {
  const baseUrl = getProxyBaseUrl();
  if (!baseUrl) {
    throw new Error(
      "Proxy base URL not configured. Please run setProxyBaseUrl() first."
    );
  }
  return baseUrl;
}

/**
 * Proxy cache provider implementation
 */
const proxyCache = {
  /**
   * Gets data from proxy cache
   * @param {string} key Cache key
   * @returns {Object|null} Cached data or null if not found
   */
  get: function (key) {
    try {
      Logger.log(`[Proxy] Getting data for key: ${key}`);
      const baseUrl = getValidProxyBaseUrl();
      const url = `${baseUrl}/api/cache/${encodeURIComponent(key)}`;

      const response = UrlFetchApp.fetch(url, {
        method: "get",
        muteHttpExceptions: true,
      });

      if (response.getResponseCode() === 404) {
        Logger.log(`[Proxy] No data found for key: ${key}`);
        return null;
      }

      if (response.getResponseCode() !== 200) {
        Logger.log(
          `[Proxy] API error: ${response.getResponseCode()} - ${response.getContentText()}`
        );
        return null;
      }

      // Parse the response - depending on the content type
      const contentText = response.getContentText();
      try {
        return JSON.parse(contentText);
      } catch (e) {
        // If not JSON, return as is (plain text)
        return contentText;
      }
    } catch (error) {
      Logger.log(`[Proxy] Error getting data: ${error}`);
      return null;
    }
  },

  /**
   * Gets all cache keys from the proxy
   * @returns {Object|null} Object with keys as properties or null if error
   */
  getKeys: function () {
    try {
      Logger.log("[Proxy] Fetching all cache keys");
      const baseUrl = getValidProxyBaseUrl();
      const url = `${baseUrl}/api/cache/keys`;

      const response = UrlFetchApp.fetch(url, {
        method: "get",
        muteHttpExceptions: true,
      });

      if (response.getResponseCode() !== 200) {
        Logger.log(
          `[Proxy] API error when fetching keys: ${response.getResponseCode()} - ${response.getContentText()}`
        );
        return null;
      }

      // Parse keys from the response
      const keys = JSON.parse(response.getContentText());

      // Convert array of keys to object like Firebase returns
      // This helps maintain compatibility with existing code
      const keysObject = {};

      // Fetch the actual data for each key
      for (const key of keys) {
        const data = this.get(key);
        if (data) {
          keysObject[key] = data;
        }
      }

      return keysObject;
    } catch (error) {
      Logger.log(`[Proxy] Error fetching all keys: ${error}`);
      return null;
    }
  },

  /**
   * Puts data in proxy cache
   * @param {string} key Cache key
   * @param {Object} data Data to cache
   * @returns {boolean} Success flag
   */
  put: function (key, data) {
    try {
      Logger.log(`[Proxy] Storing data for key: ${key}`);
      const baseUrl = getValidProxyBaseUrl();
      const url = `${baseUrl}/api/cache/${encodeURIComponent(key)}`;

      // Convert data to JSON string if it's an object
      const payload = typeof data === "object" ? JSON.stringify(data) : data;

      const response = UrlFetchApp.fetch(url, {
        method: "put",
        contentType: "application/json",
        payload: payload,
        muteHttpExceptions: true,
      });

      if (response.getResponseCode() !== 200) {
        Logger.log(
          `[Proxy] API error during put: ${response.getResponseCode()} - ${response.getContentText()}`
        );
        return false;
      }

      return true;
    } catch (error) {
      Logger.log(`[Proxy] Error storing data: ${error}`);
      return false;
    }
  },

  /**
   * Deletes data from proxy cache
   * @param {string} key Cache key
   * @returns {boolean} Success flag
   */
  delete: function (key) {
    try {
      Logger.log(`[Proxy] Deleting data for key: ${key}`);
      const baseUrl = getValidProxyBaseUrl();
      const url = `${baseUrl}/api/cache/${encodeURIComponent(key)}`;

      const response = UrlFetchApp.fetch(url, {
        method: "delete",
        muteHttpExceptions: true,
      });

      if (response.getResponseCode() !== 200) {
        Logger.log(
          `[Proxy] API error during delete: ${response.getResponseCode()} - ${response.getContentText()}`
        );
        return false;
      }

      return true;
    } catch (error) {
      Logger.log(`[Proxy] Error deleting data: ${error}`);
      return false;
    }
  },
};
