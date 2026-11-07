
const express = require('express');
const router = express.Router();

const {
    getPatientByStudentNumber
} = require('../controllers/patientController');

router.get('/:studentNumber', getPatientByStudentNumber);

module.exports = router;

