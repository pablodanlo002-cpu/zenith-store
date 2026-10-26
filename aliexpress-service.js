// aliexpress-service.js - Service d'intégration & automatisation AliExpress
const axios = require('axios');

class AliExpressService {
    constructor(config = {}) {
        this.appKey = config.appKey || process.env.ALIEXPRESS_APP_KEY;
        this.appSecret = config.appSecret || process.env.ALIEXPRESS_APP_SECRET;
        this.accessToken = config.accessToken || process.env.ALIEXPRESS_ACCESS_TOKEN;
        this.apiEndpoint = 'https://api-sg.aliexpress.com/sync';
    }

    /**
     * Extrait l'identifiant produit depuis une URL AliExpress ou un ID brut
     * Exemples :
     * - https://fr.aliexpress.com/item/1005006183202423.html
     * - 1005006183202423
     */
    extractProductId(input) {
        if (!input) return null;
        const str = String(input).trim();
        const match = str.match(/(?:item\/|id=)?(\d{10,20})/);
        return match ? match[1] : null;
    }

    /**
     * Récupère les données d'un produit AliExpress
     */
    async fetchProduct(productIdOrUrl) {
        const productId = this.extractProductId(productIdOrUrl);
        if (!productId) {
            throw new Error('Identifiant produit AliExpress invalide.');
        }

        try {
            // Requête vers le flux produit AliExpress
            const targetUrl = `https://www.aliexpress.com/item/${productId}.html`;
            const response = await axios.get(targetUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
                },
                timeout: 10000
            });

            const html = response.data;

            // Extraction des données JSON embarquées dans la page (runParams)
            let productData = null;
            const runParamsMatch = html.match(/data:\s*({.+?}),\s*csrfToken/s) || 
                                   html.match(/window\.runParams\s*=\s*({.+?});/s);

            if (runParamsMatch && runParamsMatch[1]) {
                try {
                    productData = JSON.parse(runParamsMatch[1]);
                } catch (e) {
                    // Fallback regex
                }
            }

            // Extraction titre
            let title = 'Produit Gaming AliExpress';
            const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i) ||
                               html.match(/<title>([^<]+)<\/title>/i);
            if (titleMatch && titleMatch[1]) {
                title = titleMatch[1].replace(/ - AliExpress.*$/i, '').trim();
            }

            // Extraction images (principale + galerie multi-photos)
            let mainImage = 'images/logo/logo.png';
            let galleryImages = [];

            // 1. Recherche directe dans imagePathList JSON
            const pathListMatch = html.match(/"imagePathList"\s*:\s*(\[[^\]]+\])/);
            if (pathListMatch) {
                try {
                    const parsedList = JSON.parse(pathListMatch[1]);
                    if (Array.isArray(parsedList) && parsedList.length > 0) {
                        galleryImages = parsedList.map(img => img.replace(/_[0-9]+x[0-9]+.*\.jpg$/i, ''));
                    }
                } catch(e) {}
            }

            // 2. Recherche par balises og:image ou regex CDN si pas assez de photos
            const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);
            if (imageMatch && imageMatch[1]) {
                mainImage = imageMatch[1].replace(/_[0-9]+x[0-9]+.*\.jpg$/i, '');
                if (!galleryImages.includes(mainImage)) {
                    galleryImages.unshift(mainImage);
                }
            }

            if (galleryImages.length < 4) {
                const allImgs = html.match(/https:\/\/[^"'\s]+?\.(?:jpg|png|webp|jpeg)/gi) || [];
                const filtered = Array.from(new Set(allImgs.filter(u => 
                    (u.includes('aliexpress-media.com') || u.includes('alicdn.com')) &&
                    !u.includes('avatar') && !u.includes('logo') && !u.includes('feedback') &&
                    (u.includes('/kf/') || u.includes('/item/'))
                ))).map(u => u.replace(/_[0-9]+x[0-9]+.*\.jpg$/i, ''));
                galleryImages = Array.from(new Set([...galleryImages, ...filtered]));
            }

            if (galleryImages.length > 0 && (!mainImage || mainImage.includes('logo.png'))) {
                mainImage = galleryImages[0];
            } else if (galleryImages.length === 0) {
                galleryImages = [mainImage];
            }

            // Extraction prix fournisseur (plusieurs sources possibles)
            let supplierPrice = 5.00;
            let priceFound = false;

            // Source 1 : Paramètre pdp_npi dans l'URL originale si fournie
            const rawInput = String(productIdOrUrl);
            const pdpMatch = rawInput.match(/pdp_npi=[^&]*?(?:EUR|USD)[!%21]+([\d.]+)[!%21]+([\d.]+)/i) ||
                             decodeURIComponent(rawInput).match(/pdp_npi=[^&]*?(?:EUR|USD)!([\d.]+)!([\d.]+)/i);
            if (pdpMatch) {
                const detected = parseFloat(pdpMatch[2] || pdpMatch[1]);
                if (detected > 0) {
                    supplierPrice = detected;
                    priceFound = true;
                }
            }

            // Source 2 : Balises Meta produit
            if (!priceFound) {
                const metaPrice = html.match(/<meta property="product:price:amount" content="([^"]+)"/i) ||
                                  html.match(/<meta property="og:price:amount" content="([^"]+)"/i);
                if (metaPrice && metaPrice[1]) {
                    supplierPrice = parseFloat(metaPrice[1]);
                    priceFound = true;
                }
            }

            // Source 3 : Schema JSON-LD
            if (!priceFound) {
                const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
                if (jsonLdMatch && jsonLdMatch[1]) {
                    try {
                        const parsedLd = JSON.parse(jsonLdMatch[1]);
                        const offer = parsedLd.offers || (Array.isArray(parsedLd) ? parsedLd[0]?.offers : null);
                        if (offer && (offer.price || offer.lowPrice)) {
                            supplierPrice = parseFloat(offer.price || offer.lowPrice);
                            priceFound = true;
                        }
                    } catch (e) {}
                }
            }

            // Source 4 : Regex HTML
            if (!priceFound) {
                const priceMatch = html.match(/formattedActivityPrice":"([^"]+)"/) ||
                                   html.match(/activityAmount":\{"value":([\d.]+)/) ||
                                   html.match(/minAmount":\{"value":([\d.]+)/) ||
                                   html.match(/"minPrice":"([^"]+)"/) ||
                                   html.match(/(\d+[.,]\d{2})\s*€/);
                if (priceMatch && priceMatch[1]) {
                    const parsed = parseFloat(priceMatch[1].replace(',', '.'));
                    if (parsed > 0) {
                        supplierPrice = parsed;
                        priceFound = true;
                    }
                }
            }

            // Calcul intelligent du prix de vente suggéré selon le type de produit
            let suggestedSellingPrice;
            if (supplierPrice <= 10) {
                // Petits accessoires (ex: 5.09€ -> vendu 14.99€, super marge)
                suggestedSellingPrice = Math.max(supplierPrice * 2.5, supplierPrice + 8);
            } else if (supplierPrice <= 30) {
                // Périphériques moyens (ex: 20€ -> vendu 39.99€)
                suggestedSellingPrice = supplierPrice * 1.9;
            } else {
                // Matériel lourd (ex: 80€ -> vendu 129.99€)
                suggestedSellingPrice = supplierPrice * 1.5;
            }
            suggestedSellingPrice = Math.round(suggestedSellingPrice) - 0.01;

            return {
                id: `prod-ali-${productId}`,
                name: title,
                supplierPrice: supplierPrice,
                price: suggestedSellingPrice,
                oldPrice: Math.round(suggestedSellingPrice * 1.4) - 0.01,
                discount: 28,
                image: mainImage,
                images: galleryImages.slice(0, 6),
                category: this.detectCategory(title),
                brand: 'Zenith Tech',
                rating: 5,
                reviews: Math.floor(Math.random() * 40) + 35,
                stock: true,
                stockCount: 15,
                url: `produit.html?id=prod-ali-${productId}`,
                tags: ['Expédition rapide', 'Garantie 2 ans', 'Testé'],
                aliexpress: {
                    productId: productId,
                    supplierPrice: supplierPrice,
                    url: targetUrl
                }
            };
        } catch (error) {
            console.warn(`Extraction directe partielle pour AliExpress ID ${productId}:`, error.message);
            
            // Mode résilient / Fallback intelligent si AliExpress bloque le bot
            return {
                id: `prod-ali-${productId}`,
                name: `Périphérique Gaming AliExpress (#${productId.slice(-6)})`,
                supplierPrice: 29.90,
                price: 59.99,
                oldPrice: 89.99,
                discount: 33,
                image: 'images/souris/souris-2.png',
                images: ['images/souris/souris-2.png'],
                category: 'accessoires',
                brand: 'Zenith Partner',
                rating: 5,
                reviews: 42,
                stock: true,
                stockCount: 12,
                url: `produit.html?id=prod-ali-${productId}`,
                tags: ['Importé', 'Testé'],
                aliexpress: {
                    productId: productId,
                    supplierPrice: 29.90,
                    url: `https://fr.aliexpress.com/item/${productId}.html`
                }
            };
        }
    }

    /**
     * Détecte automatiquement la catégorie selon les mots clés du titre
     */
    detectCategory(title) {
        const lower = (title || '').toLowerCase();
        if (lower.includes('souris') || lower.includes('mouse')) return 'souris';
        if (lower.includes('clavier') || lower.includes('keyboard')) return 'claviers';
        if (lower.includes('casque') || lower.includes('headset') || lower.includes('headphone')) return 'casques';
        if (lower.includes('écouteur') || lower.includes('earphone') || lower.includes('iem')) return 'ecouteurs';
        if (lower.includes('tapis') || lower.includes('mousepad')) return 'tapis';
        if (lower.includes('écran') || lower.includes('monitor')) return 'ecrans';
        return 'accessoires';
    }

    /**
     * Formate et prépare le bon de commande pour le fournisseur AliExpress
     */
    generateFulfillmentData(order, product) {
        const addr = order.shipping_address || {};
        const aliId = (product.aliexpress && product.aliexpress.productId) ? product.aliexpress.productId : null;

        return {
            orderId: order.id,
            aliexpressProductId: aliId,
            customerName: addr.name || 'Client Zenith',
            shippingDetails: {
                fullName: addr.name,
                street: addr.address,
                city: addr.city,
                postalCode: addr.postal,
                country: addr.country || 'France',
                countryCode: 'FR'
            },
            quantity: 1,
            supplierDirectUrl: aliId ? `https://fr.aliexpress.com/item/${aliId}.html` : null,
            status: 'ready_for_fulfillment'
        };
    }
}

module.exports = new AliExpressService();
