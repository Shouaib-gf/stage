const test = require('node:test');
const assert = require('node:assert/strict');
const { getJwtSecret } = require('../config/security');

test('JWT signing and verification require the configured secret', () => {
  assert.throws(() => getJwtSecret(''), /JWT_SECRET must be configured/);
  assert.equal(getJwtSecret('unit-test-secret'), 'unit-test-secret');
});
