/**
 * Configuration module for caching providers
 */

// Script properties keys
const CACHE_PROVIDER_KEY = "CACHE_PROVIDER";
const PROXY_BASE_URL_KEY = "PROXY_BASE_URL";

// Default values
const DEFAULT_CACHE_PROVIDER = "firebase";

/**
 * Gets the name of the current cache provider
 * @returns {string} Cache provider name ('firebase' or 'proxy')
 */
function getCacheProviderName() {
  const providerName =
    PropertiesService.getScriptProperties().getProperty(CACHE_PROVIDER_KEY);
  return providerName || DEFAULT_CACHE_PROVIDER;
}

/**
 * Sets the cache provider to use
 * NOTE: This is an internal utility function.
 * Not meant for direct execution from the Apps Script UI since it requires parameters.
 * Use useFirebaseCacheProvider() or useProxyCacheProvider() functions in setup.js instead.
 *
 * @param {string} name Provider name ('firebase' or 'proxy')
 * @returns {boolean} Success flag
 */
function setCacheProviderName(name) {
  if (name !== "firebase" && name !== "proxy") {
    Logger.log(
      `Invalid cache provider name: ${name}. Must be 'firebase' or 'proxy'`
    );
    return false;
  }

  PropertiesService.getScriptProperties().setProperty(CACHE_PROVIDER_KEY, name);
  Logger.log(`Cache provider set to: ${name}`);
  return true;
}

/**
 * Gets the base URL for the proxy cache provider
 * @returns {string|null} Proxy base URL or null if not set
 */
function getProxyBaseUrl() {
  return PropertiesService.getScriptProperties().getProperty(
    PROXY_BASE_URL_KEY
  );
}

/**
 * Sets the base URL for the proxy cache provider
 * NOTE: This is an internal utility function.
 * Not meant for direct execution from the Apps Script UI since it requires parameters.
 * Use configureProxyUrl() function in setup.js instead.
 *
 * @param {string} url Proxy base URL (e.g., 'https://your-proxy.example.com')
 * @returns {boolean} Success flag
 */
function setProxyBaseUrl(url) {
  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    Logger.log(`Invalid proxy base URL: ${url}`);
    return false;
  }

  // Remove trailing slash if present
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }

  PropertiesService.getScriptProperties().setProperty(PROXY_BASE_URL_KEY, url);
  Logger.log(`Proxy base URL set to: ${url}`);
  return true;
}
