const express = require('express');
const router = express.Router();
const orderController = require('../controller/order.controller');

router.post('/order', orderController.createOrder);
router.get('/order/:id', orderController.getOrderById);
router.put('/order/:id', orderController.updateOrder);
router.delete('/order/:id', orderController.deleteOrder);
router.get('/orders', orderController.getAllOrders);

module.exports = router;
