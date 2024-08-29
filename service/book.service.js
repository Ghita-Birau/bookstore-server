const { pool } = require('../config/database/db');

const createBook = async (title, author, publishing_house, gen, price, publication_date, stock, discount, is_favorite, image_url, short_description, long_description) => {
    const [result] = await pool.execute(`
        INSERT INTO books (title, author, publishing_house, gen, price, publication_date, stock, discount, is_favorite, image_url, short_description, long_description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, author, publishing_house, gen, price, publication_date, stock, discount, is_favorite, image_url, short_description, long_description]);
    return result.insertId;
};

const getAllBooks = async () => {
    const [rows] = await pool.execute('SELECT * FROM books WHERE is_deleted = FALSE');
    return rows;
};

const getBookById = async (id) => {
    const [rows] = await pool.execute('SELECT * FROM books WHERE id = ? AND is_deleted = FALSE', [id]);
    return rows.length > 0 ? rows[0] : null;
};

const deleteBookById = async (id) => {
    const [result] = await pool.execute(
        'UPDATE books SET is_deleted = TRUE WHERE id = ?',
        [id]
    );
    if (result.affectedRows === 0) {
        throw new Error('Book not found');
    }
    return result.affectedRows;
};

const filterBooks = async (filters, page, limit, sortBy, sortOrder) => {
    let query = 'SELECT * FROM books WHERE 1=1 AND title IS NOT NULL AND is_deleted = FALSE AND title != \'\' AND price IS NOT NULL AND price != \'\'';
    const params = [];

    const filterMappings = {
        gen: {
            query: (value) => ` AND gen IN (${value.map(() => '?').join(',')})`,
            process: (value) => (Array.isArray(value) ? value : [value])
        },
        author: {
            query: (value) => ` AND author IN (${value.map(() => '?').join(',')})`,
            process: (value) => (Array.isArray(value) ? value : [value])
        },
        publishing_house: {
            query: (value) => ` AND publishing_house IN (${value.map(() => '?').join(',')})`,
            process: (value) => (Array.isArray(value) ? value : [value])
        },
        minPrice: {
            query: () => ' AND price >= ?',
            process: (value) => [value]
        },
        maxPrice: {
            query: () => ' AND price <= ?',
            process: (value) => [value]
        },
        startDate: {
            query: () => ' AND publication_date >= ?',
            process: (value) => [value]
        },
        endDate: {
            query: () => ' AND publication_date <= ?',
            process: (value) => [value]
        }
    };

    try {
        // Iterează prin filtre și aplică logica specifică fiecăruia
        for (const key in filters) {
            if (filterMappings[key] && filters[key] && filters[key].length > 0) {
                const processedValue = filterMappings[key].process(filters[key]);
                query += filterMappings[key].query(processedValue);
                params.push(...processedValue);
            }
        }

        if (sortBy) {
            const order = sortOrder && sortOrder.toLowerCase() === 'desc' ? 'DESC' : 'ASC';
            query += ` ORDER BY ${sortBy} ${order}`;
        }

        const offset = (page - 1) * limit;
        const finalQuery = `${query} LIMIT ${parseInt(limit, 10)} OFFSET ${parseInt(offset, 10)}`;

        const [rows] = await pool.execute(finalQuery, params);

        let countQuery = query.replace(' LIMIT ? OFFSET ?', '');
        const [totalRows] = await pool.execute(countQuery, params);
        const total = totalRows.length;

        return { total, books: rows };
    } catch (error) {
        console.error("Error executing query:", error.message);
        throw error;
    }
};


const getAllFilters = async () => {
    const [results] = await pool.execute(`
        SELECT 
            (SELECT GROUP_CONCAT(DISTINCT gen SEPARATOR ',') FROM books WHERE gen IS NOT NULL AND gen != '') AS genres,
            (SELECT GROUP_CONCAT(DISTINCT author SEPARATOR ',') FROM books WHERE author IS NOT NULL AND author != '') AS authors,
            (SELECT GROUP_CONCAT(DISTINCT publishing_house SEPARATOR ',') FROM books WHERE publishing_house IS NOT NULL AND publishing_house != '') AS publishingHouses,
            MIN(price) AS minPrice,
            MAX(price) AS maxPrice,
            MIN(publication_date) AS startDate,
            MAX(publication_date) AS endDate
        FROM books
    `);

    const formattedStartDate = new Date(results[0].startDate).toISOString().split('T')[0];
    const formattedEndDate = new Date(results[0].endDate).toISOString().split('T')[0];

    const mapping = [
        { key: 'gen', label: 'Category', value: results[0].genres ? results[0].genres.split(',') : [] },
        { key: 'author', label: 'Author', value: results[0].authors ? results[0].authors.split(',') : [] },
        { key: 'publishing_house', label: 'Publishing house', value: results[0].publishingHouses ? results[0].publishingHouses.split(',') : [] },
        { key: 'price', label: 'Price', value: { minPrice: results[0].minPrice, maxPrice: results[0].maxPrice } },
        { key: 'date', label: 'Date', value: { startDate: formattedStartDate, endDate: formattedEndDate } }
    ];
    return mapping;
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

            currentStock = currentStockRow[0].stock;
            const newStock = fields.stock;

            if (newStock < 0) {
                throw new Error('Stock cannot be negative');
            }

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
