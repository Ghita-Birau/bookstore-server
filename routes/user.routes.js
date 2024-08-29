const express = require('express');
const userController = require('../controller/user.controller');
const router = express.Router();
const { authorizeRoles, authenticateToken } = require("../security/jwt.validator");
const {validateUserRegistration, validateUserLogin} = require("../validator/user.validator");

router.post('/register', validateUserRegistration, userController.registerUser);
router.post('/login', validateUserLogin, userController.loginUser);
router.get('/user', authenticateToken, authorizeRoles('user', 'admin'), userController.getUserDetails);
router.put('/user', authenticateToken, authorizeRoles('user', 'admin'), userController.updateUser);
//router.delete('/user/:id', userController.deleteUser);
//router.get('/users', userController.getAllUsers);

module.exports = router;

// Register user si register user fac acelasi lucru cu precizarea ca register cripteaza parolele