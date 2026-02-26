-- Database Schema for Clean and Point (Чисто и точка)

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    car_number VARCHAR(50),
    role ENUM('client', 'admin', 'owner') DEFAULT 'client',
    bonus_balance DECIMAL(10, 2) DEFAULT 0.00,
    cashback_percent INT DEFAULT 5,
    tg_id BIGINT UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS washers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    percent INT DEFAULT 30,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    status ENUM('free', 'occupied', 'maintenance') DEFAULT 'free'
);

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    service_ids JSON,
    body_type VARCHAR(50),
    date DATE,
    time TIME,
    status ENUM('pending', 'waiting', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    post_id INT,
    washer_id INT,
    rating INT,
    review TEXT,
    total_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (post_id) REFERENCES posts(id),
    FOREIGN KEY (washer_id) REFERENCES washers(id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type VARCHAR(50),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    icon VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed Initial Data
INSERT IGNORE INTO users (login, password, name, phone, role, bonus_balance) VALUES 
('admin', 'admin', 'Администратор', '+7 900 000-00-01', 'admin', 0),
('owner', 'owner', 'Владелец', '+7 900 000-00-00', 'owner', 0);

INSERT IGNORE INTO services (name, price, description, icon) VALUES 
('Бесконтактная мойка', 500, 'Мойка кузова бесконтактной химией', '🚿'),
('Мойка с пеной', 800, 'Ручная мойка с активной пеной', '🧽'),
('Полировка кузова', 3000, 'Восстановительная полировка', '✨'),
('Химчистка салона', 4500, 'Глубокая чистка салона', '🧹'),
('Мойка двигателя', 1200, 'Деликатная мойка моторного отсека', '⚙️'),
('Покрытие воском', 1500, 'Защитное восковое покрытие', '💎');

INSERT IGNORE INTO washers (name, percent) VALUES 
('Алексей Козлов', 30),
('Сергей Иванов', 30),
('Дмитрий Фёдоров', 30),
('Иван Семёнов', 25);

INSERT IGNORE INTO posts (name, status) VALUES 
('Пост 1', 'free'),
('Пост 2', 'free'),
('Пост 3', 'free');
