// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet')
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(helmet())
app.use(cors({
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
}));
app.use(express.json());
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Route inconnue
app.use((req, res) => {
  res.status(404).json({ message: 'Route introuvable' });
});

// Gestion centralisée des erreurs
app.use((err, req, res, next) => {
  console.error(err.message);
  const status = err.status || 500;
  res.status(status).json({
    message: status < 500 ? 'Requête invalide' : 'Erreur serveur',
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur en écoute sur le port ${PORT}`));