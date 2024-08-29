const orderService = require('../service/order.service');

const createOrder = async (req, res) => {
        try {
            const orderData = {
                user_id: req.user.id,
                items: req.body.items
            };
            const order = await orderService.createOrder(orderData);
            res.status(201).json(order);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

const getOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        const orders = await orderService.getOrders(userId, isAdmin);

        if (!orders || (Array.isArray(orders) && orders.length === 0)) {
            return res.status(404).json({ message: 'Orders not found' });
        }

        return res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateOrder = async (req, res) => {
    try {
        const updatedOrder = await orderService.updateOrder(req.params.id, req.body);
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const deleteOrder = async (req, res) => {
    // Stergere dupa plasarea unei comenzi (mai trebuie lucrat)
        try {
            const deletedOrder = await orderService.deleteOrder(req.params.id);
            if (!deletedOrder) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.status(200).json({ message: 'Order deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

module.exports = {
    createOrder,
    getOrders,
    updateOrder,
    deleteOrder,
}