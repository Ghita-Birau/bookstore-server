const orderService = require('../service/order.service');

const createOrder = async (req, res) => {
        try {
            const order = await orderService.createOrder(req.body);
            res.status(201).json(order);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

const getOrderById = async (req, res) => {
        try {
            const order = await orderService.getOrderById(req.params.id);
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }
            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

const getOrderByUserId = async (req, res) => {
    try {
        const order = await orderService.getOrderByUserId(req.params.userId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
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

const getAllOrders = async (req, res) => {
        try {
            const orders = await orderService.getAllOrders();
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

module.exports = {
    createOrder,
    getOrderById,
    getOrderByUserId,
    getAllOrders,
    updateOrder,
    deleteOrder,
}