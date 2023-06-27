const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();
const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB
});

connection.connect((err) => {
    if (err) {
        console.log("Error connecting to db", err);
    }
    else {
        console.log("DB is successfully connected");
    }
});

module.exports = connection;