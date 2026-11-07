
const express = require('express');
const router = express.Router();

const {
    getPatientVisits,
    addPatientVisit
} = require('../controllers/visitController');

// Get visit history
router.get('/:studentNumber/visits', getPatientVisits);

// Record a new visit
router.post('/:studentNumber/visits', addPatientVisit);

module.exports = router;
