// Vérifie req.body ou req.params avec un schéma Joi
/**
 * Crée un middleware qui valide une partie de la requête avec un schéma Joi.
 * @param {import('joi').Schema} schema - Schéma de validation.
 * @param {'body'|'params'} [source='body'] - Partie de la requête à valider.
 * @returns {import('express').RequestHandler} Middleware qui répond 400 si les données sont invalides.
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      message: 'Données invalides',
      details: error.details.map((detail) => detail.message),
    });
  }

  req[source] = value;
  next();
};

module.exports = validate;
