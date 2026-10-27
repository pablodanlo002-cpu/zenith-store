// ========================================
// PANIER PERSISTANT - FONCTIONNALITÉ 21
// ========================================

const PersistentCart = {
    syncInterval: null,
    lastSync: null,

    // Initialiser
    init() {
        this.loadCartFromCloud();
        this.setupAutoSync();
        this.setupBeforeUnloadListener();
        this.migrateOldCart();
    },

    // Migrer l'ancien panier vers le nouveau format
    migrateOldCart() {
        const oldCart = localStorage.getItem('cart');
        if (oldCart && !localStorage.getItem('persistentCart')) {
            localStorage.setItem('persistentCart', oldCart);
            console.log('✅ Ancien panier migré vers le format persistant');
        }
    },

    // Charger le panier depuis le "cloud" (localStorage avec metadata)
    loadCartFromCloud() {
        try {
            const savedCart = localStorage.getItem('persistentCart');
            const metadata = this.getCartMetadata();
            
            if (savedCart) {
                const cart = JSON.parse(savedCart);
                
                // Vérifier la validité des articles
                this.validateCartItems(cart);
                
                // Mettre à jour le panier actuel
                localStorage.setItem('cart', savedCart);
                
                console.log(`✅ Panier chargé: ${cart.items?.length || 0} articles`);
                console.log(`📅 Dernière modification: ${metadata.lastModified ? new Date(metadata.lastModified).toLocaleString('fr-FR') : 'Inconnue'}`);
                
                // Actualiser l'interface
                if (typeof updateCartDisplay === 'function') {
                    updateCartDisplay();
                }
                
                return cart;
            }
        } catch (error) {
            console.error('❌ Erreur de chargement du panier:', error);
        }
        
        return { items: [] };
    },

    // Sauvegarder le panier dans le cloud (localStorage)
    saveCartToCloud(cart) {
        try {
            // Éviter la boucle infinie avec un flag
            if (this._isSaving) return;
            this._isSaving = true;
            
            const cartData = typeof cart === 'string' ? cart : JSON.stringify(cart);
            
            localStorage.setItem('persistentCart', cartData);
            localStorage.setItem('cart', cartData);
            
            // Mettre à jour les métadonnées
            this.updateCartMetadata(cart);
            
            this.lastSync = Date.now();
            
            console.log('💾 Panier sauvegardé');
            
            this._isSaving = false;
        } catch (error) {
            console.error('❌ Erreur de sauvegarde du panier:', error);
            this._isSaving = false;
        }
    },

    // Obtenir les métadonnées du panier
    getCartMetadata() {
        const metadata = localStorage.getItem('cartMetadata');
        return metadata ? JSON.parse(metadata) : {
            lastModified: null,
            deviceId: this.getDeviceId(),
            syncCount: 0
        };
    },

    // Mettre à jour les métadonnées
    updateCartMetadata(cart) {
        const metadata = this.getCartMetadata();
        const parsedCart = typeof cart === 'string' ? JSON.parse(cart) : cart;
        
        metadata.lastModified = Date.now();
        metadata.itemCount = parsedCart.items?.length || 0;
        metadata.totalValue = this.calculateCartTotal(parsedCart);
        metadata.syncCount += 1;
        
        localStorage.setItem('cartMetadata', JSON.stringify(metadata));
    },

    // Valider les articles du panier
    validateCartItems(cart) {
        if (!cart.items) return;
        
        const validItems = cart.items.filter(item => {
            // Vérifier que l'article a les propriétés minimales
            return item.id && item.name && item.price && item.quantity > 0;
        });
        
        if (validItems.length !== cart.items.length) {
            console.warn(`⚠️ ${cart.items.length - validItems.length} articles invalides supprimés`);
            cart.items = validItems;
            this.saveCartToCloud(cart);
        }
    },

    // Calculer le total du panier
    calculateCartTotal(cart) {
        if (!cart.items) return 0;
        
        return cart.items.reduce((total, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return total + (price * quantity);
        }, 0);
    },

    // Obtenir un ID d'appareil unique
    getDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        
        if (!deviceId) {
            deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('deviceId', deviceId);
        }
        
        return deviceId;
    },

    // Configuration de la synchronisation automatique
    setupAutoSync() {
        // Synchroniser toutes les 5 minutes (optimisé)
        this.syncInterval = setInterval(() => {
            const cart = this.getCurrentCart();
            if (cart) {
                this.saveCartToCloud(cart);
            }
        }, 300000); // 5 minutes au lieu de 30 secondes

        // Synchroniser lors des modifications du panier
        this.watchCartChanges();
    },

    // Surveiller les changements du panier
    watchCartChanges() {
        // Observer les modifications de localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'cart') {
                console.log('🔄 Panier modifié dans un autre onglet');
                this.loadCartFromCloud();
            }
        });

        // Intercepter les modifications directes
        const originalSetItem = localStorage.setItem.bind(localStorage);
        localStorage.setItem = (key, value) => {
            // Appeler d'abord la méthode originale
            originalSetItem(key, value);
            
            // Puis sauvegarder uniquement si c'est 'cart' et qu'on n'est pas déjà en train de sauvegarder
            if (key === 'cart' && !this._isSaving) {
                this.saveCartToCloud(value);
            }
        };
    },

    // Obtenir le panier actuel
    getCurrentCart() {
        try {
            const cartData = localStorage.getItem('cart');
            return cartData ? JSON.parse(cartData) : { items: [] };
        } catch (error) {
            console.error('❌ Erreur de lecture du panier:', error);
            return { items: [] };
        }
    },

    // Listener avant fermeture
    setupBeforeUnloadListener() {
        window.addEventListener('beforeunload', () => {
            const cart = this.getCurrentCart();
            this.saveCartToCloud(cart);
            console.log('💾 Panier sauvegardé avant fermeture');
        });
    },

    // Fusionner deux paniers (utile pour la synchronisation multi-appareils)
    mergeCarts(cart1, cart2) {
        const mergedItems = [...cart1.items];
        
        cart2.items.forEach(item2 => {
            const existingItem = mergedItems.find(item1 => item1.id === item2.id);
            
            if (existingItem) {
                // Prendre la quantité maximale
                existingItem.quantity = Math.max(existingItem.quantity, item2.quantity);
            } else {
                mergedItems.push(item2);
            }
        });
        
        return { items: mergedItems };
    },

    // Effacer le panier persistant
    clearPersistentCart() {
        localStorage.removeItem('persistentCart');
        localStorage.removeItem('cartMetadata');
        localStorage.removeItem('cart');
        console.log('🗑️ Panier persistant effacé');
    },

    // Obtenir les statistiques du panier
    getCartStatistics() {
        const metadata = this.getCartMetadata();
        const cart = this.getCurrentCart();
        
        return {
            itemCount: cart.items?.length || 0,
            totalValue: this.calculateCartTotal(cart),
            lastModified: metadata.lastModified,
            syncCount: metadata.syncCount,
            deviceId: metadata.deviceId,
            age: metadata.lastModified ? Date.now() - metadata.lastModified : null
        };
    },

    // Créer un widget d'info panier persistant
    createPersistentCartWidget() {
        const stats = this.getCartStatistics();
        
        if (stats.itemCount === 0) return '';
        
        return `
            <div style="
                background: rgba(139, 92, 246, 0.1);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 12px;
                padding: 16px;
                margin: 16px 0;
                display: flex;
                align-items: center;
                gap: 12px;
            ">
                <div style="font-size: 32px;">💾</div>
                <div style="flex: 1;">
                    <div style="font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 4px;">
                        Panier sauvegardé automatiquement
                    </div>
                    <div style="font-size: 12px; color: #888;">
                        ${stats.itemCount} article${stats.itemCount > 1 ? 's' : ''} • 
                        ${stats.totalValue.toFixed(2)}€ • 
                        Dernière modification: ${stats.lastModified ? this.getTimeAgo(stats.lastModified) : 'Jamais'}
                    </div>
                </div>
                <i class="fas fa-check-circle" style="color: #10b981; font-size: 20px;"></i>
            </div>
        `;
    },

    // Obtenir le temps écoulé
    getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'À l\'instant';
        if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
        if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)}j`;
        return new Date(timestamp).toLocaleDateString('fr-FR');
    },

    // Exporter le panier
    exportCart() {
        const cart = this.getCurrentCart();
        const metadata = this.getCartMetadata();
        
        const exportData = {
            cart,
            metadata,
            exportedAt: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `zenith-cart-${Date.now()}.json`;
        link.click();
        
        console.log('📦 Panier exporté');
    },

    // Importer un panier
    importCart(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (importData.cart && importData.cart.items) {
                    this.saveCartToCloud(importData.cart);
                    
                    if (typeof showNotification === 'function') {
                        showNotification('Panier importé avec succès !', 'success');
                    }
                    
                    // Actualiser la page
                    setTimeout(() => location.reload(), 1000);
                } else {
                    throw new Error('Format de fichier invalide');
                }
            } catch (error) {
                console.error('❌ Erreur d\'importation:', error);
                if (typeof showNotification === 'function') {
                    showNotification('Erreur lors de l\'importation', 'error');
                }
            }
        };
        reader.readAsText(file);
    }
};

// Initialiser
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PersistentCart.init());
} else {
    PersistentCart.init();
}

// Nettoyer avant déchargement
window.addEventListener('beforeunload', () => {
    if (PersistentCart.syncInterval) {
        clearInterval(PersistentCart.syncInterval);
    }
});
