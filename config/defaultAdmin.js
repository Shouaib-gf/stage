const User = require('../models/User');
const { logEvent } = require('./safeLogger');

const createDefaultSuperAdmin = async ({ UserModel = User } = {}) => {
    try {
        const existingSuperAdmin = await UserModel.findOne({ role: 'superadmin' });
        if (!existingSuperAdmin) {
           // const hashedPassword = await bcrypt.hash('HbB6yq+R+U', 12); // Mot de passe par défaut sécurisé

            await UserModel.create({
                username: 'Super Admin',
                email: 'service.info@emkamed.tn',
                myadmin:'service.info@emkamed.tn',
                password: '$2a$12$5Hgo7LsgyAvu8X9uZp/bVur.FQkuxF1crI0RwEJm6P/U2GcPWjwba',
                role: 'superadmin',
                agencies: [] 
            });

            logEvent('info', 'default_super_admin_created');
        } else {
            logEvent('info', 'default_super_admin_exists');
        }
    } catch (error) {
        logEvent('error', 'default_super_admin_initialization_failed');
        throw error;
    }
};

module.exports = createDefaultSuperAdmin;
