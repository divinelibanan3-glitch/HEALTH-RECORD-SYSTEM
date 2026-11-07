
const express = require('express');
const router = express.Router();

const {
  loginStaff,
  getCurrentStaff,
  logoutStaff
} = require('../controllers/authController');

router.post('/login', loginStaff);
router.get('/me', getCurrentStaff);
router.post('/logout', logoutStaff);

module.exports = router;
