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
        return row[fieldId];
      }
      return "";
    });

    return { values };
  });
}

/**
 * Logs performance metrics
 * @param {Date} startTime Start time for measurement
 * @param {Array} rows Data rows returned
 * @param {String} statusMessage Optional status message
 */
function logPerformance(startTime, rows, statusMessage = "") {
  const executionTime = (new Date() - startTime) / 1000;

  if (statusMessage) {
    Logger.log(statusMessage);
  }

  if (rows) {
    Logger.log(`Number of rows returned: ${rows.length}`);

    // Only log the first row as sample data to avoid excessive logging
    if (rows.length > 0) {
      Logger.log("Sample data (first row):");
      Logger.log(JSON.stringify(rows[0]));
    }
  }

  Logger.log(`Execution completed in ${executionTime} seconds`);

  // Log memory usage if available
  if (typeof Utilities !== "undefined" && Utilities.getScriptTimeRemaining) {
    Logger.log(
      `Script time remaining: ${Math.round(
        Utilities.getScriptTimeRemaining()
      )} seconds`
    );
  }
}
