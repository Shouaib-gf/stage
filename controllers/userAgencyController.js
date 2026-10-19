const User = require('../models/User');
const { logEvent } = require('../config/safeLogger');

function createGetUserAgenciesHandler({ UserModel = User } = {}) {
  return async (req, res) => {
    const requestedUserId = req.query.userId || String(req.user._id);
    const authenticatedUserId = String(req.user._id);

    if (!['superadmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (req.user.role !== 'superadmin' && requestedUserId !== authenticatedUserId) {
      return res.status(403).json({ message: 'Admins can only view their own agencies.' });
    }

    try {
      const user = await UserModel.findById(requestedUserId)
        .select('agencies')
        .populate('agencies', 'name');

      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      return res.json(user.agencies.map((agency) => ({
        _id: agency._id,
        agence_name: agency.name,
      })));
    } catch {
      logEvent('error', 'user_agencies_lookup_failed');
      return res.status(500).json({ message: 'Unable to retrieve assigned agencies.' });
    }
  };
}

module.exports = { createGetUserAgenciesHandler };
