const { pool} = require('../Config/Database/db');

const createBook = async (title, author, gen, price, published_date, description) => {
    const [result] = await pool.execute(`
    INSERT INTO books (title, author, gen, price, published_date, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [title, author, gen, price, published_date, description]);
    return result.insertId;
};

const getAllBooks = async () => {
    const [rows] = await pool.execute('SELECT * FROM books');
    return rows;
};

const getBookByTitle = async (title) => {
    const [rows] = await pool.execute('SELECT * FROM books WHERE title = ?', [title]);
    return rows;
};

const deleteBookById = async (id) => {
    const [result] = await pool.execute('DELETE FROM books WHERE id = ?', [id]);
    return result.affectedRows;
};

module.exports = {
    createBook,
    getAllBooks,
    getBookByTitle,
    deleteBookById
};
