const logger = require('../config/logger');

// Journalise chaque requête, sans paramètres d'URL, corps ni cookies, qui peuvent contenir des données sensibles
/**
 * Journalise chaque requête à la fin de son traitement.
 * @param {import('express').Request} req - Requête HTTP.
 * @param {import('express').Response} res - Réponse HTTP.
 * @param {import('express').NextFunction} next - Passe au middleware suivant.
 */
module.exports = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const path = req.originalUrl.split('?')[0];
    if (path === '/api/health') return;

    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger.log(level, 'requete', {
      method: req.method,
      path,
      status: res.statusCode,
      durationMs: Date.now() - start,
    });
  });

  next();
};
