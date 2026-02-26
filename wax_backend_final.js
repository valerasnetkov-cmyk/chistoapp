const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Telegram Bot Setup
const token = process.env.TELEGRAM_BOT_TOKEN || '8232256174:AAHmSbVarnGDwKYCeGNI0Qp4XjZZiuD4Aa8';
let bot;

function initBot() {
    try {
        bot = new TelegramBot(token, { polling: true });
        console.log('Telegram Bot initialized with polling.');
        
        const WEB_APP_URL = 'https://chistoapp.ru';

        const sendWelcome = (chatId) => {
            bot.sendMessage(chatId, `👋 Привет! Это тестовый бот системы «Чисто и точка» 💧\n\nЯ помогу тебе записаться на мойку прямо здесь. Нажми кнопку ниже, чтобы запустить приложение!`, {
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🚀 Открыть приложение', web_app: { url: WEB_APP_URL } }
                    ]],
                    keyboard: [[
                        { text: '💧 Записаться на мойку', web_app: { url: WEB_APP_URL } }
                    ]],
                    resize_keyboard: true
                }
            }).catch(err => console.error('Send message error:', err));
        };

        bot.onText(/\/start/, (msg) => sendWelcome(msg.chat.id));
    } catch (e) {
        console.error('Bot Error:', e);
    }
}

initBot();

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const getCarWashId = (req) => req.headers['x-car-wash-id'] || 1;

app.post('/api/auth/login', async (req, res) => {
    const { login, password } = req.body;
    const washId = getCarWashId(req);
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE login = ? AND (password = ? OR password = "NO_PASSWORD") AND (car_wash_id = ? OR role != "client")', [login, password, washId]);
        if (rows.length > 0) res.json({ success: true, user: rows[0] });
        else res.status(401).json({ success: false, error: 'Неверный логин или пароль' });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/auth/register', async (req, res) => {
    const { login, password, name, phone, car_number } = req.body;
    const washId = getCarWashId(req);
    try {
        const [existing] = await pool.execute('SELECT id FROM users WHERE login = ? AND car_wash_id = ?', [login, washId]);
        if (existing.length > 0) return res.status(400).json({ success: false, error: 'Пользователь уже зарегистрирован' });
        const [result] = await pool.execute('INSERT INTO users (login, password, name, phone, car_number, car_wash_id) VALUES (?, ?, ?, ?, ?, ?)', [login, password, name, phone, car_number, washId]);
        res.json({ success: true, id: result.insertId });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/users', async (req, res) => {
    try { const [rows] = await pool.execute('SELECT * FROM users WHERE car_wash_id = ?', [getCarWashId(req)]); res.json(rows); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/users/:id', async (req, res) => {
    const param = req.params.id;
    const washId = getCarWashId(req);
    try {
        let query = isNaN(parseInt(param)) ? 'SELECT * FROM users WHERE login = ? AND car_wash_id = ?' : 'SELECT * FROM users WHERE id = ? AND car_wash_id = ?';
        const [rows] = await pool.execute(query, [param, washId]);
        if (rows.length > 0) res.json(rows[0]);
        else res.status(404).json({ error: 'User not found' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/users/:id', async (req, res) => {
    const fields = Object.keys(req.body);
    const washId = getCarWashId(req);
    const mapping = { name: 'name', phone: 'phone', car_number: 'car_number', role: 'role', bonus_balance: 'bonus_balance', tg_id: 'tg_id' };
    const updates = []; const values = [];
    for (let f of fields) if (mapping[f]) { updates.push(`${mapping[f]} = ?`); values.push(req.body[f]); }
    if (updates.length === 0) return res.status(400).json({ error: 'No valid fields' });
    const param = req.params.id;
    let whereClause = isNaN(parseInt(param)) ? 'login = ? AND car_wash_id = ?' : 'id = ? AND car_wash_id = ?';
    values.push(param, washId);
    try {
        await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE ${whereClause}`, values);
        const [updated] = await pool.execute(`SELECT * FROM users WHERE ${whereClause}`, [param, washId]);
        res.json(updated[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/services', async (req, res) => {
    try { const [rows] = await pool.execute('SELECT * FROM services WHERE active = TRUE AND car_wash_id = ?', [getCarWashId(req)]); res.json(rows); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/washers', async (req, res) => {
    try { const [rows] = await pool.execute('SELECT * FROM washers WHERE active = TRUE AND car_wash_id = ?', [getCarWashId(req)]); res.json(rows); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/bookings', async (req, res) => {
    try { const [rows] = await pool.execute('SELECT * FROM bookings WHERE car_wash_id = ? ORDER BY created_at DESC', [getCarWashId(req)]); res.json(rows); }
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/bookings', async (req, res) => {
    const { user_id, service_ids, body_type, date, time, total_price } = req.body;
    const washId = getCarWashId(req);
    try {
        let db_user_id = null;
        if (user_id) {
            const [users] = await pool.execute('SELECT id FROM users WHERE (id = ? OR login = ?) AND car_wash_id = ?', [user_id, user_id, washId]);
            if (users.length > 0) db_user_id = users[0].id;
        }
        const [result] = await pool.execute('INSERT INTO bookings (user_id, service_ids, body_type, date, time, total_price, status, car_wash_id) VALUES (?, ?, ?, ?, ?, ?, "pending", ?)', [db_user_id, JSON.stringify(service_ids), body_type, date, time, total_price, washId]);
        res.json({ success: true, id: result.insertId });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/bookings/:id', async (req, res) => {
    const fields = Object.keys(req.body);
    const washId = getCarWashId(req);
    const mapping = { status: 'status', post_id: 'post_id', washer_id: 'washer_id', rating: 'rating', review: 'review' };
    const updates = []; const values = [];
    for (let f of fields) if (mapping[f]) { updates.push(`${mapping[f]} = ?`); values.push(req.body[f]); }
    if (updates.length === 0) return res.status(400).json({ error: 'No valid fields' });
    values.push(req.params.id, washId);
    try {
        await pool.execute(`UPDATE bookings SET ${updates.join(', ')} WHERE id = ? AND car_wash_id = ?`, values);
        const [updated] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
        if (req.body.status && updated[0].user_id) {
            const [users] = await pool.execute('SELECT tg_id FROM users WHERE id = ?', [updated[0].user_id]);
            if (users.length > 0 && users[0].tg_id && bot) {
                let msg = '';
                if (req.body.status === 'waiting') msg = '📢 Ваша машина ожидается на мойке! Пожалуйста, подъезжайте.';
                if (req.body.status === 'in_progress') msg = '🚿 Мойка вашего автомобиля началась.';
                if (req.body.status === 'completed') msg = '✅ Мойка завершена! Можете забрать автомобиль.';
                if (msg) bot.sendMessage(users[0].tg_id, msg).catch(e => console.error('Notify Error:', e));
            }
        }
        res.json(updated[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/weather', async (req, res) => {
    const city = req.query.city || 'Yuzhno-Sakhalinsk';
    try {
        const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
        res.json(await response.json());
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.listen(port, () => { console.log(`Server running on port ${port}`); });
