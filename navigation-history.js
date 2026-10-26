// navigation-history.js - Système d'historique de navigation

// Initialiser l'historique de navigation
function initNavigationHistory() {
    // Récupérer l'historique existant
    let history = JSON.parse(localStorage.getItem('navigationHistory')) || [];
    
    // Obtenir les informations de la page actuelle
    const currentPage = {
        url: window.location.pathname + window.location.search,
        title: document.title,
        timestamp: Date.now(),
        pageName: getPageName()
    };
    
    // Éviter les doublons consécutifs
    if (history.length > 0) {
        const lastPage = history[history.length - 1];
        if (lastPage.url === currentPage.url) {
            return; // Ne pas ajouter si c'est la même page
        }
    }
    
    // Ajouter la page actuelle
    history.push(currentPage);
    
    // Limiter à 20 dernières pages
    if (history.length > 20) {
        history = history.slice(-20);
    }
    
    // Sauvegarder
    localStorage.setItem('navigationHistory', JSON.stringify(history));
}

// Obtenir le nom de la page actuelle
function getPageName() {
    const path = window.location.pathname;
    const search = window.location.search;
    
    // Pages spécifiques
    if (path.includes('index.html') || path === '/' || path === '') {
        return 'Accueil';
    }
    if (path.includes('produit.html')) {
        const urlParams = new URLSearchParams(search);
        const productId = urlParams.get('id');
        if (productId && typeof allProducts !== 'undefined') {
            const product = allProducts.find(p => p.id === productId);
            if (product) {
                return product.name;
            }
        }
        return 'Produit';
    }
    if (path.includes('panier.html')) return 'Panier';
    if (path.includes('favoris.html')) return 'Favoris';
    if (path.includes('comparateur.html')) return 'Comparateur';
    if (path.includes('compte.html')) return 'Mon Compte';
    if (path.includes('admin.html')) return 'Panel Admin';
    if (path.includes('login.html')) return 'Connexion';
    if (path.includes('register.html')) return 'Inscription';
    
    // Par défaut, utiliser le titre de la page
    return document.title.split('|')[0].trim();
}

// Obtenir l'historique complet
function getNavigationHistory() {
    return JSON.parse(localStorage.getItem('navigationHistory')) || [];
}

// Effacer l'historique
function clearNavigationHistory() {
    localStorage.removeItem('navigationHistory');
}

// Obtenir les X dernières pages visitées
function getRecentPages(count = 5) {
    const history = getNavigationHistory();
    return history.slice(-count).reverse();
}

// Créer le widget d'historique de navigation
function createNavigationHistoryWidget() {
    const history = getRecentPages(5);
    
    if (history.length === 0) {
        return null;
    }
    
    const widget = document.createElement('div');
    widget.className = 'navigation-history-widget';
    widget.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: linear-gradient(145deg, #1a1a1a 0%, #151515 100%);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 16px;
        padding: 20px;
        max-width: 320px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        z-index: 999;
        backdrop-filter: blur(10px);
        transform: translateX(calc(100% + 24px));
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    
    // Bouton pour toggle
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'history-toggle-btn';
    toggleBtn.innerHTML = '<i class="fas fa-history"></i>';
    toggleBtn.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        border: none;
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
        z-index: 1000;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    toggleBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1) rotate(15deg)';
        this.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.6)';
    });
    
    toggleBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1) rotate(0deg)';
        this.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.4)';
    });
    
    let isOpen = false;
    
    toggleBtn.addEventListener('click', function() {
        isOpen = !isOpen;
        if (isOpen) {
            widget.style.transform = 'translateX(0)';
            toggleBtn.style.transform = 'scale(0.9)';
            toggleBtn.style.opacity = '0.5';
        } else {
            widget.style.transform = 'translateX(calc(100% + 24px))';
            toggleBtn.style.transform = 'scale(1)';
            toggleBtn.style.opacity = '1';
        }
    });
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(139, 92, 246, 0.2);
    `;
    header.innerHTML = `
        <h3 style="
            font-size: 16px;
            font-weight: 700;
            color: #fff;
            margin: 0;
        ">
            <i class="fas fa-history" style="color: #8b5cf6; margin-right: 8px;"></i>
            Historique
        </h3>
        <button onclick="clearNavigationHistory(); location.reload();" style="
            background: transparent;
            border: 1px solid rgba(239, 68, 68, 0.5);
            color: #ef4444;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 600;
        " onmouseover="this.style.background='rgba(239, 68, 68, 0.1)'" onmouseout="this.style.background='transparent'">
            <i class="fas fa-trash"></i> Effacer
        </button>
    `;
    
    // Liste des pages
    const list = document.createElement('div');
    list.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 8px;
    `;
    
    history.forEach((page, index) => {
        const isCurrentPage = page.url === (window.location.pathname + window.location.search);
        
        const item = document.createElement('a');
        item.href = page.url;
        item.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: ${isCurrentPage ? 'rgba(139, 92, 246, 0.15)' : 'rgba(26, 26, 26, 0.5)'};
            border: 1px solid ${isCurrentPage ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.1)'};
            border-radius: 10px;
            text-decoration: none;
            color: #fff;
            transition: all 0.3s;
            position: relative;
        `;
        
        // Temps relatif
        const timeAgo = getTimeAgo(page.timestamp);
        
        item.innerHTML = `
            <div style="
                width: 32px;
                height: 32px;
                border-radius: 8px;
                background: ${isCurrentPage ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(139, 92, 246, 0.2)'};
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                color: ${isCurrentPage ? '#fff' : '#8b5cf6'};
                font-size: 14px;
            ">
                ${getPageIcon(page.pageName)}
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="
                    font-size: 13px;
                    font-weight: 600;
                    color: ${isCurrentPage ? '#fff' : '#e0e0e0'};
                    margin-bottom: 2px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                ">${page.pageName}</div>
                <div style="
                    font-size: 10px;
                    color: #737373;
                ">${timeAgo}</div>
            </div>
            ${isCurrentPage ? `
                <div style="
                    background: #10b981;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    flex-shrink: 0;
                "></div>
            ` : ''}
        `;
        
        if (!isCurrentPage) {
            item.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(139, 92, 246, 0.2)';
                this.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                this.style.transform = 'translateX(-4px)';
            });
            
            item.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(26, 26, 26, 0.5)';
                this.style.borderColor = 'rgba(139, 92, 246, 0.1)';
                this.style.transform = 'translateX(0)';
            });
        }
        
        list.appendChild(item);
    });
    
    widget.appendChild(header);
    widget.appendChild(list);
    
    document.body.appendChild(widget);
    document.body.appendChild(toggleBtn);
    
    return { widget, toggleBtn };
}

// Obtenir l'icône selon le type de page
function getPageIcon(pageName) {
    if (pageName.includes('Accueil')) return '<i class="fas fa-home"></i>';
    if (pageName.includes('Panier')) return '<i class="fas fa-shopping-cart"></i>';
    if (pageName.includes('Favoris')) return '<i class="fas fa-heart"></i>';
    if (pageName.includes('Comparateur')) return '<i class="fas fa-balance-scale"></i>';
    if (pageName.includes('Compte')) return '<i class="fas fa-user"></i>';
    if (pageName.includes('Admin')) return '<i class="fas fa-shield-alt"></i>';
    if (pageName.includes('Connexion')) return '<i class="fas fa-sign-in-alt"></i>';
    if (pageName.includes('Inscription')) return '<i class="fas fa-user-plus"></i>';
    return '<i class="fas fa-file"></i>';
}

// Calculer le temps écoulé
function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
    if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)} j`;
    
    return new Date(timestamp).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

// Initialiser automatiquement au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Enregistrer la page actuelle dans l'historique
    initNavigationHistory();
    
    // Créer le widget d'historique (optionnel - peut être activé/désactivé)
    const shouldShowWidget = localStorage.getItem('showNavigationHistory') !== 'false';
    if (shouldShowWidget) {
        createNavigationHistoryWidget();
    }
});

// Export des fonctions pour utilisation externe
window.NavigationHistory = {
    init: initNavigationHistory,
    get: getNavigationHistory,
    getRecent: getRecentPages,
    clear: clearNavigationHistory,
    createWidget: createNavigationHistoryWidget
};
