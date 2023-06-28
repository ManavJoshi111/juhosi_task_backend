const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();
const connection = mysql.createConnection({
    host: "13.127.217.25",
    port: "3306",
    user: "manav",
    password: "root_manav@123",
    database: "juhosi_task"
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