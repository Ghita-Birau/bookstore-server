const { body, validationResult } = require('express-validator');
const { param } = require('express-validator');

const validateCreateBook = [
    body('title').isString().notEmpty().withMessage('Title is required and must be a string.'),
    body('author').isString().notEmpty().withMessage('Author is required and must be a string.'),
    body('publishing_house').isString().notEmpty().withMessage('Publishing house is required and must be a string'),
    body('gen').isString().notEmpty().withMessage('Gen is required and must be a string'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number.'),
    body('publication_date').isDate().withMessage('Publication date must be a valid date.'),
    body('stock').isNumeric().notEmpty().withMessage('Stock is required and must be a number'),
    body('discount').isFloat().notEmpty().withMessage('Discount is required and must be a number'),
    body('is_favorite').isBoolean().notEmpty().withMessage('Favorite is required an must be a boolean'),
    body('image_url').isString().notEmpty().withMessage('Image is required'),
    body('short_description').isString().notEmpty().withMessage('Short description is required and must be a string'),
    body('long_description').isString().notEmpty().withMessage('Long description is required and must be a string'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const validateBookId = [
    param('id').isInt().withMessage('ID must be an integer.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

module.exports = {
    validateCreateBook,
    validateBookId,
};
