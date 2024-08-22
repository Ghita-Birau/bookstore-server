const pool = require('../config/database/db').pool;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const createUser = async (userData) => {
        const [result] = await pool.execute(
            `INSERT INTO users (firstname, lastname, username, role, email, password) VALUES (?, ?, ?, ?, ?, ?)`,
            [userData.firstname, userData.lastname, userData.username, userData.role, userData.email, userData.password]
        );
        return { id: result.insertId, ...userData };
    };

const registerUser = async (userData) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [result] = await pool.execute(
        `INSERT INTO users (firstname, lastname, username, role, email, password) VALUES (?, ?, ?, ?, ?, ?)`,
        [userData.firstname, userData.lastname, userData.username, userData.role || 'user', userData.email, hashedPassword]
    );
    return { id: result.insertId, ...userData, password: hashedPassword };
};

const authenticateUser = async (email, password) => {
    const [rows] = await pool.query(`SELECT * FROM users WHERE email = ?`, [email]);
    if (rows.length === 0) return null;

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return null;

    const token = jwt.sign(
        { id: user.id, firstname: user.firstname, lastname: user.lastname, username: user.username, email: user.email, password: user.password, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    return { token, user: { id: user.id, firstname: user.firstname, lastname: user.lastname, username: user.username, email: user.email, password: user.password, role: user.role } };
};

const getUserById = async (id) => {
        const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
        return rows[0];
    };

const updateUser = async (id, userData) => {
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