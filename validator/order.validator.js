const { body, param, validationResult } = require('express-validator');
const pool = require('../config/database/db').pool;

const validateOrderCreation = [
    body('items')
        .isArray({ min: 1 }).withMessage('Order must contain at least one item.')
        .custom(async (items) => {
            for (const item of items) {
                if (!item.book_id || typeof item.book_id !== 'number') {
                    throw new Error('Each item must have a valid numeric book_id.');
                }
                if (!item.quantity || item.quantity <= 0) {
                    throw new Error('Each item must have a positive quantity.');
                }
            }
            return true;
        }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateOrderIdParam = [
    param('id').isInt().withMessage('Order ID must be an integer.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateOrderCreation,
    validateOrderIdParam
};
