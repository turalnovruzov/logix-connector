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
      const url = `${baseUrl}/cache/${encodeURIComponent(key)}`;

      const response = UrlFetchApp.fetch(url, {
        method: "get",
        contentType: "application/json",
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

      return JSON.parse(response.getContentText());
    } catch (error) {
      Logger.log(`[Proxy] Error getting data: ${error}`);
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
      const url = `${baseUrl}/cache/${encodeURIComponent(key)}`;

      const response = UrlFetchApp.fetch(url, {
        method: "put",
        contentType: "application/json",
        payload: JSON.stringify(data),
        muteHttpExceptions: true,
      });

      if (
        response.getResponseCode() !== 200 &&
        response.getResponseCode() !== 201
      ) {
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
      const url = `${baseUrl}/cache/${encodeURIComponent(key)}`;

      const response = UrlFetchApp.fetch(url, {
        method: "delete",
        muteHttpExceptions: true,
      });

      if (
        response.getResponseCode() !== 200 &&
        response.getResponseCode() !== 204
      ) {
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
