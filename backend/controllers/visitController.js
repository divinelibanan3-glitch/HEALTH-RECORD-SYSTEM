
const db = require('../db');    
// Get a patient's clinic visit history
const getPatientVisits = async (req, res) => {
    try {
        const { studentNumber } = req.params;

        const [patients] = await db.execute(
            `SELECT patient_id, student_number, full_name
             FROM patients
             WHERE student_number = ?`,
            [studentNumber]
        );

        if (patients.length === 0) {
            return res.status(404).json({
                message: 'Patient not found'
            });
        }

        const [visits] = await db.execute(
            `SELECT
                visit_id,
                visit_date,
                checkup_type,
                chief_complaint,
                symptoms,
                medical_assessment,
                treatment_given,
                medication,
                remarks
             FROM clinic_visits
             WHERE patient_id = ?
             ORDER BY visit_date DESC, visit_id DESC`,
            [patients[0].patient_id]
        );

        res.json({
            message: 'Clinic visit history retrieved successfully',
            patient: patients[0],
            total_visits: visits.length,
            visits
        });

    } catch (error) {
        console.error('Error retrieving clinic visits:', error.message);

        res.status(500).json({
            message: 'Failed to retrieve clinic visit history'
        });
    }
};

// Add a new clinic visit
const addPatientVisit = async (req, res) => {
    try {
        const { studentNumber } = req.params;

        const {
            checkup_type,
            chief_complaint,
            symptoms,
            medical_assessment,
            treatment_given,
            medication,
            remarks
        } = req.body;

        if (
            typeof chief_complaint !== 'string' ||
            !chief_complaint.trim()
        ) {
            return res.status(400).json({
                message: 'Chief complaint is required'
            });
        }

        const [patients] = await db.execute(
            `SELECT patient_id, full_name
             FROM patients
             WHERE student_number = ?`,
            [studentNumber]
        );

        if (patients.length === 0) {
            return res.status(404).json({
                message: 'Patient not found'
            });
        }

        const patient = patients[0];

        const [result] = await db.execute(
            `INSERT INTO clinic_visits (
                patient_id,
                checkup_type,
                chief_complaint,
                symptoms,
                medical_assessment,
                treatment_given,
                medication,
                remarks
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                patient.patient_id,
                checkup_type || null,
                chief_complaint.trim(),
                symptoms || null,
                medical_assessment || null,
                treatment_given || null,
                medication || null,
                remarks || null
            ]
        );

        res.status(201).json({
            message: 'Clinic visit recorded successfully',
            visit_id: result.insertId,
            student_number: studentNumber,
            patient_name: patient.full_name
        });

    } catch (error) {
        console.error('Clinic visit error:', error.message);

        res.status(500).json({
            message: 'Failed to record clinic visit'
        });
    }
};

module.exports = {
    getPatientVisits,
    addPatientVisit
};
