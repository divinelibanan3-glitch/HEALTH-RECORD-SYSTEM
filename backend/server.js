const express = require('express');
const cors = require('cors');

const visitRoutes = require('./routes/visitRoutes');
const patientRoutes = require('./routes/patientRoutes');
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


app.listen(PORT, () => {
    console.log(`PLMun Health Portal running at http://localhost:${PORT}`);
});
