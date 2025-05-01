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
