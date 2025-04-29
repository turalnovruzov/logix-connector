/**
 * Object containing district data that can be reused throughout the connector.
 */
const DISTRICTS = {
  DEMO: {
    id: 'demo',
    label: 'Demo',
    db_number: '0000'
  },
  BELLWOOD: {
    id: 'bellwood',
    label: 'Bellwood',
    db_number: '0001'
  },
  PROVISO: {
    id: 'proviso',
    label: 'Proviso',
    db_number: '0002'
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
    .setText('Select one district to include in your report.');
    
  const districtSelect = config.newSelectSingle()
    .setId('district')
    .setName('District')
    .setHelpText('Select the district you want to include');
  
  // Add all district options from our reusable list
  getDistrictsList().forEach(function(district) {
    districtSelect.addOption(
      config.newOptionBuilder()
        .setLabel(district.label)
        .setValue(district.id)
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

  fields.newDimension()
    .setId('idn')
    .setName('ID')
    .setDescription('ID of the data entry')
    .setType(cc.FieldType.TEXT);

  fields.newDimension()
    .setId('fk_budget_upload')
    .setName('Budget Upload ID')
    .setDescription('Foreign key to the Budget Upload')
    .setType(cc.FieldType.TEXT);

  fields.newDimension()
    .setId('num')
    .setName('NUM')
    .setDescription('Num is null')
    .setType(cc.FieldType.TEXT);    

  fields.newDimension()
    .setId('account')
    .setName('Account')
    .setDescription('Account Number')
    .setType(cc.FieldType.TEXT);

  fields.newDimension()
    .setId('description')
    .setName('Description')
    .setDescription('Description of the account')
    .setType(cc.FieldType.TEXT);

  fields.newDimension()
    .setId('year_kind')
    .setName('Year Kind')
    .setDescription('Fiscal Year or Budget Type')
    .setType(cc.FieldType.TEXT);

  fields.newMetric()
    .setId('amount')
    .setName('Amount')
    .setDescription('Amount value')
    .setType(cc.FieldType.NUMBER);

  fields.newDimension()
    .setId('fund')
    .setName('Fund')
    .setDescription('Fund code')
    .setType(cc.FieldType.TEXT);

  fields.newDimension()
    .setId('type')
    .setName('Type')
    .setDescription('Type of the transaction')
    .setType(cc.FieldType.TEXT);

  fields.newDimension()
    .setId('function')
    .setName('Function')
    .setDescription('Function code')
    .setType(cc.FieldType.TEXT);

  fields.newDimension()
    .setId('object')
    .setName('Object')
    .setDescription('Object code')
    .setType(cc.FieldType.TEXT);

  fields.newDimension()
    .setId('program')
    .setName('Program')
    .setDescription('Program code')
    .setType(cc.FieldType.TEXT);

  fields.newDimension()
    .setId('source')
    .setName('Source')
    .setDescription('Source code')
    .setType(cc.FieldType.TEXT);

  fields.newDimension()
    .setId('location')
    .setName('Location')
    .setDescription('Location code')
    .setType(cc.FieldType.TEXT);

  fields.newDimension()
    .setId('fund_description')
    .setName('Fund Description')
    .setDescription('Description of the fund')
    .setType(cc.FieldType.TEXT);

  fields.newDimension()
    .setId('type_description')
    .setName('Type Description')
    .setDescription('Description of the type')
    .setType(cc.FieldType.TEXT);

  fields.newDimension()
    .setId('function_description')
    .setName('Function Description')
    .setDescription('Description of the function')
    .setType(cc.FieldType.TEXT);

  fields.newDimension()
    .setId('object_description')
    .setName('Object Description')
    .setDescription('Description of the object')
    .setType(cc.FieldType.TEXT);

  fields.newDimension()
    .setId('program_description')
    .setName('Program Description')
    .setDescription('Description of the program')
    .setType(cc.FieldType.TEXT);

  fields.newDimension()
    .setId('source_description')
    .setName('Source Description')
    .setDescription('Description of the source')
    .setType(cc.FieldType.TEXT);

  fields.newDimension()
    .setId('location_description')
    .setName('Location Description')
    .setDescription('Description of the location')
    .setType(cc.FieldType.TEXT);

  return fields;
}

/**
 * Returns the schema for the given request.
 * @param {Object} request Schema request parameters.
 * @return {Object} Schema for the given request.
 */
function getSchema(request) {
  var cc = DataStudioApp.createCommunityConnector();
  return cc.newGetSchemaResponse()
    .setFields(getFields())
    .build();
}

/**
 * Function to fetch data from the API
 * @param {Array} requestedFieldIds Array of field IDs to request
 * @param {String} districtDbNumber District database number to use in API URL
 * @return {Array} Formatted data from API response
 */
function fetchAPIData(requestedFieldIds, districtDbNumber) {
  // Get API token from project properties
  const apiToken = PropertiesService.getScriptProperties().getProperty('API_TOKEN');
  if (!apiToken) {
    Logger.log('API token not found in script properties');
    return [];
  }
  
  // Build dynamic API URL based on district db_number
  const apiUrl = `https://api01.logixcommerce.com/usa-sch-${districtDbNumber}/db/post/request`;

  const columns = requestedFieldIds.length > 0 ? requestedFieldIds.map(field => `[${field}]`).join(", ") : '[idn]';
  
  // Query to fetch all rows from the budget report view
  const query = `Select ${columns} From sch_budget_report_view`;

  // Create the JSON body for the API request
  const requestBody = {
    "Method": "GET",
    "Query": [
      {
        "Type": "server",
        "Obj_query": query
      }
    ]
  };

  try {
    const response = UrlFetchApp.fetch(apiUrl, {
      'method': 'post',
      'headers': {
        'Authorization': apiToken,
        'Content-Type': 'application/json'
      },
      'payload': JSON.stringify(requestBody)
    });

    const jsonData = JSON.parse(response.getContentText());

    // Check if the response is successful and contains data
    if (jsonData.kind === "Success" && jsonData.objects && jsonData.objects.length > 0) {
      const dataObjects = jsonData.objects[0]; // Assuming you are interested in the first object
      const rows = dataObjects.rows;

      // Prepare the data for Looker Studio dynamically based on the fields requested
      const formattedData = rows.map(row => {
        const rowData = [];

        // Iterate over the requested fields and populate the row data accordingly
        requestedFieldIds.forEach(fieldId => {
          if (fieldId in row) {
            if (fieldId === 'amount') {
              rowData.push(parseFloat(row[fieldId].replace(/[^0-9.-]+/g, ""))); // Convert to float if amount
            } else {
              rowData.push(row[fieldId]);
            }
          } else {
            rowData.push(''); // Handle cases where the field might not exist in the data
          }
        });

        return rowData;
      });

      return formattedData;
    } else {
      Logger.log('API response does not contain valid data.');
      return [];
    }

  } catch (error) {
    Logger.log('Error fetching data from API: ' + error.message);
    return [];
  }
}

/**
 * Function to test the API connection
 */
function test() {
  const districtDbNumber = DISTRICTS.DEMO.db_number;
  const data = fetchAPIData(['account', 'idn'], districtDbNumber);
  Logger.log('Fetched Data: ' + JSON.stringify(data));
  if (data.length > 0) {
    Logger.log('First Row: ' + JSON.stringify(data[0]));
  }
}

/**
 * Returns the tabular data for the given request.
 * @param {Object} request Data request parameters.
 * @return {Object} Contains the schema and data for the given request.
 */
function getData(request) {
  var cc = DataStudioApp.createCommunityConnector();
  Logger.log('getData function called with request: ' + JSON.stringify(request));

  // Get selected district from config
  const selectedDistrictId = request.configParams.district;
  
  // Find the selected district object
  let districtDbNumber = DISTRICTS.DEMO.db_number; // Default to demo
  for (let key in DISTRICTS) {
    if (DISTRICTS[key].id === selectedDistrictId) {
      districtDbNumber = DISTRICTS[key].db_number;
      break;
    }
  }
  
  Logger.log('Using district DB number: ' + districtDbNumber);

  const requestedFieldIds = request.fields.map(field => field.name);
  const requestedFields = getFields().forIds(requestedFieldIds);

  Logger.log('Requested Fields: ' + JSON.stringify(requestedFieldIds));

  // Fetch data from the API with selected district
  const apiData = fetchAPIData(requestedFieldIds, districtDbNumber);
  if (!apiData || apiData.length === 0) {
    Logger.log('No data returned from API.');
    return cc.newGetDataResponse().setFields(requestedFields).setRows([]).build();
  }

  // Build the data rows
  const data = apiData.map(row => {
    const values = requestedFieldIds.map((fieldId, index) => {
      return row[index] || ''; // Use the correct index
    });

    return { values };
  });

  Logger.log('Data to be returned, first row: ' + JSON.stringify(data[0]));

  // Return the response with correctly formatted data
  return cc.newGetDataResponse()
    .setFields(requestedFields)
    .setRows(data)
    .build();
}
