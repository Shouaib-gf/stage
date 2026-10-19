const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const mongoose = require('mongoose');
const { createApp } = require('./app');
const createDefaultSuperAdmin = require('./config/defaultAdmin');
const { getJwtSecret } = require('./config/security');
const { logEvent } = require('./config/safeLogger');

async function startServer({
  mongoUri = process.env.MONGO_URI,
  jwtSecret = process.env.JWT_SECRET,
  connect = (uri) => mongoose.connect(uri),
  initializeSuperAdmin = createDefaultSuperAdmin,
  appFactory = createApp,
  port = Number(process.env.PORT || 80),
} = {}) {
  if (!mongoUri) {
    throw new Error('MONGO_URI must be configured before starting SmartBus.');
  }
  getJwtSecret(jwtSecret);

  mongoose.set('strictQuery', false);
  await connect(mongoUri);
  logEvent('info', 'mongodb_connected');

  // User uses Mongoose's default connection, so the Super Admin lookup reuses
  // the same authenticated connection established above.
  await initializeSuperAdmin();

  const app = appFactory();
  return app.listen(port, () => {
    logEvent('info', 'http_server_started');
  });
}

if (require.main === module) {
  startServer().catch(() => {
    logEvent('error', 'startup_failed');
    process.exitCode = 1;
  });
}

module.exports = { startServer };
