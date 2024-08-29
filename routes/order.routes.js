const express = require('express');
const router = express.Router();
const orderController = require('../controller/order.controller');
const { authorizeRoles, authenticateToken } = require("../security/jwt.validator");
const {validateOrderIdParam, validateOrderCreation} = require("../validator/order.validator");

router.post('/order', authenticateToken, authorizeRoles('user'), validateOrderCreation, orderController.createOrder);
router.get('/orders', authenticateToken, orderController.getOrders);
router.put('/order/:id', validateOrderIdParam, orderController.updateOrder);
router.delete('/order/:id', validateOrderIdParam, orderController.deleteOrder);

module.exports = router;
