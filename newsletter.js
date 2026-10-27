// ========================================
// SYSTÈME D'INSCRIPTION NEWSLETTER - FONCTIONNALITÉ 27
// ========================================

const Newsletter = {
    subscribers: JSON.parse(localStorage.getItem('newsletterSubscribers')) || [],

    // Créer le widget de newsletter - VERSION SIMPLE
    createNewsletterWidget() {
        return `
            <div class="newsletter-widget" style="
                background: rgba(17, 17, 17, 0.95);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 16px;
                padding: 32px;
                text-align: center;
                margin: 40px 0;
            ">
                <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 12px; color: #fff;">
                    Newsletter
                </h3>
                <p style="font-size: 14px; color: #aaa; margin-bottom: 24px;">
                    Recevez nos offres exclusives et nouveautes
                </p>
                
                <form id="newsletterForm" onsubmit="Newsletter.subscribe(event)" style="
                    max-width: 500px;
                    margin: 0 auto;
                    display: flex;
                    gap: 12px;
                ">
                    <input 
                        type="email" 
                        id="newsletterEmail" 
                        placeholder="votre@email.com" 
                        required
                        style="
                            flex: 1;
                            background: rgba(0, 0, 0, 0.4);
                            border: 1px solid rgba(139, 92, 246, 0.4);
                            border-radius: 8px;
                            padding: 12px 16px;
                            color: #fff;
                            font-size: 14px;
                        "
                    >
                    <button type="submit" style="
                        background: #8b5cf6;
                        border: none;
                        color: #fff;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                    ">
                        S'inscrire
                    </button>
                </form>
                
                <div id="newsletterMessage" style="margin-top: 16px; font-size: 14px;"></div>
            </div>
        `;
    },

    // S'inscrire à la newsletter
    subscribe(event) {
        event.preventDefault();
        
        const emailInput = document.getElementById('newsletterEmail');
        const email = emailInput.value.trim().toLowerCase();
        const messageDiv = document.getElementById('newsletterMessage');

        // Validation
        if (!this.isValidEmail(email)) {
            this.showMessage(messageDiv, 'Veuillez entrer un email valide', 'error');
            return;
        }

        // Vérifier si déjà inscrit
        if (this.subscribers.some(sub => sub.email === email)) {
            this.showMessage(messageDiv, 'Vous êtes déjà inscrit à notre newsletter ! 🎉', 'info');
            emailInput.value = '';
            return;
        }

        // Ajouter l'abonné
        const subscriber = {
            email,
            subscribedAt: new Date().toISOString(),
            preferences: {
                newProducts: true,
                promotions: true,
                newsletter: true
            }
        };

        this.subscribers.push(subscriber);
        localStorage.setItem('newsletterSubscribers', JSON.stringify(this.subscribers));

        // Animation de succès
        this.showMessage(messageDiv, '✅ Merci ! Vous êtes maintenant inscrit à notre newsletter', 'success');
        emailInput.value = '';

        // Confettis
        if (typeof showNotification === 'function') {
            showNotification('Bienvenue dans notre communauté ! 🎉', 'success');
        }

        // Envoyer un email de bienvenue (simulé)
        this.sendWelcomeEmail(email);
    },

    // Valider l'email
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // Afficher un message
    showMessage(div, message, type) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };

        div.innerHTML = `
            <div style="
                padding: 12px 20px;
                background: rgba(${type === 'success' ? '16, 185, 129' : type === 'error' ? '239, 68, 68' : '59, 130, 246'}, 0.1);
                border: 1px solid ${colors[type]}40;
                border-radius: 10px;
                color: ${colors[type]};
                font-weight: 600;
                animation: slideIn 0.3s ease;
            ">
                ${message}
            </div>
        `;

        setTimeout(() => {
            div.style.opacity = '0';
            div.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                div.innerHTML = '';
                div.style.opacity = '1';
            }, 300);
        }, 5000);
    },

    // Simuler l'envoi d'un email de bienvenue
    sendWelcomeEmail(email) {
        console.log(`📧 Email de bienvenue envoyé à ${email}`);
        // Dans une vraie application, appeler une API backend
    },

    // Obtenir tous les abonnés (pour l'admin)
    getAllSubscribers() {
        return this.subscribers;
    },

    // Se désinscrire
    unsubscribe(email) {
        this.subscribers = this.subscribers.filter(sub => sub.email !== email);
        localStorage.setItem('newsletterSubscribers', JSON.stringify(this.subscribers));
        
        if (typeof showNotification === 'function') {
            showNotification('Vous avez été désinscrit', 'info');
        }
    },

    // Widget compact pour footer
    createFooterWidget() {
        return `
            <div style="display: flex; gap: 12px; max-width: 400px;">
                <input 
                    type="email" 
                    id="footerNewsletterEmail" 
                    placeholder="Votre email" 
                    style="
                        flex: 1;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                        padding: 12px 16px;
                        color: #fff;
                        font-size: 14px;
                    "
                >
                <button onclick="Newsletter.quickSubscribe()" style="
                    background: #8b5cf6;
                    border: none;
                    color: #fff;
                    padding: 12px 20px;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    white-space: nowrap;
                ">
                    S'inscrire
                </button>
            </div>
        `;
    },

    // Inscription rapide depuis le footer
    quickSubscribe() {
        const emailInput = document.getElementById('footerNewsletterEmail');
        const email = emailInput?.value.trim().toLowerCase();

        if (!email || !this.isValidEmail(email)) {
            if (typeof showNotification === 'function') {
                showNotification('Email invalide', 'error');
            }
            return;
        }

        if (this.subscribers.some(sub => sub.email === email)) {
            if (typeof showNotification === 'function') {
                showNotification('Déjà inscrit !', 'info');
            }
            emailInput.value = '';
            return;
        }

        this.subscribers.push({
            email,
            subscribedAt: new Date().toISOString(),
            preferences: { newProducts: true, promotions: true, newsletter: true }
        });
        
        localStorage.setItem('newsletterSubscribers', JSON.stringify(this.subscribers));
        
        if (typeof showNotification === 'function') {
            showNotification('Merci de votre inscription ! 🎉', 'success');
        }
        
        emailInput.value = '';
    }
};

// Ajouter les styles d'animation
(function() {
    const style = document.createElement('style');
    style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);
})(); // Fin du bloc IIFE
