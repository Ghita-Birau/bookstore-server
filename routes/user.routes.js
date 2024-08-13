const express = require('express');
const userController = require('../controller/user.controller');
const router = express.Router();


router.post('/user', userController.createUser);
router.get('/user/:id', userController.getUserById);
router.put('/user/:id', userController.updateUser);
router.delete('/user/:id', userController.deleteUser);
router.get('/users', userController.getAllUsers);

module.exports = router;
