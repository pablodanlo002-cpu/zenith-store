// ========================================
// SUGGESTIONS PERSONNALISÉES - FONCTIONNALITÉ 23
// ========================================

const PersonalizedSuggestions = {
    userBehavior: JSON.parse(localStorage.getItem('userBehavior')) || {
        viewedProducts: [],
        purchasedProducts: [],
        searchHistory: [],
        categories: {},
        brands: {},
        priceRange: { min: 0, max: 10000 }
    },

    // Initialiser
    init() {
        this.trackUserBehavior();
        this.cleanOldData();
    },

    // Suivre le comportement utilisateur
    trackUserBehavior() {
        // Tracker les vues de produits
        this.trackProductViews();
        
        // Tracker les recherches
        this.trackSearches();
        
        // Tracker les achats
        this.trackPurchases();
    },

    // Tracker les vues de produits
    trackProductViews() {
        const currentUrl = window.location.href;
        
        if (currentUrl.includes('product.html') || currentUrl.includes('?id=')) {
            const urlParams = new URLSearchParams(window.location.search);
            const productId = urlParams.get('id');
            
            if (productId) {
                this.addViewedProduct(productId);
            }
        }
    },

    // Ajouter un produit vu
    addViewedProduct(productId) {
        const product = this.getProductData(productId);
        if (!product) return;

        // Ajouter à l'historique des vues
        const viewed = {
            id: productId,
            timestamp: Date.now(),
            ...product
        };

        this.userBehavior.viewedProducts.unshift(viewed);
        
        // Limiter à 50 produits
        if (this.userBehavior.viewedProducts.length > 50) {
            this.userBehavior.viewedProducts = this.userBehavior.viewedProducts.slice(0, 50);
        }

        // Mettre à jour les préférences de catégorie
        if (product.category) {
            this.userBehavior.categories[product.category] = 
                (this.userBehavior.categories[product.category] || 0) + 1;
        }

        // Mettre à jour les préférences de marque
        if (product.brand) {
            this.userBehavior.brands[product.brand] = 
                (this.userBehavior.brands[product.brand] || 0) + 1;
        }

        // Mettre à jour la gamme de prix
        const price = parseFloat(product.price);
        if (price) {
            if (this.userBehavior.viewedProducts.length === 1) {
                this.userBehavior.priceRange = { min: price, max: price };
            } else {
                this.userBehavior.priceRange.min = Math.min(this.userBehavior.priceRange.min, price);
                this.userBehavior.priceRange.max = Math.max(this.userBehavior.priceRange.max, price * 1.5);
            }
        }

        this.saveUserBehavior();
        console.log('👁️ Produit vu enregistré:', productId);
    },

    // Tracker les recherches
    trackSearches() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        searchInput.addEventListener('change', (e) => {
            const query = e.target.value.trim();
            if (query.length < 2) return;

            this.userBehavior.searchHistory.unshift({
                query,
                timestamp: Date.now()
            });

            if (this.userBehavior.searchHistory.length > 20) {
                this.userBehavior.searchHistory = this.userBehavior.searchHistory.slice(0, 20);
            }

            this.saveUserBehavior();
        });
    },

    // Tracker les achats
    trackPurchases() {
        document.addEventListener('orderCompleted', (e) => {
            if (e.detail && e.detail.items) {
                e.detail.items.forEach(item => {
                    this.userBehavior.purchasedProducts.push({
                        ...item,
                        timestamp: Date.now()
                    });
                });
                this.saveUserBehavior();
            }
        });
    },

    // Obtenir les données d'un produit
    getProductData(productId) {
        // Essayer de trouver le produit dans le DOM
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        
        if (productCard) {
            return {
                id: productId,
                name: productCard.querySelector('.product-title, h3')?.textContent.trim(),
                price: productCard.querySelector('.product-price, .price')?.textContent.replace(/[^0-9.]/g, ''),
                category: productCard.dataset.category,
                brand: productCard.dataset.brand,
                image: productCard.querySelector('img')?.src
            };
        }

        return null;
    },

    // Générer des suggestions personnalisées
    getSuggestions(count = 6) {
        const allProducts = this.getAllProducts();
        const viewedIds = this.userBehavior.viewedProducts.map(p => p.id);
        const purchasedIds = this.userBehavior.purchasedProducts.map(p => p.id);
        
        // Filtrer les produits déjà vus/achetés
        const availableProducts = allProducts.filter(p => 
            !viewedIds.includes(p.id) && !purchasedIds.includes(p.id)
        );

        // Calculer un score pour chaque produit
        const scoredProducts = availableProducts.map(product => ({
            ...product,
            score: this.calculateProductScore(product)
        }));

        // Trier par score décroissant
        scoredProducts.sort((a, b) => b.score - a.score);

        return scoredProducts.slice(0, count);
    },

    // Calculer le score d'un produit
    calculateProductScore(product) {
        let score = 0;

        // Score basé sur la catégorie préférée
        if (product.category && this.userBehavior.categories[product.category]) {
            score += this.userBehavior.categories[product.category] * 10;
        }

        // Score basé sur la marque préférée
        if (product.brand && this.userBehavior.brands[product.brand]) {
            score += this.userBehavior.brands[product.brand] * 8;
        }

        // Score basé sur la gamme de prix
        const price = parseFloat(product.price);
        if (price >= this.userBehavior.priceRange.min && price <= this.userBehavior.priceRange.max) {
            score += 15;
        }

        // Score basé sur les recherches récentes
        this.userBehavior.searchHistory.slice(0, 5).forEach(search => {
            const searchLower = search.query.toLowerCase();
            const nameLower = product.name?.toLowerCase() || '';
            
            if (nameLower.includes(searchLower)) {
                score += 20;
            }
        });

        // Bonus pour les produits récemment ajoutés (simulé avec un facteur aléatoire)
        score += Math.random() * 5;

        return score;
    },

    // Obtenir tous les produits
    getAllProducts() {
        const productCards = document.querySelectorAll('.product-card');
        const products = [];

        productCards.forEach(card => {
            const id = card.dataset.productId || Math.random().toString(36).substr(2, 9);
            const name = card.querySelector('.product-title, h3')?.textContent.trim();
            const priceText = card.querySelector('.product-price, .price')?.textContent.trim();
            const price = priceText ? priceText.replace(/[^0-9.]/g, '') : '0';
            const category = card.dataset.category || '';
            const brand = card.dataset.brand || '';
            const image = card.querySelector('img')?.src || '';

            products.push({ id, name, price, category, brand, image });
        });

        return products;
    },

    // Créer le widget de suggestions
    createSuggestionsWidget() {
        const suggestions = this.getSuggestions(4);
        
        if (suggestions.length === 0) {
            return '';
        }

        return `
            <div class="suggestions-widget" style="
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05));
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 20px;
                padding: 32px;
                margin: 40px 0;
            ">
                <div style="text-align: center; margin-bottom: 32px;">
                    <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #fff;">
                        ✨ Recommandé pour vous
                    </h3>
                    <p style="font-size: 14px; color: #888;">
                        Basé sur vos préférences et votre historique
                    </p>
                </div>

                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                ">
                    ${suggestions.map(product => `
                        <a href="product.html?id=${product.id}" style="
                            display: block;
                            background: rgba(0, 0, 0, 0.3);
                            border: 1px solid rgba(139, 92, 246, 0.2);
                            border-radius: 16px;
                            padding: 16px;
                            text-decoration: none;
                            transition: all 0.3s;
                        " onmouseover="this.style.transform='translateY(-4px)'; this.style.borderColor='rgba(139, 92, 246, 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='rgba(139, 92, 246, 0.2)'">
                            <img src="${product.image}" style="
                                width: 100%;
                                height: 160px;
                                object-fit: cover;
                                border-radius: 12px;
                                margin-bottom: 12px;
                            " onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22160%22%3E%3Crect fill=%22%23333%22 width=%22200%22 height=%22160%22/%3E%3C/svg%3E'">
                            <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${this.escapeHtml(product.name)}
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="font-size: 18px; font-weight: 700; color: #8b5cf6;">
                                    ${product.price}€
                                </span>
                                <span style="font-size: 12px; color: #888;">
                                    ${product.category}
                                </span>
                            </div>
                        </a>
                    `).join('')}
                </div>

                <div style="text-align: center; margin-top: 24px;">
                    <button onclick="PersonalizedSuggestions.refreshSuggestions()" style="
                        background: rgba(139, 92, 246, 0.2);
                        border: 1px solid rgba(139, 92, 246, 0.4);
                        color: #8b5cf6;
                        padding: 12px 24px;
                        border-radius: 12px;
                        font-size: 14px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s;
                    " onmouseover="this.style.background='rgba(139, 92, 246, 0.3)'" onmouseout="this.style.background='rgba(139, 92, 246, 0.2)'">
                        <i class="fas fa-sync-alt"></i> Voir d'autres suggestions
                    </button>
                </div>
            </div>
        `;
    },

    // Rafraîchir les suggestions
    refreshSuggestions() {
        // Ajouter un petit boost aléatoire pour varier
        this.userBehavior.randomSeed = Math.random();
        this.saveUserBehavior();
        
        // Recharger la page ou mettre à jour dynamiquement
        if (typeof showNotification === 'function') {
            showNotification('Nouvelles suggestions chargées !', 'success');
        }
        
        location.reload();
    },

    // Obtenir les catégories recommandées
    getRecommendedCategories() {
        const categories = Object.entries(this.userBehavior.categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([category]) => category);
        
        return categories;
    },

    // Obtenir les marques recommandées
    getRecommendedBrands() {
        const brands = Object.entries(this.userBehavior.brands)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([brand]) => brand);
        
        return brands;
    },

    // Sauvegarder le comportement utilisateur
    saveUserBehavior() {
        localStorage.setItem('userBehavior', JSON.stringify(this.userBehavior));
    },

    // Nettoyer les anciennes données (> 90 jours)
    cleanOldData() {
        const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);

        this.userBehavior.viewedProducts = this.userBehavior.viewedProducts.filter(
            p => p.timestamp > ninetyDaysAgo
        );

        this.userBehavior.searchHistory = this.userBehavior.searchHistory.filter(
            s => s.timestamp > ninetyDaysAgo
        );

        this.saveUserBehavior();
    },

    // Réinitialiser les données
    reset() {
        localStorage.removeItem('userBehavior');
        this.userBehavior = {
            viewedProducts: [],
            purchasedProducts: [],
            searchHistory: [],
            categories: {},
            brands: {},
            priceRange: { min: 0, max: 10000 }
        };
        
        if (typeof showNotification === 'function') {
            showNotification('Historique de recommandations réinitialisé', 'info');
        }
    },

    // Obtenir les statistiques
    getStats() {
        return {
            viewedCount: this.userBehavior.viewedProducts.length,
            purchasedCount: this.userBehavior.purchasedProducts.length,
            searchCount: this.userBehavior.searchHistory.length,
            favoriteCategory: Object.entries(this.userBehavior.categories).sort((a, b) => b[1] - a[1])[0]?.[0],
            favoriteBrand: Object.entries(this.userBehavior.brands).sort((a, b) => b[1] - a[1])[0]?.[0],
            priceRange: this.userBehavior.priceRange
        };
    },

    // Échapper HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialiser - DÉSACTIVÉ (suggestions IA trop automatiques)
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => PersonalizedSuggestions.init());
// } else {
//     PersonalizedSuggestions.init();
// }
