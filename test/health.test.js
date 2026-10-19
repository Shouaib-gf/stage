const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { createApp } = require('../app');

test('health endpoint reports readiness when MongoDB is connected', async () => {
  const app = createApp({ isDatabaseReady: () => true });
  const response = await request(app).get('/health');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { status: 'ok', database: 'connected' });
});

test('health endpoint returns 503 when MongoDB is disconnected', async () => {
  const app = createApp({ isDatabaseReady: () => false });
  const response = await request(app).get('/health');

  assert.equal(response.status, 503);
  assert.deepEqual(response.body, { status: 'unavailable', database: 'disconnected' });
});

test('metrics endpoint exposes the required SmartBus and HTTP metrics', async () => {
  const app = createApp({ isDatabaseReady: () => true });
  const response = await request(app).get('/metrics');

  assert.equal(response.status, 200);
  assert.match(response.text, /smartbus_buses_connected/);
  assert.match(response.text, /smartbus_students_detected_total/);
  assert.match(response.text, /smartbus_http_request_duration_seconds/);
});
