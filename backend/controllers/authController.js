const databaseDisabled = (res) => res.status(503).json({
  message: 'Database connection is disabled'
});

const loginStaff = (req, res) => {
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

  return databaseDisabled(res);
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
