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
