
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({
    path: path.join(__dirname, '..', '.env')
});

const db = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.DB_NAME || 'plmun_clinic',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = db;
