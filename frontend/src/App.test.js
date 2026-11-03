import { cartReducer } from './context/CartContext';

test('ajouter un produit existant augmente sa quantité sans modifier l\'état précédent', () => {
  const state = { cart: [{ id: '1', quantity: 1 }] };
  const next = cartReducer(state, { type: 'ADD_TO_CART', payload: { id: '1', quantity: 1 } });
  expect(next.cart[0].quantity).toBe(2);
  expect(state.cart[0].quantity).toBe(1);
});

test('la quantité ne descend pas sous 1', () => {
  const state = { cart: [{ id: '1', quantity: 1 }] };
  const next = cartReducer(state, { type: 'DECREMENT_QUANTITY', payload: { id: '1' } });
  expect(next.cart[0].quantity).toBe(1);
});

test('retirer un produit le supprime du panier', () => {
  const state = { cart: [{ id: '1', quantity: 1 }, { id: '2', quantity: 3 }] };
  const next = cartReducer(state, { type: 'REMOVE_FROM_CART', payload: { id: '1' } });
  expect(next.cart).toEqual([{ id: '2', quantity: 3 }]);
});

test('vider le panier supprime tous les produits', () => {
  const next = cartReducer({ cart: [{ id: '1', quantity: 1 }] }, { type: 'CLEAR_CART' });
  expect(next.cart).toEqual([]);
});
