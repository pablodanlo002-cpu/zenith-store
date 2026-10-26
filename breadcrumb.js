// ===== SYSTÈME DE BREADCRUMB ZENITH STORE =====

// Structure des pages et leur breadcrumb
const breadcrumbConfig = {
    'index.html': [
        { name: 'Accueil', url: 'index.html', active: true }
    ],
    'produit.html': [
        { name: 'Accueil', url: 'index.html' },
        { name: 'Écouteurs', url: 'index.html#products' },
        { name: 'FiiO JD1 IEM Gaming', url: 'produit.html', active: true }
    ],
    'produit-casque.html': [
        { name: 'Accueil', url: 'index.html' },
        { name: 'Casques', url: 'index.html#products' },
        { name: 'BINNUNE Casque Gaming', url: 'produit-casque.html', active: true }
    ],
    'produit-souris.html': [
        { name: 'Accueil', url: 'index.html' },
        { name: 'Souris', url: 'index.html#products' },
        { name: 'AJAZZ AJ139 PRO', url: 'produit-souris.html', active: true }
    ],
    'produit-clavier.html': [
        { name: 'Accueil', url: 'index.html' },
        { name: 'Claviers', url: 'index.html#products' },
        { name: 'AJAZZ AK820 PRO', url: 'produit-clavier.html', active: true }
    ],
    'produit-tapis.html': [
        { name: 'Accueil', url: 'index.html' },
        { name: 'Tapis', url: 'index.html#products' },
        { name: 'Tapis XXL Gaming RGB', url: 'produit-tapis.html', active: true }
    ],
    'produit-ecran.html': [
        { name: 'Accueil', url: 'index.html' },
        { name: 'Écrans', url: 'index.html#products' },
        { name: 'Écran Gaming 27" 240Hz', url: 'produit-ecran.html', active: true }
    ],
    'produit-accessoire.html': [
        { name: 'Accueil', url: 'index.html' },
        { name: 'Accessoires', url: 'index.html#products' },
        { name: 'Stream Deck Mini', url: 'produit-accessoire.html', active: true }
    ],
    'panier.html': [
        { name: 'Accueil', url: 'index.html' },
        { name: 'Panier', url: 'panier.html', active: true }
    ],
    'checkout.html': [
        { name: 'Accueil', url: 'index.html' },
        { name: 'Panier', url: 'panier.html' },
        { name: 'Paiement', url: 'checkout.html', active: true }
    ],
    'compte.html': [
        { name: 'Accueil', url: 'index.html' },
        { name: 'Mon compte', url: 'compte.html', active: true }
    ],
    'commandes.html': [
        { name: 'Accueil', url: 'index.html' },
        { name: 'Mon compte', url: 'compte.html' },
        { name: 'Mes commandes', url: 'commandes.html', active: true }
    ],
    'favoris.html': [
        { name: 'Accueil', url: 'index.html' },
        { name: 'Mes favoris', url: 'favoris.html', active: true }
    ],
    'admin.html': [
        { name: 'Accueil', url: 'index.html' },
        { name: 'Panel Admin', url: 'admin.html', active: true }
    ],
    'contact.html': [
        { name: 'Accueil', url: 'index.html' },
        { name: 'Contact', url: 'contact.html', active: true }
    ],
    'a-propos.html': [
        { name: 'Accueil', url: 'index.html' },
        { name: 'À propos', url: 'a-propos.html', active: true }
    ]
};

// Créer le breadcrumb HTML
function createBreadcrumb(items) {
    const breadcrumb = document.createElement('nav');
    breadcrumb.className = 'breadcrumb';
    breadcrumb.setAttribute('aria-label', 'Breadcrumb');
    
    const ol = document.createElement('ol');
    ol.className = 'breadcrumb-list';
    
    items.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'breadcrumb-item';
        
        if (item.active) {
            li.classList.add('active');
            li.setAttribute('aria-current', 'page');
            li.innerHTML = `<span>${item.name}</span>`;
        } else {
            li.innerHTML = `<a href="${item.url}">${item.name}</a>`;
        }
        
        ol.appendChild(li);
        
        // Ajouter le séparateur sauf pour le dernier élément
        if (index < items.length - 1) {
            const separator = document.createElement('li');
            separator.className = 'breadcrumb-separator';
            separator.innerHTML = '<i class="fas fa-chevron-right"></i>';
            ol.appendChild(separator);
        }
    });
    
    breadcrumb.appendChild(ol);
    return breadcrumb;
}

// Insérer le breadcrumb dans la page
function insertBreadcrumb() {
    // Déterminer la page actuelle
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Récupérer le breadcrumb config
    const items = breadcrumbConfig[currentPage];
    
    // Si pas de config ou page d'accueil, ne rien afficher
    if (!items || currentPage === 'index.html' || items.length <= 1) {
        return;
    }
    
    // Créer le breadcrumb
    const breadcrumb = createBreadcrumb(items);
    
    // Trouver où l'insérer (après le header)
    const header = document.querySelector('.header');
    if (header && header.nextElementSibling) {
        header.parentNode.insertBefore(breadcrumb, header.nextElementSibling);
    }
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', function() {
    insertBreadcrumb();
});

// Injecter les styles CSS
const breadcrumbStyle = document.createElement('style');
breadcrumbStyle.textContent = `
    /* BREADCRUMB */
    .breadcrumb {
        background: var(--bg-secondary, #111);
        border-bottom: 1px solid var(--border-color, #1a1a1a);
        padding: 1rem 0;
        position: sticky;
        top: 60px;
        z-index: 99;
        backdrop-filter: blur(10px);
    }
    
    .breadcrumb-list {
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 2rem;
        list-style: none;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        flex-wrap: wrap;
    }
    
    .breadcrumb-item {
        font-size: 14px;
        display: flex;
        align-items: center;
    }
    
    .breadcrumb-item a {
        color: var(--text-secondary, #aaa);
        text-decoration: none;
        transition: color 0.2s;
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
    }
    
    .breadcrumb-item a:hover {
        color: var(--primary-color, #8b5cf6);
        background: var(--hover-bg, rgba(139, 92, 246, 0.1));
    }
    
    .breadcrumb-item.active span {
        color: var(--text-primary, #fff);
        font-weight: 600;
        padding: 0.25rem 0.5rem;
    }
    
    .breadcrumb-separator {
        color: var(--text-tertiary, #666);
        font-size: 10px;
        display: flex;
        align-items: center;
    }
    
    /* ANIMATION D'ENTRÉE */
    .breadcrumb {
        animation: breadcrumbSlideIn 0.3s ease-out;
    }
    
    @keyframes breadcrumbSlideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* RESPONSIVE */
    @media (max-width: 768px) {
        .breadcrumb-list {
            padding: 0 1rem;
            font-size: 13px;
        }
        
        .breadcrumb-item a,
        .breadcrumb-item.active span {
            padding: 0.25rem;
        }
    }
    
    /* MODE CLAIR */
    [data-theme="light"] .breadcrumb {
        background: var(--bg-secondary, #f9fafb);
        border-bottom-color: var(--border-color, #e5e7eb);
    }
    
    [data-theme="light"] .breadcrumb-item a {
        color: var(--text-secondary, #6b7280);
    }
    
    [data-theme="light"] .breadcrumb-item a:hover {
        color: var(--primary-color, #8b5cf6);
    }
    
    [data-theme="light"] .breadcrumb-item.active span {
        color: var(--text-primary, #0a0a0a);
    }
    
    [data-theme="light"] .breadcrumb-separator {
        color: var(--text-tertiary, #9ca3af);
    }
`;
document.head.appendChild(breadcrumbStyle);

// Export pour utilisation externe
window.insertBreadcrumb = insertBreadcrumb;
