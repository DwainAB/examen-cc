// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

/**
 * Vérifie le JWT du cookie et ajoute ses données à req.user.
 * @param {Object} req - Requête HTTP.
 * @param {Object} res - Réponse HTTP.
 * @param {Function} next - Passe au middleware suivant.
 * @returns {void} Répond 401 sans token, 403 si le token est invalide.
 */
exports.authenticateToken = (req, res, next) => {

  const token = req.cookies?.token;
  if (!token) return res.sendStatus(401);

  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: true, message: 'Token invalide' });
      }
      req.user = user;
      next();
    });
  } catch (error) { 
    return res.status(403).json({ error: true, message: 'Token invalide' });
  }
};

/**
 * Réserve la route aux administrateurs.
 * @param {Object} req - Requête HTTP.
 * @param {Object} res - Réponse HTTP.
 * @param {Function} next - Passe au middleware suivant.
 * @returns {void} Répond 403 si l'utilisateur n'est pas administrateur.
 */
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès interdit' });
  next();
};