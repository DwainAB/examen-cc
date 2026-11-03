const Joi = require('joi');

const objectId = Joi.string().hex().length(24).required();

exports.registerSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(72).required(),
});

exports.loginSchema = Joi.object({
  username: Joi.string().trim().max(30).required(),
  password: Joi.string().max(72).required(),
});

exports.createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: objectId,
        quantity: Joi.number().integer().min(1).max(100).required(),
      })
    )
    .min(1)
    .max(50)
    .required(),
  shippingAddress: Joi.object({
    street: Joi.string().trim().max(200).required(),
    city: Joi.string().trim().max(100).required(),
    postalCode: Joi.string().trim().max(20).required(),
    country: Joi.string().trim().max(100).required(),
  }).required(),
  paymentMethod: Joi.string().valid('Carte bancaire', 'PayPal', 'Virement').required(),
  shippingMethod: Joi.string().valid('colissimo', 'chronopost').required(),
});

exports.orderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('En attente', 'En cours de traitement', 'Expédiée', 'Délivrée', 'Annulée')
    .required(),
});

exports.stockSchema = Joi.object({
  stock: Joi.number().integer().min(0).required(),
});

exports.idParamSchema = Joi.object({ id: objectId });
exports.orderIdParamSchema = Joi.object({ orderId: objectId });
exports.productIdParamSchema = Joi.object({ productId: objectId });
