const assert = require('node:assert/strict');
const test = require('node:test');
const { createGetUserAgenciesHandler } = require('../controllers/userAgencyController');

function responseRecorder() {
  return {
    statusCode: 200,
    body: undefined,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function modelReturning(agencies) {
  const calls = [];
  return {
    calls,
    findById(userId) {
      calls.push(userId);
      return {
        select(fields) {
          assert.equal(fields, 'agencies');
          return this;
        },
        populate(field, projection) {
          assert.equal(field, 'agencies');
          assert.equal(projection, 'name');
          return Promise.resolve({ agencies });
        },
      };
    },
  };
}

test('admin can read their assigned agencies in the legacy frontend shape', async () => {
  const UserModel = modelReturning([{ _id: 'agency-1', name: 'North Depot' }]);
  const res = responseRecorder();
  const handler = createGetUserAgenciesHandler({ UserModel });

  await handler({
    query: { userId: 'admin-1' },
    user: { _id: 'admin-1', role: 'admin' },
  }, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, [{ _id: 'agency-1', agence_name: 'North Depot' }]);
  assert.deepEqual(UserModel.calls, ['admin-1']);
});

test('admin cannot inspect another user agency assignments', async () => {
  const UserModel = modelReturning([]);
  const res = responseRecorder();
  const handler = createGetUserAgenciesHandler({ UserModel });

  await handler({
    query: { userId: 'another-user' },
    user: { _id: 'admin-1', role: 'admin' },
  }, res);

  assert.equal(res.statusCode, 403);
  assert.deepEqual(UserModel.calls, []);
});
