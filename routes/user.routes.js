const express = require('express');
const userController = require('../controller/user.controller');
const router = express.Router();
const authenticateToken = require('../security/jwt.validator');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/user', userController.createUser);
router.get('/user', authenticateToken, userController.getUserDetails);
router.put('/user', authenticateToken, userController.updateUser);
router.delete('/user/:id', userController.deleteUser);
router.get('/users', userController.getAllUsers);

module.exports = router;

// Register user si register user fac acelasi lucru cu precizarea ca register cripteaza parolele