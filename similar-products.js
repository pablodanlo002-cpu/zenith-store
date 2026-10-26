// similar-products.js - Synchronisé automatiquement avec le catalogue
var allProducts = [];

// Obtenir des produits similaires basés sur la catégorie et l'ID actuel
function getSimilarProducts(currentProductId, maxResults = 4) {
    const currentProduct = allProducts.find(p => p.id === currentProductId);
    
    if (!currentProduct) {
        console.warn('Produit actuel non trouvé');
        return [];
    }

    // Filtrer les produits de la même catégorie (sauf le produit actuel)
    const similarByCategory = allProducts.filter(p => 
        p.id !== currentProductId && p.category === currentProduct.category
    );

    // Si pas assez de produits dans la même catégorie, ajouter d'autres produits populaires
    if (similarByCategory.length < maxResults) {
        const othersNeeded = maxResults - similarByCategory.length;
        const otherProducts = allProducts
            .filter(p => p.id !== currentProductId && !similarByCategory.includes(p))
            .sort((a, b) => b.rating - a.rating) // Trier par note
            .slice(0, othersNeeded);
        
        return [...similarByCategory, ...otherProducts];
    }

    // Retourner les premiers résultats
    return similarByCategory.slice(0, maxResults);
}

// Créer la carte produit similaire
function createSimilarProductCard(product) {
    const card = document.createElement('div');
    card.className = 'similar-product-card animate-on-scroll';
    card.style.cssText = `
        background: linear-gradient(145deg, #1a1a1a 0%, #151515 100%);
        border: 1px solid rgba(139, 92, 246, 0.2);
        border-radius: 16px;
        overflow: hidden;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        position: relative;
        display: flex;
        flex-direction: column;
    `;

    // Discount badge si présent
    const discountBadge = product.discount ? `
        <div style="
            position: absolute;
            top: 12px;
            right: 12px;
            background: #dc2626;
            color: #fff;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            z-index: 10;
        ">-${product.discount}%</div>
    ` : '';

    // Stock indicator
    const stockIndicator = product.stock ? `
        <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #10b981;
            font-weight: 600;
        ">
            <span style="
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #10b981;
            "></span>
            En stock
        </div>
    ` : `
        <div style="
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            color: #ef4444;
            font-weight: 600;
        ">
            <span style="
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #ef4444;
            "></span>
            Rupture
        </div>
    `;

    card.innerHTML = `
        ${discountBadge}
        
        <!-- Image -->
        <div style="
            background: #0f0f0f;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 220px;
        ">
            <img src="${product.image}" alt="${product.name}" style="
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                transition: transform 0.4s;
            ">
        </div>

        <!-- Info -->
        <div style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
            <!-- Brand -->
            <div style="
                color: #8b5cf6;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                margin-bottom: 8px;
            ">${product.brand}</div>

            <!-- Name -->
            <h3 style="
                font-size: 16px;
                font-weight: 700;
                margin-bottom: 12px;
                line-height: 1.3;
                color: #fff;
            ">${product.name}</h3>

            <!-- Rating -->
            <div style="
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
            ">
                <span style="color: #fbbf24; font-size: 14px;">★★★★★</span>
                <span style="color: #737373; font-size: 12px;">(${product.reviews})</span>
            </div>

            <!-- Stock -->
            ${stockIndicator}

            <!-- Tags -->
            <div style="
                display: flex;
                gap: 6px;
                flex-wrap: wrap;
                margin: 12px 0;
            ">
                ${product.tags.map(tag => `
                    <span style="
                        background: rgba(139, 92, 246, 0.1);
                        color: #a78bfa;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 10px;
                        font-weight: 600;
                    ">${tag}</span>
                `).join('')}
            </div>

            <!-- Price -->
            <div style="
                display: flex;
                align-items: center;
                gap: 12px;
                margin-top: auto;
                padding-top: 12px;
            ">
                <span style="
                    font-size: 24px;
                    font-weight: 900;
                    color: #fff;
                ">${product.price.toFixed(2)}€</span>
                ${product.oldPrice ? `
                    <span style="
                        font-size: 16px;
                        color: #737373;
                        text-decoration: line-through;
                    ">${product.oldPrice.toFixed(2)}€</span>
                ` : ''}
            </div>

            <!-- Actions -->
            <div style="
                display: flex;
                gap: 10px;
                margin-top: 16px;
            ">
                <button onclick="window.location.href='produit.html?id=${product.id}'" style="
                    flex: 1;
                    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
                    color: #fff;
                    padding: 12px 20px;
                    border-radius: 8px;
                    border: none;
                    font-weight: 600;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.3s;
                ">Voir</button>
                
                <button onclick="event.stopPropagation(); addToCartFromSimilar('${product.id}')" style="
                    background: transparent;
                    color: #8b5cf6;
                    padding: 12px 16px;
                    border-radius: 8px;
                    border: 2px solid #8b5cf6;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s;
                " title="Ajouter au panier">
                    <i class="fas fa-shopping-cart"></i>
                </button>
            </div>
        </div>
    `;

    // Hover effects
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
        this.style.borderColor = 'rgba(139, 92, 246, 0.6)';
        this.style.boxShadow = '0 20px 40px rgba(139, 92, 246, 0.3)';
        const img = this.querySelector('img');
        if (img) img.style.transform = 'scale(1.1)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
        this.style.borderColor = 'rgba(139, 92, 246, 0.2)';
        this.style.boxShadow = 'none';
        const img = this.querySelector('img');
        if (img) img.style.transform = 'scale(1)';
    });

    return card;
}

// Ajouter au panier depuis les produits similaires
function addToCartFromSimilar(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || { items: [] };
    
    const existingItem = cart.items.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.items.push({
            id: product.id,
            name: product.name,
            quantity: 1,
            price: product.price,
            image: product.image
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Mettre à jour le compteur du panier
    if (typeof updateCartCount === 'function') {
        updateCartCount();
    }
    
    // Notification
    if (typeof showNotification === 'function') {
        showNotification(`${product.name} ajouté au panier !`, 'success');
    } else {
        alert(`${product.name} ajouté au panier !`);
    }
}

// Créer la section complète des produits similaires
function createSimilarProductsSection(currentProductId) {
    const similarProducts = getSimilarProducts(currentProductId, 4);
    
    if (similarProducts.length === 0) {
        console.warn('Aucun produit similaire trouvé');
        return null;
    }

    const section = document.createElement('section');
    section.className = 'similar-products-section';
    section.style.cssText = `
        max-width: 1400px;
        margin: 80px auto;
        padding: 0 24px;
    `;

    // Titre de la section
    const header = document.createElement('div');
    header.className = 'animate-on-scroll';
    header.style.cssText = `
        text-align: center;
        margin-bottom: 48px;
    `;
    header.innerHTML = `
        <h2 style="
            font-size: 36px;
            font-weight: 900;
            letter-spacing: -0.02em;
            margin-bottom: 12px;
            color: #fff;
        ">
            <span style="
                background: linear-gradient(135deg, #8b5cf6, #a78bfa);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            ">Vous aimerez aussi</span>
        </h2>
        <p style="
            font-size: 16px;
            color: #a1a1a1;
        ">Découvrez nos produits similaires sélectionnés pour vous</p>
    `;

    // Grille de produits
    const grid = document.createElement('div');
    grid.className = 'similar-products-grid';
    grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;
    `;

    similarProducts.forEach(product => {
        grid.appendChild(createSimilarProductCard(product));
    });

    section.appendChild(header);
    section.appendChild(grid);

    return section;
}

// Injecter automatiquement la section sur les pages produits
function injectSimilarProducts(currentProductId, targetSelector = '.product-detail') {
    const targetElement = document.querySelector(targetSelector);
    
    if (!targetElement) {
        console.warn('Élément cible non trouvé pour les produits similaires');
        return;
    }

    const similarSection = createSimilarProductsSection(currentProductId);
    
    if (similarSection) {
        // Insérer après l'élément cible
        targetElement.parentNode.insertBefore(similarSection, targetElement.nextSibling);
    }
}
