const express = require('express');
const router = express.Router();

const {
  getPatientByStudentNumber,
  searchPatients,
  registerPatient
} = require('../controllers/patientController');

router.get('/', searchPatients);
router.post('/', registerPatient);
router.get('/:studentNumber', getPatientByStudentNumber);

module.exports = router;
