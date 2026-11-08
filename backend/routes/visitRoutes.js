const express = require('express');
const router = express.Router();

const {
  getPatientVisits,
  addPatientVisit
} = require('../controllers/visitController');

router.get('/:studentNumber/visits', getPatientVisits);
router.post('/:studentNumber/visits', addPatientVisit);

module.exports = router;
