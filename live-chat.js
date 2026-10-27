// ========================================
// CHAT SUPPORT EN DIRECT - MONGODB SYNCHRONISÉ
// ========================================

const LiveChat = {
    isOpen: false,
    messages: [],
    isClosing: false,
    sessionId: null,
    API_BASE: window.location.origin,

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
        this.getOrCreateSession();
        this.loadChatHistory();
        this.startPolling();
    },

    // Obtenir ou créer un ID de session
    getOrCreateSession() {
        this.sessionId = localStorage.getItem('chatSessionId');
        if (!this.sessionId) {
            this.sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('chatSessionId', this.sessionId);
        }
    },

    // Polling pour les nouvelles réponses admin
    startPolling() {
        setInterval(() => {
            if (this.isOpen && !this.isClosing) {
                this.checkForNewMessages();
            }
        }, 10000); // Vérifier toutes les 10 secondes
    },

    // Vérifier les nouveaux messages de l'admin
    async checkForNewMessages() {
        if (this.isClosing || !this.sessionId) return;

        try {
            const response = await fetch(`${this.API_BASE}/api/chat/conversation/${this.sessionId}`);
            const data = await response.json();

            if (data.success && data.conversation) {
                const conversation = data.conversation;

                // Vérifier si la conversation a été clôturée
                if (!conversation.active) {
                    this.isClosing = true;
                    this.showClosedMessage();
                    return;
                }

                // Vérifier s'il y a de nouveaux messages
                if (conversation.messages.length > this.messages.length) {
                    this.messages = conversation.messages;
                    this.refreshMessages();
                }
            }
        } catch (error) {
            console.error('Erreur polling chat:', error);
        }
    },

    // Rafraîchir l'affichage des messages
    refreshMessages() {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = this.getWelcomeMessage();
        
        this.messages.forEach(msg => {
            this.displayMessage(msg.text, msg.isAdmin);
        });

        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    // Charger l'historique des messages
    async loadChatHistory() {
        if (!this.sessionId) return;

        try {
            const response = await fetch(`${this.API_BASE}/api/chat/conversation/${this.sessionId}`);
            const data = await response.json();

            if (data.success && data.conversation) {
                this.messages = data.conversation.messages || [];
                this.refreshMessages();
            }
        } catch (error) {
            console.error('Erreur chargement historique:', error);
        }
    },

    // Afficher le message de conversation clôturée
    showClosedMessage() {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        if (document.getElementById('closingMessage')) return;

        const closingDiv = document.createElement('div');
        closingDiv.id = 'closingMessage';
        closingDiv.style.cssText = `
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            animation: fadeIn 0.3s ease;
            margin-top: 12px;
        `;
        closingDiv.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 12px;">⚠️</div>
            <p style="font-size: 16px; color: #fff; margin-bottom: 8px; font-weight: 700;">
                Conversation clôturée par l'équipe
            </p>
            <p style="font-size: 14px; color: #ef4444; font-weight: 600;">
                Ce chat se ferme dans <span id="closeCountdown">5</span> secondes...
            </p>
        `;
        messagesContainer.appendChild(closingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Désactiver l'input
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.querySelector('#liveChatWindow button');
        
        if (chatInput) {
            chatInput.disabled = true;
            chatInput.placeholder = 'Conversation terminée';
            chatInput.style.opacity = '0.5';
        }
        if (sendButton) {
            sendButton.disabled = true;
            sendButton.style.opacity = '0.3';
        }

        // Compte à rebours
        let countdown = 5;
        const countdownInterval = setInterval(() => {
            countdown--;
            const countdownEl = document.getElementById('closeCountdown');
            if (countdownEl) countdownEl.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                this.forceCloseChat();
            }
        }, 1000);
    },

    // Fermer le chat et créer nouvelle session
    forceCloseChat() {
        localStorage.removeItem('chatSessionId');
        this.sessionId = null;
        this.messages = [];
        this.isClosing = false;
        this.closeChat();
        this.getOrCreateSession();
    },

    // Créer le bouton de chat
    createChatButton() {
        const button = document.createElement('button');
        button.id = 'liveChatButton';
        button.innerHTML = '<i class="fas fa-comments"></i>';
        button.onclick = () => this.toggleChat();
        button.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: #fff;
            border: none;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
            z-index: 9999;
            transition: all 0.3s ease;
        `;
        button.onmouseover = () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 6px 30px rgba(139, 92, 246, 0.6)';
        };
        button.onmouseout = () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 20px rgba(139, 92, 246, 0.4)';
        };
        document.body.appendChild(button);
    },

    // Basculer l'ouverture/fermeture du chat
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
        
        if (!document.getElementById('liveChatWindow')) {
            this.createChatWindow();
        }
        
        const chatWindow = document.getElementById('liveChatWindow');
        chatWindow.style.display = 'flex';
        chatWindow.style.animation = 'slideUp 0.3s ease';
        
        const chatButton = document.getElementById('liveChatButton');
        chatButton.style.display = 'none';
        
        this.loadChatHistory();
        
        setTimeout(() => {
            const input = document.getElementById('chatInput');
            if (input) input.focus();
        }, 300);
    },

    // Fermer le chat
    closeChat() {
        this.isOpen = false;
        const chatWindow = document.getElementById('liveChatWindow');
        if (chatWindow) {
            chatWindow.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => {
                chatWindow.style.display = 'none';
            }, 300);
        }
        
        const chatButton = document.getElementById('liveChatButton');
        chatButton.style.display = 'flex';
    },

    // Créer la fenêtre de chat
    createChatWindow() {
        const chatWindow = document.createElement('div');
        chatWindow.id = 'liveChatWindow';
        chatWindow.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 380px;
            max-height: 600px;
            background: rgba(17, 17, 17, 0.98);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 16px;
            box-shadow: 0 10px 50px rgba(0, 0, 0, 0.8);
            z-index: 9998;
            display: none;
            flex-direction: column;
            overflow: hidden;
            backdrop-filter: blur(10px);
        `;

        chatWindow.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                padding: 20px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            ">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <i class="fas fa-headset" style="font-size: 24px; color: #fff;"></i>
                    <div>
                        <div style="font-size: 18px; font-weight: 700; color: #fff;">Support Zenith</div>
                        <div style="font-size: 12px; color: rgba(255, 255, 255, 0.8);">
                            <i class="fas fa-circle" style="font-size: 8px; color: #10b981;"></i> En ligne
                        </div>
                    </div>
                </div>
                <button onclick="LiveChat.closeChat()" style="
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: #fff;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.2s;
                ">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="chatMessages" style="
                flex: 1;
                padding: 20px;
                overflow-y: auto;
                max-height: 420px;
                background: rgba(0, 0, 0, 0.3);
            ">
                ${this.getWelcomeMessage()}
            </div>
            <div style="
                padding: 16px;
                background: rgba(0, 0, 0, 0.2);
                border-top: 1px solid rgba(139, 92, 246, 0.2);
            ">
                <div style="display: flex; gap: 8px;">
                    <input
                        type="text"
                        id="chatInput"
                        placeholder="Écrivez votre message..."
                        style="
                            flex: 1;
                            padding: 12px 16px;
                            background: rgba(255, 255, 255, 0.05);
                            border: 1px solid rgba(139, 92, 246, 0.3);
                            border-radius: 8px;
                            color: #fff;
                            font-size: 14px;
                            outline: none;
                        "
                        onkeypress="if(event.key==='Enter') LiveChat.sendMessage()"
                    />
                    <button onclick="LiveChat.sendMessage()" style="
                        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                        border: none;
                        color: #fff;
                        width: 48px;
                        height: 48px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 18px;
                        transition: all 0.2s;
                    ">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(chatWindow);
    },

    // Message de bienvenue
    getWelcomeMessage() {
        return `
            <div style="
                background: rgba(139, 92, 246, 0.1);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 12px;
                padding: 16px;
                text-align: center;
                margin-bottom: 16px;
            ">
                <div style="font-size: 48px; margin-bottom: 12px;">👋</div>
                <p style="font-size: 16px; color: #fff; margin-bottom: 8px; font-weight: 700;">
                    Bienvenue sur le Support Zenith !
                </p>
                <p style="font-size: 14px; color: #888; line-height: 1.5;">
                    Notre équipe est là pour vous aider.<br>
                    Posez votre question, nous répondons rapidement !
                </p>
            </div>
        `;
    },

    // Envoyer un message
    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Afficher le message immédiatement
        this.displayMessage(message, false);
        input.value = '';

        // Envoyer au serveur
        try {
            const userInfo = {
                ip: 'client',
                userAgent: navigator.userAgent,
                language: navigator.language
            };

            const response = await fetch(`${this.API_BASE}/api/chat/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: this.sessionId,
                    message: message,
                    userInfo: userInfo
                })
            });

            const data = await response.json();

            if (data.success) {
                // Récupérer la conversation complète depuis le serveur
                const convResponse = await fetch(`${this.API_BASE}/api/chat/conversation/${this.sessionId}`);
                const convData = await convResponse.json();

                if (convData.success && convData.conversation) {
                    this.messages = convData.conversation.messages;
                    
                    // Vérifier si un admin a déjà répondu
                    const hasAdminReplied = this.messages.some(m => m.isAdmin);
                    
                    // Réponse auto SEULEMENT si :
                    // 1. C'est le premier message (ou presque)
                    // 2. Aucun admin n'a répondu
                    if (this.messages.length <= 1 && !hasAdminReplied) {
                        const lowerMsg = message.toLowerCase();
                        let autoResponse = this.botResponses.default;
                        
                        for (const [key, value] of Object.entries(this.botResponses)) {
                            if (key !== 'default' && lowerMsg.includes(key)) {
                                autoResponse = value;
                                break;
                            }
                        }

                        // Afficher la réponse auto après un court délai
                        setTimeout(() => {
                            this.displayMessage(autoResponse, true);
                        }, 1000);
                    }
                }
            }
        } catch (error) {
            console.error('Erreur envoi message:', error);
            this.displayMessage('❌ Erreur de connexion. Veuillez réessayer.', true);
        }
    },

    // Afficher un message
    displayMessage(text, isAdmin) {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            display: flex;
            justify-content: ${isAdmin ? 'flex-start' : 'flex-end'};
            margin-bottom: 12px;
            animation: fadeIn 0.3s ease;
        `;

        const bubble = document.createElement('div');
        bubble.style.cssText = `
            max-width: 75%;
            padding: 12px 16px;
            border-radius: 16px;
            font-size: 14px;
            line-height: 1.5;
            word-wrap: break-word;
            ${isAdmin 
                ? 'background: rgba(139, 92, 246, 0.15); color: #c4b5fd; border: 1px solid rgba(139, 92, 246, 0.3);'
                : 'background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: #fff;'
            }
        `;
        bubble.textContent = text;

        messageDiv.appendChild(bubble);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
};

// Initialiser au chargement de la page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LiveChat.init());
} else {
    LiveChat.init();
}
