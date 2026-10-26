// ========================================
// NOTIFICATIONS PUSH - FONCTIONNALITÉ 19
// ========================================

const PushNotifications = {
    permission: localStorage.getItem('notificationPermission') || 'default',
    subscriptions: JSON.parse(localStorage.getItem('notificationSubscriptions')) || {
        newProducts: true,
        promotions: true,
        orderUpdates: true,
        newsletter: true
    },

    // Initialiser
    init() {
        this.checkPermission();
        this.createNotificationCenter();
        this.scheduleNotifications();
    },

    // Vérifier la permission
    checkPermission() {
        if ('Notification' in window) {
            this.permission = Notification.permission;
        }
    },

    // Demander la permission
    async requestPermission() {
        if (!('Notification' in window)) {
            console.log('Ce navigateur ne supporte pas les notifications');
            return false;
        }

        if (this.permission === 'granted') {
            return true;
        }

        const permission = await Notification.requestPermission();
        this.permission = permission;
        localStorage.setItem('notificationPermission', permission);

        if (permission === 'granted') {
            this.showWelcomeNotification();
            return true;
        }

        return false;
    },

    // Afficher une notification de bienvenue
    showWelcomeNotification() {
        this.send({
            title: '🎉 Notifications activées !',
            body: 'Vous recevrez désormais nos meilleures offres',
            icon: 'https://via.placeholder.com/128x128/8b5cf6/ffffff?text=Z',
            tag: 'welcome'
        });
    },

    // Envoyer une notification
    send({ title, body, icon, tag, data = {} }) {
        if (this.permission !== 'granted') {
            console.log('Permission de notification refusée');
            return;
        }

        // Notification système
        if ('Notification' in window) {
            const notification = new Notification(title, {
                body,
                icon: icon || 'https://via.placeholder.com/128x128/8b5cf6/ffffff?text=Z',
                tag: tag || 'default',
                badge: 'https://via.placeholder.com/96x96/8b5cf6/ffffff?text=Z',
                vibrate: [200, 100, 200],
                data
            });

            notification.onclick = () => {
                window.focus();
                if (data.url) {
                    window.location.href = data.url;
                }
                notification.close();
            };
        }

        // Notification in-app
        this.showInAppNotification(title, body, icon);

        // Sauvegarder dans l'historique
        this.saveToHistory({ title, body, icon, timestamp: Date.now(), read: false });
    },

    // Afficher une notification in-app
    showInAppNotification(title, body, icon) {
        const container = this.getOrCreateNotificationContainer();
        
        const notification = document.createElement('div');
        notification.className = 'in-app-notification';
        notification.style.cssText = `
            background: rgba(17, 17, 17, 0.98);
            border: 1px solid rgba(139, 92, 246, 0.5);
            border-radius: 16px;
            padding: 16px;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 8px 32px rgba(139, 92, 246, 0.3);
            animation: slideInRight 0.5s ease;
            cursor: pointer;
            max-width: 400px;
        `;

        notification.innerHTML = `
            ${icon ? `<img src="${icon}" style="width: 48px; height: 48px; border-radius: 12px;">` : ''}
            <div style="flex: 1;">
                <div style="font-size: 14px; font-weight: 700; margin-bottom: 4px; color: #fff;">
                    ${this.escapeHtml(title)}
                </div>
                <div style="font-size: 13px; color: #aaa;">
                    ${this.escapeHtml(body)}
                </div>
            </div>
            <button onclick="this.closest('.in-app-notification').remove()" style="
                background: transparent;
                border: none;
                color: #666;
                font-size: 16px;
                cursor: pointer;
                padding: 4px;
            ">✕</button>
        `;

        container.appendChild(notification);

        // Supprimer après 10 secondes
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }, 10000);
    },

    // Obtenir ou créer le conteneur de notifications
    getOrCreateNotificationContainer() {
        let container = document.getElementById('inAppNotifications');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'inAppNotifications';
            container.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
            `;
            document.body.appendChild(container);

            // Ajouter les animations CSS
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(400px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes slideOutRight {
                    from {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    to {
                        opacity: 0;
                        transform: translateX(400px);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        return container;
    },

    // Créer le centre de notifications
    createNotificationCenter() {
        // Bouton pour ouvrir le centre
        const bellButton = document.createElement('button');
        bellButton.id = 'notificationBell';
        bellButton.innerHTML = `
            <i class="fas fa-bell"></i>
            <span id="notificationBadge" style="
                position: absolute;
                top: -4px;
                right: -4px;
                background: #ef4444;
                color: #fff;
                font-size: 10px;
                font-weight: 700;
                padding: 2px 6px;
                border-radius: 10px;
                display: none;
            "></span>
        `;
        bellButton.style.cssText = `
            position: fixed;
            top: 80px;
            right: 80px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: rgba(139, 92, 246, 0.2);
            border: 1px solid rgba(139, 92, 246, 0.4);
            color: #8b5cf6;
            font-size: 20px;
            cursor: pointer;
            z-index: 9998;
            transition: all 0.3s;
        `;
        
        bellButton.addEventListener('click', () => this.toggleNotificationCenter());
        document.body.appendChild(bellButton);

        this.updateBadge();
    },

    // Basculer le centre de notifications
    toggleNotificationCenter() {
        let panel = document.getElementById('notificationPanel');
        
        if (panel) {
            panel.remove();
            return;
        }

        panel = document.createElement('div');
        panel.id = 'notificationPanel';
        panel.style.cssText = `
            position: fixed;
            top: 140px;
            right: 20px;
            width: 400px;
            max-height: 600px;
            background: rgba(17, 17, 17, 0.98);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
            z-index: 9997;
            overflow: hidden;
            animation: slideInRight 0.3s ease;
        `;

        const history = this.getHistory();

        panel.innerHTML = `
            <div style="
                padding: 20px;
                border-bottom: 1px solid rgba(139, 92, 246, 0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <h3 style="font-size: 18px; font-weight: 700; color: #fff;">
                    🔔 Notifications
                </h3>
                <button onclick="PushNotifications.markAllAsRead()" style="
                    background: transparent;
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    color: #8b5cf6;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 12px;
                    cursor: pointer;
                ">
                    Tout marquer comme lu
                </button>
            </div>

            <div style="
                max-height: 400px;
                overflow-y: auto;
                padding: 12px;
            ">
                ${history.length > 0 ? history.map((notif, index) => `
                    <div style="
                        padding: 12px;
                        border-radius: 12px;
                        margin-bottom: 8px;
                        background: ${notif.read ? 'rgba(0,0,0,0.2)' : 'rgba(139, 92, 246, 0.1)'};
                        border: 1px solid ${notif.read ? 'rgba(255,255,255,0.05)' : 'rgba(139, 92, 246, 0.3)'};
                        cursor: pointer;
                    " onclick="PushNotifications.markAsRead(${index})">
                        <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px; color: #fff;">
                            ${notif.title}
                        </div>
                        <div style="font-size: 12px; color: #888; margin-bottom: 6px;">
                            ${notif.body}
                        </div>
                        <div style="font-size: 11px; color: #666;">
                            ${this.getTimeAgo(notif.timestamp)}
                        </div>
                    </div>
                `).join('') : `
                    <div style="
                        padding: 40px;
                        text-align: center;
                        color: #666;
                    ">
                        <i class="fas fa-bell-slash" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
                        <p>Aucune notification</p>
                    </div>
                `}
            </div>

            <div style="
                padding: 16px;
                border-top: 1px solid rgba(139, 92, 246, 0.2);
            ">
                <button onclick="PushNotifications.showPreferences()" style="
                    width: 100%;
                    background: rgba(139, 92, 246, 0.2);
                    border: 1px solid rgba(139, 92, 246, 0.4);
                    color: #8b5cf6;
                    padding: 12px;
                    border-radius: 12px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                ">
                    <i class="fas fa-cog"></i> Préférences
                </button>
            </div>
        `;

        document.body.appendChild(panel);

        // Fermer au clic extérieur
        setTimeout(() => {
            document.addEventListener('click', function closePanel(e) {
                if (!e.target.closest('#notificationPanel') && !e.target.closest('#notificationBell')) {
                    panel?.remove();
                    document.removeEventListener('click', closePanel);
                }
            });
        }, 100);
    },

    // Sauvegarder dans l'historique
    saveToHistory(notification) {
        let history = this.getHistory();
        history.unshift(notification);
        
        // Limiter à 50 notifications
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        
        localStorage.setItem('notificationHistory', JSON.stringify(history));
        this.updateBadge();
    },

    // Obtenir l'historique
    getHistory() {
        return JSON.parse(localStorage.getItem('notificationHistory')) || [];
    },

    // Marquer comme lu
    markAsRead(index) {
        const history = this.getHistory();
        if (history[index]) {
            history[index].read = true;
            localStorage.setItem('notificationHistory', JSON.stringify(history));
            this.updateBadge();
            this.toggleNotificationCenter();
            this.toggleNotificationCenter(); // Refresh
        }
    },

    // Tout marquer comme lu
    markAllAsRead() {
        const history = this.getHistory();
        history.forEach(notif => notif.read = true);
        localStorage.setItem('notificationHistory', JSON.stringify(history));
        this.updateBadge();
        this.toggleNotificationCenter();
    },

    // Mettre à jour le badge
    updateBadge() {
        const badge = document.getElementById('notificationBadge');
        if (!badge) return;

        const unreadCount = this.getHistory().filter(n => !n.read).length;
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    },

    // Afficher les préférences
    showPreferences() {
        // Fermer le panel
        document.getElementById('notificationPanel')?.remove();

        // Créer la modale de préférences
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        modal.innerHTML = `
            <div style="
                background: rgba(17, 17, 17, 0.98);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 24px;
                padding: 32px;
                max-width: 500px;
                width: 90%;
            ">
                <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 20px; color: #fff;">
                    ⚙️ Préférences de notifications
                </h2>

                <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
                    ${this.createPreferenceToggle('newProducts', '🆕 Nouveaux produits')}
                    ${this.createPreferenceToggle('promotions', '🎁 Promotions')}
                    ${this.createPreferenceToggle('orderUpdates', '📦 Mises à jour des commandes')}
                    ${this.createPreferenceToggle('newsletter', '📧 Newsletter')}
                </div>

                ${this.permission !== 'granted' ? `
                    <button onclick="PushNotifications.requestPermission()" style="
                        width: 100%;
                        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                        border: none;
                        color: #fff;
                        padding: 14px;
                        border-radius: 12px;
                        font-size: 15px;
                        font-weight: 700;
                        cursor: pointer;
                        margin-bottom: 12px;
                    ">
                        🔔 Activer les notifications
                    </button>
                ` : ''}

                <button onclick="this.closest('div[style*=fixed]').remove()" style="
                    width: 100%;
                    background: rgba(139, 92, 246, 0.2);
                    border: 1px solid rgba(139, 92, 246, 0.4);
                    color: #8b5cf6;
                    padding: 14px;
                    border-radius: 12px;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                ">
                    Fermer
                </button>
            </div>
        `;

        document.body.appendChild(modal);
    },

    // Créer un toggle de préférence
    createPreferenceToggle(key, label) {
        const checked = this.subscriptions[key];
        return `
            <label style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(139, 92, 246, 0.2);
                border-radius: 12px;
                cursor: pointer;
            ">
                <span style="font-size: 15px; color: #fff;">${label}</span>
                <input 
                    type="checkbox" 
                    ${checked ? 'checked' : ''}
                    onchange="PushNotifications.updateSubscription('${key}', this.checked)"
                    style="
                        width: 48px;
                        height: 24px;
                        cursor: pointer;
                    "
                >
            </label>
        `;
    },

    // Mettre à jour une subscription
    updateSubscription(key, value) {
        this.subscriptions[key] = value;
        localStorage.setItem('notificationSubscriptions', JSON.stringify(this.subscriptions));
    },

    // Planifier des notifications
    scheduleNotifications() {
        // Exemple: notification de nouveaux produits tous les jours
        setInterval(() => {
            if (this.subscriptions.newProducts && Math.random() > 0.7) {
                this.send({
                    title: '🆕 Nouveaux produits disponibles !',
                    body: 'Découvrez notre dernière collection gaming',
                    tag: 'new-products',
                    data: { url: '/index.html#nouveautes' }
                });
            }
        }, 24 * 60 * 60 * 1000); // 24 heures
    },

    // Obtenir le temps écoulé
    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'À l\'instant';
        if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
        return `Il y a ${Math.floor(seconds / 86400)} j`;
    },

    // Échapper HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialiser - DÉSACTIVÉ (notifications automatiques trop IA)
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => PushNotifications.init());
// } else {
//     PushNotifications.init();
// }
