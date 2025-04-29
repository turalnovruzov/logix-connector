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
