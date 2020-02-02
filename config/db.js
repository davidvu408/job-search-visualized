const mysql = require('mysql');
require('dotenv').config();
const fs = require('fs');

// Configure Connection
const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        ca: fs.readFileSync('./config/amazon-rds-ca-cert.pem')
    }
});

// Establish Connection
con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to database!");
});


module.exports = con;