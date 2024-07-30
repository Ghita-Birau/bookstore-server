const bookRepository = require('../Repository/book.repository');

const createBook = async (title, author, gen, price, published_date, description) => {

    if (!title || !author || !gen || !price || !published_date || !description) {
        throw new Error('All fields are required');
    }

    console.log("Validating data:", { title, author, gen, price, published_date, description });

    const bookId = await bookRepository.createBook(title, author, gen, price, published_date, description);
    return bookId;
};

const getAllBooks = async () => {
    return await bookRepository.getAllBooks();
};

const getBookByTitle = async (title) => {
    if (!title) {
        throw new Error('Title is required');
    }
    return await bookRepository.getBookByTitle(title);
};

const deleteBook = async (id) => {
    if (!id) {
        throw new Error('ID is required');
    }
    const rowsAffected = await bookRepository.deleteBookById(id);
    if (rowsAffected === 0) {
        throw new Error('Book not found');
    }
    return rowsAffected;
};

module.exports = {
    createBook,
    getAllBooks,
    getBookByTitle,
    deleteBook
};
