// Vérifie req.body ou req.params avec un schéma Joi
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
