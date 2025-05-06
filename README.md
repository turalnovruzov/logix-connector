# Logix Connector for Looker Studio

A Google Apps Script connector for Logix Commerce data in Looker Studio.

## Project Structure

- `Code.js` - Main connector implementation with Looker Studio required functions
- `api.js` - API communication with Logix Commerce
- `constants.js` - Constants and district configurations
- `schema.js` - Field definitions for the connector
- `utils.js` - Utility functions for data processing

## Caching Architecture

This connector implements a pluggable caching adapter that supports multiple cache backends:

### Cache Providers

1. **Firebase** - Default provider, uses Firebase Realtime Database
2. **Proxy** - Uses a custom HTTP proxy API for caching

### Files

- `cachingAdapter.js` - Core adapter that delegates to the configured provider
- `config.js` - Configuration for cache providers
- `firebaseCache.js` - Firebase Realtime Database provider implementation
- `proxyCache.js` - Custom proxy API provider implementation
- `firebase.js` - Legacy file maintained for backwards compatibility

### Usage

```javascript
// Get data from cache
const data = getFromCache(cacheKey);

// Store data in cache
putInCache(cacheKey, data);

// Delete data from cache
deleteFromCache(cacheKey);
```

### Configuration

```javascript
// Set cache provider
setCacheProviderName('firebase'); // or 'proxy'

// Configure proxy URL (if using proxy provider)
setProxyBaseUrl('https://your-proxy.example.com');

// Enable/disable caching
setCachingEnabled(true);

// Test providers
testCacheProvider('firebase');
testCacheProvider('proxy');
```

## Setup

1. Create a new Google Apps Script project
2. Install [clasp](https://github.com/google/clasp) CLI
3. Clone this repository
4. Run `clasp push` to upload files to Apps Script
5. Configure the connector in Looker Studio

### Firebase Setup

If using Firebase caching:

1. Create a Firebase project with Realtime Database
2. Generate a service account key
3. Run `storeServiceAccountCredentials(JSON.stringify(serviceAccountJson))` to store credentials
4. Run `enableCaching()` to enable caching
5. Test with `testFirebaseConnection()`

### Proxy Setup

If using a proxy API for caching:

1. Set up your custom caching API
2. Run `configureProxyUrl('https://your-proxy.example.com')`
3. Run `switchCacheProvider('proxy')`
4. Test with `testProxyConnection()`

## Development

- Run `test()` to test the connector
- Use `manuallyRefreshAllCaches()` to refresh the cache
- Use `getCachingStatus()` to check caching configuration
