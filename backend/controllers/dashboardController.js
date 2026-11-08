const getDashboard = (req, res) => res.status(503).json({
  message: 'Dashboard data is unavailable because the database connection is disabled'
});

module.exports = { getDashboard };
