
const db = require('../db');
const getDashboard = async (req, res) => {
    try {
        // Count registered patients
        const [patientRows] = await db.execute(
            'SELECT COUNT(*) AS total FROM patients'
        );

        // Count all clinic visits
        const [visitRows] = await db.execute(
            'SELECT COUNT(*) AS total FROM clinic_visits'
        );

        // Count today's visits
        const [todayRows] = await db.execute(
            `SELECT COUNT(*) AS total
             FROM clinic_visits
             WHERE visit_date >= CURRENT_DATE()
               AND visit_date < CURRENT_DATE() + INTERVAL 1 DAY`
        );

        // Get five most recent consultations
        const [recentVisits] = await db.execute(
            `SELECT
                v.visit_id,
                v.visit_date,
                p.student_number,
                p.full_name,
                v.chief_complaint
             FROM clinic_visits v
             JOIN patients p
                ON v.patient_id = p.patient_id
             ORDER BY v.visit_date DESC, v.visit_id DESC
             LIMIT 5`
        );

        res.json({
            message: 'Dashboard data retrieved successfully',
            statistics: {
                total_patients: patientRows[0].total,
                total_visits: visitRows[0].total,
                visits_today: todayRows[0].total
            },
            recent_visits: recentVisits
        });

    } catch (error) {
        console.error('Dashboard error:', error.message);

        res.status(500).json({
            message: 'Failed to retrieve dashboard data'
        });
    }
};

module.exports = {
    getDashboard
};
