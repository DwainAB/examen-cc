const logger = require('./logger');

// Journal d'audit : qui a fait quoi. Jamais de mot de passe, de token ni d'adresse.
/**
 * Enregistre un événement dans le journal d'audit.
 * @param {string} event - Nom de l'événement.
 * @param {Object} [details] - Détails, sans donnée sensible.
 * @returns {void}
 */
module.exports = (event, details = {}) => logger.info('audit', { event, ...details });
