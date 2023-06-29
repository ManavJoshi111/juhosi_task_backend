const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();
const connection = mysql.createConnection({
    host: "db4free.net",
    port: "3306",
    user: "juhosi",
    password: "juhosi123",
    database: "juhosi"
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