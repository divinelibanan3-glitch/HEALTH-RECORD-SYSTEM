
const bcrypt = require('bcrypt');
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

    const [rows] = await db.query(
      `SELECT staff_id, full_name, email,
              password_hash, role, is_active
       FROM staff_users
       WHERE email = ?
       LIMIT 1`,
      [email.trim()]
    );

    const staff = rows[0];

    if (!staff || !staff.is_active) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      staff.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Create a new session after successful login
    req.session.regenerate((err) => {
      if (err) {
        console.error('Session error:', err);
        return res.status(500).json({
          message: 'Could not create login session'
        });
      }

      // Store staff information in the session
      req.session.staff = {
        staff_id: staff.staff_id,
        full_name: staff.full_name,
        email: staff.email,
        role: staff.role
      };

      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({
            message: 'Could not save login session'
          });
        }

        return res.json({
          message: 'Login successful',
          staff: req.session.staff
        });
      });
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
    return res.status(401).json({
      message: 'Not authenticated'
    });
  }

  return res.json({
    message: 'Authenticated',
    staff: req.session.staff
  });
};


const logoutStaff = (req, res) => {
  if (!req.session) {
    return res.status(401).json({
      message: 'Not authenticated'
    });
  }

  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        message: 'Could not log out'
      });
    }

    res.clearCookie('plmun.sid', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });

    return res.json({
      message: 'Logout successful'
    });
  });
};

module.exports = {
  loginStaff,
  getCurrentStaff,
  logoutStaff
};

