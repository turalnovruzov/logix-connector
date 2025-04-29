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
 * Returns the schema for the given request.
 * @param {Object} request Schema request parameters.
 * @return {Object} Schema for the given request.
 */
function getSchema(request) {
  var cc = DataStudioApp.createCommunityConnector();
  return cc.newGetSchemaResponse().setFields(getFields()).build();
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
    logPerformance(
      startTime,
      null,
      `Execution completed with error: ${apiResponse.error}`
    );

    return {
      schema: requestedFields.build(),
      rows: [],
    };
  }

  // Process the API data for Looker Studio
  const rows = processApiData(apiResponse.data, requestedFieldIds);

  // Log performance metrics
  logPerformance(startTime, rows);

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
