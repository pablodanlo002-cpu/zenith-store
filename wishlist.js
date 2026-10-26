// ===== SYSTÈME DE WISHLIST ZENITH STORE =====

// Récupérer la wishlist
function getWishlist() {
    return JSON.parse(localStorage.getItem('wishlist')) || [];
}

// Sauvegarder la wishlist
function saveWishlist(wishlist) {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
}

// Ajouter aux favoris
function addToWishlist(productId, productName, productPrice, productImage, productUrl) {
    const wishlist = getWishlist();
    
    // Vérifier si déjà dans la wishlist
    if (wishlist.find(item => item.id === productId)) {
        showNotification('Déjà dans les favoris', productName + ' est déjà dans tes favoris', 'info');
        return false;
    }
    
    const product = {
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
        url: productUrl,
        addedAt: new Date().toISOString()
    };
    
    wishlist.push(product);
    saveWishlist(wishlist);
    
    showNotification('Ajouté aux favoris', productName + ' a été ajouté à tes favoris', 'success');
    return true;
}

// Retirer des favoris
function removeFromWishlist(productId) {
    let wishlist = getWishlist();
    const product = wishlist.find(item => item.id === productId);
    
    wishlist = wishlist.filter(item => item.id !== productId);
    saveWishlist(wishlist);
    
    if (product) {
        showNotification('Retiré des favoris', product.name + ' a été retiré de tes favoris', 'success');
    }
    
    return true;
}

// Vérifier si un produit est dans la wishlist
function isInWishlist(productId) {
    const wishlist = getWishlist();
    return wishlist.some(item => item.id === productId);
}

// Toggle wishlist (ajouter ou retirer)
function toggleWishlist(productId, productName, productPrice, productImage, productUrl) {
    if (isInWishlist(productId)) {
        removeFromWishlist(productId);
        return false;
    } else {
        addToWishlist(productId, productName, productPrice, productImage, productUrl);
        return true;
    }
}

// Mettre à jour le compteur dans le header
function updateWishlistCount() {
    const wishlist = getWishlist();
    const badges = document.querySelectorAll('.wishlist-count');
    
    badges.forEach(badge => {
        if (wishlist.length > 0) {
            badge.textContent = wishlist.length;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

// Créer le bouton wishlist pour les cartes produits
function createWishlistButton(productId, productName, productPrice, productImage, productUrl) {
    const isLiked = isInWishlist(productId);
    
    const button = document.createElement('button');
    button.className = 'wishlist-btn' + (isLiked ? ' active' : '');
    button.innerHTML = '<i class="' + (isLiked ? 'fas' : 'far') + ' fa-heart"></i>';
    button.setAttribute('data-product-id', productId);
    button.setAttribute('title', isLiked ? 'Retirer des favoris' : 'Ajouter aux favoris');
    button.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const isNowLiked = toggleWishlist(productId, productName, productPrice, productImage, productUrl);
        
        // Update button state
        if (isNowLiked) {
            button.classList.add('active');
            button.querySelector('i').className = 'fas fa-heart';
            button.setAttribute('title', 'Retirer des favoris');
        } else {
            button.classList.remove('active');
            button.querySelector('i').className = 'far fa-heart';
            button.setAttribute('title', 'Ajouter aux favoris');
        }
        
        // Animation
        button.classList.add('pop');
        setTimeout(() => button.classList.remove('pop'), 300);
    };
    
    return button;
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    updateWishlistCount();
});

// Injecter les styles CSS
const wishlistStyle = document.createElement('style');
wishlistStyle.textContent = `
    /* WISHLIST BUTTON */
    .wishlist-btn {
        position: absolute;
        top: 1rem;
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
    
    .wishlist-btn:hover {
        background: rgba(139, 92, 246, 0.2);
        border-color: #8b5cf6;
        transform: scale(1.1);
    }
    
    .wishlist-btn.active {
        background: rgba(239, 68, 68, 0.2);
        border-color: #ef4444;
        color: #ef4444;
    }
    
    .wishlist-btn.active:hover {
        background: rgba(239, 68, 68, 0.3);
    }
    
    .wishlist-btn.pop {
        animation: wishlistPop 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes wishlistPop {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3); }
    }
    
    /* WISHLIST COUNT BADGE */
    .wishlist-count {
        position: absolute;
        top: -6px;
        right: -6px;
        background: #ef4444;
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
    
    /* WISHLIST LINK */
    .wishlist-link {
        position: relative;
        color: #fff;
        text-decoration: none;
        font-size: 20px;
        padding: 8px;
        border-radius: 8px;
        transition: 0.2s;
    }
    
    .wishlist-link:hover {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
    }
`;
document.head.appendChild(wishlistStyle);
