// ===== CONFIGURATION EMAILJS =====
// Configuration avec tes vraies clés EmailJS

const EMAILJS_CONFIG = {
    // 1. Service ID depuis emailjs.com → Email Services
    SERVICE_ID: 'service_z3bqsjl',
    
    // 2. Template IDs depuis emailjs.com → Email Templates
    TEMPLATES: {
        // Template pour l'email de confirmation d'inscription
        CONFIRMATION: 'template_tbzb0og',
        
        // Template pour le code de réinitialisation
        RESET_CODE: 'template_51278ny'
    },
    
    // 3. Public Key depuis emailjs.com → Account
    PUBLIC_KEY: 'ot_hxtuqRGfNKM4zG'
};

// ===== INITIALISATION EMAILJS =====
function initEmailJS() {
    emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
}

// ===== FONCTIONS D'ENVOI =====

// Envoyer email de confirmation d'inscription
async function sendConfirmationEmail(userEmail, userName, confirmationToken) {
    const confirmationLink = `${window.location.origin}/confirm-email.html?token=${confirmationToken}`;
    
    const templateParams = {
        to_name: userName,
        confirmation_link: confirmationLink,
        site_name: 'Zenith Store',
        reply_to: userEmail
    };
    
    try {
        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATES.CONFIRMATION,
            templateParams,
            EMAILJS_CONFIG.PUBLIC_KEY
        );
        console.log('Email de confirmation envoyé', response);
        return true;
    } catch (error) {
        console.error('Erreur envoi email:', error);
        return false;
    }
}

// Envoyer code de réinitialisation
async function sendResetCode(userEmail, userName, resetCode) {
    const templateParams = {
        to_name: userName,
        reset_code: resetCode,
        site_name: 'Zenith Store',
        reply_to: userEmail
    };
    
    try {
        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATES.RESET_CODE,
            templateParams,
            EMAILJS_CONFIG.PUBLIC_KEY
        );
        console.log('Code de réinitialisation envoyé', response);
        return true;
    } catch (error) {
        console.error('Erreur envoi code:', error);
        return false;
    }
}

// ===== UTILITAIRES =====

// Générer un code de 6 chiffres
function generateResetCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Générer un token de confirmation unique
function generateConfirmationToken() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Vérifier si EmailJS est configuré
function isEmailJSConfigured() {
    return EMAILJS_CONFIG.SERVICE_ID !== 'YOUR_SERVICE_ID' &&
           EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY';
}
