
const express = require('express');
const cors = require('cors');

const visitRoutes = require('./routes/visitRoutes');
const patientRoutes = require('./routes/patientRoutes');
const visitRoutes = require('./routes/visitRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'PLMun Health Portal API is running!' });
});

app.use('/api/patients', visitRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/dashboard', dashboardRoutes);

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
