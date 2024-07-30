const mysql = require('mysql2/promise');
require('dotenv').config({ path: './Config/Database/.env' });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function initialize() {
    try {
        const connection = await pool.getConnection();
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        await connection.query(`USE \`${process.env.DB_NAME}\`;`);

        // Crearea tabelor
        await connection.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        publishing_house VARCHAR(255) NOT NULL,
        gen VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2),
        published_date DATE,
        description TEXT
      );
    `);

        await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstname VARCHAR(50) NOT NULL,
        lastname VARCHAR(50) NOT NULL,
        username VARCHAR(50) NOT NULL,
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

        await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        total_price DECIMAL(10, 2),
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

        await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT,
        book_id INT,
        quantity INT,
        price DECIMAL(10, 2),
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (book_id) REFERENCES books(id)
      );
    `);

        connection.release();
        console.log("Baza de date și tabelele au fost create cu succes.");
    } catch (error) {
        console.error("Eroare la crearea bazei de date sau tabelelor:", error);
        throw error;
    }
}

module.exports = {
    pool,
    initialize
};
