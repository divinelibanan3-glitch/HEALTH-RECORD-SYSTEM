const databaseDisabled = (res) => res.status(503).json({
  message: 'Patient data is unavailable because the database connection is disabled'
});

const getPatientByStudentNumber = (req, res) => databaseDisabled(res);
const searchPatients = (req, res) => databaseDisabled(res);
const registerPatient = (req, res) => databaseDisabled(res);

module.exports = {
  getPatientByStudentNumber,
  searchPatients,
  registerPatient
};
