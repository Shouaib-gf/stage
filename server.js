const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { createApp } = require('./app');
const createDefaultSuperAdmin = require('./config/defaultAdmin');
const { getJwtSecret } = require('./config/security');

dotenv.config({ path: './.env' });

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
  console.log('Connected to MongoDB');

  // User uses Mongoose's default connection, so the Super Admin lookup reuses
  // the same authenticated connection established above.
  await initializeSuperAdmin();

  const app = appFactory();
  return app.listen(port, () => {
    console.log(`Server started at port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('SmartBus startup failed:', error.message);
    process.exitCode = 1;
  });
}

module.exports = { startServer };
