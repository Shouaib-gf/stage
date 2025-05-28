const User = require('../models/User');

const createDefaultSuperAdmin = async () => {
    try {
        const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
        if (!existingSuperAdmin) {
           // const hashedPassword = await bcrypt.hash('HbB6yq+R+U', 12); // Mot de passe par défaut sécurisé

            await User.create({
                username: 'Super Admin',
                email: 'service.info@emkamed.tn',
                myadmin:'service.info@emkamed.tn',
                password: '$2a$12$5Hgo7LsgyAvu8X9uZp/bVur.FQkuxF1crI0RwEJm6P/U2GcPWjwba',
                role: 'superadmin',
                agencies: [] 
            });

            console.log('✅ Compte Super Admin créé avec succès.');
        } else {
            console.log('✅ Compte Super Admin existe déjà.');
        }
    } catch (error) {
        console.error('❌ Erreur lors de la création du Super Admin :', error.message);
    }
};

module.exports = createDefaultSuperAdmin;
