import { cartReducer } from './context/CartContext';

test('ajouter un produit existant augmente sa quantité sans modifier l\'état précédent', () => {
  const state = { cart: [{ id: '1', quantity: 1 }] };
  const next = cartReducer(state, { type: 'ADD_TO_CART', payload: { id: '1', quantity: 1 } });
  expect(next.cart[0].quantity).toBe(2);
  expect(state.cart[0].quantity).toBe(1);
});
