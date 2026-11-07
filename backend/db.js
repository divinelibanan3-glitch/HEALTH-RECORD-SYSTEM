
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({
    path: path.join(__dirname, '..', '.env')
});

const db = mysql.createPool({
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: 'plmun_clinic',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = db;
