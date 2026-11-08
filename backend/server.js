
const express = require('express');
require('dotenv').config({
  path: require('path').join(__dirname, '../.env')
});
const path = require('path');
const patientRoutes = require('./routes/patientRoutes');
const visitRoutes = require('./routes/visitRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const session = require('express-session');
const { requireAuth } = require('./middleware/authMiddleware');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

app.use(express.static(
  path.join(__dirname, '../frontend'),
  { index: false }
));

app.use(session({
  name: 'plmun.sid',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.use('/api/patients', requireAuth, visitRoutes);
app.use('/api/patients', requireAuth, patientRoutes);
app.use('/api/dashboard', requireAuth, dashboardRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.sendFile(
    path.join(__dirname, '../frontend/index.html')
  );
});

// Start server
app.listen(PORT, () => {
    console.log(`PLMun Health Portal running at http://localhost:${PORT}`);
});
