// db.js - Gestion de la base de données MongoDB Atlas avec cache en mémoire et fallback local
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const defaultCatalog = require('./default-catalog');

// Cache en mémoire pour des temps de réponse ultra-rapides (< 1ms)
let cachedProducts = [];
let cachedOrders = [];
let isMongoConnected = false;
let db = null;
let client = null;

// Helper fichiers locaux (fallback / sauvegarde miroir)
function readLocalJSON(filePath, fallback = []) {
    try {
        if (!fs.existsSync(filePath)) {
            if (filePath === PRODUCTS_FILE && defaultCatalog && defaultCatalog.length > 0) {
                fs.writeFileSync(filePath, JSON.stringify(defaultCatalog, null, 2), 'utf8');
                return defaultCatalog;
            }
            fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf8');
            return fallback;
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return fallback;
    }
}

function writeLocalJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error('Erreur écriture fichier local:', e.message);
    }
}

async function initDB() {
    // 1. Initialiser le cache avec les fichiers locaux en attendant Mongo
    cachedProducts = readLocalJSON(PRODUCTS_FILE, []);
    cachedOrders = readLocalJSON(ORDERS_FILE, []);

    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://deksanet00_db_user:MdieJw59KIjKFToF@cluster0.q1mq1qv.mongodb.net/zenith_store?retryWrites=true&w=majority';

    try {
        client = new MongoClient(mongoUri, {
            serverSelectionTimeoutMS: 6000,
            connectTimeoutMS: 6000
        });

        await client.connect();
        db = client.db('zenith_store');
        isMongoConnected = true;
        console.log('🍃 Connecté avec succès à MongoDB Atlas Cloud (Base: zenith_store)');

        const productsCol = db.collection('products');
        const ordersCol = db.collection('orders');

        // Charger les données depuis MongoDB
        const mongoProducts = await productsCol.find({}, { projection: { _id: 0 } }).toArray();
        const mongoOrders = await ordersCol.find({}, { projection: { _id: 0 } }).sort({ date: -1 }).toArray();

        if (mongoProducts.length > 0) {
            cachedProducts = mongoProducts;
            writeLocalJSON(PRODUCTS_FILE, cachedProducts);
            console.log(`📦 MongoDB: ${mongoProducts.length} produit(s) synchronisé(s) depuis le cloud.`);
        } else if (cachedProducts.length > 0) {
            // Première migration si le local a des produits mais pas encore Mongo
            await productsCol.insertMany(cachedProducts);
            console.log(`⬆️ MongoDB: Migration initiale de ${cachedProducts.length} produit(s) vers le cloud.`);
        }

        if (mongoOrders.length > 0) {
            cachedOrders = mongoOrders;
            writeLocalJSON(ORDERS_FILE, cachedOrders);
            console.log(`📋 MongoDB: ${mongoOrders.length} commande(s) synchronisée(s) depuis le cloud.`);
        } else if (cachedOrders.length > 0) {
            await ordersCol.insertMany(cachedOrders);
            console.log(`⬆️ MongoDB: Migration initiale de ${cachedOrders.length} commande(s) vers le cloud.`);
        }

        // 🔄 NOUVEAU : Recharger automatiquement depuis MongoDB toutes les 60 secondes
        setInterval(async () => {
            try {
                const freshProducts = await productsCol.find({}, { projection: { _id: 0 } }).toArray();
                if (freshProducts.length !== cachedProducts.length) {
                    cachedProducts = freshProducts;
                    writeLocalJSON(PRODUCTS_FILE, cachedProducts);
                    console.log(`🔄 [Auto-Sync] ${freshProducts.length} produit(s) rechargés depuis MongoDB.`);
                }
            } catch (err) {
                console.error('⚠️ Erreur auto-sync produits:', err.message);
            }
        }, 60000); // Toutes les 60 secondes

    } catch (err) {
        console.warn('⚠️ Mode Local/Fallback actif (MongoDB indisponible ou hors-ligne):', err.message);
        isMongoConnected = false;
    }
}

// ---------------- PRODUITS ----------------

function getProducts() {
    return cachedProducts;
}

async function setProducts(newProducts) {
    cachedProducts = newProducts;
    writeLocalJSON(PRODUCTS_FILE, cachedProducts);

    if (isMongoConnected && db) {
        try {
            const col = db.collection('products');
            await col.deleteMany({});
            if (newProducts.length > 0) {
                await col.insertMany(newProducts);
            }
        } catch (e) {
            console.error('Erreur synchro MongoDB setProducts:', e.message);
        }
    }
}

async function saveProduct(product) {
    const idx = cachedProducts.findIndex(p => p.id === product.id);
    if (idx !== -1) {
        cachedProducts[idx] = product;
    } else {
        cachedProducts.unshift(product);
    }
    writeLocalJSON(PRODUCTS_FILE, cachedProducts);

    if (isMongoConnected && db) {
        try {
            await db.collection('products').replaceOne(
                { id: product.id },
                product,
                { upsert: true }
            );
        } catch (e) {
            console.error('Erreur MongoDB saveProduct:', e.message);
        }
    }
}

async function deleteProduct(productId) {
    cachedProducts = cachedProducts.filter(p => p.id !== productId);
    writeLocalJSON(PRODUCTS_FILE, cachedProducts);

    if (isMongoConnected && db) {
        try {
            await db.collection('products').deleteOne({ id: productId });
        } catch (e) {
            console.error('Erreur MongoDB deleteProduct:', e.message);
        }
    }
}

async function clearProducts() {
    cachedProducts = [];
    writeLocalJSON(PRODUCTS_FILE, []);

    if (isMongoConnected && db) {
        try {
            await db.collection('products').deleteMany({});
        } catch (e) {
            console.error('Erreur MongoDB clearProducts:', e.message);
        }
    }
}

// ---------------- COMMANDES ----------------

function getOrders() {
    return cachedOrders;
}

async function saveOrder(order) {
    const idx = cachedOrders.findIndex(o => o.id === order.id);
    if (idx !== -1) {
        cachedOrders[idx] = order;
    } else {
        cachedOrders.unshift(order);
    }
    writeLocalJSON(ORDERS_FILE, cachedOrders);

    if (isMongoConnected && db) {
        try {
            await db.collection('orders').replaceOne(
                { id: order.id },
                order,
                { upsert: true }
            );
        } catch (e) {
            console.error('Erreur MongoDB saveOrder:', e.message);
        }
    }
}

async function setOrders(newOrders) {
    cachedOrders = newOrders;
    writeLocalJSON(ORDERS_FILE, cachedOrders);

    if (isMongoConnected && db) {
        try {
            const col = db.collection('orders');
            await col.deleteMany({});
            if (newOrders.length > 0) {
                await col.insertMany(newOrders);
            }
        } catch (e) {
            console.error('Erreur MongoDB setOrders:', e.message);
        }
    }
}

async function deleteOrder(orderId) {
    cachedOrders = cachedOrders.filter(o => o.id !== orderId);
    writeLocalJSON(ORDERS_FILE, cachedOrders);

    if (isMongoConnected && db) {
        try {
            await db.collection('orders').deleteOne({ id: orderId });
        } catch (e) {
            console.error('Erreur MongoDB deleteOrder:', e.message);
        }
    }
}

async function clearOrders() {
    cachedOrders = [];
    writeLocalJSON(ORDERS_FILE, []);

    if (isMongoConnected && db) {
        try {
            await db.collection('orders').deleteMany({});
        } catch (e) {
            console.error('Erreur MongoDB clearOrders:', e.message);
        }
    }
}

// ---------------- CONVERSATIONS CHAT ----------------

async function getConversations(activeOnly = true) {
    if (isMongoConnected && db) {
        try {
            const col = db.collection('conversations');
            const filter = activeOnly ? { active: true } : {};
            return await col.find(filter).sort({ lastMessageTime: -1 }).limit(50).toArray();
        } catch (e) {
            console.error('Erreur MongoDB getConversations:', e.message);
            return [];
        }
    }
    return [];
}

async function getConversation(sessionId) {
    if (isMongoConnected && db) {
        try {
            const col = db.collection('conversations');
            return await col.findOne({ sessionId });
        } catch (e) {
            console.error('Erreur MongoDB getConversation:', e.message);
            return null;
        }
    }
    return null;
}

async function saveConversation(conversation) {
    if (isMongoConnected && db) {
        try {
            const col = db.collection('conversations');
            await col.replaceOne(
                { sessionId: conversation.sessionId },
                conversation,
                { upsert: true }
            );
            return true;
        } catch (e) {
            console.error('Erreur MongoDB saveConversation:', e.message);
            return false;
        }
    }
    return false;
}

module.exports = {
    initDB,
    isMongoConnected: () => isMongoConnected,
    getProducts,
    setProducts,
    saveProduct,
    deleteProduct,
    clearProducts,
    getOrders,
    setOrders,
    saveOrder,
    deleteOrder,
    clearOrders,
    getConversations,
    getConversation,
    saveConversation
};
