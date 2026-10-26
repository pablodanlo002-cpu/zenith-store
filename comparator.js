// ===== SYSTÈME DE COMPARATEUR DE PRODUITS ZENITH STORE =====

// Récupérer la liste de comparaison
function getComparison() {
    return JSON.parse(localStorage.getItem('comparison')) || [];
}

// Sauvegarder la liste de comparaison
function saveComparison(comparison) {
    localStorage.setItem('comparison', JSON.stringify(comparison));
    updateComparisonCount();
}

// Ajouter au comparateur
function addToComparison(productId, productName, productPrice, productImage, productUrl, productSpecs) {
    const comparison = getComparison();
    
    // Limite de 3 produits
    if (comparison.length >= 3) {
        showNotification('Limite atteinte', 'Tu peux comparer maximum 3 produits. Retire-en un pour en ajouter un autre.', 'warning');
        return false;
    }
    
    // Vérifier si déjà dans la comparaison
    if (comparison.find(item => item.id === productId)) {
        showNotification('Déjà dans le comparateur', productName + ' est déjà dans ton comparateur', 'info');
        return false;
    }
    
    const product = {
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
        url: productUrl,
        specs: productSpecs || {},
        addedAt: new Date().toISOString()
    };
    
    comparison.push(product);
    saveComparison(comparison);
    
    showNotification('Ajouté au comparateur', productName + ' a été ajouté au comparateur (' + comparison.length + '/3)', 'success');
    return true;
}

// Retirer du comparateur
function removeFromComparison(productId) {
    let comparison = getComparison();
    const product = comparison.find(item => item.id === productId);
    
    comparison = comparison.filter(item => item.id !== productId);
    saveComparison(comparison);
    
    if (product) {
        showNotification('Retiré du comparateur', product.name + ' a été retiré du comparateur', 'success');
    }
    
    return true;
}

// Vérifier si un produit est dans le comparateur
function isInComparison(productId) {
    const comparison = getComparison();
    return comparison.some(item => item.id === productId);
}

// Toggle comparaison
function toggleComparison(productId, productName, productPrice, productImage, productUrl, productSpecs) {
    if (isInComparison(productId)) {
        removeFromComparison(productId);
        return false;
    } else {
        return addToComparison(productId, productName, productPrice, productImage, productUrl, productSpecs);
    }
}

// Mettre à jour le compteur
function updateComparisonCount() {
    const comparison = getComparison();
    const badges = document.querySelectorAll('.comparison-count');
    
    badges.forEach(badge => {
        if (comparison.length > 0) {
            badge.textContent = comparison.length;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

// Vider le comparateur
function clearComparison() {
    localStorage.removeItem('comparison');
    updateComparisonCount();
    showNotification('Comparateur vidé', 'Tous les produits ont été retirés', 'success');
}

// Créer le bouton de comparaison
function createComparisonButton(productId, productName, productPrice, productImage, productUrl, productSpecs) {
    const isComparing = isInComparison(productId);
    
    const button = document.createElement('button');
    button.className = 'comparison-btn' + (isComparing ? ' active' : '');
    button.innerHTML = '<i class="fas fa-' + (isComparing ? 'check-' : '') + 'balance-scale"></i>';
    button.setAttribute('data-product-id', productId);
    button.setAttribute('title', isComparing ? 'Retirer du comparateur' : 'Ajouter au comparateur');
    button.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isNowComparing = toggleComparison(productId, productName, productPrice, productImage, productUrl, productSpecs);
        
        // Update button state
        if (isNowComparing) {
            button.classList.add('active');
            button.querySelector('i').className = 'fas fa-check-balance-scale';
            button.setAttribute('title', 'Retirer du comparateur');
        } else {
            button.classList.remove('active');
            button.querySelector('i').className = 'fas fa-balance-scale';
            button.setAttribute('title', 'Ajouter au comparateur');
        }
    };
    
    return button;
}

// Initialiser
document.addEventListener('DOMContentLoaded', function() {
    updateComparisonCount();
});

// Injecter les styles CSS
const comparisonStyle = document.createElement('style');
comparisonStyle.textContent = `
    /* BOUTON COMPARAISON */
    .comparison-btn {
        position: absolute;
        top: 4.2rem;
        right: 1rem;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(17, 17, 17, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid #2a2a2a;
        color: #fff;
        font-size: 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 10;
    }
    
    .comparison-btn:hover {
        background: rgba(139, 92, 246, 0.2);
        border-color: #8b5cf6;
        transform: scale(1.1);
    }
    
    .comparison-btn.active {
        background: rgba(139, 92, 246, 0.2);
        border-color: #8b5cf6;
        color: #8b5cf6;
    }
    
    .comparison-btn.active:hover {
        background: rgba(139, 92, 246, 0.3);
    }
    
    /* BADGE COMPTEUR */
    .comparison-count {
        position: absolute;
        top: -6px;
        right: -6px;
        background: #8b5cf6;
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        min-width: 18px;
        height: 18px;
        border-radius: 10px;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 0 5px;
        border: 2px solid #0a0a0a;
    }
    
    /* LIEN COMPARATEUR DANS LE HEADER */
    .comparison-link {
        position: relative;
        color: #fff;
        text-decoration: none;
        font-size: 20px;
        padding: 8px;
        border-radius: 8px;
        transition: 0.2s;
    }
    
    .comparison-link:hover {
        color: #8b5cf6;
        background: rgba(139, 92, 246, 0.1);
    }
    
    /* MODE CLAIR */
    [data-theme="light"] .comparison-btn {
        background: rgba(255, 255, 255, 0.9);
        border-color: #e5e7eb;
        color: #0a0a0a;
    }
    
    [data-theme="light"] .comparison-btn:hover {
        background: rgba(139, 92, 246, 0.1);
    }
    
    [data-theme="light"] .comparison-btn.active {
        background: rgba(139, 92, 246, 0.1);
        color: #8b5cf6;
    }
`;
document.head.appendChild(comparisonStyle);
