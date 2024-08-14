const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database/db');

const BATCH_SIZE = 1000;
const insertBooksBatch = async (books) => {
    const values = [];
    const placeholders = books.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    books.forEach(({ title, author, publishing_house, gen, price, publication_date, stock, discount, is_favorite, image_url, short_description, long_description }) => {
        values.push(title, author, publishing_house, gen, price, publication_date, stock, discount, is_favorite, image_url, short_description, long_description);
    });

    const [result] = await pool.execute(`
        INSERT INTO books (title, author, publishing_house, gen, price, publication_date, stock, discount, is_favorite, image_url, short_description, long_description)
        VALUES ${placeholders}
    `, values);

    return result.affectedRows;
};

const insertBooks = async () => {
    try {
        const books = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'books.json'), 'utf-8'));

        for (let i = 0; i < books.length; i += BATCH_SIZE) {
            const batch = books.slice(i, i + BATCH_SIZE);
            const insertedRows = await insertBooksBatch(batch);
            console.log(`Inserted ${insertedRows} books in this batch.`);
        }

        console.log('All books inserted successfully.');
    } catch (error) {
        console.error('Error inserting books:', error.message);
    } finally {
        await pool.end();
    }
};

insertBooks();
