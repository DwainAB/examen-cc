const crypto = require('crypto');

const hash = (value) => crypto.createHash('sha256').update(value).digest();

// Refuse toute requête qui ne présente pas la clé interne
module.exports = (req, res, next) => {
  const expected = process.env.INTERNAL_API_KEY;
  const received = req.get('x-internal-api-key');

  if (!expected || !received || !crypto.timingSafeEqual(hash(expected), hash(received))) {
    return res.status(401).json({ message: 'Accès non autorisé' });
  }

  next();
};
