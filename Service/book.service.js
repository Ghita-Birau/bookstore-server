const { pool } = require('../Config/Database/db');

const createBook = async (title, author, publishing_house, gen, price, publication_date, image_url, description) => {
    const [result] = await pool.execute(`
        INSERT INTO books (title, author, publishing_house, gen, price, publication_date, image_url, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, author, publishing_house, gen, price, publication_date, image_url, description]);
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

const filterBooks = async (filters) => {
    let query = 'SELECT * FROM books WHERE 1=1';
    const params = [];

    if (filters.gen) {
        const genres = Array.isArray(filters.gen) ? filters.gen : [filters.gen];
        query += ` AND gen IN (${genres.map(() => '?').join(',')})`;
        params.push(...genres);
    }
    if (filters.author) {
        const authors = Array.isArray(filters.author) ? filters.author : [filters.author];
        query += ` AND author IN (${authors.map(() => '?').join(',')})`;
        params.push(...authors);
    }
    if (filters.publishing_house) {
        const publishingHouses = Array.isArray(filters.publishing_house) ? filters.publishing_house : [filters.publishing_house];
        query += ` AND publishing_house IN (${publishingHouses.map(() => '?').join(',')})`;
        params.push(...publishingHouses);
    }
    if (filters.minPrice) {
        query += ' AND price >= ?';
        params.push(filters.minPrice);
    }
    if (filters.maxPrice) {
        query += ' AND price <= ?';
        params.push(filters.maxPrice);
    }
    if (filters.startDate) {
        query += ' AND publication_date >= ?';
        params.push(filters.startDate);
    }
    if (filters.endDate) {
        query += ' AND publication_date <= ?';
        params.push(filters.endDate);
    }

    const [rows] = await pool.execute(query, params);
    return rows;
};
const getAllFilters = async () => {
    const [genres] = await pool.execute(`
        SELECT DISTINCT gen
        FROM books
        WHERE gen IS NOT NULL AND gen != ''
    `);
    const [authors] = await pool.execute(`
        SELECT DISTINCT author
        FROM books
        WHERE author IS NOT NULL AND author != ''
    `);
    const [publishingHouses] = await pool.execute(`
        SELECT DISTINCT publishing_house
        FROM books
        WHERE publishing_house IS NOT NULL AND publishing_house != ''
    `);
    const [minPrice] = await pool.execute('SELECT MIN(price) AS minPrice FROM books');
    const [maxPrice] = await pool.execute('SELECT MAX(price) AS maxPrice FROM books');

    return {
        genres: genres.map(row => row.gen),
        authors: authors.map(row => row.author),
        publishingHouses: publishingHouses.map(row => row.publishing_house),
        minPrice: minPrice[0].minPrice,
        maxPrice: maxPrice[0].maxPrice
    };
};

module.exports = {
    createBook,
    getAllBooks,
    getBookByTitle,
    deleteBookById,
    filterBooks,
    getAllFilters,
};
