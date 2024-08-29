const { body, param, validationResult } = require('express-validator');

const validateUserRegistration = [
    body('firstname').isString().notEmpty().withMessage('First name is required and must be a string.'),
    body('lastname').isString().notEmpty().withMessage('Last name is required and must be a string.'),
    body('username').isString().notEmpty().withMessage('Username is required and must be a string.'),
    body('email').isEmail().withMessage('A valid email is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateUserLogin = [
    body('email').isEmail().withMessage('A valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateUserRegistration,
    validateUserLogin,
};