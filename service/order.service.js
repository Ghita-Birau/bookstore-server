const pool = require('../config/database/db').pool;

const calculateTotalPrice = async (items, connection) => {
    let totalPrice = 0;

    for (const item of items) {
        const [rows] = await connection.execute(
            `SELECT price FROM books WHERE id = ?`, [item.book_id]
        );

        if (rows.length === 0) {
            throw new Error(`Book with id ${item.book_id} not found`);
        }

        const bookPrice = rows[0].price;
        totalPrice += bookPrice * item.quantity;
    }

    return totalPrice;
};
const createOrder = async (orderData) => {
        const connection = await pool.getConnection();
        try {

            await connection.beginTransaction();
            const total_price = await calculateTotalPrice(orderData.items, connection);
            const [result] = await connection.execute(
                `INSERT INTO orders (user_id, total_price) VALUES (?, ?)`,
                [orderData.user_id, total_price]
            );
            const orderId = result.insertId;

            for (const item of orderData.items) {
                const [rows] = await connection.execute(
                    `SELECT price FROM books WHERE id = ?`,
                    [item.book_id]
                );

                if (rows.length === 0) {
                    throw new Error(`Book with id ${item.book_id} not found`);
                }

                const bookPrice = rows[0].price;

                await connection.execute(
                    `INSERT INTO order_items (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)`,
                    [orderId, item.book_id, item.quantity, item.quantity * bookPrice]
                );
            }

            await connection.commit();
            return { id: orderId, user_id: orderData.user_id, total_price, items: orderData.items };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    };

const getOrderById = async (id) => {
        const [rows] = await pool.query(`SELECT * FROM orders WHERE id = ?`, [id]);
        return rows[0];
    };

const getOrderByUserId = async (userId) => {
    const [rows] = await pool.query(`
        SELECT 
            o.id AS order_id,
            o.total_price,
            o.order_date,
            oi.id AS item_id,
            oi.book_id,
            oi.quantity,
            oi.price AS item_price
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        WHERE o.user_id = ?
        ORDER BY o.order_date DESC
    `, [userId]);

    const ordersMap = new Map();

    rows.forEach(row => {
        const orderId = row.order_id;

        if (!ordersMap.has(orderId)) {
            ordersMap.set(orderId, {
                id: orderId,
                total_price: row.total_price,
                order_date: row.order_date,
                items: []
            });
        }

        ordersMap.get(orderId).items.push({
            item_id: row.item_id,
            book_id: row.book_id,
            quantity: row.quantity,
            price: row.item_price
        });
    });

    return Array.from(ordersMap.values());
};


const updateOrder = async (orderId, orderData) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [orderRows] = await connection.execute(
            `SELECT id FROM orders WHERE id = ?`,
            [orderId]
        );

        if (orderRows.length === 0) {
            await connection.rollback();
            return null;
        }

        for (const item of orderData.items) {
            const [rows] = await connection.execute(
                `SELECT price FROM books WHERE id = ?`,
                [item.book_id]
            );

            if (rows.length === 0) {
                throw new Error(`Book with id ${item.book_id} not found`);
            }

            const pricePerUnit = rows[0].price;
            const totalItemPrice = pricePerUnit * item.quantity;

            await connection.execute(
                `UPDATE order_items SET quantity = ?, price = ? WHERE order_id = ? AND book_id = ?`,
                [item.quantity, totalItemPrice, orderId, item.book_id]
            );
        }

        const total_price = await calculateTotalPrice(orderData.items, connection);

        await connection.execute(
            `UPDATE orders SET total_price = ? WHERE id = ?`,
            [total_price, orderId]
        );

        await connection.commit();

        return { id: orderId, user_id: orderData.user_id, total_price, items: orderData.items };
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const deleteOrder = async (id) => {
        const [result] = await pool.execute(`DELETE FROM orders WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    };

const getAllOrders = async () => {
        const [rows] = await pool.query(`SELECT * FROM orders`);
        return rows;
    };

module.exports = {
    createOrder,
    getOrderById,
    getOrderByUserId,
    getAllOrders,
    updateOrder,
    deleteOrder
}
