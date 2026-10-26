// ========================================
// CHAT SUPPORT EN DIRECT - FONCTIONNALITÉ 31
// ========================================

const LiveChat = {
    isOpen: false,
    messages: [],
    isClosing: false, // Flag pour éviter les appels multiples
    botResponses: {
        'bonjour': 'Bonjour ! 👋 Comment puis-je vous aider aujourd\'hui ?',
        'hello': 'Hello! 👋 How can I help you today?',
        'prix': 'Pour des informations sur les prix, consultez nos produits ou contactez notre équipe.',
        'livraison': 'Livraison gratuite à partir de 50€. Délai : 2-5 jours ouvrés. 📦',
        'retour': 'Retours gratuits sous 30 jours. Consultez notre politique de retour.',
        'paiement': 'Nous acceptons CB, PayPal, Apple Pay et Google Pay. 💳',
        'promo': 'Inscrivez-vous à notre newsletter pour recevoir des codes promo exclusifs! 🎁',
        'aide': 'Je peux vous aider avec : commandes, livraison, retours, produits, ou codes promo.',
        'default': 'Merci pour votre message. Un conseiller vous répondra dans quelques instants. ⏱️'
    },

    // Initialiser le chat
    init() {
        this.createChatButton();
        this.loadChatHistory();
        this.startPolling();
    },

    // Polling pour les nouvelles réponses admin
    startPolling() {
        setInterval(() => {
            if (this.isOpen) {
                this.checkForNewMessages();
            }
        }, 10000); // Vérifier toutes les 10 secondes (optimisé)
    },

    // Vérifier les nouveaux messages de l'admin
    checkForNewMessages() {
        // Si déjà en train de fermer, ne rien faire
        if (this.isClosing) return;

        const activeSessionId = localStorage.getItem('activeChatSession');
        if (!activeSessionId) return;

        const conversations = JSON.parse(localStorage.getItem('adminChatConversations')) || {};
        const conversation = conversations[activeSessionId];
        
        // Vérifier si la conversation a été clôturée par l'admin
        if (!conversation || conversation.active === false) {
            this.isClosing = true; // Marquer comme en fermeture
            this.showClosedMessage();
            return;
        }

        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        // Comparer avec le nombre actuel de messages affichés
        const currentMessageCount = messagesContainer.children.length - 1; // -1 pour le message de bienvenue
        const serverMessageCount = conversation.messages.length;

        if (serverMessageCount > currentMessageCount) {
            // Il y a de nouveaux messages, recharger l'affichage
            messagesContainer.innerHTML = this.getWelcomeMessage();
            this.loadPreviousMessages();
        }
    },

    // Afficher le message de conversation clôturée
    showClosedMessage() {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        // Vérifier si le message n'est pas déjà affiché
        if (document.getElementById('closingMessage')) return;

        // Afficher le message de fermeture imminente
        const closingDiv = document.createElement('div');
        closingDiv.id = 'closingMessage';
        closingDiv.style.cssText = `
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            animation: fadeIn 0.3s ease;
        `;
        closingDiv.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 12px;">⚠️</div>
            <p style="font-size: 16px; color: #fff; margin-bottom: 8px; font-weight: 700;">
                Conversation clôturée par l'équipe
            </p>
            <p style="font-size: 14px; color: #ef4444; font-weight: 600;">
                Votre ticket se ferme dans <span id="closeCountdown">5</span> secondes...
            </p>
        `;
        messagesContainer.appendChild(closingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Désactiver l'input immédiatement
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.querySelector('#liveChatWindow button[onclick*="sendMessage"]');
        
        if (chatInput) {
            chatInput.disabled = true;
            chatInput.placeholder = 'Conversation terminée';
            chatInput.style.opacity = '0.5';
        }
        if (sendButton) {
            sendButton.disabled = true;
            sendButton.style.opacity = '0.3';
            sendButton.style.cursor = 'not-allowed';
        }

        // Compte à rebours
        let countdown = 5;
        const countdownInterval = setInterval(() => {
            countdown--;
            const countdownEl = document.getElementById('closeCountdown');
            if (countdownEl) {
                countdownEl.textContent = countdown;
            }
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                this.forceCloseChat();
            }
        }, 1000);
    },

    // Fermer le chat de force et réinitialiser
    forceCloseChat() {
        const activeSessionId = localStorage.getItem('activeChatSession');
        
        // Supprimer la conversation fermée du cache local
        if (activeSessionId) {
            const conversations = JSON.parse(localStorage.getItem('adminChatConversations')) || {};
            if (conversations[activeSessionId]) {
                delete conversations[activeSessionId];
                localStorage.setItem('adminChatConversations', JSON.stringify(conversations));
            }
        }
        
        // Supprimer la session
        localStorage.removeItem('activeChatSession');
        
        // Réinitialiser le flag de fermeture
        this.isClosing = false;
        
        // Fermer la fenêtre de chat
        this.closeChat();
        
        // Afficher une notification
        this.showClosedNotification();
    },

    // Afficher une notification de fermeture
    showClosedNotification() {
        const notification = document.createElement('div');
        notification.id = 'chatClosedNotification';
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 24px;
            background: rgba(17, 17, 17, 0.98);
            border: 1px solid rgba(139, 92, 246, 0.5);
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
            z-index: 9997;
            animation: slideUp 0.3s ease;
            max-width: 320px;
        `;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <div style="font-size: 28px;">✅</div>
                <div style="font-size: 16px; font-weight: 700; color: #fff;">
                    Conversation terminée
                </div>
            </div>
            <p style="font-size: 14px; color: #888; margin-bottom: 16px; line-height: 1.5;">
                Merci d'avoir contacté notre support !<br>
                Besoin d'aide ? Démarrez une nouvelle conversation.
            </p>
            <button onclick="document.getElementById('chatClosedNotification').remove(); LiveChat.openChat();" style="
                width: 100%;
                background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                border: none;
                color: #fff;
                padding: 12px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                margin-bottom: 8px;
            " onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 20px rgba(139, 92, 246, 0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none'">
                <i class="fas fa-comments"></i> Nouvelle conversation
            </button>
            <button onclick="document.getElementById('chatClosedNotification').remove();" style="
                width: 100%;
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #888;
                padding: 10px;
                border-radius: 8px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.3s;
            " onmouseover="this.style.borderColor='rgba(255, 255, 255, 0.3)'; this.style.color='#aaa'" onmouseout="this.style.borderColor='rgba(255, 255, 255, 0.1)'; this.style.color='#888'">
                Fermer
            </button>
        `;
        document.body.appendChild(notification);

        // Auto-supprimer après 30 secondes si pas d'action
        setTimeout(() => {
            const notif = document.getElementById('chatClosedNotification');
            if (notif && notif.parentElement) {
                notif.remove();
            }
        }, 30000);
    },

    // Créer le bouton de chat
    createChatButton() {
        if (document.getElementById('liveChatButton')) return;

        const button = document.createElement('button');
        button.id = 'liveChatButton';
        button.innerHTML = '<i class="fas fa-comments"></i>';
        button.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            border: none;
            color: #fff;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
            z-index: 9999;
            transition: all 0.3s;
            animation: pulse 2s infinite;
        `;
        
        button.onmouseover = () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 6px 30px rgba(139, 92, 246, 0.6)';
        };
        button.onmouseout = () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4)';
        };
        
        button.addEventListener('click', () => this.toggleChat());
        
        document.body.appendChild(button);

        // Ajouter l'animation pulse
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4); }
                50% { box-shadow: 0 4px 30px rgba(139, 92, 246, 0.8), 0 0 0 10px rgba(139, 92, 246, 0.1); }
            }
        `;
        document.head.appendChild(style);
    },

    // Basculer le chat
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    },

    // Ouvrir le chat
    openChat() {
        this.isOpen = true;
        this.isClosing = false; // Réinitialiser le flag à chaque ouverture
        
        // Vérifier si on rouvre après une fermeture
        const existingWindow = document.getElementById('liveChatWindow');
        if (existingWindow) {
            // Supprimer complètement l'ancienne fenêtre
            existingWindow.remove();
        }

        const chatWindow = document.createElement('div');
        chatWindow.id = 'liveChatWindow';
        chatWindow.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 24px;
            width: 380px;
            height: 600px;
            max-height: calc(100vh - 140px);
            background: rgba(17, 17, 17, 0.98);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
            z-index: 9998;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: slideUp 0.3s ease;
        `;

        chatWindow.innerHTML = `
            <!-- Header -->
            <div style="
                background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                padding: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-radius: 20px 20px 0 0;
            ">
                <div>
                    <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 4px; color: #fff;">
                        💬 Support en direct
                    </h3>
                    <p style="font-size: 12px; color: rgba(255,255,255,0.8);">
                        <span class="online-indicator" style="
                            display: inline-block;
                            width: 8px;
                            height: 8px;
                            border-radius: 50%;
                            background: #10b981;
                            margin-right: 6px;
                            animation: blink 1.5s infinite;
                        "></span>
                        En ligne
                    </p>
                </div>
                <button onclick="LiveChat.closeChat()" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: #fff;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    font-size: 18px;
                    cursor: pointer;
                    transition: all 0.3s;
                ">✕</button>
            </div>

            <!-- Messages -->
            <div id="chatMessages" style="
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 12px;
            ">
                ${this.getWelcomeMessage()}
            </div>

            <!-- Input -->
            <div style="
                padding: 16px;
                border-top: 1px solid rgba(139, 92, 246, 0.2);
                background: rgba(0, 0, 0, 0.3);
            ">
                <div style="display: flex; gap: 8px;">
                    <input 
                        type="text" 
                        id="chatInput" 
                        placeholder="Tapez votre message..."
                        style="
                            flex: 1;
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid rgba(139, 92, 246, 0.3);
                            border-radius: 12px;
                            padding: 12px 16px;
                            color: #fff;
                            font-size: 14px;
                            outline: none;
                        "
                        onkeypress="if(event.key === 'Enter') LiveChat.sendMessage()"
                    >
                    <button onclick="LiveChat.sendMessage()" style="
                        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                        border: none;
                        color: #fff;
                        width: 44px;
                        height: 44px;
                        border-radius: 12px;
                        font-size: 18px;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div style="
                    margin-top: 12px;
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                ">
                    ${this.createQuickButton('Livraison')}
                    ${this.createQuickButton('Retours')}
                    ${this.createQuickButton('Promo')}
                </div>
            </div>
        `;

        document.body.appendChild(chatWindow);

        // Animation
        const animStyle = document.createElement('style');
        animStyle.textContent = `
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
            }
        `;
        document.head.appendChild(animStyle);

        // Charger les messages précédents s'il y a une session active
        this.loadPreviousMessages();

        // Focus sur l'input
        setTimeout(() => document.getElementById('chatInput')?.focus(), 100);
    },

    // Fermer le chat
    closeChat() {
        this.isOpen = false;
        const chatWindow = document.getElementById('liveChatWindow');
        if (chatWindow) {
            chatWindow.style.display = 'none';
        }
    },

    // Charger les messages précédents de la session active
    loadPreviousMessages() {
        const activeSessionId = localStorage.getItem('activeChatSession');
        if (!activeSessionId) return;

        const conversations = JSON.parse(localStorage.getItem('adminChatConversations')) || {};
        const conversation = conversations[activeSessionId];
        
        // Vérifier si la conversation est clôturée ou n'existe plus
        if (!conversation || conversation.active === false) {
            // Session fermée, créer une nouvelle session
            localStorage.removeItem('activeChatSession');
            return; // Ne pas charger les anciens messages
        }

        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        // Charger les messages de la conversation
        conversation.messages.forEach(msg => {
            const isUser = msg.sender === 'user';
            
            const messageDiv = document.createElement('div');
            messageDiv.style.cssText = `
                display: flex;
                justify-content: ${isUser ? 'flex-end' : 'flex-start'};
            `;

            messageDiv.innerHTML = `
                <div style="
                    max-width: 75%;
                    background: ${isUser ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(255, 255, 255, 0.05)'};
                    border: 1px solid ${isUser ? 'transparent' : 'rgba(255, 255, 255, 0.1)'};
                    border-radius: ${isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
                    padding: 12px 16px;
                    color: #fff;
                    font-size: 14px;
                    line-height: 1.5;
                ">
                    ${this.escapeHtml(msg.text)}
                    <div style="
                        font-size: 11px;
                        color: ${isUser ? 'rgba(255,255,255,0.7)' : '#666'};
                        margin-top: 4px;
                        text-align: right;
                    ">
                        ${new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            `;

            messagesContainer.appendChild(messageDiv);
        });

        // Scroller vers le bas
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    // Message de bienvenue
    getWelcomeMessage() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const userName = currentUser ? currentUser.name || 'Client' : 'Client';
        
        return `
            <div style="
                background: rgba(139, 92, 246, 0.1);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 12px;
                padding: 16px;
                text-align: center;
            ">
                <div style="font-size: 32px; margin-bottom: 12px;">👋</div>
                <p style="font-size: 14px; color: #fff; margin-bottom: 8px;">
                    Bonjour ${userName} !
                </p>
                <p style="font-size: 13px; color: #888;">
                    Comment puis-je vous aider aujourd'hui ?
                </p>
            </div>
        `;
    },

    // Créer un bouton rapide
    createQuickButton(text) {
        return `
            <button onclick="LiveChat.sendQuickMessage('${text}')" style="
                background: rgba(139, 92, 246, 0.1);
                border: 1px solid rgba(139, 92, 246, 0.3);
                color: #8b5cf6;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.3s;
            " onmouseover="this.style.background='rgba(139, 92, 246, 0.2)'" onmouseout="this.style.background='rgba(139, 92, 246, 0.1)'">
                ${text}
            </button>
        `;
    },

    // Envoyer un message rapide
    sendQuickMessage(text) {
        const input = document.getElementById('chatInput');
        if (input) {
            input.value = text;
            this.sendMessage();
        }
    },

    // Envoyer un message
    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input?.value.trim();
        
        if (!message) return;

        this.addMessage(message, 'user');
        input.value = '';

        // Vérifier si c'est le premier message de la conversation
        const activeSessionId = localStorage.getItem('activeChatSession');
        const conversations = JSON.parse(localStorage.getItem('adminChatConversations')) || {};
        const currentConv = conversations[activeSessionId];
        
        // Envoyer réponse auto seulement si :
        // 1. C'est le premier message (1 seul message dans la conv)
        // 2. L'admin n'a pas encore répondu (pas de message avec sender === 'admin')
        const shouldAutoReply = currentConv && 
                                currentConv.messages.length === 1 && 
                                !currentConv.messages.some(msg => msg.sender === 'admin');

        if (shouldAutoReply) {
            // Simuler une réponse du bot uniquement pour le premier message
            setTimeout(() => {
                const response = "Merci pour votre message. Un conseiller vous répondra dans quelques instants. ⏱️";
                this.addMessage(response, 'bot');
            }, 500);
        }
    },

    // Ajouter un message
    addMessage(text, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const isUser = sender === 'user';
        
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            display: flex;
            justify-content: ${isUser ? 'flex-end' : 'flex-start'};
            animation: fadeIn 0.3s ease;
        `;

        messageDiv.innerHTML = `
            <div style="
                max-width: 75%;
                background: ${isUser ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(255, 255, 255, 0.05)'};
                border: 1px solid ${isUser ? 'transparent' : 'rgba(255, 255, 255, 0.1)'};
                border-radius: ${isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
                padding: 12px 16px;
                color: #fff;
                font-size: 14px;
                line-height: 1.5;
            ">
                ${this.escapeHtml(text)}
                <div style="
                    font-size: 11px;
                    color: ${isUser ? 'rgba(255,255,255,0.7)' : '#666'};
                    margin-top: 4px;
                    text-align: right;
                ">
                    ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Sauvegarder dans l'historique du chat (pour admin)
        this.messages.push({ text, sender, timestamp: Date.now() });
        this.saveChatHistory();
        
        // Sauvegarder aussi dans les conversations admin
        this.saveToAdminConversations({ text, sender, timestamp: Date.now() });
    },
    
    // Sauvegarder dans les conversations admin
    saveToAdminConversations(message) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const userName = currentUser ? currentUser.name : 'Visiteur';
        const userEmail = currentUser ? currentUser.email : 'visiteur@example.com';
        
        // Créer ou récupérer la conversation active
        let conversations = JSON.parse(localStorage.getItem('adminChatConversations')) || {};
        let activeSessionId = localStorage.getItem('activeChatSession');
        
        if (!activeSessionId) {
            activeSessionId = 'session_' + Date.now();
            localStorage.setItem('activeChatSession', activeSessionId);
        }
        
        if (!conversations[activeSessionId]) {
            conversations[activeSessionId] = {
                id: activeSessionId,
                clientName: userName,
                clientEmail: userEmail,
                messages: [],
                unread: false,
                active: true, // Conversation active
                createdAt: Date.now()
            };
        }
        
        conversations[activeSessionId].messages.push(message);
        conversations[activeSessionId].lastUpdate = Date.now();
        
        // Si c'est un message client, marquer comme non lu pour admin
        if (message.sender === 'user') {
            conversations[activeSessionId].unread = true;
        }
        
        localStorage.setItem('adminChatConversations', JSON.stringify(conversations));
    },

    // Obtenir une réponse du bot
    getBotResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        for (const [keyword, response] of Object.entries(this.botResponses)) {
            if (lowerMessage.includes(keyword)) {
                return response;
            }
        }
        
        return this.botResponses.default;
    },

    // Sauvegarder l'historique du chat
    saveChatHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(this.messages));
    },

    // Charger l'historique du chat
    loadChatHistory() {
        const history = localStorage.getItem('chatHistory');
        if (history) {
            this.messages = JSON.parse(history);
        }
    },

    // Échapper HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialiser
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LiveChat.init());
} else {
    LiveChat.init();
}
