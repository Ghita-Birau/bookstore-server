const express = require('express');
const router = express.Router();
const orderController = require('../controller/order.controller');
const authenticateToken = require('../security/jwt.validator');

// router.post('/order', authenticateToken, orderController.createOrder);
router.post('/order', orderController.createOrder);
router.get('/order', orderController.getOrder);
router.get('/orders', orderController.getAllOrders);
router.put('/order/:id', orderController.updateOrder);
router.delete('/order/:id', orderController.deleteOrder);

module.exports = router;
