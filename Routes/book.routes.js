const express = require('express');
const bookController = require('../Controller/book.controller');

const router = express.Router();

router.post('/add-book', bookController.createBook);
router.get('/all-books', bookController.getAllBooks);
router.get('/books-by-title', bookController.getBookByTitle);
router.delete('/book-by-id', bookController.deleteBook);
router.get('/filters', bookController.getAllFilters);
router.get('/filter-books', bookController.filterBooks);


module.exports = router;