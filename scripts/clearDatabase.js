const { pool } = require('../config/database/db');

const clearTable = async (tableName) => {
    try {
        const [result] = await pool.execute(`DELETE FROM ${tableName}`);
        console.log(`Deleted ${result.affectedRows} rows from ${tableName}`);
    } catch (error) {
        console.error(`Error deleting from ${tableName}:`, error.message);
    }
};

const clearDatabase = async () => {
    try {
        await clearTable('books');
        await clearTable('users');
        await clearTable('orders');
        await clearTable('order_items');

        console.log('All records deleted successfully.');
    } catch (error) {
        console.error('Error clearing database:', error.message);
    } finally {
        await pool.end();
    }
};

clearDatabase();
