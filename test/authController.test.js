const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { createSessionHandler } = require('../controllers/authController');

function responseRecorder() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test('Super Admin login signs a token with the configured secret', async () => {
  const user = {
    id: 'super-admin-id',
    _id: 'super-admin-id',
    username: 'Super Admin',
    email: 'admin@example.test',
    role: 'superadmin',
    password: 'stored-password-hash',
    myadmin: 'admin@example.test',
    agencies: [],
  };
  const handler = createSessionHandler({
    UserModel: { findOne: async () => user },
    comparePassword: async (password, hash) => password === 'correct' && hash === user.password,
    getSecret: () => 'test-signing-secret',
  });
  const res = responseRecorder();

  await handler({ body: { email: user.email, password: 'correct' } }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.role, 'superadmin');
  assert.equal(res.body.token.expiresIn > Math.floor(Date.now() / 1000), true);
  assert.equal(jwt.verify(res.body.token.data, 'test-signing-secret').role, 'superadmin');
});

test('Super Admin login rejects an incorrect password without signing a token', async () => {
  const handler = createSessionHandler({
    UserModel: { findOne: async () => ({ password: 'stored-password-hash' }) },
    comparePassword: async () => false,
    signToken: () => assert.fail('A token must not be signed for an incorrect password'),
    getSecret: () => 'test-signing-secret',
  });
  const res = responseRecorder();

  await handler({ body: { email: 'admin@example.test', password: 'wrong' } }, res);

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /Password is incorrect/);
});
