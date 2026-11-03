// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();
const logger = require('./logger');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        logger.info('mongodb_connecte');
    } catch (err) {
        logger.error('mongodb_connexion_echouee', { error: err.message });
        process.exit(1);
    }
};

module.exports = connectDB;
