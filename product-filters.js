// ========================================
// SYSTÈME DE FILTRES AVANCÉS - ZENITH STORE
// ========================================

const ProductFilters = {
    currentFilters: {
        priceRange: { min: 0, max: 10000 },
        categories: [],
        brands: [],
        ratings: 0,
        inStock: false,
        sortBy: 'featured'
    },

    // Initialiser les filtres
    init() {
        this.loadFiltersFromURL();
        this.attachEventListeners();
    },

    // Charger les filtres depuis l'URL
    loadFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);
        
        if (params.has('minPrice')) this.currentFilters.priceRange.min = parseInt(params.get('minPrice'));
        if (params.has('maxPrice')) this.currentFilters.priceRange.max = parseInt(params.get('maxPrice'));
        if (params.has('categories')) this.currentFilters.categories = params.get('categories').split(',');
        if (params.has('brands')) this.currentFilters.brands = params.get('brands').split(',');
        if (params.has('rating')) this.currentFilters.ratings = parseInt(params.get('rating'));
        if (params.has('inStock')) this.currentFilters.inStock = params.get('inStock') === 'true';
        if (params.has('sort')) this.currentFilters.sortBy = params.get('sort');
    },

    // Attacher les event listeners
    attachEventListeners() {
        // Prix
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        if (minPrice) minPrice.addEventListener('input', () => this.updatePriceFilter());
        if (maxPrice) maxPrice.addEventListener('input', () => this.updatePriceFilter());

        // Catégories
        document.querySelectorAll('.filter-category').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.updateCategoryFilter(e.target));
        });

        // Marques
        document.querySelectorAll('.filter-brand').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => this.updateBrandFilter(e.target));
        });

        // Notes
        document.querySelectorAll('.filter-rating').forEach(radio => {
            radio.addEventListener('change', (e) => this.updateRatingFilter(e.target.value));
        });

        // Stock
        const inStockCheckbox = document.getElementById('inStockOnly');
        if (inStockCheckbox) {
            inStockCheckbox.addEventListener('change', (e) => {
                this.currentFilters.inStock = e.target.checked;
                this.applyFilters();
            });
        }

        // Tri
        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentFilters.sortBy = e.target.value;
                this.applyFilters();
            });
        }

        // Bouton reset
        const resetBtn = document.getElementById('resetFilters');
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetFilters());
    },

    // Mettre à jour le filtre de prix
    updatePriceFilter() {
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        const minValue = document.getElementById('minPriceValue');
        const maxValue = document.getElementById('maxPriceValue');

        if (minPrice && maxPrice) {
            this.currentFilters.priceRange.min = parseInt(minPrice.value);
            this.currentFilters.priceRange.max = parseInt(maxPrice.value);

            if (minValue) minValue.textContent = `${minPrice.value}€`;
            if (maxValue) maxValue.textContent = `${maxPrice.value}€`;

            this.applyFilters();
        }
    },

    // Mettre à jour le filtre de catégorie
    updateCategoryFilter(checkbox) {
        const category = checkbox.value;
        if (checkbox.checked) {
            if (!this.currentFilters.categories.includes(category)) {
                this.currentFilters.categories.push(category);
            }
        } else {
            this.currentFilters.categories = this.currentFilters.categories.filter(c => c !== category);
        }
        this.applyFilters();
    },

    // Mettre à jour le filtre de marque
    updateBrandFilter(checkbox) {
        const brand = checkbox.value;
        if (checkbox.checked) {
            if (!this.currentFilters.brands.includes(brand)) {
                this.currentFilters.brands.push(brand);
            }
        } else {
            this.currentFilters.brands = this.currentFilters.brands.filter(b => b !== brand);
        }
        this.applyFilters();
    },

    // Mettre à jour le filtre de note
    updateRatingFilter(rating) {
        this.currentFilters.ratings = parseInt(rating);
        this.applyFilters();
    },

    // Appliquer les filtres
    applyFilters() {
        const products = this.getAllProducts();
        let filtered = products;

        // Filtre de prix
        filtered = filtered.filter(product => {
            const price = parseFloat(product.price);
            return price >= this.currentFilters.priceRange.min && 
                   price <= this.currentFilters.priceRange.max;
        });

        // Filtre de catégorie
        if (this.currentFilters.categories.length > 0) {
            filtered = filtered.filter(product => 
                this.currentFilters.categories.includes(product.category)
            );
        }

        // Filtre de marque
        if (this.currentFilters.brands.length > 0) {
            filtered = filtered.filter(product => 
                this.currentFilters.brands.includes(product.brand)
            );
        }

        // Filtre de note
        if (this.currentFilters.ratings > 0) {
            filtered = filtered.filter(product => {
                const avgRating = this.getProductAverageRating(product.id);
                return avgRating >= this.currentFilters.ratings;
            });
        }

        // Filtre de stock
        if (this.currentFilters.inStock) {
            filtered = filtered.filter(product => product.stock > 0);
        }

        // Tri
        filtered = this.sortProducts(filtered, this.currentFilters.sortBy);

        // Afficher les résultats
        this.displayFilteredProducts(filtered);
        this.updateFilterCount(filtered.length);
        this.updateURL();
    },

    // Trier les produits
    sortProducts(products, sortBy) {
        const sorted = [...products];

        switch (sortBy) {
            case 'price-asc':
                return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            case 'price-desc':
                return sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            case 'rating':
                return sorted.sort((a, b) => {
                    const ratingA = this.getProductAverageRating(a.id);
                    const ratingB = this.getProductAverageRating(b.id);
                    return ratingB - ratingA;
                });
            case 'newest':
                return sorted.reverse();
            case 'featured':
            default:
                return sorted;
        }
    },

    // Obtenir tous les produits
    getAllProducts() {
        // Récupérer depuis le DOM ou une source de données
        const productCards = document.querySelectorAll('.product-card');
        const products = [];

        productCards.forEach(card => {
            const id = card.dataset.productId || card.querySelector('[data-product-id]')?.dataset.productId;
            const name = card.querySelector('.product-title, h3')?.textContent.trim();
            const priceText = card.querySelector('.product-price, .price')?.textContent.trim();
            const price = priceText ? priceText.replace(/[^0-9.]/g, '') : '0';
            const category = card.dataset.category || 'other';
            const brand = card.dataset.brand || 'Generic';
            const stockText = card.querySelector('.stock-badge')?.textContent || '';
            const stock = stockText.includes('Stock') ? 10 : 0;

            products.push({
                id,
                name,
                price,
                category,
                brand,
                stock,
                element: card
            });
        });

        return products;
    },

    // Obtenir la note moyenne d'un produit
    getProductAverageRating(productId) {
        if (typeof ReviewSystem !== 'undefined') {
            const reviews = ReviewSystem.getProductReviews(productId);
            if (reviews.length === 0) return 0;
            const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
            return sum / reviews.length;
        }
        return 0;
    },

    // Afficher les produits filtrés
    displayFilteredProducts(products) {
        const container = document.querySelector('.products-grid, .product-grid');
        if (!container) return;

        // Masquer tous les produits
        const allCards = container.querySelectorAll('.product-card');
        allCards.forEach(card => card.style.display = 'none');

        // Afficher les produits filtrés
        products.forEach(product => {
            if (product.element) {
                product.element.style.display = 'block';
            }
        });

        // Message si aucun résultat
        let noResultsMsg = container.querySelector('.no-results-message');
        if (products.length === 0) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.className = 'no-results-message';
                noResultsMsg.innerHTML = `
                    <div style="text-align: center; padding: 60px 20px; color: #666;">
                        <i class="fas fa-search" style="font-size: 48px; margin-bottom: 20px; color: #444;"></i>
                        <h3 style="margin-bottom: 10px; color: #fff;">Aucun produit trouvé</h3>
                        <p>Essayez de modifier vos filtres</p>
                    </div>
                `;
                container.appendChild(noResultsMsg);
            }
            noResultsMsg.style.display = 'block';
        } else {
            if (noResultsMsg) noResultsMsg.style.display = 'none';
        }
    },

    // Mettre à jour le compteur de résultats
    updateFilterCount(count) {
        const counter = document.getElementById('filterCount');
        if (counter) {
            counter.textContent = `${count} produit${count > 1 ? 's' : ''}`;
        }
    },

    // Mettre à jour l'URL avec les filtres
    updateURL() {
        const params = new URLSearchParams();

        if (this.currentFilters.priceRange.min > 0) {
            params.set('minPrice', this.currentFilters.priceRange.min);
        }
        if (this.currentFilters.priceRange.max < 10000) {
            params.set('maxPrice', this.currentFilters.priceRange.max);
        }
        if (this.currentFilters.categories.length > 0) {
            params.set('categories', this.currentFilters.categories.join(','));
        }
        if (this.currentFilters.brands.length > 0) {
            params.set('brands', this.currentFilters.brands.join(','));
        }
        if (this.currentFilters.ratings > 0) {
            params.set('rating', this.currentFilters.ratings);
        }
        if (this.currentFilters.inStock) {
            params.set('inStock', 'true');
        }
        if (this.currentFilters.sortBy !== 'featured') {
            params.set('sort', this.currentFilters.sortBy);
        }

        const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
        window.history.replaceState({}, '', newURL);
    },

    // Réinitialiser les filtres
    resetFilters() {
        this.currentFilters = {
            priceRange: { min: 0, max: 10000 },
            categories: [],
            brands: [],
            ratings: 0,
            inStock: false,
            sortBy: 'featured'
        };

        // Réinitialiser les inputs
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        if (minPrice) minPrice.value = 0;
        if (maxPrice) maxPrice.value = 10000;

        document.querySelectorAll('.filter-category, .filter-brand').forEach(checkbox => {
            checkbox.checked = false;
        });

        document.querySelectorAll('.filter-rating').forEach(radio => {
            radio.checked = false;
        });

        const inStockCheckbox = document.getElementById('inStockOnly');
        if (inStockCheckbox) inStockCheckbox.checked = false;

        const sortSelect = document.getElementById('sortBy');
        if (sortSelect) sortSelect.value = 'featured';

        this.applyFilters();
    },

    // Créer le panneau de filtres
    createFilterPanel() {
        return `
            <div class="filters-panel" style="
                background: rgba(17, 17, 17, 0.95);
                border: 1px solid rgba(139, 92, 246, 0.2);
                border-radius: 16px;
                padding: 24px;
                position: sticky;
                top: 80px;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h3 style="font-size: 18px; font-weight: 700; color: #fff;">
                        <i class="fas fa-filter"></i> Filtres
                    </h3>
                    <button id="resetFilters" style="
                        background: transparent;
                        border: 1px solid rgba(239, 68, 68, 0.3);
                        color: #ef4444;
                        padding: 6px 12px;
                        border-radius: 6px;
                        font-size: 12px;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        <i class="fas fa-redo"></i> Reset
                    </button>
                </div>

                <!-- Prix -->
                <div class="filter-section" style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #fff;">
                        💰 Prix
                    </h4>
                    <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                        <div style="flex: 1;">
                            <label style="font-size: 12px; color: #888; display: block; margin-bottom: 6px;">Min</label>
                            <input type="number" id="minPrice" value="0" min="0" max="10000" step="50" style="
                                width: 100%;
                                background: rgba(0,0,0,0.3);
                                border: 1px solid rgba(139, 92, 246, 0.3);
                                border-radius: 8px;
                                padding: 8px 12px;
                                color: #fff;
                                font-size: 14px;
                            ">
                            <span id="minPriceValue" style="font-size: 11px; color: #8b5cf6;">0€</span>
                        </div>
                        <div style="flex: 1;">
                            <label style="font-size: 12px; color: #888; display: block; margin-bottom: 6px;">Max</label>
                            <input type="number" id="maxPrice" value="10000" min="0" max="10000" step="50" style="
                                width: 100%;
                                background: rgba(0,0,0,0.3);
                                border: 1px solid rgba(139, 92, 246, 0.3);
                                border-radius: 8px;
                                padding: 8px 12px;
                                color: #fff;
                                font-size: 14px;
                            ">
                            <span id="maxPriceValue" style="font-size: 11px; color: #8b5cf6;">10000€</span>
                        </div>
                    </div>
                </div>

                <!-- Catégories -->
                <div class="filter-section" style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #fff;">
                        📦 Catégories
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${this.createCheckbox('filter-category', 'pc', 'PC Gaming')}
                        ${this.createCheckbox('filter-category', 'peripherals', 'Périphériques')}
                        ${this.createCheckbox('filter-category', 'audio', 'Audio')}
                        ${this.createCheckbox('filter-category', 'accessories', 'Accessoires')}
                    </div>
                </div>

                <!-- Marques -->
                <div class="filter-section" style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #fff;">
                        🏷️ Marques
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${this.createCheckbox('filter-brand', 'Razer', 'Razer')}
                        ${this.createCheckbox('filter-brand', 'Logitech', 'Logitech')}
                        ${this.createCheckbox('filter-brand', 'Corsair', 'Corsair')}
                        ${this.createCheckbox('filter-brand', 'SteelSeries', 'SteelSeries')}
                        ${this.createCheckbox('filter-brand', 'HyperX', 'HyperX')}
                    </div>
                </div>

                <!-- Note minimum -->
                <div class="filter-section" style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 16px; color: #fff;">
                        ⭐ Note minimum
                    </h4>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${this.createRadio('filter-rating', '0', 'Toutes les notes', true)}
                        ${this.createRadio('filter-rating', '4', '4+ étoiles')}
                        ${this.createRadio('filter-rating', '3', '3+ étoiles')}
                    </div>
                </div>

                <!-- Stock -->
                <div class="filter-section">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="inStockOnly" style="
                            width: 18px;
                            height: 18px;
                            cursor: pointer;
                        ">
                        <label for="inStockOnly" style="font-size: 14px; color: #fff; cursor: pointer;">
                            📦 En stock uniquement
                        </label>
                    </div>
                </div>

                <!-- Résultats -->
                <div style="margin-top: 20px; padding: 12px; background: rgba(139, 92, 246, 0.1); border-radius: 8px; text-align: center;">
                    <span id="filterCount" style="font-size: 14px; font-weight: 600; color: #8b5cf6;">
                        Chargement...
                    </span>
                </div>
            </div>
        `;
    },

    // Créer une checkbox
    createCheckbox(className, value, label) {
        return `
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px; border-radius: 6px; transition: all 0.3s;" 
                   onmouseover="this.style.background='rgba(139, 92, 246, 0.1)'" 
                   onmouseout="this.style.background='transparent'">
                <input type="checkbox" class="${className}" value="${value}" style="
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                ">
                <span style="font-size: 13px; color: #ccc;">${label}</span>
            </label>
        `;
    },

    // Créer un radio button
    createRadio(name, value, label, checked = false) {
        return `
            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 8px; border-radius: 6px; transition: all 0.3s;" 
                   onmouseover="this.style.background='rgba(139, 92, 246, 0.1)'" 
                   onmouseout="this.style.background='transparent'">
                <input type="radio" class="${name}" name="${name}" value="${value}" ${checked ? 'checked' : ''} style="
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                ">
                <span style="font-size: 13px; color: #ccc;">${label}</span>
            </label>
        `;
    },

    // Créer la barre de tri
    createSortBar() {
        return `
            <div style="
                background: rgba(17, 17, 17, 0.95);
                border: 1px solid rgba(139, 92, 246, 0.2);
                border-radius: 12px;
                padding: 16px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 24px;
            ">
                <span style="font-size: 14px; color: #888;">
                    <span id="filterCount">Tous les produits</span>
                </span>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <label style="font-size: 14px; color: #888;">Trier par:</label>
                    <select id="sortBy" style="
                        background: rgba(0,0,0,0.3);
                        border: 1px solid rgba(139, 92, 246, 0.3);
                        border-radius: 8px;
                        padding: 8px 16px;
                        color: #fff;
                        font-size: 14px;
                        cursor: pointer;
                    ">
                        <option value="featured">⭐ En vedette</option>
                        <option value="price-asc">💰 Prix croissant</option>
                        <option value="price-desc">💰 Prix décroissant</option>
                        <option value="name-asc">🔤 A-Z</option>
                        <option value="name-desc">🔤 Z-A</option>
                        <option value="rating">⭐ Meilleures notes</option>
                        <option value="newest">🆕 Nouveautés</option>
                    </select>
                </div>
            </div>
        `;
    }
};

// Initialiser au chargement
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ProductFilters.init());
} else {
    ProductFilters.init();
}
