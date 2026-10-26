// ========================================
// RECHERCHE INTELLIGENTE AVEC AUTO-COMPLÉTION
// ========================================

const SmartSearch = {
    searchIndex: [],
    searchHistory: JSON.parse(localStorage.getItem('searchHistory')) || [],
    maxHistoryItems: 10,

    // Initialiser
    init() {
        this.buildSearchIndex();
        this.attachSearchListeners();
    },

    // Construire l'index de recherche
    buildSearchIndex() {
        const products = document.querySelectorAll('.product-card');
        this.searchIndex = [];

        products.forEach(card => {
            const id = card.dataset.productId || Math.random().toString(36).substr(2, 9);
            const name = card.querySelector('.product-title, h3')?.textContent.trim() || '';
            const description = card.dataset.description || '';
            const category = card.dataset.category || '';
            const brand = card.dataset.brand || '';
            const priceText = card.querySelector('.product-price, .price')?.textContent.trim() || '';
            const price = priceText.replace(/[^0-9.]/g, '');
            const imageUrl = card.querySelector('img')?.src || '';
            const productUrl = card.querySelector('a')?.href || '#';

            this.searchIndex.push({
                id,
                name,
                description,
                category,
                brand,
                price,
                imageUrl,
                productUrl,
                searchText: `${name} ${description} ${category} ${brand}`.toLowerCase()
            });
        });
    },

    // Attacher les event listeners
    attachSearchListeners() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => this.handleSearchInput(e.target.value));
        searchInput.addEventListener('focus', () => this.showSearchDropdown());
        searchInput.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));

        // Fermer au clic extérieur
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSearchDropdown();
            }
        });
    },

    // Gérer l'entrée de recherche
    handleSearchInput(query) {
        const trimmedQuery = query.trim();

        if (trimmedQuery.length === 0) {
            this.showSearchHistory();
            return;
        }

        if (trimmedQuery.length < 2) {
            this.hideSearchDropdown();
            return;
        }

        const results = this.search(trimmedQuery);
        this.displaySearchResults(results, trimmedQuery);
    },

    // Effectuer la recherche
    search(query) {
        const lowerQuery = query.toLowerCase();
        const results = [];

        this.searchIndex.forEach(item => {
            let score = 0;

            // Correspondance exacte du nom (score le plus élevé)
            if (item.name.toLowerCase() === lowerQuery) {
                score = 1000;
            }
            // Le nom commence par la requête
            else if (item.name.toLowerCase().startsWith(lowerQuery)) {
                score = 500;
            }
            // La requête est dans le nom
            else if (item.name.toLowerCase().includes(lowerQuery)) {
                score = 300;
            }
            // La requête est dans le texte de recherche
            else if (item.searchText.includes(lowerQuery)) {
                score = 100;
            }

            // Bonus pour la marque
            if (item.brand.toLowerCase().includes(lowerQuery)) {
                score += 50;
            }

            // Bonus pour la catégorie
            if (item.category.toLowerCase().includes(lowerQuery)) {
                score += 30;
            }

            if (score > 0) {
                results.push({ ...item, score });
            }
        });

        // Trier par score décroissant
        return results.sort((a, b) => b.score - a.score).slice(0, 8);
    },

    // Afficher les résultats de recherche
    displaySearchResults(results, query) {
        const dropdown = this.getOrCreateDropdown();

        if (results.length === 0) {
            dropdown.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #666;">
                    <i class="fas fa-search" style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;"></i>
                    <p style="font-size: 14px;">Aucun résultat pour "${this.escapeHtml(query)}"</p>
                </div>
            `;
            dropdown.style.display = 'block';
            return;
        }

        dropdown.innerHTML = results.map((item, index) => `
            <a href="${item.productUrl}" 
               class="search-result-item" 
               data-index="${index}"
               style="
                   display: flex;
                   align-items: center;
                   gap: 12px;
                   padding: 12px 16px;
                   text-decoration: none;
                   color: #fff;
                   border-bottom: 1px solid rgba(255,255,255,0.05);
                   transition: all 0.3s;
               "
               onmouseover="this.style.background='rgba(139, 92, 246, 0.1)'"
               onmouseout="this.style.background='transparent'"
               onclick="SmartSearch.saveToHistory('${this.escapeHtml(item.name)}', '${item.productUrl}')">
                <img src="${item.imageUrl}" 
                     style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px; background: rgba(0,0,0,0.3);"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2248%22 height=%2248%22%3E%3Crect fill=%22%23333%22 width=%2248%22 height=%2248%22/%3E%3C/svg%3E'">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${this.highlightQuery(item.name, query)}
                    </div>
                    <div style="font-size: 12px; color: #888;">
                        ${item.category} ${item.brand ? `• ${item.brand}` : ''}
                    </div>
                </div>
                <div style="font-size: 14px; font-weight: 700; color: #8b5cf6; white-space: nowrap;">
                    ${item.price}€
                </div>
            </a>
        `).join('');

        dropdown.style.display = 'block';
        this.currentResults = results;
        this.selectedIndex = -1;
    },

    // Afficher l'historique de recherche
    showSearchHistory() {
        if (this.searchHistory.length === 0) {
            this.hideSearchDropdown();
            return;
        }

        const dropdown = this.getOrCreateDropdown();
        dropdown.innerHTML = `
            <div style="padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; color: #888; font-weight: 600;">🕐 Recherches récentes</span>
                <button onclick="SmartSearch.clearHistory()" style="
                    background: transparent;
                    border: none;
                    color: #ef4444;
                    font-size: 11px;
                    cursor: pointer;
                    padding: 4px 8px;
                ">Effacer</button>
            </div>
            ${this.searchHistory.map(item => `
                <a href="${item.url}" 
                   style="
                       display: flex;
                       align-items: center;
                       gap: 12px;
                       padding: 12px 16px;
                       text-decoration: none;
                       color: #fff;
                       border-bottom: 1px solid rgba(255,255,255,0.05);
                       transition: all 0.3s;
                   "
                   onmouseover="this.style.background='rgba(139, 92, 246, 0.1)'"
                   onmouseout="this.style.background='transparent'">
                    <i class="fas fa-history" style="color: #666; font-size: 14px;"></i>
                    <div style="flex: 1; font-size: 14px;">${this.escapeHtml(item.query)}</div>
                    <i class="fas fa-arrow-right" style="color: #666; font-size: 12px;"></i>
                </a>
            `).join('')}
        `;
        dropdown.style.display = 'block';
    },

    // Sauvegarder dans l'historique
    saveToHistory(query, url) {
        // Éviter les doublons
        this.searchHistory = this.searchHistory.filter(item => item.query !== query);
        
        // Ajouter en début
        this.searchHistory.unshift({ query, url, timestamp: Date.now() });
        
        // Limiter la taille
        if (this.searchHistory.length > this.maxHistoryItems) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);
        }
        
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    },

    // Effacer l'historique
    clearHistory() {
        this.searchHistory = [];
        localStorage.removeItem('searchHistory');
        this.hideSearchDropdown();
        if (typeof showNotification === 'function') {
            showNotification('Historique effacé', 'success');
        }
    },

    // Gérer la navigation au clavier
    handleKeyboardNavigation(e) {
        const dropdown = document.getElementById('searchDropdown');
        if (!dropdown || dropdown.style.display === 'none') return;

        const items = dropdown.querySelectorAll('.search-result-item');
        if (items.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
                this.highlightSelectedItem(items);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.highlightSelectedItem(items);
                break;
            case 'Enter':
                e.preventDefault();
                if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
                    items[this.selectedIndex].click();
                }
                break;
            case 'Escape':
                this.hideSearchDropdown();
                break;
        }
    },

    // Surligner l'élément sélectionné
    highlightSelectedItem(items) {
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.style.background = 'rgba(139, 92, 246, 0.2)';
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.style.background = 'transparent';
            }
        });
    },

    // Surligner la requête dans le texte
    highlightQuery(text, query) {
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<span style="background: rgba(139, 92, 246, 0.3); border-radius: 3px; padding: 0 2px;">$1</span>');
    },

    // Obtenir ou créer le dropdown
    getOrCreateDropdown() {
        let dropdown = document.getElementById('searchDropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'searchDropdown';
            dropdown.style.cssText = `
                position: absolute;
                top: calc(100% + 8px);
                left: 0;
                right: 0;
                background: rgba(17, 17, 17, 0.98);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
                max-height: 500px;
                overflow-y: auto;
                z-index: 1000;
                display: none;
                backdrop-filter: blur(10px);
            `;
            
            const searchContainer = document.querySelector('.search-container');
            if (searchContainer) {
                searchContainer.style.position = 'relative';
                searchContainer.appendChild(dropdown);
            }
        }
        return dropdown;
    },

    // Afficher le dropdown
    showSearchDropdown() {
        const input = document.getElementById('searchInput');
        if (input && input.value.trim().length === 0) {
            this.showSearchHistory();
        }
    },

    // Masquer le dropdown
    hideSearchDropdown() {
        const dropdown = document.getElementById('searchDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    },

    // Échapper HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Échapper Regex
    escapeRegex(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};

// Initialiser - DÉSACTIVÉ (trop automatique/IA)
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => SmartSearch.init());
// } else {
//     SmartSearch.init();
// }
