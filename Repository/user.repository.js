const { pool } = require('..Config/Database/db');

const createUser = async (firstname, lastname, username, role, email, password, created_at)  => {
    const [result] = await pool.execute(`
    INSERT INTO users (firstname, lastname, username, role, email, password, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [firstname, lastname, username, role, email, password, created_at]);
    return result.insertId;
};

module.exports = {
    createUser
}