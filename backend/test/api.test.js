// Tests de l'API sans base de données : validation, droits d'accès et erreurs
const test = require('node:test');
const assert = require('node:assert');
const app = require('../app');

let server;
let url;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  url = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => server.close());

const post = (path, body) =>
  fetch(`${url}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

test('une route inconnue renvoie 404', async () => {
  assert.strictEqual((await fetch(`${url}/api/inconnu`)).status, 404);
});

test('une injection NoSQL au login est refusée', async () => {
  const res = await post('/api/auth/login', '{"username":{"$ne":null},"password":"x"}');
  assert.strictEqual(res.status, 400);
});

test('un mot de passe trop court est refusé', async () => {
  const res = await post('/api/auth/register', '{"username":"test","email":"t@example.com","password":"abc"}');
  assert.strictEqual(res.status, 400);
});

test('un JSON mal formé ne révèle aucun détail technique', async () => {
  const res = await post('/api/auth/login', '{mauvais');
  assert.strictEqual(res.status, 400);
  assert.deepStrictEqual(await res.json(), { message: 'Requête invalide' });
});

test('la liste des commandes exige une connexion', async () => {
  assert.strictEqual((await fetch(`${url}/api/orders`)).status, 401);
});
