// server.js - Serveur Backend Zenith Store
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const aliService = require('./aliexpress-service');
const db = require('./db');

// Initialisation de la base de données MongoDB Atlas Cloud
db.initDB();

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// CONFIGURATION SÉCURITÉ & AUTHENTIFICATION
// ==========================================
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ZenithStore2026!';
const SESSION_SECRET = process.env.SESSION_SECRET || 'zenith_salt_super_secret_983742';

function generateAdminToken() {
    return crypto.createHmac('sha256', SESSION_SECRET).update(`admin:${ADMIN_PASSWORD}`).digest('hex');
}

function verifyAdminToken(token) {
    if (!token) return false;
    const expected = generateAdminToken();
    return token === expected;
}

function requireAdminAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.query.token;

    if (!verifyAdminToken(token)) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Session administrateur requise. Veuillez vous connecter.'
        });
    }
    next();
}

function sanitizeText(str) {
    if (!str) return '';
    return String(str).replace(/[<>]/g, '').trim();
}

// Configuration Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY;
const isStripeConfigured = stripeKey && !stripeKey.includes('demo_mode') && stripeKey.startsWith('sk_');
let stripe = null;
if (isStripeConfigured) {
    stripe = require('stripe')(stripeKey);
}

// Middleware CORS complet pour supporter à la fois http://localhost:3000 et file:///
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
app.use(cors());
app.use(express.json());

// BLINDAGE SÉCURITÉ : Bloquer l'accès direct aux fichiers internes et sensibles
app.use((req, res, next) => {
    const p = req.path.toLowerCase();
    if (
        p.startsWith('/data/') ||
        p === '/server.js' ||
        p === '/db.js' ||
        p === '/aliexpress-service.js' ||
        p === '/package.json' ||
        p === '/package-lock.json' ||
        p.includes('.env') ||
        p.includes('.git') ||
        p.endsWith('.log')
    ) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Accès interdit. Ce fichier est sécurisé.'
        });
    }
    next();
});

// Compatibilité images : servir automatiquement l'image depuis la racine si le sous-dossier n'existe pas
app.use('/images', (req, res, next) => {
    const filename = path.basename(req.path);
    const rootPath = path.join(__dirname, filename);
    if (fs.existsSync(rootPath)) {
        return res.sendFile(rootPath);
    }
    next();
});

// Servir tous les fichiers statiques du site (HTML, CSS, JS, Images)
app.use(express.static(path.join(__dirname)));

// Chemins des données & Catalogue de secours
const defaultCatalog = require('./default-catalog.js');
const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// S'assurer que le dossier data/ et les fichiers initiaux existent
try {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(PRODUCTS_FILE)) {
        fs.writeFileSync(PRODUCTS_FILE, '[]', 'utf-8');
    }
    if (!fs.existsSync(ORDERS_FILE)) {
        fs.writeFileSync(ORDERS_FILE, '[]', 'utf-8');
    }
} catch (e) {
    console.warn('Initialisation data/ warning:', e.message);
}

// Fonctions utilitaires JSON (synchronisées avec MongoDB Cloud Atlas)
function readJSON(filePath, fallback = []) {
    if (filePath === PRODUCTS_FILE) {
        return db.getProducts();
    }
    if (filePath === ORDERS_FILE) {
        return db.getOrders();
    }
    try {
        if (!fs.existsSync(filePath)) {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
            return fallback;
        }
        const data = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch (err) {
        console.error(`Erreur lecture ${filePath}:`, err.message);
        return fallback;
    }
}

function writeJSON(filePath, data) {
    if (filePath === PRODUCTS_FILE) {
        db.setProducts(data);
        return;
    }
    if (filePath === ORDERS_FILE) {
        db.setOrders(data);
        return;
    }
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ==========================================
// 0. API AUTHENTIFICATION & SÉCURITÉ ADMIN
// ==========================================

// Connexion Administrateur
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (!password) {
        return res.status(400).json({ success: false, error: 'Mot de passe requis.' });
    }
    if (password === ADMIN_PASSWORD) {
        const token = generateAdminToken();
        console.log(`🔐 Connexion réussie au Panel Admin`);
        return res.json({ success: true, token: token, message: 'Authentification validée.' });
    }
    console.warn(`⚠️ Tentative de connexion admin refusée.`);
    return res.status(401).json({ success: false, error: 'Mot de passe administrateur incorrect.' });
});

// Vérification de la session admin
app.get('/api/admin/verify', (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim() || req.query.token;
    if (verifyAdminToken(token)) {
        return res.json({ success: true, authenticated: true });
    }
    return res.status(401).json({ success: false, authenticated: false, error: 'Non authentifié.' });
});

// Suivi colis public sécurisé (sans divulguer la liste des commandes ou les marges)
app.get('/api/tracking/:query', async (req, res) => {
    const q = req.params.query.trim().toLowerCase();
    const orders = readJSON(ORDERS_FILE, []);
    const found = orders.find(o => 
        (o.id && o.id.toLowerCase() === q) ||
        (o.tracking && o.tracking.number && o.tracking.number.toLowerCase() === q)
    );
    if (!found) {
        return res.status(404).json({ success: false, error: 'Commande introuvable.' });
    }

    // Auto-validation immédiate si le client revient avec une session Stripe validée
    const sessionId = req.query.session_id;
    if (found.status === 'pending_payment' && isStripeConfigured && stripe && sessionId) {
        try {
            const sess = await stripe.checkout.sessions.retrieve(sessionId);
            if (sess && (sess.payment_status === 'paid' || sess.status === 'complete')) {
                found.status = 'paid';
                if (found.aliexpress_fulfillment) {
                    found.aliexpress_fulfillment.status = 'ready_for_supplier';
                }
                writeJSON(ORDERS_FILE, orders);
                console.log(`✅ [Stripe] Paiement validé automatiquement pour #${found.id}`);
            }
        } catch (e) {
            console.warn('[Stripe] Vérification session:', e.message);
        }
    }

    return res.json({
        success: true,
        order: {
            id: found.id,
            date: found.date,
            status: found.status,
            total: found.total,
            shipping: found.shipping,
            items: (found.items || []).map(i => ({
                name: i.name,
                quantity: i.quantity,
                price: i.price,
                image: i.image
            })),
            shipping_address: {
                name: found.shipping_address?.name,
                address: found.shipping_address?.address,
                city: found.shipping_address?.city,
                postal: found.shipping_address?.postal,
                country: found.shipping_address?.country || 'France'
            },
            tracking: found.tracking || null
        }
    });
});

// ==========================================
// 1. API PRODUITS
// ==========================================

// Liste de tous les produits
app.get('/api/products', (req, res) => {
    const products = readJSON(PRODUCTS_FILE, []);
    res.json({ success: true, count: products.length, products });
});

// Récupérer un produit par ID
app.get('/api/products/:id', (req, res) => {
    const products = readJSON(PRODUCTS_FILE, []);
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ success: false, error: 'Produit non trouvé' });
    }
    res.json({ success: true, product });
});

// ==========================================
// 2. API ALIEXPRESS (IMPORT & SYNCHRO)
// ==========================================

// Prévisualiser un produit AliExpress avant de l'importer
app.post('/api/aliexpress/preview', requireAdminAuth, async (req, res) => {
    const { urlOrId } = req.body;
    if (!urlOrId) {
        return res.status(400).json({ success: false, error: 'URL ou ID AliExpress requis.' });
    }

    try {
        const preview = await aliService.fetchProduct(urlOrId);
        res.json({ success: true, preview });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Importer définitivement un produit AliExpress dans le catalogue
app.post('/api/aliexpress/import', requireAdminAuth, async (req, res) => {
    const { urlOrId, customPrice, customName, category } = req.body;
    if (!urlOrId) {
        return res.status(400).json({ success: false, error: 'URL ou ID AliExpress requis.' });
    }

    try {
        const productData = await aliService.fetchProduct(urlOrId);

        // Personnalisations optionnelles
        if (customName) productData.name = customName;
        if (req.body.customImage && typeof req.body.customImage === 'string' && req.body.customImage.startsWith('http')) {
            productData.image = req.body.customImage;
            if (!productData.images || !productData.images.length) {
                productData.images = [req.body.customImage];
            } else if (!productData.images.includes(req.body.customImage)) {
                productData.images.unshift(req.body.customImage);
            }
        }
        if (req.body.supplierPrice && !isNaN(req.body.supplierPrice)) {
            const sp = parseFloat(req.body.supplierPrice);
            productData.supplierPrice = sp;
            if (productData.aliexpress) productData.aliexpress.supplierPrice = sp;
        }
        if (customPrice && !isNaN(customPrice)) {
            productData.price = parseFloat(customPrice);
        }
        if (req.body.oldPrice && !isNaN(req.body.oldPrice)) {
            productData.oldPrice = parseFloat(req.body.oldPrice);
        } else if (productData.price) {
            productData.oldPrice = Math.round(productData.price * 1.35) - 0.01;
        }
        if (req.body.discount && !isNaN(req.body.discount)) {
            productData.discount = parseInt(req.body.discount, 10);
        } else if (productData.oldPrice && productData.price && productData.oldPrice > productData.price) {
            productData.discount = Math.round(((productData.oldPrice - productData.price) / productData.oldPrice) * 100);
        }
        if (category) productData.category = category;

        const products = readJSON(PRODUCTS_FILE, []);
        
        // Vérifier si le produit existe déjà
        const existingIndex = products.findIndex(p => 
            p.aliexpress && p.aliexpress.productId === productData.aliexpress.productId
        );

        if (existingIndex >= 0) {
            products[existingIndex] = { ...products[existingIndex], ...productData };
        } else {
            products.unshift(productData); // Ajouter en tête de liste
        }

        writeJSON(PRODUCTS_FILE, products);

        // Synchroniser également dans similar-products.js pour le frontend
        syncToSimilarProductsJS(products);

        res.json({ 
            success: true, 
            message: `Produit "${productData.name}" importé avec succès !`, 
            product: productData 
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Synchronise products.json avec similar-products.js
function syncToSimilarProductsJS(products) {
    try {
        const similarPath = path.join(__dirname, 'similar-products.js');
        if (fs.existsSync(similarPath)) {
            let content = fs.readFileSync(similarPath, 'utf-8');
            const newArrayCode = `const allProducts = ${JSON.stringify(products, null, 4)};`;
            content = content.replace(/const allProducts = \[[\s\S]*?\];/s, newArrayCode);
            fs.writeFileSync(similarPath, content, 'utf-8');
        }
    } catch (e) {
        console.warn('Synchro similar-products.js warning:', e.message);
    }
}

// ==========================================
// 3. API PAIEMENT STRIPE & COMMANDES
// ==========================================

// Créer une session de paiement Stripe Checkout ou enregistrer une commande
app.post('/api/create-checkout-session', async (req, res) => {
    const { items, customer, promoCode, discount } = req.body;
    if (!items || !items.length) {
        return res.status(400).json({ success: false, error: 'Panier vide.' });
    }

    // Calcul du sous-total
    let subtotal = 0;
    items.forEach(item => {
        subtotal += (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1);
    });

    const discountVal = Math.min(subtotal, Math.max(0, parseFloat(discount) || 0));
    const discountedSubtotal = Math.max(0, subtotal - discountVal);
    const shipping = discountedSubtotal >= 50 ? 0 : 4.99;
    const total = parseFloat((discountedSubtotal + shipping).toFixed(2));

    const orderId = 'CMD-' + Date.now();
    const catalogProducts = readJSON(PRODUCTS_FILE, []);
    
    // 1. Décrémenter le stock des produits achetés dans le catalogue
    items.forEach(it => {
        const prod = catalogProducts.find(p => p.id === it.id || (p.aliexpress && p.aliexpress.productId === it.aliexpressId));
        if (prod) {
            const qty = parseInt(it.quantity) || 1;
            const currentStock = typeof prod.stockCount === 'number' ? prod.stockCount : 10;
            prod.stockCount = Math.max(0, currentStock - qty);
            prod.stock = prod.stockCount > 0;
        }
    });
    writeJSON(PRODUCTS_FILE, catalogProducts);
    syncToSimilarProductsJS(catalogProducts);

    const supplierItems = items.map(it => {
        const found = catalogProducts.find(p => p.id === it.id || (p.aliexpress && p.aliexpress.productId === it.id));
        const aliId = (found && found.aliexpress && found.aliexpress.productId) 
            ? found.aliexpress.productId 
            : (it.aliexpressId || String(it.id).replace('prod-ali-', ''));
        return {
            name: it.name,
            aliId: aliId,
            url: `https://fr.aliexpress.com/item/${aliId}.html`,
            qty: it.quantity,
            image: it.image || (found ? found.image : '')
        };
    });

    const firstItem = supplierItems[0] || {};
    const primaryAliUrl = firstItem.url || `https://fr.aliexpress.com/item/1005012626624444.html`;

    const cleanCustomer = {
        name: sanitizeText(customer?.name || 'Client Zenith'),
        email: sanitizeText(customer?.email || 'client@zenith-store.fr'),
        address: sanitizeText(customer?.address || '1 rue de la Paix'),
        city: sanitizeText(customer?.city || 'Paris'),
        postal: sanitizeText(customer?.postal || '75001'),
        country: sanitizeText(customer?.country || 'France'),
        phone: sanitizeText(customer?.phone || '0600000000')
    };

    const newOrder = {
        id: orderId,
        date: new Date().toISOString(),
        status: isStripeConfigured ? 'pending_payment' : 'paid',
        paymentMethod: isStripeConfigured ? 'stripe' : 'demo_card',
        items: items,
        subtotal: parseFloat(subtotal.toFixed(2)),
        discount: discountVal,
        promoCode: promoCode || null,
        shipping: shipping,
        total: total,
        shipping_address: cleanCustomer,
        aliexpress_fulfillment: {
            status: isStripeConfigured ? 'waiting_for_payment' : 'ready_for_supplier',
            directOrderLink: primaryAliUrl,
            supplier_items: supplierItems,
            shippingPayload: {
                recipient: cleanCustomer.name,
                address: cleanCustomer.address,
                city: cleanCustomer.city,
                postal: cleanCustomer.postal,
                country: cleanCustomer.country,
                phone: cleanCustomer.phone
            }
        }
    };

    // Sauvegarder la commande
    const orders = readJSON(ORDERS_FILE, []);
    orders.unshift(newOrder);
    writeJSON(ORDERS_FILE, orders);

    console.log(`\n📦 NOUVELLE COMMANDE ENREGISTRÉE : #${orderId} (${total} €)`);
    console.log(`👤 Client : ${newOrder.shipping_address.name} (${newOrder.shipping_address.email})`);
    console.log(`🚚 Statut : ${newOrder.status.toUpperCase()} &bull; Stock décrémenté automatiquement.\n`);

    // Si Stripe est configuré, créer une vraie session Stripe Checkout
    if (isStripeConfigured && stripe) {
        try {
            const lineItems = items.map(item => ({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: item.name,
                        images: item.image ? [`${process.env.SITE_URL || 'http://localhost:3000'}/${item.image}`] : []
                    },
                    unit_amount: Math.round(parseFloat(item.price) * 100)
                },
                quantity: item.quantity
            }));

            if (shipping > 0) {
                lineItems.push({
                    price_data: {
                        currency: 'eur',
                        product_data: { name: 'Frais de livraison standard' },
                        unit_amount: Math.round(shipping * 100)
                    },
                    quantity: 1
                });
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                success_url: `${process.env.SITE_URL || 'http://localhost:3000'}/commandes.html?order_id=${orderId}&success=true&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.SITE_URL || 'http://localhost:3000'}/panier.html?canceled=true`,
                customer_email: customer ? customer.email : undefined,
                client_reference_id: orderId
            });

            return res.json({ success: true, stripeEnabled: true, checkoutUrl: session.url, orderId });
        } catch (err) {
            console.error('Erreur Stripe Checkout:', err.message);
            // Fallback mode test si la clé est invalide
        }
    }

    // Mode simulation / Démo instantané si Stripe non configuré
    return res.json({
        success: true,
        stripeEnabled: false,
        message: 'Mode Démo (Stripe non configuré) : commande enregistrée avec succès.',
        orderId: orderId,
        redirectUrl: `commandes.html?order_id=${orderId}&success=true`
    });
});

// Valider une commande & déclencher l'auto-fulfillment AliExpress
app.post('/api/orders/:id/confirm-payment', requireAdminAuth, (req, res) => {
    const orderId = req.params.id;
    const orders = readJSON(ORDERS_FILE, []);
    const orderIndex = orders.findIndex(o => o.id === orderId);

    if (orderIndex === -1) {
        return res.status(404).json({ success: false, error: 'Commande non trouvée' });
    }

    orders[orderIndex].status = 'paid';
    const existingFulfillment = orders[orderIndex].aliexpress_fulfillment || {};
    const firstSupplierItem = existingFulfillment.supplier_items?.[0];
    const directLink = existingFulfillment.directOrderLink || (firstSupplierItem ? `https://fr.aliexpress.com/item/${firstSupplierItem.aliId}.html` : 'https://fr.aliexpress.com');

    orders[orderIndex].aliexpress_fulfillment = {
        ...existingFulfillment,
        status: 'ready_for_supplier',
        preparedAt: new Date().toISOString(),
        directOrderLink: directLink,
        shippingPayload: {
            recipient: orders[orderIndex].shipping_address.name,
            address: orders[orderIndex].shipping_address.address,
            city: orders[orderIndex].shipping_address.city,
            postal: orders[orderIndex].shipping_address.postal,
            country: orders[orderIndex].shipping_address.country || 'France'
        }
    };

    writeJSON(ORDERS_FILE, orders);
    res.json({ success: true, order: orders[orderIndex] });
});

// Récupérer la liste des commandes pour l'admin
app.get('/api/orders', requireAdminAuth, (req, res) => {
    const orders = readJSON(ORDERS_FILE, []);
    res.json({ success: true, count: orders.length, orders });
});

// Mettre à jour le suivi colis (Tracking AliExpress)
app.post('/api/orders/:id/tracking', requireAdminAuth, (req, res) => {
    const { trackingNumber, carrier } = req.body;
    if (!trackingNumber) {
        return res.status(400).json({ success: false, error: 'Numéro de suivi requis.' });
    }

    const orders = readJSON(ORDERS_FILE, []);
    const order = orders.find(o => o.id === req.params.id);

    if (!order) {
        return res.status(404).json({ success: false, error: 'Commande non trouvée.' });
    }

    order.status = 'shipped';
    order.tracking = {
        number: trackingNumber,
        carrier: carrier || 'Colissimo / Cainiao',
        shippedAt: new Date().toISOString(),
        trackingUrl: `https://www.17track.net/fr/track?nums=${trackingNumber}`
    };

    writeJSON(ORDERS_FILE, orders);
    res.json({ success: true, message: 'Suivi mis à jour avec succès.', order });
});

// Modifier le statut d'une commande
app.post('/api/orders/:id/status', requireAdminAuth, (req, res) => {
    const { status } = req.body;
    const orders = readJSON(ORDERS_FILE, []);
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Commande non trouvée' });

    const oldStatus = order.status;
    order.status = status;

    // Si la commande est annulée ou remboursée, restituer le stock
    if ((status === 'cancelled' || status === 'refunded') && oldStatus !== 'cancelled' && oldStatus !== 'refunded') {
        const catalog = readJSON(PRODUCTS_FILE, []);
        (order.items || []).forEach(it => {
            const prod = catalog.find(p => p.id === it.id || (p.aliexpress && p.aliexpress.productId === it.aliexpressId));
            if (prod) {
                const qty = parseInt(it.quantity) || 1;
                prod.stockCount = (typeof prod.stockCount === 'number' ? prod.stockCount : 10) + qty;
                prod.stock = prod.stockCount > 0;
            }
        });
        writeJSON(PRODUCTS_FILE, catalog);
        syncToSimilarProductsJS(catalog);
    }

    writeJSON(ORDERS_FILE, orders);
    res.json({ success: true, message: 'Statut mis à jour', order });
});

// Créer manuellement une commande (Admin direct)
app.post('/api/orders/manual', requireAdminAuth, (req, res) => {
    const { customer, items, paymentMethod, status } = req.body;
    if (!items || !items.length) {
        return res.status(400).json({ success: false, error: 'Articles requis.' });
    }

    let subtotal = 0;
    items.forEach(it => subtotal += (parseFloat(it.price) || 0) * (parseInt(it.quantity) || 1));
    const shipping = subtotal >= 50 ? 0 : 4.99;
    const total = parseFloat((subtotal + shipping).toFixed(2));

    const orderId = 'CMD-' + Date.now();
    const catalogProducts = readJSON(PRODUCTS_FILE, []);

    // Décrémenter le stock
    items.forEach(it => {
        const prod = catalogProducts.find(p => p.id === it.id || (p.aliexpress && p.aliexpress.productId === it.aliexpressId));
        if (prod) {
            const qty = parseInt(it.quantity) || 1;
            const currentStock = typeof prod.stockCount === 'number' ? prod.stockCount : 10;
            prod.stockCount = Math.max(0, currentStock - qty);
            prod.stock = prod.stockCount > 0;
        }
    });
    writeJSON(PRODUCTS_FILE, catalogProducts);
    syncToSimilarProductsJS(catalogProducts);

    const supplierItems = items.map(it => {
        const found = catalogProducts.find(p => p.id === it.id || (p.aliexpress && p.aliexpress.productId === it.id));
        const aliId = (found && found.aliexpress && found.aliexpress.productId) ? found.aliexpress.productId : (it.aliexpressId || '1005012626624444');
        return {
            name: it.name,
            aliId: aliId,
            url: `https://fr.aliexpress.com/item/${aliId}.html`,
            qty: it.quantity || 1,
            image: it.image || (found ? found.image : '')
        };
    });

    const cleanCustomer = {
        name: sanitizeText(customer?.name || 'Client Manuel'),
        address: sanitizeText(customer?.address || '1 rue Centrale'),
        city: sanitizeText(customer?.city || 'Paris'),
        postal: sanitizeText(customer?.postal || '75001'),
        country: sanitizeText(customer?.country || 'France'),
        email: sanitizeText(customer?.email || 'client@zenith-store.fr'),
        phone: sanitizeText(customer?.phone || '0600000000')
    };

    const newOrder = {
        id: orderId,
        date: new Date().toISOString(),
        status: status || 'paid',
        paymentMethod: paymentMethod || 'manual_admin',
        items: items,
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping: shipping,
        total: total,
        shipping_address: cleanCustomer,
        aliexpress_fulfillment: {
            status: 'ready_for_supplier',
            directOrderLink: supplierItems[0]?.url || 'https://fr.aliexpress.com',
            supplier_items: supplierItems,
            shippingPayload: {
                recipient: cleanCustomer.name,
                address: cleanCustomer.address,
                city: cleanCustomer.city,
                postal: cleanCustomer.postal,
                country: cleanCustomer.country,
                phone: cleanCustomer.phone
            }
        }
    };

    const orders = readJSON(ORDERS_FILE, []);
    orders.unshift(newOrder);
    writeJSON(ORDERS_FILE, orders);

    res.json({ success: true, message: 'Commande manuelle créée avec succès', order: newOrder });
});

// Supprimer une commande
app.delete('/api/orders/:id', requireAdminAuth, (req, res) => {
    let orders = readJSON(ORDERS_FILE, []);
    const initialLen = orders.length;
    orders = orders.filter(o => o.id !== req.params.id);
    if (orders.length === initialLen) {
        return res.status(404).json({ success: false, error: 'Commande non trouvée' });
    }
    writeJSON(ORDERS_FILE, orders);
    res.json({ success: true, message: 'Commande supprimée avec succès' });
});

// Mettre à jour le stock, les prix ou le nom d'un produit
app.post('/api/products/:id/stock', requireAdminAuth, (req, res) => {
    const { stockCount, price, supplierPrice, oldPrice, discount, name, category } = req.body;
    const products = readJSON(PRODUCTS_FILE, []);
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Produit non trouvé' });

    if (name && typeof name === 'string') product.name = name;
    if (category && typeof category === 'string') product.category = category;

    if (typeof stockCount === 'number') {
        product.stockCount = stockCount;
        product.stock = stockCount > 0;
    }
    if (typeof price === 'number') product.price = price;
    if (typeof supplierPrice === 'number') {
        product.supplierPrice = supplierPrice;
        if (product.aliexpress) product.aliexpress.supplierPrice = supplierPrice;
    }
    if (typeof oldPrice === 'number') product.oldPrice = oldPrice;
    if (typeof discount === 'number') product.discount = discount;

    writeJSON(PRODUCTS_FILE, products);
    syncToSimilarProductsJS(products);
    res.json({ success: true, message: 'Produit mis à jour', product });
});

// Supprimer un produit du catalogue
app.delete('/api/products/:id', requireAdminAuth, (req, res) => {
    let products = readJSON(PRODUCTS_FILE, []);
    const initialLen = products.length;
    products = products.filter(p => p.id !== req.params.id);
    if (products.length === initialLen) {
        return res.status(404).json({ success: false, error: 'Produit non trouvé' });
    }
    writeJSON(PRODUCTS_FILE, products);
    syncToSimilarProductsJS(products);
    res.json({ success: true, message: 'Produit supprimé avec succès' });
});

// Vider tout le catalogue (Admin uniquement)
app.post('/api/products/clear', requireAdminAuth, (req, res) => {
    writeJSON(PRODUCTS_FILE, []);
    syncToSimilarProductsJS([]);
    console.log('🗑️ Catalogue vidé par l\'administrateur.');
    res.json({ success: true, message: 'Catalogue entièrement vidé.' });
});

// Réinitialiser les commandes et clients à zéro (Admin uniquement)
app.post('/api/admin/reset-data', requireAdminAuth, (req, res) => {
    writeJSON(ORDERS_FILE, []);
    console.log('🧹 Données de commandes et clients remises à 0 par l\'administrateur.');
    res.json({ success: true, message: 'Toutes les commandes et clients ont été réinitialisés à 0.' });
});

// ==========================================
// DÉMARRAGE DU SERVEUR
// ==========================================
app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 ZENITH STORE BACKEND EN LIGNE SUR http://localhost:${PORT}`);
    console.log(`🍃 Base de Données : MONGODB ATLAS CLOUD CONNECTÉ`);
    console.log(`💳 Stripe Mode : ${isStripeConfigured ? 'ACTIF (Paiements Réels)' : 'DÉMO (Simulateur)'}`);
    console.log(`📦 Liaison AliExpress : OPÉRATIONNELLE`);
    console.log(`======================================================\n`);
});
