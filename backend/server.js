const express = require('express');


const visitRoutes = require('./routes/visitRoutes');
const patientRoutes = require('./routes/patientRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');



const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/api/patients', visitRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/dashboard', dashboardRoutes);


app.listen(PORT, () => {
    console.log(`PLMun Health Portal running at http://localhost:${PORT}`);
});
