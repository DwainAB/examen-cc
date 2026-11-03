// Tests des schémas de validation
const test = require('node:test');
const assert = require('node:assert');
const { createOrderSchema, orderStatusSchema, stockSchema } = require('../validators/schemas');

const validOrder = {
  items: [{ productId: 'a'.repeat(24), quantity: 2 }],
  shippingAddress: { street: '1 rue Test', city: 'Paris', postalCode: '75001', country: 'France' },
  paymentMethod: 'PayPal',
  shippingMethod: 'colissimo',
};

test('une commande valide est acceptée', () => {
  assert.strictEqual(createOrderSchema.validate(validOrder).error, undefined);
});

test('le prix envoyé par le client est retiré', () => {
  const order = { ...validOrder, total: 0, items: [{ ...validOrder.items[0], price: 0 }] };
  const { value, error } = createOrderSchema.validate(order, { stripUnknown: true });
  assert.strictEqual(error, undefined);
  assert.strictEqual(value.total, undefined);
  assert.strictEqual(value.items[0].price, undefined);
});

test('une quantité négative est refusée', () => {
  const order = { ...validOrder, items: [{ ...validOrder.items[0], quantity: -1 }] };
  assert.ok(createOrderSchema.validate(order).error);
});

test('un identifiant de produit invalide est refusé', () => {
  const order = { ...validOrder, items: [{ productId: 'abc', quantity: 1 }] };
  assert.ok(createOrderSchema.validate(order).error);
});

test('un mode de paiement inconnu est refusé', () => {
  assert.ok(createOrderSchema.validate({ ...validOrder, paymentMethod: 'Bitcoin' }).error);
});

test('un statut inventé est refusé', () => {
  assert.ok(orderStatusSchema.validate({ status: 'Pirate' }).error);
  assert.strictEqual(orderStatusSchema.validate({ status: 'Expédiée' }).error, undefined);
});

test('un stock négatif est refusé', () => {
  assert.ok(stockSchema.validate({ stock: -1 }).error);
  assert.strictEqual(stockSchema.validate({ stock: 0 }).error, undefined);
});
