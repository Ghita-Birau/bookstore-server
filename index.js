const express = require('express');
const { pool, initialize } = require('./config/database/db');
const bookRoutes = require('./routes/book.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes')
const cors = require('cors');

const app = express();
const port = 3001;

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

//Configurare cors
const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

app.use(express.json());

app.use('/api', bookRoutes);
app.use('/api', orderRoutes);
app.use('/api', userRoutes);


app.listen(port, () => {
    console.log(`Serverul rulează pe http://localhost:${port}`);
});