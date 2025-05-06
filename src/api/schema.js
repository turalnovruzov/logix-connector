/**
 * Function to create fields for Looker Studio
 * @param {String} districtDbNumber District database number for fetching dynamic schema
 * @return {Object} Fields object with all available fields
 */
function getFields(districtDbNumber) {
  var cc = DataStudioApp.createCommunityConnector();
  const fields = cc.getFields();

  // Add static fields
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

  // Add dynamic fields based on element types
  // If districtDbNumber is provided, fetch element types from API
  if (districtDbNumber) {
    const elementTypes = fetchElementTypes(districtDbNumber);
    Logger.log("Fetched element types: " + JSON.stringify(elementTypes));

    // Create a dimension for each element type
    elementTypes.forEach(function (elementType) {
      // Convert to lowercase and add _name suffix
      const fieldId = elementType.toLowerCase() + "_name";
      const fieldName =
        elementType.charAt(0) + elementType.slice(1).toLowerCase() + " Name";

      fields
        .newDimension()
        .setId(fieldId)
        .setName(fieldName)
        .setDescription(fieldName)
        .setType(cc.FieldType.TEXT);
    });
  } else {
    // Fallback to hardcoded fields if no district is provided
    // For backward compatibility
    fields
      .newDimension()
      .setId("fund_name")
      .setName("Fund Name")
      .setDescription("Fund Name")
      .setType(cc.FieldType.TEXT);

    fields
      .newDimension()
      .setId("type_name")
      .setName("Type Name")
      .setDescription("Type Name")
      .setType(cc.FieldType.TEXT);

    fields
      .newDimension()
      .setId("function_name")
      .setName("Function Name")
      .setDescription("Function Name")
      .setType(cc.FieldType.TEXT);

    fields
      .newDimension()
      .setId("object_name")
      .setName("Object Name")
      .setDescription("Object Name")
      .setType(cc.FieldType.TEXT);

    fields
      .newDimension()
      .setId("program_name")
      .setName("Program Name")
      .setDescription("Program Name")
      .setType(cc.FieldType.TEXT);

    fields
      .newDimension()
      .setId("source_name")
      .setName("Source Name")
      .setDescription("Source Name")
      .setType(cc.FieldType.TEXT);

    fields
      .newDimension()
      .setId("location_name")
      .setName("Location Name")
      .setDescription("Location Name")
      .setType(cc.FieldType.TEXT);
  }

  // New calculated fields
  fields
    .newDimension()
    .setId("kind_")
    .setName("Kind")
    .setDescription("Budget or Actual extracted from Year Kind")
    .setType(cc.FieldType.TEXT)
    .setFormula('REGEXP_EXTRACT($year_kind, "(Budget|Actual)")');

  fields
    .newDimension()
    .setId("year")
    .setName("Year")
    .setDescription("Fiscal year extracted from Year Kind")
    .setType(cc.FieldType.TEXT)
    .setFormula('REGEXP_EXTRACT($year_kind, "^(FY[0-9]{2})")');

  return fields;
}
