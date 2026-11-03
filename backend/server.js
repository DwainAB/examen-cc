// server.js : point d'entrée, connecte la base puis démarre le serveur
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info('serveur_demarre', { port: PORT }));
