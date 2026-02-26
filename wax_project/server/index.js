const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Auth Routes
app.post('/api/auth/login', async (req, res) => {
    const { login, password } = req.body;
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE login = ? AND password = ?', [login, password]);
        if (rows.length > 0) {
            res.json({ success: true, user: rows[0] });
        } else {
            res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    const { login, password, name, phone, car_number } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO users (login, password, name, phone, car_number) VALUES (?, ?, ?, ?, ?)',
            [login, password, name, phone, car_number]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Services Routes
app.get('/api/services', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM services WHERE active = TRUE');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/services', async (req, res) => {
    const { name, price, description, icon } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO services (name, price, description, icon) VALUES (?, ?, ?, ?)',
            [name, price, description, icon]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/services/:id', async (req, res) => {
    try {
        await pool.execute('UPDATE services SET active = FALSE WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Washers Routes
app.get('/api/washers', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM washers WHERE active = TRUE');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Bookings Routes
app.get('/api/bookings', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM bookings ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/bookings', async (req, res) => {
    const { user_id, service_ids, body_type, date, time, total_price } = req.body;
    try {
        const [result] = await pool.execute(
            'INSERT INTO bookings (user_id, service_ids, body_type, date, time, total_price, status) VALUES (?, ?, ?, ?, ?, ?, "pending")',
            [user_id, JSON.stringify(service_ids), body_type, date, time, total_price]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
