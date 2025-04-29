/**
 * Object containing district data that can be reused throughout the connector.
 */
const DISTRICTS = {
  DISTRICT1: {
    id: 'district1',
    label: 'District 1'
  },
  DISTRICT2: {
    id: 'district2',
    label: 'District 2'
  }
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
  return cc.newAuthTypeResponse()
    .setAuthType(cc.AuthType.NONE)
    .build();
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
  
  config.newInfo()
    .setId('instructions')
    .setText('Select one or more districts to include in your report.');
    
  const districtsSelect = config.newSelectMultiple()
    .setId('districts')
    .setName('Districts')
    .setHelpText('Select the districts you want to include');
  
  // Add all district options from our reusable list
  getDistrictsList().forEach(function(district) {
    districtsSelect.addOption(
      config.newOptionBuilder()
        .setLabel(district.label)
        .setValue(district.id)
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
  var fields = cc.getFields();
  var types = cc.FieldType;
  
  // Simple schema with district dimension and a single metric
  fields.newDimension()
    .setId('district')
    .setName('District')
    .setType(types.TEXT);
    
  fields.newMetric()
    .setId('value')
    .setName('Value')
    .setType(types.NUMBER);
  
  return cc.newGetSchemaResponse()
    .setSchema(fields.build())
    .build();
}

/**
 * Returns the tabular data for the given request.
 * @param {Object} request Data request parameters.
 * @return {Object} Contains the schema and data for the given request.
 */
function getData(request) {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  
  // Build schema from request
  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  var requestedFields = fields.forIds(requestedFieldIds);
  
  // Sample data - just one row per selected district
  var rows = [];
  var selectedDistricts = request.configParams.districts || [];
  
  if (!Array.isArray(selectedDistricts)) {
    selectedDistricts = [selectedDistricts];
  }
  
  // Generate simple data for each selected district
  selectedDistricts.forEach(function(districtId) {
    // Get district name
    var districtName = "";
    for (var key in DISTRICTS) {
      if (DISTRICTS[key].id === districtId) {
        districtName = DISTRICTS[key].label;
        break;
      }
    }
    
    // Add simple data
    rows.push({
      values: [districtName, 42]
    });
  });
  
  // If no districts selected, provide fallback data
  if (rows.length === 0) {
    rows.push({
      values: ["Sample District", 42]
    });
  }
  
  return cc.newGetDataResponse()
    .setSchema(requestedFields)
    .setRows(rows)
    .build();
}
