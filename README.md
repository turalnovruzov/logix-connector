# Logix Connector for Looker Studio

A custom Looker Studio connector that fetches data from Logix API with Firebase Realtime Database caching.

## Features

- Connect to Logix Commerce Budget data
- Select different districts
- Caches API responses in Firebase Realtime Database for 1 hour
- Improved performance by reducing API calls

## Configuration

### Firebase Setup

1. Create a Firebase Realtime Database in your Google Cloud Project
2. Create a service account with Firebase Admin role
3. Download the service account JSON credentials file
4. Deploy the code to Google Apps Script
5. Run the `storeServiceAccountCredentials` function with the JSON content from the service account file

```javascript
// Example: Run this in the Apps Script editor
storeServiceAccountCredentials('{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}');
```

6. Test the Firebase connection by running the `testFirebaseConnection` function

### Cache Configuration

The default cache expiration is set to 1 hour. You can modify this by changing the `CACHE_EXPIRATION_HOURS` variable in `firebase.js`.

## Development

This project uses Google Apps Script for development with local JavaScript files that are converted to `.gs` files when deployed to Google Cloud.

### Files

- `Code.js` - Main connector code
- `constants.js` - Constants for districts and configuration
- `schema.js` - Field definitions and schema
- `utils.js` - Utility functions for data processing
- `api.js` - Functions for fetching data from API
- `firebase.js` - Firebase caching implementation
- `setup.js` - Setup utilities for Firebase configuration

### Deploying Changes

Use the `clasp` CLI tool to push changes to Google Cloud:

```bash
clasp push
```

## Clearing Cache

To clear all cached data, run the `clearAllCachedData` function from the Apps Script editor.
