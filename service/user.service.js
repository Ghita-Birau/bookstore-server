const pool = require('../config/database/db').pool;

const createUser = async (userData) => {
        const [result] = await pool.execute(
            `INSERT INTO users (firstname, lastname, username, role, email, password) VALUES (?, ?, ?, ?, ?, ?)`,
            [userData.firstname, userData.lastname, userData.username, userData.role, userData.email, userData.password]
        );
        return { id: result.insertId, ...userData };
    };

const getUserById = async (id) => {
        const [rows] = await pool.query(`SELECT * FROM users WHERE id = ?`, [id]);
        return rows[0];
    };

const updateUser = async (id, userData) => {
        const [result] = await pool.execute(
            `UPDATE users SET firstname = ?, lastname = ?, username = ?, role = ?, email = ?, password = ? WHERE id = ?`,
            [userData.firstname, userData.lastname, userData.username, userData.role, userData.email, userData.password, id]
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
    createUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser
}