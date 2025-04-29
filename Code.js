/**
 * Object containing district data that can be reused throughout the connector.
 */
const DISTRICTS = {
  DEMO: {
    id: "demo",
    label: "Demo",
    db_number: "0000",
  },
  BELLWOOD: {
    id: "bellwood",
    label: "Bellwood",
    db_number: "0001",
  },
  PROVISO: {
    id: "proviso",
    label: "Proviso",
    db_number: "0002",
  },
};

/**
 * Returns the list of all districts.
 * @return {Array} Array of district objects.
 */
function getDistrictsList() {
  return Object.values(DISTRICTS);
}

/**
 * Returns the authentication method required by the connector.
 * @return {Object} AuthType configuration indicating no auth is required
 */
function getAuthType() {
  var cc = DataStudioApp.createCommunityConnector();
  return cc.newAuthTypeResponse().setAuthType(cc.AuthType.NONE).build();
}

/**
 * Required function for Looker Studio connectors
 */
function isAdminUser() {
  return false;
}

/**
 * Returns the user configurable options for the connector.
 * @param {Object} request Config request parameters.
 * @return {Object} Connector configuration to be displayed to the user.
 */
function getConfig(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config
    .newInfo()
    .setId("instructions")
    .setText("Select one district to include in your report.");

  const districtSelect = config
    .newSelectSingle()
    .setId("district")
    .setName("District")
    .setHelpText("Select the district you want to include");

  // Add all district options from our reusable list
  getDistrictsList().forEach(function (district) {
    districtSelect.addOption(
      config.newOptionBuilder().setLabel(district.label).setValue(district.id)
    );
  });

  return config.build();
}

/**
 * Function to create fields for Looker Studio
 * @return {Object} Fields object with all available fields
 */
function getFields() {
  var cc = DataStudioApp.createCommunityConnector();
  const fields = cc.getFields();

  fields
    .newDimension()
    .setId("idn")
    .setName("ID")
    .setDescription("ID of the data entry")
    .setType(cc.FieldType.TEXT);

  fields
    .newDimension()
    .setId("fk_budget_upload")
    .setName("Budget Upload ID")
    .setDescription("Foreign key to the Budget Upload")
    .setType(cc.FieldType.TEXT);

  fields
    .newDimension()
    .setId("num")
    .setName("NUM")
    .setDescription("Num is null")
    .setType(cc.FieldType.TEXT);

  fields
    .newDimension()
    .setId("account")
    .setName("Account")
    .setDescription("Account Number")
    .setType(cc.FieldType.TEXT);

  fields
    .newDimension()
    .setId("description")
    .setName("Description")
    .setDescription("Description of the account")
    .setType(cc.FieldType.TEXT);

  fields
    .newDimension()
    .setId("year_kind")
    .setName("Year Kind")
    .setDescription("Fiscal Year or Budget Type")
    .setType(cc.FieldType.TEXT);

  fields
    .newMetric()
    .setId("amount")
    .setName("Amount")
    .setDescription("Amount value")
    .setType(cc.FieldType.NUMBER);

  fields
    .newDimension()
    .setId("fund")
    .setName("Fund")
    .setDescription("Fund code")
    .setType(cc.FieldType.TEXT);

  fields
    .newDimension()
    .setId("type")
    .setName("Type")
    .setDescription("Type of the transaction")
    .setType(cc.FieldType.TEXT);

  fields
    .newDimension()
    .setId("function")
    .setName("Function")
    .setDescription("Function code")
    .setType(cc.FieldType.TEXT);

  fields
    .newDimension()
    .setId("object")
    .setName("Object")
    .setDescription("Object code")
    .setType(cc.FieldType.TEXT);

  fields
    .newDimension()
    .setId("program")
    .setName("Program")
    .setDescription("Program code")
    .setType(cc.FieldType.TEXT);

  fields
    .newDimension()
    .setId("source")
    .setName("Source")
    .setDescription("Source code")
    .setType(cc.FieldType.TEXT);

  fields
    .newDimension()
    .setId("location")
    .setName("Location")
    .setDescription("Location code")
    .setType(cc.FieldType.TEXT);

  fields
    .newDimension()
    .setId("fund_description")
    .setName("Fund Description")
    .setDescription("Description of the fund")
    .setType(cc.FieldType.TEXT);

  fields
    .newDimension()
    .setId("type_description")
    .setName("Type Description")
    .setDescription("Description of the type")
    .setType(cc.FieldType.TEXT);

  fields
    .newDimension()
    .setId("function_description")
    .setName("Function Description")
    .setDescription("Description of the function")
    .setType(cc.FieldType.TEXT);

  fields
    .newDimension()
    .setId("object_description")
    .setName("Object Description")
    .setDescription("Description of the object")
    .setType(cc.FieldType.TEXT);

  fields
    .newDimension()
    .setId("program_description")
    .setName("Program Description")
    .setDescription("Description of the program")
    .setType(cc.FieldType.TEXT);

  fields
    .newDimension()
    .setId("source_description")
    .setName("Source Description")
    .setDescription("Description of the source")
    .setType(cc.FieldType.TEXT);

  fields
    .newDimension()
    .setId("location_description")
    .setName("Location Description")
    .setDescription("Description of the location")
    .setType(cc.FieldType.TEXT);

  // New calculated fields
  fields
    .newDimension()
    .setId("function_name")
    .setName("Function Name")
    .setDescription("Concatenated function code and description")
    .setType(cc.FieldType.TEXT)
    .setFormula('CONCAT($function, " - ", $function_description)');

  fields
    .newDimension()
    .setId("fund_name")
    .setName("Fund Name")
    .setDescription("Concatenated fund code and description")
    .setType(cc.FieldType.TEXT)
    .setFormula('CONCAT($fund, " - ", $fund_description)');

  fields
    .newDimension()
    .setId("kind")
    .setName("Kind")
    .setDescription("Budget or Actual extracted from Year Kind")
    .setType(cc.FieldType.TEXT)
    .setFormula('REGEXP_EXTRACT($year_kind, "(Budget|Actual)$")');

  fields
    .newDimension()
    .setId("location_name")
    .setName("Location Name")
    .setDescription("Concatenated location code and description")
    .setType(cc.FieldType.TEXT)
    .setFormula('CONCAT($location, " - ", $location_description)');

  fields
    .newDimension()
    .setId("program_name")
    .setName("Program Name")
    .setDescription("Concatenated program code and description")
    .setType(cc.FieldType.TEXT)
    .setFormula('CONCAT($program, " - ", $program_description)');

  fields
    .newDimension()
    .setId("year")
    .setName("Year")
    .setDescription("Fiscal year extracted from Year Kind")
    .setType(cc.FieldType.TEXT)
    .setFormula('REGEXP_EXTRACT($year_kind, "^(FY[0-9]{2})")');

  return fields;
}

/**
 * Returns the schema for the given request.
 * @param {Object} request Schema request parameters.
 * @return {Object} Schema for the given request.
 */
function getSchema(request) {
  var cc = DataStudioApp.createCommunityConnector();
  return cc.newGetSchemaResponse().setFields(getFields()).build();
}

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

  const query = `Select ${columns} From sch_budget_report_view`;

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
 * Fetches data from the Logix API
 * @param {Array} requestedFieldIds Array of field IDs to request
 * @param {String} districtDbNumber District database number for API URL
 * @return {Object} Object containing success status and data or error message
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
 * Processes raw API data into the format expected by Looker Studio
 * @param {Array} rawData Array of data objects from the API
 * @param {Array} requestedFieldIds Array of field IDs that were requested
 * @return {Array} Formatted data array for Looker Studio
 */
function processApiData(rawData, requestedFieldIds) {
  return rawData.map((row) => {
    const values = requestedFieldIds.map((fieldId) => {
      if (fieldId in row) {
        if (fieldId === "amount") {
          // Parse amount field as number, removing non-numeric characters
          return parseFloat(row[fieldId].replace(/[^0-9.-]+/g, ""));
        }
        return row[fieldId];
      }
      return "";
    });

    return { values };
  });
}

/**
 * Retrieves the district DB number based on the district ID
 * @param {String} selectedDistrictId District ID from config
 * @return {String} Database number for the district
 */
function getDistrictDbNumber(selectedDistrictId) {
  // Default to demo district
  let districtDbNumber = DISTRICTS.DEMO.db_number;

  // Find the selected district
  for (let key in DISTRICTS) {
    if (DISTRICTS[key].id === selectedDistrictId) {
      districtDbNumber = DISTRICTS[key].db_number;
      break;
    }
  }

  return districtDbNumber;
}

/**
 * Returns the tabular data for the given request.
 * @param {Object} request Data request parameters.
 * @return {Object} Contains the schema and data for the given request.
 */
function getData(request) {
  var cc = DataStudioApp.createCommunityConnector();
  Logger.log(
    "getData function called with request: " + JSON.stringify(request)
  );

  // Performance tracking - start time
  const startTime = new Date();

  // Get requested fields
  const requestedFieldIds = request.fields.map((field) => field.name);
  const requestedFields = getFields().forIds(requestedFieldIds);

  Logger.log("Requested Fields: " + JSON.stringify(requestedFieldIds));
  Logger.log(`Number of fields requested: ${requestedFieldIds.length}`);

  // Get district DB number
  const districtDbNumber = getDistrictDbNumber(request.configParams.district);
  Logger.log("Using district DB number: " + districtDbNumber);

  // Fetch data from the API
  const apiResponse = fetchFromLogixApi(requestedFieldIds, districtDbNumber);

  // Handle API errors
  if (!apiResponse.success) {
    Logger.log(`API error: ${apiResponse.error}`);

    // Log performance metrics
    const executionTime = (new Date() - startTime) / 1000;
    Logger.log(`Execution completed in ${executionTime} seconds with error`);

    return {
      schema: requestedFields.build(),
      rows: [],
    };
  }

  // Process the API data for Looker Studio
  const rows = processApiData(apiResponse.data, requestedFieldIds);

  // Log performance metrics
  const executionTime = (new Date() - startTime) / 1000;
  Logger.log(`Number of rows returned: ${rows.length}`);
  Logger.log(`Execution completed in ${executionTime} seconds`);

  // Only log the first row as sample data to avoid excessive logging
  if (rows.length > 0) {
    Logger.log("Sample data (first row):");
    Logger.log(JSON.stringify(rows[0]));
  }

  // Log memory usage if available
  if (typeof Utilities !== "undefined" && Utilities.getScriptTimeRemaining) {
    Logger.log(
      `Script time remaining: ${Math.round(
        Utilities.getScriptTimeRemaining()
      )} seconds`
    );
  }

  // Return the response with correctly formatted data
  return {
    schema: requestedFields.build(),
    rows: rows,
  };
}

/**
 * Function to test the connector's getData functionality
 */
function test() {
  // Mock request object similar to what Looker Studio would send
  const request = {
    configParams: {
      district: DISTRICTS.DEMO.id,
    },
    fields: [{ name: "account" }, { name: "amount" }, { name: "description" }],
  };

  Logger.log("Starting getData test...");

  // Just call getData - all logging now happens inside getData
  const response = getData(request);

  Logger.log("Test completed");
}
