const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// I-serve ang frontend files mula sa Docker volume path (/frontend)
app.use(express.static('/frontend'));

// MySQL Database Connection Pool
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.MYSQL_ROOT_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'plmun_clinic',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test Database Connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to MySQL database as id ' + connection.threadId);
    connection.release();
});

// API Route: Mag-save ng bagong patient (POST) - Tugma sa database schema
app.post('/api/patients', (req, res) => {
    const { student_number, full_name, birthdate, sex, course, year_level } = req.body;

    const query = `
        INSERT INTO patients 
        (student_number, full_name, birthdate, sex, course, year_level) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        query,
        [student_number, full_name, birthdate, sex, course, year_level],
        (err, results) => {
            if (err) {
                console.error('Error saving patient:', err);
                return res.status(500).json({ error: 'Failed to save patient to database' });
            }
            res.json({ message: 'Patient added successfully', patientId: results.insertId });
        }
    );
});

// API Route: Kunin ang listahan ng lahat ng patients mula sa MySQL (GET)
app.get('/api/patients', (req, res) => {
    db.query('SELECT * FROM patients', (err, results) => {
        if (err) {
            console.error('Error fetching patients:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});