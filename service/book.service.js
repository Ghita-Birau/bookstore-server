const { pool } = require('../config/database/db');

const createBook = async (title, author, publishing_house, gen, price, publication_date, stock, discount, is_favorite, image_url, short_description, long_description) => {
    const [result] = await pool.execute(`
        INSERT INTO books (title, author, publishing_house, gen, price, publication_date, stock, discount, is_favorite, image_url, short_description, long_description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, author, publishing_house, gen, price, publication_date, stock, discount, is_favorite, image_url, short_description, long_description]);
    return result.insertId;
};

const getAllBooks = async () => {
    const [rows] = await pool.execute('SELECT * FROM books');
    return rows;
};

const getBookById = async (id) => {
    const [rows] = await pool.execute('SELECT * FROM books WHERE id = ?', [id]);
    return rows.length > 0 ? rows[0] : null;
};

const deleteBookById = async (id) => {
    const [result] = await pool.execute('DELETE FROM books WHERE id = ?', [id]);
    return result.affectedRows;
};

const filterBooks = async (filters, page, limit, sortBy, sortOrder) => {
    let query = 'SELECT * FROM books WHERE 1=1 AND title IS NOT NULL AND title != \'\' AND price IS NOT NULL AND price != \'\'';
    const params = [];

    try {
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

        if (sortBy) {
            const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
            query += ` ORDER BY ${sortBy} ${order}`;
        }

        const offset = (page - 1) * limit;

        const finalQuery = `${query} LIMIT ${parseInt(limit, 10)} OFFSET ${parseInt(offset, 10)}`;

        console.log("Executing query:", finalQuery);
        console.log("With parameters:", params);
        console.log("Parameter types:", params.map(param => typeof param));

        const [rows] = await pool.execute(finalQuery, params);
        console.log("Query executed successfully. Rows:", rows);

        let countQuery = query.replace(' LIMIT ? OFFSET ?', '');
        console.log("Executing count query:", countQuery);
        console.log("With parameters for count query:", params);

        const [totalRows] = await pool.execute(countQuery, params);
        const total = totalRows.length;

        console.log("Count query executed successfully. Total rows:", total);

        return { total, books: rows };
    } catch (error) {
        console.error("Error executing query:", error.message);
        throw error;
    }
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

    const [startDate] = await pool.execute('SELECT MIN(publication_date) AS startDate FROM books');
    const [endDate] = await pool.execute('SELECT MAX(publication_date) AS endDate FROM books');

    const formattedStartDate = new Date(startDate[0].startDate).toISOString().split('T')[0];
    const formattedEndDate = new Date(endDate[0].endDate).toISOString().split('T')[0];

    return [
        {
            key: 'gen',
            label: 'Category',
            value: genres.map(row => row.gen)
        },
        {
            key: 'author',
            label: 'Author',
            value: authors.map(row => row.author)
        },
        {
            key: 'publishing_house',
            label: 'Publishing house',
            value: publishingHouses.map(row => row.publishing_house)
        },
        {
            key: 'price',
            label: 'Price',
            value: {
                minPrice: minPrice[0].minPrice,
                maxPrice: maxPrice[0].maxPrice
            }
        },
        {
            key: 'date',
            label: 'Date',
            value: {
                startDate: formattedStartDate,
                endDate: formattedEndDate
            }
        },
    ];
};

const updateBook = async (id, fields, connection = null) => {
    const columns = Object.keys(fields);
    const values = Object.values(fields);
    const conn = connection || await pool.getConnection();
    try {
        if (columns.includes('stock')) {
            const [currentStockRow] = await conn.execute(`
                SELECT stock FROM books WHERE id = ?
            `, [id]);

            if (currentStockRow.length === 0) {
                throw new Error('Book not found');
            }

            const currentStock = currentStockRow[0].stock;
            const quantityToSubtract = fields.stock;

            if (currentStock < quantityToSubtract) {
                throw new Error('Not enough stock available');
            }

            const newStock = currentStock - quantityToSubtract;

            const stockIndex = columns.indexOf('stock');
            values[stockIndex] = newStock;
        }

        const setClause = columns.map(column => `${column} = ?`).join(', ');
        values.push(id);

        const [result] = await conn.execute(`
            UPDATE books
            SET ${setClause}
            WHERE id = ?
        `, values);

        return result.affectedRows > 0;
    } finally {
    if (!connection) conn.release();
    }
};


module.exports = {
    createBook,
    getAllBooks,
    getBookById,
    deleteBookById,
    filterBooks,
    getAllFilters,
    updateBook,
};
