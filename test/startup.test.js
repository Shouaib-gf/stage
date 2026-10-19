const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('../server');
const createDefaultSuperAdmin = require('../config/defaultAdmin');

test('startup uses the configured Mongo URI and awaits admin initialization before listen', async () => {
  const calls = [];
  const server = { started: true };
  const result = await startServer({
    mongoUri: 'mongodb://mongo:27017/iptsdb?authSource=admin',
    jwtSecret: 'unit-test-secret',
    connect: async (uri) => calls.push(['connect', uri]),
    initializeSuperAdmin: async () => calls.push(['superadmin']),
    appFactory: () => ({
      listen: (port) => {
        calls.push(['listen', port]);
        return server;
      },
    }),
    port: 0,
  });

  assert.equal(result, server);
  assert.deepEqual(calls, [
    ['connect', 'mongodb://mongo:27017/iptsdb?authSource=admin'],
    ['superadmin'],
    ['listen', 0],
  ]);
});

test('startup refuses to connect when MONGO_URI is missing', async () => {
  let connectCalled = false;

  await assert.rejects(
    startServer({ mongoUri: '', connect: async () => { connectCalled = true; } }),
    /MONGO_URI must be configured/,
  );
  assert.equal(connectCalled, false);
});

test('startup does not accept traffic when Super Admin initialization fails', async () => {
  let listenCalled = false;

  await assert.rejects(
    startServer({
      mongoUri: 'mongodb://mongo:27017/iptsdb?authSource=admin',
      jwtSecret: 'unit-test-secret',
      connect: async () => {},
      initializeSuperAdmin: async () => { throw new Error('admin lookup failed'); },
      appFactory: () => ({
        listen: () => { listenCalled = true; },
      }),
    }),
    /admin lookup failed/,
  );

  assert.equal(listenCalled, false);
});

test('default Super Admin initialization leaves an existing account untouched', async () => {
  let createCalled = false;
  const existingAdmin = { role: 'superadmin' };

  await createDefaultSuperAdmin({
    UserModel: {
      findOne: async (query) => {
        assert.deepEqual(query, { role: 'superadmin' });
        return existingAdmin;
      },
      create: async () => { createCalled = true; },
    },
  });

  assert.equal(createCalled, false);
});

test('default Super Admin initialization creates only when no account exists', async () => {
  const createCalls = [];
  await createDefaultSuperAdmin({
    UserModel: {
      findOne: async () => null,
      create: async (account) => createCalls.push(account),
    },
  });

  assert.equal(createCalls.length, 1);
  assert.equal(createCalls[0].role, 'superadmin');
});
