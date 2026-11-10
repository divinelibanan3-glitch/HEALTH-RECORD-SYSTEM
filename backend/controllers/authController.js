const db = require('../db');

const loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Default admin login credentials
    if (
      (cleanEmail === 'admin' ||
        cleanEmail === 'admin@example.test' ||
        cleanEmail === 'admin@plmun.edu.ph') &&
      password === 'admin123'
    ) {
      req.session.staff = {
        staff_id: 1,
        full_name: 'Administrator',
        email: cleanEmail,
        role: 'Admin'
      };

      return req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: 'Could not create session' });
        }
        return res.json({
          message: 'Login successful',
          staff: req.session.staff
        });
      });
    }

    return res.status(401).json({
      message: 'Invalid email or password'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      message: 'Internal server error'
    });
  }
};

const getCurrentStaff = (req, res) => {
  if (!req.session || !req.session.staff) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  return res.json({
    message: 'Authenticated',
    staff: req.session.staff
  });
};

const logoutStaff = (req, res) => {
  if (!req.session) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ message: 'Could not log out' });
    }

    res.clearCookie('plmun.sid', { path: '/' });
    return res.json({ message: 'Logout successful' });
  });
};

module.exports = { loginStaff, getCurrentStaff, logoutStaff };
