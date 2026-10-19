function getJwtSecret(secret = process.env.JWT_SECRET) {
  if (!secret) {
    throw new Error('JWT_SECRET must be configured before starting SmartBus.');
  }
  return secret;
}

module.exports = { getJwtSecret };
