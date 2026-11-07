
const db = require('../db');

const getPatientByStudentNumber = async (req, res) => {
    try {
        const { studentNumber } = req.params;

        const [patients] = await db.execute(
            'SELECT * FROM patients WHERE student_number = ?',
            [studentNumber]
        );

        if (patients.length === 0) {
            return res.status(404).json({
                message: 'Patient not found'
            });
        }

        res.json({
            message: 'Patient found successfully',
            patient: patients[0]
        });

    } catch (error) {
        console.error('Error retrieving patient:', error.message);

        res.status(500).json({
            message: 'Failed to retrieve patient'
        });
    }
};


const searchPatients = async (req, res) => {
    try {
        const search = req.query.search;

        if (typeof search !== 'string' || !search.trim()) {
            return res.status(400).json({
                message: 'Please enter a name or student number'
            });
        }

        if (search.trim().length > 50) {
            return res.status(400).json({
                message: 'Search must be 50 characters or fewer'
            });
        }

        const searchTerm = `%${search.trim()}%`;

        const [patients] = await db.execute(
            `SELECT
                patient_id,
                student_number,
                full_name,
                course,
                year_level
             FROM patients
             WHERE full_name LIKE ?
                OR student_number LIKE ?
             ORDER BY full_name ASC
             LIMIT 20`,
            [searchTerm, searchTerm]
        );

        res.json({
            message: 'Patient search completed',
            total_results: patients.length,
            patients
        });

    } catch (error) {
        console.error('Patient search error:', error.message);

        res.status(500).json({
            message: 'Failed to search patients'
        });
    }
};


const registerPatient = async (req, res) => {
    try {
        const {
            student_number,
            full_name,
            birthdate,
            sex,
            course,
            year_level
        } = req.body;

        // Validate required information
        if (
            typeof student_number !== 'string' ||
            !/^\d{10}$/.test(student_number) ||
            typeof full_name !== 'string' ||
            !full_name.trim()
        ) {
            return res.status(400).json({
                message: 'A 10-digit student number and full name are required'
            });
        }

        // Check whether the student already exists
        const [existing] = await db.execute(
            'SELECT patient_id FROM patients WHERE student_number = ?',
            [student_number]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: 'Student number already registered'
            });
        }

        // Insert the new patient
        const [result] = await db.execute(
            `INSERT INTO patients
             (student_number, full_name, birthdate, sex, course, year_level)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                student_number,
                full_name.trim(),
                birthdate || null,
                sex || null,
                course || null,
                year_level || null
            ]
        );

        res.status(201).json({
            message: 'Patient registered successfully',
            patient_id: result.insertId,
            student_number,
            full_name: full_name.trim()
        });

    } catch (error) {
        console.error('Patient registration error:', error.message);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                message: 'Student number already registered'
            });
        }

        res.status(500).json({
            message: 'Failed to register patient'
        });
    }
};


module.exports = {
    getPatientByStudentNumber,
    searchPatients,
    registerPatient
};
