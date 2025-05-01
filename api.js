/**
 * Gets the API token from script properties
 * @return {String|null} API token or null if not found
 */
function getApiToken() {
  const apiToken =
    PropertiesService.getScriptProperties().getProperty("API_TOKEN");
  if (!apiToken) {
    Logger.log("API token not found in script properties");
    return null;
  }
  return apiToken;
}

/**
 * Creates the API request body for data fetching
 * @param {Array} requestedFieldIds Array of field IDs to request
 * @return {Object} Request body for the API
 */
function createApiRequestBody(requestedFieldIds) {
  const columns =
    requestedFieldIds.length > 0
      ? requestedFieldIds.map((field) => `[${field}]`).join(", ")
      : "[idn]";

  const query = `Select ${columns} From sch_budget_report_view_new`;

  return {
    Method: "GET",
    Query: [
      {
        Type: "server",
        Obj_query: query,
      },
    ],
  };
}

/**
 * Fetches data from the Logix API.
 * @param {Array} requestedFieldIds Array of field IDs that were requested
 * @param {String} districtDbNumber District database number
 * @return {Object} Object with success flag and data or error
 */
function fetchFromLogixApi(requestedFieldIds, districtDbNumber) {
  const apiToken = getApiToken();
  if (!apiToken) {
    return { success: false, error: "API token not available" };
  }

  const apiUrl = `https://api01.logixcommerce.com/usa-sch-${districtDbNumber}/db/post/request`;
  const requestBody = createApiRequestBody(requestedFieldIds);

  try {
    const response = UrlFetchApp.fetch(apiUrl, {
      method: "post",
      headers: {
        Authorization: apiToken,
        "Content-Type": "application/json",
      },
      payload: JSON.stringify(requestBody),
      muteHttpExceptions: true,
    });

    const jsonData = JSON.parse(response.getContentText());

    if (response.getResponseCode() !== 200) {
      return {
        success: false,
        error: `API returned status code ${response.getResponseCode()}`,
      };
    }

    if (
      jsonData.kind !== "Success" ||
      !jsonData.objects ||
      jsonData.objects.length === 0
    ) {
      return {
        success: false,
        error: "API response does not contain valid data",
      };
    }

    return {
      success: true,
      data: jsonData.objects[0].rows || [],
    };
  } catch (error) {
    return {
      success: false,
      error: "Error fetching data from API: " + error.message,
    };
  }
}

/**
 * Fetches element types from the Logix API.
 * @param {String} districtDbNumber District database number
 * @return {Array} Array of element type names or empty array on error
 */
function fetchElementTypes(districtDbNumber) {
  const apiToken = getApiToken();
  if (!apiToken) {
    Logger.log("API token not available for fetching element types");
    return [];
  }

  const apiUrl = `https://api01.logixcommerce.com/usa-sch-${districtDbNumber}/db/post/request`;
  const requestBody = {
    Method: "GET",
    Query: [
      {
        Type: "server",
        Obj_query: "Select name From dbo.sch_element_types",
      },
    ],
  };

  try {
    const response = UrlFetchApp.fetch(apiUrl, {
      method: "post",
      headers: {
        Authorization: apiToken,
        "Content-Type": "application/json",
      },
      payload: JSON.stringify(requestBody),
      muteHttpExceptions: true,
    });

    const jsonData = JSON.parse(response.getContentText());

    if (response.getResponseCode() !== 200 || jsonData.kind !== "Success") {
      Logger.log("API error when fetching element types");
      return [];
    }

    if (
      !jsonData.objects ||
      jsonData.objects.length === 0 ||
      !jsonData.objects[0].rows
    ) {
      Logger.log("No element types found in API response");
      return [];
    }

    // Extract just the names from the response
    return jsonData.objects[0].rows.map((row) => row.name);
  } catch (error) {
    Logger.log("Error fetching element types: " + error.message);
    return [];
  }
}

/**
 * Refreshes all cached data in Firebase to ensure users always get fast responses.
 * Intended to be run on a time-based trigger every 30 minutes.
 * @return {Object} Results of the refresh operation
 */
function refreshAllCaches() {
  const startTime = new Date();
  Logger.log("Starting cache refresh operation");

  // Get all cached data from Firebase
  const rootUrl = buildFirebaseUrl("");
  const cacheData = getFromCache(rootUrl);

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
      const cacheUrl = buildFirebaseUrl(key);
      const cacheData = {
        data: apiResponse.data,
        timestamp: new Date().getTime(),
      };

      putInCache(cacheUrl, cacheData);
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
