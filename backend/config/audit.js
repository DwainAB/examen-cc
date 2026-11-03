const logger = require('./logger');

// Journal d'audit : qui a fait quoi. Jamais de mot de passe, de token ni d'adresse.
module.exports = (event, details = {}) => logger.info('audit', { event, ...details });
