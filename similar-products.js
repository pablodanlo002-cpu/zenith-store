// similar-products.js - Système de produits similaires "Vous aimerez aussi"

// Base de données produits complète (synchronisée avec index.html)
const allProducts = [
    {
        "id": "prod-ali-1005012808400149",
        "name": "Clavier de jeu mécanique sans fil AULA F75 Tri-mode, disposition 75 %, 2,4 GHz/Bluetooth/Filaire, rétroéclairage RGB, profil OEM, structure Gasket",
        "supplierPrice": 55,
        "price": 99.99,
        "oldPrice": 134.99,
        "discount": 26,
        "image": "https://ae-pic-a1.aliexpress-media.com/kf/A9e8796a563c0417187e03b909809750at.jpg",
        "images": [
            "https://ae-pic-a1.aliexpress-media.com/kf/A9e8796a563c0417187e03b909809750at.jpg",
            "https://ae-pic-a1.aliexpress-media.com/kf/A168ccf9451344c638c837375a6543403o.jpg",
            "https://ae-pic-a1.aliexpress-media.com/kf/Ab7b5aec99e2749a7959b14cfab3dfde5w.jpg",
            "https://ae-pic-a1.aliexpress-media.com/kf/A3d3bef6a0fc4432ba7832c6e64de9bfbG.jpg",
            "https://ae-pic-a1.aliexpress-media.com/kf/Ac17c7c05fc7140258fed7a70fdb7f8a4C.jpg",
            "https://ae-pic-a1.aliexpress-media.com/kf/Acade6491294d43f886c93387a64a4352U.jpg"
        ],
        "category": "claviers",
        "brand": "Zenith Tech",
        "rating": 5,
        "reviews": 53,
        "stock": true,
        "stockCount": 15,
        "url": "produit.html?id=prod-ali-1005012808400149",
        "tags": [
            "Expédition rapide",
            "Garantie 2 ans",
            "Testé"
        ],
        "aliexpress": {
            "productId": "1005012808400149",
            "supplierPrice": 55,
            "url": "https://www.aliexpress.com/item/1005012808400149.html"
        }
    },
    {
        "id": "prod-ali-1005012626624444",
        "name": "Support de refroidissement horizontal pour PS5 Slim/Pro Edition Disque et Edition Numérique avec éclairage RGB, station de charge pour manettes et support pour casque",
        "supplierPrice": 25,
        "price": 34.99,
        "oldPrice": 59.99,
        "discount": 42,
        "image": "https://ae-pic-a1.aliexpress-media.com/kf/S49832f51255948a399eb37157282cb59F.jpg",
        "category": "accessoires",
        "brand": "Zenith Tech",
        "rating": 5,
        "reviews": 72,
        "stock": true,
        "stockCount": 10,
        "url": "produit.html?id=prod-ali-1005012626624444",
        "tags": [
            "Expédition rapide",
            "Garantie 2 ans",
            "Testé"
        ],
        "aliexpress": {
            "productId": "1005012626624444",
            "supplierPrice": 25,
            "url": "https://www.aliexpress.com/item/1005012626624444.html"
        },
        "images": [
            "https://ae-pic-a1.aliexpress-media.com/kf/S49832f51255948a399eb37157282cb59F.jpg",
            "https://ae-pic-a1.aliexpress-media.com/kf/S65ebaba8856d4bf8be9050d614e088e4J.jpg",
            "https://ae-pic-a1.aliexpress-media.com/kf/Sf9024be1ca014ea888cdf77b5d62accad.jpg",
            "https://ae-pic-a1.aliexpress-media.com/kf/S52eca0d7a5774d94afedd899e609343cu.jpg",
            "https://ae-pic-a1.aliexpress-media.com/kf/S413707bb0559478a97b3757ee25e6b27z.jpg",
            "https://ae-pic-a1.aliexpress-media.com/kf/S221bd8fd8ebe49d5b6ec1241e4733044J.jpg"
        ]
    },
    {
        "id": "prod-1",
        "name": "FiiO JD1 IEM Gaming Écouteurs",
        "price": 79.9,
        "oldPrice": 149.9,
        "discount": 47,
        "image": "images/ecouteurs/1.png",
        "category": "ecouteurs",
        "brand": "FiiO",
        "rating": 5,
        "reviews": 128,
        "stock": true,
        "stockCount": 14,
        "url": "produit.html?id=prod-1",
        "tags": [
            "Driver LCP 10mm",
            "Hi-Res Audio",
            "2-Pin Cable"
        ],
        "aliexpress": {
            "productId": "1005006183202423",
            "supplierPrice": 38.5,
            "url": "https://fr.aliexpress.com/item/1005006183202423.html"
        },
        "images": [
            "images/ecouteurs/1.png",
            "images/ecouteurs/2.png",
            "images/ecouteurs/3.png",
            "images/ecouteurs/4.png"
        ]
    },
    {
        "id": "prod-ali-1005007187792794",
        "name": "BINNUNE Casque Gaming Sans Fil 2.4GHz & Bluetooth",
        "price": 59.99,
        "oldPrice": 80.99,
        "discount": 28,
        "image": "https://ae-pic-a1.aliexpress-media.com/kf/S1328ed68e219482ab133025ac0448d4f0.jpg",
        "category": "casques",
        "brand": "Zenith Tech",
        "rating": 5,
        "reviews": 55,
        "stock": true,
        "stockCount": 20,
        "url": "produit.html?id=prod-ali-1005007187792794",
        "tags": [
            "Expédition rapide",
            "Garantie 2 ans",
            "Testé"
        ],
        "aliexpress": {
            "productId": "1005007187792794",
            "supplierPrice": 25,
            "url": "https://www.aliexpress.com/item/1005007187792794.html"
        },
        "supplierPrice": 25,
        "images": [
            "https://ae-pic-a1.aliexpress-media.com/kf/S1328ed68e219482ab133025ac0448d4f0.jpg",
            "https://ae-pic-a1.aliexpress-media.com/kf/S3fb5f45c084542cda7dec2b39f9a538e3.jpg",
            "https://ae-pic-a1.aliexpress-media.com/kf/S59a0adeaca7d4fffa4a0223a0bb48874g.jpg",
            "https://ae-pic-a1.aliexpress-media.com/kf/S9930b7d7ee054a78a29c16cc2a62d6a9w.jpg",
            "https://ae-pic-a1.aliexpress-media.com/kf/S2857e17696cd44219ed0a1dde0b60b9cl.jpg",
            "https://ae-pic-a1.aliexpress-media.com/kf/S6bf49ceec3a64e86ad1937b4b6d5c6f0Y.jpg"
        ]
    },
    {
        "id": "prod-3",
        "name": "AJAZZ AJ179 V2 Souris Gaming Tri-Mode",
        "price": 74.99,
        "oldPrice": 169.99,
        "discount": 56,
        "image": "images/souris/souris-2.png",
        "category": "souris",
        "brand": "AJAZZ",
        "rating": 5,
        "reviews": 213,
        "stock": true,
        "stockCount": 9,
        "url": "produit.html?id=prod-3",
        "tags": [
            "12000 DPI",
            "Ultra-légère 56g",
            "Tri-Mode"
        ],
        "aliexpress": {
            "productId": "1005006899452311",
            "supplierPrice": 32,
            "url": "https://fr.aliexpress.com/item/1005006899452311.html"
        }
    },
    {
        "id": "prod-4",
        "name": "AJAZZ AK992 Clavier Mécanique 98 Touches",
        "price": 99.99,
        "oldPrice": 149.99,
        "discount": 33,
        "image": "images/claviers/clavier-1.png",
        "category": "claviers",
        "brand": "AJAZZ",
        "rating": 5,
        "reviews": 156,
        "stock": true,
        "stockCount": 11,
        "url": "produit.html?id=prod-4",
        "tags": [
            "98 Touches",
            "Hot-Swap",
            "RGB"
        ],
        "aliexpress": {
            "productId": "1005005829183742",
            "supplierPrice": 46.5,
            "url": "https://fr.aliexpress.com/item/1005005829183742.html"
        }
    },
    {
        "id": "prod-5",
        "name": "Tapis de Souris Gaming XXL Spider",
        "price": 34.99,
        "oldPrice": 49.99,
        "discount": 30,
        "image": "images/tapis/tapis-1.png",
        "category": "tapis",
        "brand": "GAMING PRO",
        "rating": 4,
        "reviews": 67,
        "stock": true,
        "stockCount": 23,
        "url": "produit.html?id=prod-5",
        "tags": [
            "XXL 80x30cm",
            "Antidérapant",
            "Design Spider"
        ],
        "aliexpress": {
            "productId": "1005004728916254",
            "supplierPrice": 12,
            "url": "https://fr.aliexpress.com/item/1005004728916254.html"
        }
    },
    {
        "id": "prod-6",
        "name": "Écran Gaming 24.5\" 200Hz Full HD",
        "price": 179.99,
        "oldPrice": 209.99,
        "discount": 14,
        "image": "images/ecrans/ecran-1.png",
        "category": "ecrans",
        "brand": "LXZ",
        "rating": 5,
        "reviews": 192,
        "stock": true,
        "stockCount": 3,
        "url": "produit.html?id=prod-6",
        "tags": [
            "200Hz",
            "1ms",
            "FreeSync"
        ],
        "aliexpress": {
            "productId": "1005006019283746",
            "supplierPrice": 110,
            "url": "https://fr.aliexpress.com/item/1005006019283746.html"
        }
    },
    {
        "id": "prod-7",
        "name": "AJAZZ AKP153 Console Macros Programmable",
        "price": 149.99,
        "oldPrice": 199.99,
        "discount": 25,
        "image": "images/accessoires/accessoire-1.png",
        "category": "accessoires",
        "brand": "AJAZZ",
        "rating": 5,
        "reviews": 43,
        "stock": true,
        "stockCount": 8,
        "url": "produit.html?id=prod-7",
        "tags": [
            "Écran LCD",
            "Programmable",
            "15 Touches"
        ],
        "aliexpress": {
            "productId": "1005012031666768",
            "supplierPrice": 68,
            "url": "https://fr.aliexpress.com/item/1005012031666768.html"
        }
    }
];

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
