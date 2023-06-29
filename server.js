const express = require('express');
const app = express();
const cors = require('cors');
const fs = require('fs');
const dotenv = require('dotenv');
const connection = require('./db');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
dotenv.config();
const PORT = process.env.PORT || 8000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/login', (req, res) => {
    const { ID, password } = req.body;
    console.log("id : ", ID);
    console.log("Password : ", password);
    if (!ID || !password) {
        return res.status(401).json({ error: "Invalid Credentials" });
    }
    const query = "SELECT * FROM login WHERE ID = ? AND password = ?";
    connection.query(query, [ID, password], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (result.length === 0) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }
        return res.status(200).json({ message: "Login Successful" });
    });
});

app.post('/changepassword', async (req, res) => {
    console.log("Body : ", req.body);
    const { id, mobile, newPassword, confirmNewPassword } = req.body;
    if (!mobile || !newPassword || !confirmNewPassword) {
        return res.status(401).json({ error: "Invalid Credentials" });
    }
    if (newPassword !== confirmNewPassword) {
        return res.status(401).json({ error: "Password Mismatch" });
    }

    let query = "UPDATE users SET password = ? WHERE mobile = ?";
    connection.query(query, [newPassword, mobile], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Invalid Credentials" });
        }
        else if (result.affectedRows === 0) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }
        query = "UPDATE login SET password=? WHERE id=?";
        connection.query(query, [newPassword, id], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            if (result.affectedRows === 0) {
                return res.status(401).json({ error: "Invalid Credentials" });
            }
            return res.status(200).json({ message: "Password Updated Successfully" });
        });
    });
});

app.get('/details/:id', (req, res) => {
    const id = req.params.id;
    console.log("Id : ", id);
    const query = "SELECT id,name FROM users WHERE id = ?";
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (result.length === 0) {
            return res.status(401).json({ error: "Invalid Credentials" });
        }
        return res.status(200).json(result[0]);
    });
})

app.post('/details', (req, res) => {
    const { order_date, item, count, weight, requests } = req.body;
    let query = "INSERT INTO Orderitem(order_date,item,count,weight,requests) VALUES(?,?,?,?,?)";
    let orderId;
    connection.query(query, [order_date, item, count, weight, requests], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        orderId = result.insertId;
        query = "INSERT INTO Orderinfo VALUES(?,?,?)";
        connection.query(query, [null, orderId, req.body.company], (err, result) => {
            console.log(query.sql);
            if (err) {
                console.log(err);
            }
        });
        return res.status(200).json({ message: "Order Placed Successfully" });
    });
});

app.get('/data/:id', (req, res) => {
    const { id } = req.params;
    const query = "select * from Orderitem where order_id in (select order_id from Orderinfo WHERE user_id=?)";
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        const subquery = "SELECT id,mobile,name from users where id=?";
        connection.query(subquery, [id], (err, subresult) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            result.push(subresult[0]);
            return res.status(200).json(result);
        });
    });
});

app.get('/data/csv/:id', (req, res) => {
    const { id } = req.params;
    const query = "select * from Orderitem where order_id in (select order_id from Orderinfo WHERE user_id=?)";
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        const subquery = "SELECT id,mobile,name from users where id=?";
        connection.query(subquery, [id], (err, subresult) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
            result.push(subresult[0]);
        });
        const csvWriter = createCsvWriter({
            path: 'data.csv',
            header: Object.keys(result[0]).map(column => ({
                id: column,
                title: column,
            })),
        });

        csvWriter
            .writeRecords(result)
            .then(() => {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=data.csv');

                fs.createReadStream('data.csv').pipe(res);
            })
            .catch(error => {
                console.error(error);
                return res.status(500).json({ error: 'Internal Server Error' });
            });
    });
});

app.listen(PORT, () => {
    console.log("Server is running");
})