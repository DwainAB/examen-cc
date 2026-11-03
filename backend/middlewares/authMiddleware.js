// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

exports.authenticateToken = (req, res, next) => {

  const token = req.cookies?.token;
  if (!token) return res.sendStatus(401);

  try {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Erreur de vérification du token upd');
        return res.status(403).json({ error: true, message: 'Token invalide upd' });
      }
      req.user = user;
      next();
    });
  } catch (error) { 
    return res.status(403).json({ error: true, message: 'Token invalide' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Accès interdit' });
  next();
};