const bookService = require('../Service/book.service');

const createBook = async (req, res) => {
    const { title, author, gen, price, published_date, description } = req.body;
    console.log("Received data:", { title, author, gen, price, published_date, description });
    try {
        const bookId = await bookService.createBook(title, author, gen, price, published_date, description);
        res.status(201).json({ bookId });
    } catch (error) {
        console.error("Error in createBook controller:", error.message);
        res.status(400).json({ error: error.message });
    }
};

const getAllBooks = async (req, res) => {
    try {
        const books = await bookService.getAllBooks();
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBookByTitle = async (req, res) => {
    const { title } = req.query;
    try {
        const book = await bookService.getBookByTitle(title);
        if (book) {
            res.status(200).json(book);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteBook = async (req, res) => {
    const { id } = req.query;
    try {
        await bookService.deleteBook(id);
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

module.exports = {
    createBook,
    getAllBooks,
    getBookByTitle,
    deleteBook
};