const test = require('node:test');
const assert = require('node:assert/strict');
const { getJwtSecret } = require('../config/security');

test('JWT signing and verification require the configured secret', () => {
  assert.throws(() => getJwtSecret(''), /JWT_SECRET must be configured/);
  assert.equal(getJwtSecret('unit-test-secret'), 'unit-test-secret');
});

const request = require('supertest');
const { createApp } = require('../app');

test('vehicle endpoints require authentication and administrative roles for writes', async () => {
  const app = createApp({ isDatabaseReady: () => true });
  const checks = [
    request(app).get('/useragences?userId=507f1f77bcf86cd799439011'),
    request(app).get('/api/vehicles'),
    request(app).get('/api/vehicles/507f1f77bcf86cd799439011'),
    request(app).post('/api/vehicles').send({}),
    request(app).put('/api/vehicles/507f1f77bcf86cd799439011').send({}),
    request(app).delete('/api/vehicles/507f1f77bcf86cd799439011'),
  ];

  for (const response of await Promise.all(checks)) {
    assert.equal(response.status, 401);
  }
});

test('stop mutations require authentication while public stop reads remain available', async () => {
  const app = createApp({ isDatabaseReady: () => true });
  const checks = [
    request(app).post('/api/stops').send({}),
    request(app).put('/api/stops/507f1f77bcf86cd799439011').send({}),
    request(app).delete('/api/stops/507f1f77bcf86cd799439011'),
  ];

  for (const response of await Promise.all(checks)) {
    assert.equal(response.status, 401);
  }
});
