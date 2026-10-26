# 🚀 Guide Dropshipping & Automatisation AliExpress — Zenith Store

Ce document explique comment utiliser le système automatisé de ta boutique pour importer des produits AliExpress et expédier les commandes chez tes clients.

---

## 1. Démarrer le serveur Zenith Store

Pour que la synchronisation AliExpress et les paiements fonctionnent, lance le serveur :

```bash
cd C:\Users\deksa\Desktop\siteweb
npm start
```

Le serveur démarre sur **http://localhost:3000** :
* 🌐 **Boutique :** http://localhost:3000/index.html
* ⚙️ **Panneau Admin :** http://localhost:3000/admin.html

---

## 2. Comment importer un nouveau produit depuis AliExpress

1. Ouvre le panneau d'administration : **http://localhost:3000/admin.html**
2. Clique sur l'onglet **« AliExpress & Produits »**.
3. Colle l'URL ou l'ID AliExpress de ton produit (ex: `https://fr.aliexpress.com/item/1005006183202423.html` ou `1005006183202423`).
4. Clique sur **« Analyser »** :
   * Le robot récupère la photo HD, le nom et le prix fournisseur.
   * Il calcule automatiquement ta marge nette estimée.
5. Ajuste si tu veux le nom ou ton prix de vente (ex: 49.99€).
6. Clique sur **« Publier sur Zenith Store »** :
   * Le produit est immédiatement ajouté à ta boutique et visible par les clients !

---

## 3. Comment fonctionne le paiement et l'expédition (Flux complet)

1. **Le client commande sur ton site :**
   * Il choisit ses produits et va sur la page de paiement (`checkout.html`).
   * Il renseigne son adresse complète (Nom, Rue, Ville, Code Postal, Pays).
   * Il paie par carte bancaire.

2. **L'argent arrive chez toi :**
   * L'argent est encaissé via Stripe directement sur ton compte bancaire.

3. **Expédition chez le fournisseur AliExpress :**
   * Dans ton administration, la commande apparaît avec toutes les coordonnées du client pré-remplies.
   * Clique sur **« Fiche Fournisseur »** pour commander l'article sur AliExpress en renseignant l'adresse du client.
   * Dès qu'AliExpress t'envoie le numéro de suivi du colis, colle-le dans la commande pour que le client reçoive automatiquement le lien de suivi (Colissimo / 17track).

---

## 4. Activer les vrais paiements par carte bancaire (Stripe)

Par défaut, le serveur est en **Mode Démo** (tu peux tester les achats sans argent réel).
Pour accepter les vraies cartes bancaires et Apple Pay :

1. Crée un compte gratuit sur [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register).
2. Récupère ta **Clé secrète** (`sk_live_...` ou `sk_test_...`) dans Développeurs > Clés API.
3. Ouvre le fichier `.env` dans ton dossier et remplace :
   ```env
   STRIPE_SECRET_KEY=sk_test_ton_vrai_secret_ici
   STRIPE_PUBLISHABLE_KEY=pk_test_ta_vraie_cle_ici
   ```
4. Redémarre le serveur (`npm start`). Stripe est maintenant actif !

---

## 5. Règles d'or pour réussir en Dropshipping

* **Marge minimale :** Vends au minimum 2x à 2.5x le prix d'achat fournisseur (ex: produit acheté 20€ -> vendu 49.99€) pour couvrir les frais de pub et de transaction Stripe.
* **Délais d'expédition :** Choisis des vendeurs AliExpress avec la mention **« Choice »** ou **« Livraison 5-10 jours »** pour que tes clients reçoivent rapidement leurs colis.
* **SAV réactif :** Réponds toujours rapidement aux clients pour leur donner le lien de suivi de leur colis.
