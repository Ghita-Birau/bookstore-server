const express = require('express');
const bookController = require('../controller/book.controller');

const router = express.Router();

router.post('/add-book', bookController.createBook);
router.get('/all-books', bookController.getAllBooks);
router.get('/book/:id', bookController.getBookById);
router.delete('/book-by-id', bookController.deleteBook);
router.get('/filters', bookController.getAllFilters);
router.get('/filter-books', bookController.filterBooks);
//router.put('/book/:id', bookController.updateBook);


module.exports = router;