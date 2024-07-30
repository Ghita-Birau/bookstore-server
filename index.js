const express = require('express');
const { pool, initialize } = require('./Config/Database/db');
const bookRoutes = require('./Routes/book.routes');
const userController = require('./Controller/user.controller');

const app = express();
const port = 3000;

// Inițializăm baza de date
initialize().catch(err => {
    console.error('Eroare la inițializarea bazei de date:', err);
    process.exit(1);
});

app.get('/test-db', async (req, res) => {
    try {
        const [rows, fields] = await pool.query('SELECT 1 + 1 AS solution');
        res.send(`Soluția este: ${rows[0].solution}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Eroare la conectarea la baza de date');
    }
});


app.use(express.json());
app.use('/api', bookRoutes);

app.post('/api/user', userController.createUser);

app.listen(port, () => {
    console.log(`Serverul rulează pe http://localhost:${port}`);
});
