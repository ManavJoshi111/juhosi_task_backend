const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const connection = require('./db');
dotenv.config();
const PORT = process.env.PORT || 8000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const validateDate = (date) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date);
};

const validateAlphaNumeric = (text) => {
    const alphaNumericRegex = /^[a-zA-Z0-9\s]+$/;
    return alphaNumericRegex.test(text);
};

const validateString = (text) => {
    return typeof text === 'string' && text.trim() !== '';
};

const validateInteger = (number) => {
    const parsedNumber = parseInt(number, 10);
    return !isNaN(parsedNumber) && Number.isInteger(parsedNumber);
};

const validateFloat = (number) => {
    const parsedNumber = parseFloat(number);
    return !isNaN(parsedNumber) && typeof parsedNumber === 'number';
};


app.post('/customer', (req, res) => {
    const { ID, orderdate, company, owner, item, quantity, weight, request_for_shipment, tracking_id, shipment_size, box_count, specification, checklist_quantity } = req.body;
    if (!validateDate(orderdate)) {
        return res.status(400).json({ error: 'Invalid order date' });
    }

    if (!validateAlphaNumeric(company)) {
        return res.status(400).json({ error: 'Invalid company name' });
    }

    if (!validateAlphaNumeric(owner)) {
        return res.status(400).json({ error: 'Invalid owner name' });
    }

    if (!validateString(item)) {
        return res.status(400).json({ error: 'Invalid item' });
    }

    if (!validateInteger(quantity)) {
        return res.status(400).json({ error: 'Invalid quantity' });
    }

    if (!validateFloat(weight)) {
        return res.status(400).json({ error: 'Invalid weight' });
    }

    if (!validateString(request_for_shipment)) {
        return res.status(400).json({ error: 'Invalid request for shipment' });
    }

    if (!validateString(tracking_id)) {
        return res.status(400).json({ error: 'Invalid tracking ID' });
    }

    if (!validateString(shipment_size)) {
        return res.status(400).json({ error: 'Invalid shipment size' });
    }

    if (!validateInteger(box_count)) {
        return res.status(400).json({ error: 'Invalid box count' });
    }

    if (!validateString(specification)) {
        return res.status(400).json({ error: 'Invalid specification' });
    }

    if (!validateString(checklist_quantity)) {
        return res.status(400).json({ error: 'Invalid checklist quantity' });
    }

    const query = connection.query("INSERT INTO customer (ID,orderdate, company, owner, item, quantity, weight, request_for_shipment, tracking_id, shipment_size, box_count, specification, checklist_quantity) VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [ID, orderdate, company, owner, item, quantity, weight, request_for_shipment, tracking_id, shipment_size, box_count, specification, checklist_quantity], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        else {
            console.log(result);
            return res.status(200).json({ message: "Customer added successfully" });
        }
    });
});

app.get('/admin', async (req, res) => {
    const query1 = "SELECT  sum(quantity) as quantity,sum(weight) as weight,sum(box_count) as box_count FROM customer where ID='customer1'";
    const query2 = "SELECT  sum(quantity) as quantity,sum(weight) as weight, sum(box_count) as box_count FROM customer where ID='customer2'";
    const query3 = "SELECT sum(quantity) as quantity,sum(weight) as weight,sum(box_count) as box_count FROM customer";
    let data = {
        customer1: [],
        customer2: [],
        total: []
    };
    let query = await connection.query(query1, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        else {
            data.customer1.push(result[0].quantity);
            data.customer1.push(result[0].weight);
            data.customer1.push(result[0].box_count);
        }
    });
    query = await connection.query(query2, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        else {
            data.customer2.push(result[0].quantity);
            data.customer2.push(result[0].weight);
            data.customer2.push(result[0].box_count);
        }
    });
    query = await connection.query(query3, (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
        else {
            data.total.push(result[0].quantity);
            data.total.push(result[0].weight);
            data.total.push(result[0].box_count);
            return res.status(200).json({ data });
        }
    });
});

app.post('/login', (req, res) => {
    const { ID, password } = req.body;
    if (!ID || !password) {
        return res.status(401).json({ message: "Invalid Credentials" });
    }
    if (password != process.env.PASSWORD) {
        return res.status(401).json({ message: "Invalid Credentials" });
    }
    if (ID == "admin") {
        return res.status(200).json({ admin: 1 });
    }
    else {
        if (ID == "customer1" || ID == "customer2") {
            return res.status(200).json({ admin: 0 });
        }
        else {
            return res.status(401).json({ message: "Invalid Credentials" });
        }
    }
});

app.listen(PORT, () => {
    console.log("Server is running");
})