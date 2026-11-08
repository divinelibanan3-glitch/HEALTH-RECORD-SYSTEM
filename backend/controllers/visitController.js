const databaseDisabled = (res) => res.status(503).json({
  message: 'Visit data is unavailable because the database connection is disabled'
});

const getPatientVisits = (req, res) => databaseDisabled(res);
const addPatientVisit = (req, res) => databaseDisabled(res);

module.exports = { getPatientVisits, addPatientVisit };
