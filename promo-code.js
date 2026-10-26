// promo-code.js - Système de codes promotionnels

// Base de données des codes promo
let promoCodes = {};

// Charger les codes depuis localStorage
function loadPromoCodesFromStorage() {
    const saved = localStorage.getItem('promoCodes');
    if (saved) {
        promoCodes = JSON.parse(saved);
    } else {
        // Codes par défaut
        promoCodes = {
            'WELCOME10': {
                code: 'WELCOME10',
                type: 'percentage',
                value: 10,
                description: 'Bienvenue - 10% de réduction',
                minAmount: 0,
                maxDiscount: null,
                expiryDate: '2027-12-31',
                usageLimit: null,
                active: true,
                icon: 'gift',
                color: '#8b5cf6'
            },
            'GAMING20': {
                code: 'GAMING20',
                type: 'percentage',
                value: 20,
                description: 'Spécial Gaming - 20% de réduction',
                minAmount: 50,
                maxDiscount: 50,
                expiryDate: '2027-12-31',
                usageLimit: 100,
                active: true,
                icon: 'gamepad',
                color: '#10b981'
            },
            'FREE15': {
                code: 'FREE15',
                type: 'fixed',
                value: 15,
                description: 'Réduction de 15€',
                minAmount: 100,
                maxDiscount: null,
                expiryDate: '2027-12-31',
                usageLimit: null,
                active: true,
                icon: 'tag',
                color: '#f59e0b'
            },
            'ZENITH50': {
                code: 'ZENITH50',
                type: 'fixed',
                value: 50,
                description: 'Méga réduction - 50€ offerts',
                minAmount: 200,
                maxDiscount: null,
                expiryDate: '2027-12-31',
                usageLimit: 50,
                active: true,
                icon: 'star',
                color: '#ef4444'
            },
            'VIP30': {
                code: 'VIP30',
                type: 'percentage',
                value: 30,
                description: 'VIP - 30% de réduction',
                minAmount: 150,
                maxDiscount: 100,
                expiryDate: '2027-12-31',
                usageLimit: 10,
                active: true,
                icon: 'crown',
                color: '#a78bfa'
            }
        };
        // Sauvegarder les codes par défaut
        localStorage.setItem('promoCodes', JSON.stringify(promoCodes));
    }
}

// Charger au démarrage
loadPromoCodesFromStorage();

// Valider un code promo
function validatePromoCode(code, cartAmount) {
    loadPromoCodesFromStorage(); // Recharger pour avoir les derniers codes
    const promo = promoCodes[code.toUpperCase()];
    
    if (!promo) {
        return {
            valid: false,
            error: 'Code promo invalide',
            errorType: 'invalid'
        };
    }
    
    if (!promo.active) {
        return {
            valid: false,
            error: 'Ce code promo n\'est plus actif',
            errorType: 'inactive'
        };
    }
    
    // Vérifier la date d'expiration
    const now = new Date();
    const expiry = new Date(promo.expiryDate);
    if (now > expiry) {
        return {
            valid: false,
            error: `Ce code a expiré le ${formatDate(expiry)}`,
            errorType: 'expired'
        };
    }
    
    // Vérifier le montant minimum
    if (cartAmount < promo.minAmount) {
        return {
            valid: false,
            error: `Montant minimum requis : ${promo.minAmount.toFixed(2)}€`,
            errorType: 'min-amount',
            minAmount: promo.minAmount
        };
    }
    
    // Vérifier le nombre d'utilisations
    const usageCount = getPromoUsageCount(code);
    if (promo.usageLimit && usageCount >= promo.usageLimit) {
        return {
            valid: false,
            error: 'Ce code a atteint sa limite d\'utilisation',
            errorType: 'usage-limit'
        };
    }
    
    // Calculer la réduction
    let discount = 0;
    if (promo.type === 'percentage') {
        discount = (cartAmount * promo.value) / 100;
        if (promo.maxDiscount && discount > promo.maxDiscount) {
            discount = promo.maxDiscount;
        }
    } else if (promo.type === 'fixed') {
        discount = promo.value;
    }
    
    return {
        valid: true,
        promo: promo,
        discount: discount,
        finalAmount: cartAmount - discount
    };
}

// Appliquer un code promo au panier
function applyPromoCode(code) {
    const cart = JSON.parse(localStorage.getItem('cart')) || { items: [], promoCode: null };
    const cartTotal = calculateCartTotal(cart.items);
    
    const validation = validatePromoCode(code, cartTotal);
    
    if (validation.valid) {
        cart.promoCode = {
            code: validation.promo.code,
            discount: validation.discount,
            appliedAt: Date.now()
        };
        
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Incrémenter le compteur d'utilisation
        incrementPromoUsage(code);
        
        return {
            success: true,
            message: `Code "${code}" appliqué ! -${validation.discount.toFixed(2)}€`,
            discount: validation.discount,
            finalAmount: validation.finalAmount
        };
    } else {
        return {
            success: false,
            message: validation.error,
            errorType: validation.errorType
        };
    }
}

// Retirer le code promo
function removePromoCode() {
    const cart = JSON.parse(localStorage.getItem('cart')) || { items: [], promoCode: null };
    cart.promoCode = null;
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Calculer le total du panier
function calculateCartTotal(items) {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Obtenir le nombre d'utilisations d'un code
function getPromoUsageCount(code) {
    const usage = JSON.parse(localStorage.getItem('promoUsage')) || {};
    return usage[code.toUpperCase()] || 0;
}

// Incrémenter le compteur d'utilisation
function incrementPromoUsage(code) {
    const usage = JSON.parse(localStorage.getItem('promoUsage')) || {};
    usage[code.toUpperCase()] = (usage[code.toUpperCase()] || 0) + 1;
    localStorage.setItem('promoUsage', JSON.stringify(usage));
}

// Formater une date
function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Créer le widget de code promo
function createPromoCodeWidget(cartTotal = 0) {
    const container = document.createElement('div');
    container.className = 'promo-code-widget';
    container.style.cssText = `
        background: linear-gradient(145deg, #1a1a1a 0%, #151515 100%);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 16px;
        padding: 24px;
        margin: 20px 0;
    `;
    
    // Vérifier si un code est déjà appliqué
    const cart = JSON.parse(localStorage.getItem('cart')) || { items: [], promoCode: null };
    const hasPromo = cart.promoCode !== null;
    
    container.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
            <div style="
                width: 48px;
                height: 48px;
                border-radius: 12px;
                background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            ">
                <i class="fas fa-ticket-alt"></i>
            </div>
            <div style="flex: 1;">
                <h3 style="
                    font-size: 18px;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 4px;
                ">Code Promo</h3>
                <p style="
                    font-size: 13px;
                    color: #888;
                ">Bénéficiez d'une réduction sur votre commande</p>
            </div>
        </div>
        
        ${hasPromo ? `
            <!-- Code appliqué -->
            <div style="
                background: rgba(16, 185, 129, 0.1);
                border: 1px solid rgba(16, 185, 129, 0.3);
                border-radius: 12px;
                padding: 16px;
                margin-bottom: 16px;
            ">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-check-circle" style="color: #10b981; font-size: 20px;"></i>
                        <div>
                            <div style="font-size: 16px; font-weight: 700; color: #10b981;">
                                ${cart.promoCode.code}
                            </div>
                            <div style="font-size: 12px; color: #888;">
                                Code promo appliqué
                            </div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 20px; font-weight: 700; color: #10b981;">
                            -${cart.promoCode.discount.toFixed(2)}€
                        </div>
                    </div>
                </div>
                <button onclick="removePromoCodeAndRefresh()" style="
                    background: transparent;
                    border: 1px solid rgba(239, 68, 68, 0.5);
                    color: #ef4444;
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-size: 12px;
                    cursor: pointer;
                    font-weight: 600;
                    transition: all 0.3s;
                    width: 100%;
                " onmouseover="this.style.background='rgba(239, 68, 68, 0.1)'" onmouseout="this.style.background='transparent'">
                    <i class="fas fa-times"></i> Retirer le code
                </button>
            </div>
        ` : `
            <!-- Formulaire de saisie -->
            <div style="display: flex; gap: 12px; margin-bottom: 16px;">
                <input 
                    type="text" 
                    id="promoCodeInput" 
                    placeholder="Entrez votre code promo" 
                    style="
                        flex: 1;
                        background: rgba(0, 0, 0, 0.3);
                        border: 1px solid rgba(139, 92, 246, 0.3);
                        border-radius: 10px;
                        padding: 14px 16px;
                        color: #fff;
                        font-size: 14px;
                        font-weight: 600;
                        text-transform: uppercase;
                        outline: none;
                        transition: all 0.3s;
                    "
                    onfocus="this.style.borderColor='rgba(139, 92, 246, 0.6)'"
                    onblur="this.style.borderColor='rgba(139, 92, 246, 0.3)'"
                >
                <button onclick="applyPromoCodeFromWidget()" style="
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                    border: none;
                    color: #fff;
                    padding: 14px 24px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s;
                    white-space: nowrap;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 24px rgba(139, 92, 246, 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
                    <i class="fas fa-check"></i> Appliquer
                </button>
            </div>
            
            <div id="promoMessage" style="
                padding: 12px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                display: none;
                margin-bottom: 16px;
            "></div>
        `}

    `;
    
    return container;
}

// Appliquer un code depuis le widget
function applyPromoCodeFromWidget() {
    const input = document.getElementById('promoCodeInput');
    const code = input.value.trim().toUpperCase();
    
    if (!code) {
        showPromoMessage('Veuillez entrer un code promo', 'error');
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart')) || { items: [] };
    const cartTotal = calculateCartTotal(cart.items);
    
    const result = applyPromoCode(code);
    
    if (result.success) {
        showPromoMessage(result.message, 'success');
        setTimeout(() => {
            location.reload();
        }, 1000);
    } else {
        showPromoMessage(result.message, 'error');
    }
}

// Retirer le code et rafraîchir
function removePromoCodeAndRefresh() {
    removePromoCode();
    if (typeof showNotification === 'function') {
        showNotification('Code promo retiré', 'info');
    }
    setTimeout(() => {
        location.reload();
    }, 500);
}

// Afficher un message dans le widget
function showPromoMessage(message, type) {
    const messageEl = document.getElementById('promoMessage');
    if (!messageEl) return;
    
    const colors = {
        success: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', text: '#10b981' },
        error: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#ef4444' },
        info: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', text: '#3b82f6' }
    };
    
    const color = colors[type] || colors.info;
    
    messageEl.style.display = 'block';
    messageEl.style.background = color.bg;
    messageEl.style.border = `1px solid ${color.border}`;
    messageEl.style.color = color.text;
    messageEl.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
}

// Export des fonctions
window.PromoCode = {
    validate: validatePromoCode,
    apply: applyPromoCode,
    remove: removePromoCode,
    createWidget: createPromoCodeWidget,
    getAll: () => {
        loadPromoCodesFromStorage();
        return promoCodes;
    },
    reload: loadPromoCodesFromStorage
};
