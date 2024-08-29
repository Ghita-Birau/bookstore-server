const express = require('express');
const bookController = require('../controller/book.controller');
const {authorizeRoles, authenticateToken} = require("../security/jwt.validator");
const {validateCreateBook, validateBookId} = require('../validator/book.validator');

const router = express.Router();

//router.post('/add-book', validateCreateBook, bookController.createBook);
//router.get('/all-books', bookController.getAllBooks);
router.get('/book/:id', validateBookId, bookController.getBookById);
router.put('/del_book/:id', authenticateToken, authorizeRoles('admin'), validateBookId, bookController.deleteBook);
router.get('/filters', bookController.getAllFilters);
router.get('/filter_books', bookController.filterBooks);
router.put('/book/:id', authenticateToken, authorizeRoles('admin', 'user'), validateBookId, bookController.updateBook);


module.exports = router;