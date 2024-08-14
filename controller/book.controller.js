const bookService = require('../service/book.service');

const createBook = async (req, res) => {
    const { title, author, publishing_house, gen, price, publication_date, stock, discount, is_favorite, image_url, short_description, long_description } = req.body;
    console.log("Received data:", { title, author, publishing_house, gen, price, publication_date, stock, discount, is_favorite, image_url, short_description, long_description });
    try {
        const bookId = await bookService.createBook(title, author, publishing_house, gen, price, publication_date, stock, discount, is_favorite, image_url, short_description, long_description);
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

const getBookById = async (req, res) => {
    const { id } = req.params;
    try {
        const book = await bookService.getBookById(id);
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

const filterBooks = async (req, res) => {
    try {
        const filters = req.query;
        const page = parseInt(filters.page) || 1;
        const limit = parseInt(filters.limit) || 10;
        const sortBy = filters.sortBy;
        const sortOrder = filters.sortOrder;

        delete filters.page;
        delete filters.limit;
        delete filters.sortBy;
        delete filters.sortOrder;

        console.log("Received filterBooks request. Filters:", filters, "Page:", page, "Limit:", limit);

        const result = await bookService.filterBooks(filters, page, limit, sortBy, sortOrder);
        res.status(200).json({
            total: result.total,
            page,
            limit,
            books: result.books
        });
    } catch (error) {
        console.error("Error in filterBooks controller:", error.message);
        res.status(500).json({ error: error.message });
    }
};

const getAllFilters = async (req, res) => {
    try {
        const filters = await bookService.getAllFilters();
        res.json({ filters });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateBook = async (req, res) => {
    const { id } = req.params;
    const fieldsToUpdate = req.body;

    try {
        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ message: 'No fields provided for update' });
        }

        const updated = await bookService.updateBook(id, fieldsToUpdate);

        if (updated) {
            res.status(200).json({ message: 'Book updated successfully' });
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        console.error("Error in updateBook controller:", error.message);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createBook,
    getAllBooks,
    getBookById,
    deleteBook,
    filterBooks,
    getAllFilters,
    updateBook
};
