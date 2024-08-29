const pool = require('../config/database/db').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const e = require("express");

const createUser = async (userData) => {
        const [result] = await pool.execute(
            `INSERT INTO users (firstname, lastname, username, role, email, password) VALUES (?, ?, ?, ?, ?, ?)`,
            [userData.firstname, userData.lastname, userData.username, userData.role, userData.email, userData.password]
        );
        return { id: result.insertId, ...userData };
    };

const validatePasswordStrength = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        throw new Error('Password must be at least 8 characters long, include an uppercase letter, a number, and a special character.');
    }
};
const registerUser = async (userData) => {
    const [existingUser] = await pool.query('SELECT id FROM users WHERE email = ?', [userData.email]);
    if (existingUser.length > 0) {
        throw new Error('Email already in use.');
    }

    validatePasswordStrength(userData.password);

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [result] = await pool.execute(
        `INSERT INTO users (firstname, lastname, username, role, email, password) VALUES (?, ?, ?, ?, ?, ?)`,
        [userData.firstname, userData.lastname, userData.username, userData.role || 'user', userData.email, hashedPassword]
    );
    return { id: result.insertId, ...userData, password: hashedPassword };
};

let loginAttempts = {};
const authenticateUser = async (email, password) => {
    if (!loginAttempts[email]) {
        loginAttempts[email] = { count: 0, lastAttempt: new Date() };
    }

    const currentTime = new Date();
    const timeDiff = (currentTime - loginAttempts[email].lastAttempt) / 1000; // Diff in seconds

    // Reset attempts after a certain time window (e.g., 15 minutes)
    if (timeDiff > 900) {
        loginAttempts[email] = { count: 0, lastAttempt: new Date() };
    }

    loginAttempts[email].lastAttempt = new Date();
    if (loginAttempts[email].count >= 5) {
        throw new Error('Too many login attempts. Please try again later.');
    }

    const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
    if (rows.length === 0) {
        loginAttempts[email].count++;
        return null;
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        loginAttempts[email].count++;
        return null;
    }

    loginAttempts[email].count = 0;

    const token = jwt.sign(
        { id: user.id, role: user.role, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    return { token, user: { id: user.id, role: user.role } };
};

const getUserById = async (id) => {
        const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
        return rows[0];
    };

const updateUser = async (id, userData) => {
    const user = await getUserById(id);
    if (!user) {
        throw new Error('User not found.');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [result] = await pool.execute(
            `UPDATE users SET firstname = ?, lastname = ?, username = ?, email = ?, password = ? WHERE id = ?`,
            [userData.firstname, userData.lastname, userData.username, userData.email, hashedPassword, id]
        );

        return result.affectedRows > 0 ? { id, ...userData } : null;
    };

const deleteUser = async (id) => {
        const [result] = await pool.execute(`DELETE FROM users WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    };

const getAllUsers = async () => {
        const [rows] = await pool.query(`SELECT * FROM users`);
        return rows;
    };

module.exports = {
    registerUser,
    authenticateUser,
    createUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser
}