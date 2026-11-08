const db = require('../db');

const getPatientByStudentNumber = async (req, res) => {
    try {
        const { studentNumber } = req.params;

        const [patients] = await db.execute(
            `SELECT
                patient_id,
                student_number,
                full_name,
                birthdate,
                sex,
                course,
                year_level,
                blood_type,
                allergies,
                medical_conditions,
                emergency_contact,
                contact_number,
                created_at
             FROM patients
             WHERE student_number = ?`,
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
        const search = typeof req.query.search === 'string'
            ? req.query.search.trim()
            : '';

        if (search.length > 50) {
            return res.status(400).json({
                message: 'Search must be 50 characters or fewer'
            });
        }

        const searchTerm = `%${search}%`;

        const [patients] = await db.execute(
            `SELECT
                patient_id,
                student_number,
                full_name,
                course,
                year_level
             FROM patients
             WHERE ? = ''
                OR full_name LIKE ?
                OR student_number LIKE ?
             ORDER BY full_name ASC
             LIMIT 20`,
            [search, searchTerm, searchTerm]
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
            year_level,
            blood_type,
            allergies,
            medical_conditions,
            emergency_contact,
            contact_number
        } = req.body;

        if (
            typeof student_number !== 'string' ||
            !student_number.trim() ||
            typeof full_name !== 'string' ||
            !full_name.trim()
        ) {
            return res.status(400).json({
                message: 'Student number and full name are required'
            });
        }

        const [existing] = await db.execute(
            'SELECT patient_id FROM patients WHERE student_number = ?',
            [student_number.trim()]
        );

        if (existing.length > 0) {
            return res.status(409).json({
                message: 'Student number already registered'
            });
        }

        const [result] = await db.execute(
            `INSERT INTO patients
             (
                student_number,
                full_name,
                birthdate,
                sex,
                course,
                year_level,
                blood_type,
                allergies,
                medical_conditions,
                emergency_contact,
                contact_number
             )
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                student_number.trim(),
                full_name.trim(),
                birthdate || null,
                sex || null,
                course || null,
                year_level || null,
                blood_type || null,
                allergies || null,
                medical_conditions || null,
                emergency_contact || null,
                contact_number || null
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
