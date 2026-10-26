// stock-indicator.js - Système d'indicateur de stock en temps réel

// Données de stock pour chaque produit
const stockData = {
    'prod-1': { current: 12, max: 50, threshold: 5, status: 'in-stock' },
    'prod-2': { current: 8, max: 30, threshold: 5, status: 'in-stock' },
    'prod-3': { current: 15, max: 40, threshold: 5, status: 'in-stock' },
    'prod-4': { current: 10, max: 35, threshold: 5, status: 'in-stock' },
    'prod-5': { current: 20, max: 60, threshold: 5, status: 'in-stock' },
    'prod-6': { current: 5, max: 20, threshold: 5, status: 'low-stock' },
    'prod-7': { current: 12, max: 45, threshold: 5, status: 'in-stock' }
};

// Obtenir le stock d'un produit
function getStock(productId) {
    // Vérifier si le produit est présent dans allProducts ou la base globale
    let prod = null;
    if (typeof allProducts !== 'undefined' && Array.isArray(allProducts)) {
        prod = allProducts.find(p => p.id === productId || (p.aliexpress && p.aliexpress.productId === productId));
    }

    if (prod && typeof prod.stockCount === 'number') {
        const count = prod.stockCount;
        const isAvailable = (typeof prod.stock === 'boolean') ? prod.stock : true;
        return {
            current: isAvailable ? count : 0,
            max: Math.max(20, count * 2),
            threshold: 5,
            status: (!isAvailable || count <= 0) ? 'out-of-stock' : (count <= 5 ? 'low-stock' : 'in-stock')
        };
    }

    if (stockData[productId]) return stockData[productId];

    return {
        current: 10,
        max: 30,
        threshold: 5,
        status: 'in-stock'
    };
}

// Mettre à jour le stock (simuler une vente)
function decreaseStock(productId, quantity = 1) {
    const stock = stockData[productId];
    if (!stock) return false;
    
    if (stock.current >= quantity) {
        stock.current -= quantity;
        
        // Mettre à jour le statut
        if (stock.current === 0) {
            stock.status = 'out-of-stock';
        } else if (stock.current <= stock.threshold) {
            stock.status = 'low-stock';
        } else {
            stock.status = 'in-stock';
        }
        
        // Sauvegarder dans localStorage
        localStorage.setItem('stockData', JSON.stringify(stockData));
        
        return true;
    }
    
    return false;
}

// Restaurer le stock depuis localStorage
function loadStockFromStorage() {
    const savedStock = localStorage.getItem('stockData');
    if (savedStock) {
        const parsed = JSON.parse(savedStock);
        Object.assign(stockData, parsed);
    }
}

// Créer l'indicateur de stock moderne
function createStockIndicator(productId, style = 'default') {
    const stock = getStock(productId);
    const container = document.createElement('div');
    container.className = 'stock-indicator-container';
    
    if (style === 'compact') {
        return createCompactStockIndicator(stock);
    } else if (style === 'detailed') {
        return createDetailedStockIndicator(stock, productId);
    } else {
        return createDefaultStockIndicator(stock);
    }
}

// Style par défaut - Badge simple
function createDefaultStockIndicator(stock) {
    const container = document.createElement('div');
    container.className = 'stock-indicator-default';
    
    let color, bgColor, icon, text, animation;
    
    switch (stock.status) {
        case 'in-stock':
            color = '#10b981';
            bgColor = 'rgba(16, 185, 129, 0.1)';
            icon = 'check-circle';
            text = `En stock - ${stock.current} unités`;
            animation = 'pulse';
            break;
        case 'low-stock':
            color = '#f59e0b';
            bgColor = 'rgba(245, 158, 11, 0.1)';
            icon = 'exclamation-circle';
            text = `Stock limité - ${stock.current} restants`;
            animation = 'pulse-fast';
            break;
        case 'out-of-stock':
            color = '#ef4444';
            bgColor = 'rgba(239, 68, 68, 0.1)';
            icon = 'times-circle';
            text = 'Rupture de stock';
            animation = 'none';
            break;
    }
    
    container.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: ${bgColor};
        border: 1px solid ${color}40;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        color: ${color};
        animation: ${animation} 2s infinite;
        margin: 12px 0;
    `;
    
    container.innerHTML = `
        <i class="fas fa-${icon}" style="font-size: 14px;"></i>
        <span>${text}</span>
    `;
    
    return container;
}

// Style compact - Pour les cartes produits
function createCompactStockIndicator(stock) {
    const container = document.createElement('div');
    container.className = 'stock-indicator-compact';
    
    let color, icon;
    
    switch (stock.status) {
        case 'in-stock':
            color = '#10b981';
            icon = 'check';
            break;
        case 'low-stock':
            color = '#f59e0b';
            icon = 'exclamation';
            break;
        case 'out-of-stock':
            color = '#ef4444';
            icon = 'times';
            break;
    }
    
    container.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        color: ${color};
    `;
    
    container.innerHTML = `
        <span style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${color};
            display: block;
            ${stock.status !== 'out-of-stock' ? 'animation: pulse 2s infinite;' : ''}
        "></span>
        <span>${stock.current > 0 ? `${stock.current} en stock` : 'Rupture'}</span>
    `;
    
    return container;
}

// Style détaillé - Pour les pages produits
function createDetailedStockIndicator(stock, productId) {
    const container = document.createElement('div');
    container.className = 'stock-indicator-detailed';
    
    let statusColor, statusBg, statusText, statusIcon, barColor;
    
    switch (stock.status) {
        case 'in-stock':
            statusColor = '#10b981';
            statusBg = 'rgba(16, 185, 129, 0.1)';
            statusText = 'Disponible';
            statusIcon = 'check-circle';
            barColor = '#10b981';
            break;
        case 'low-stock':
            statusColor = '#f59e0b';
            statusBg = 'rgba(245, 158, 11, 0.1)';
            statusText = 'Stock limité';
            statusIcon = 'exclamation-triangle';
            barColor = '#f59e0b';
            break;
        case 'out-of-stock':
            statusColor = '#ef4444';
            statusBg = 'rgba(239, 68, 68, 0.1)';
            statusText = 'Indisponible';
            statusIcon = 'times-circle';
            barColor = '#ef4444';
            break;
    }
    
    const percentage = stock.max > 0 ? (stock.current / stock.max) * 100 : 0;
    
    container.style.cssText = `
        background: ${statusBg};
        border: 1px solid ${statusColor}40;
        border-radius: 12px;
        padding: 20px;
        margin: 20px 0;
    `;
    
    container.innerHTML = `
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-${statusIcon}" style="color: ${statusColor}; font-size: 20px;"></i>
                <div>
                    <div style="font-size: 18px; font-weight: 700; color: ${statusColor}; margin-bottom: 2px;">
                        ${statusText}
                    </div>
                    <div style="font-size: 13px; color: #888;">
                        ${stock.current} / ${stock.max} unités disponibles
                    </div>
                </div>
            </div>
            ${stock.status === 'low-stock' ? `
                <div style="
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: #fff;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    animation: pulse-fast 1.5s infinite;
                ">
                    <i class="fas fa-fire"></i> Dépêchez-vous !
                </div>
            ` : ''}
        </div>
        
        <!-- Barre de progression -->
        <div style="
            background: rgba(0, 0, 0, 0.2);
            height: 8px;
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 12px;
        ">
            <div style="
                background: linear-gradient(90deg, ${barColor}, ${barColor}dd);
                height: 100%;
                width: ${percentage}%;
                border-radius: 4px;
                transition: width 0.5s ease;
                ${stock.status !== 'out-of-stock' ? 'animation: shimmer 2s infinite;' : ''}
            "></div>
        </div>
        
        <!-- Infos additionnelles -->
        <div style="display: flex; gap: 20px; font-size: 12px; color: #999;">
            ${stock.status === 'in-stock' ? `
                <div>
                    <i class="fas fa-shipping-fast" style="color: ${statusColor};"></i>
                    Expédition sous 24h
                </div>
            ` : ''}
            ${stock.status === 'low-stock' ? `
                <div>
                    <i class="fas fa-clock" style="color: ${statusColor};"></i>
                    Plus que ${stock.current} disponibles
                </div>
            ` : ''}
            ${stock.status === 'out-of-stock' ? `
                <div>
                    <i class="fas fa-bell" style="color: ${statusColor};"></i>
                    <a href="#" onclick="notifyMeWhenAvailable('${productId}'); return false;" style="color: ${statusColor}; text-decoration: none;">
                        Me prévenir quand disponible
                    </a>
                </div>
            ` : ''}
        </div>
    `;
    
    return container;
}

// Ajouter les animations CSS
function injectStockStyles() {
    if (document.getElementById('stock-indicator-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'stock-indicator-styles';
    style.textContent = `
        @keyframes pulse {
            0%, 100% {
                box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
            }
            50% {
                box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
            }
        }
        
        @keyframes pulse-fast {
            0%, 100% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.05);
                opacity: 0.9;
            }
        }
        
        @keyframes shimmer {
            0% {
                background-position: -100% 0;
            }
            100% {
                background-position: 200% 0;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Notifier quand disponible
function notifyMeWhenAvailable(productId) {
    const notifications = JSON.parse(localStorage.getItem('stockNotifications')) || [];
    
    if (!notifications.includes(productId)) {
        notifications.push(productId);
        localStorage.setItem('stockNotifications', JSON.stringify(notifications));
        
        if (typeof showNotification === 'function') {
            showNotification('Vous serez notifié dès que le produit sera de nouveau disponible !', 'success');
        } else {
            alert('Vous serez notifié dès que le produit sera de nouveau disponible !');
        }
    } else {
        if (typeof showNotification === 'function') {
            showNotification('Vous êtes déjà inscrit aux notifications pour ce produit.', 'info');
        } else {
            alert('Vous êtes déjà inscrit aux notifications pour ce produit.');
        }
    }
}

// Désactiver la simulation de changements de stock pour les performances
/*
function simulateStockChanges() {
    setInterval(() => {
        // Choisir un produit aléatoire
        const productIds = Object.keys(stockData);
        const randomProduct = productIds[Math.floor(Math.random() * productIds.length)];
        
        // 30% de chance de vendre une unité
        if (Math.random() < 0.3) {
            const stock = stockData[randomProduct];
            if (stock.current > 0) {
                decreaseStock(randomProduct, 1);
                console.log(`📦 Stock mis à jour: ${randomProduct} - ${stock.current} restants`);
            }
        }
        
        // 10% de chance de réapprovisionner
        if (Math.random() < 0.1) {
            const stock = stockData[randomProduct];
            if (stock.current < stock.max) {
                const restockAmount = Math.min(5, stock.max - stock.current);
                stock.current += restockAmount;
                
                // Mettre à jour le statut
                if (stock.current > stock.threshold) {
                    stock.status = 'in-stock';
                } else if (stock.current > 0) {
                    stock.status = 'low-stock';
                }
                
                localStorage.setItem('stockData', JSON.stringify(stockData));
                console.log(`✅ Réapprovisionnement: ${randomProduct} +${restockAmount} unités`);
            }
        }
    }, 5000); // Toutes les 5 secondes
}
*/

// Mettre à jour tous les indicateurs de stock sur la page
function refreshStockIndicators() {
    const indicators = document.querySelectorAll('[data-stock-product]');
    indicators.forEach(indicator => {
        const productId = indicator.getAttribute('data-stock-product');
        const style = indicator.getAttribute('data-stock-style') || 'default';
        const newIndicator = createStockIndicator(productId, style);
        indicator.innerHTML = '';
        indicator.appendChild(newIndicator);
    });
}

// Initialiser le système de stock
function initStockSystem(enableSimulation = false) {
    // Charger le stock depuis localStorage
    loadStockFromStorage();
    
    // Injecter les styles
    injectStockStyles();
    
    // Activer la simulation si demandé (désactivé pour performances)
    if (false && enableSimulation) {
        simulateStockChanges();
        
        // Actualiser l'affichage toutes les 30 secondes (optimisé)
        setInterval(refreshStockIndicators, 30000);
    }
}

// Auto-initialisation
document.addEventListener('DOMContentLoaded', function() {
    initStockSystem(false); // Mettre à true pour activer la simulation
});

// Export pour utilisation globale
window.StockIndicator = {
    get: getStock,
    decrease: decreaseStock,
    create: createStockIndicator,
    refresh: refreshStockIndicators,
    init: initStockSystem,
    notify: notifyMeWhenAvailable
};
