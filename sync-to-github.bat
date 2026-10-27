@echo off
REM ==========================================
REM SCRIPT DE SYNCHRONISATION ZENITH STORE
REM Copie les fichiers vers le dossier GitHub
REM en excluant les donnees sensibles
REM ==========================================

echo.
echo ========================================
echo  SYNCHRONISATION ZENITH STORE
echo  vers ZENITH-STORE-PRET-POUR-GITHUB
echo ========================================
echo.

set SOURCE=C:\Users\deksa\Desktop\siteweb
set DEST=C:\Users\deksa\Desktop\ZENITH-STORE-PRET-POUR-GITHUB

echo Copie des fichiers...
echo.

REM Creer le dossier de destination si besoin
if not exist "%DEST%" mkdir "%DEST%"

REM Copier tous les fichiers HTML
echo [1/10] Copie des pages HTML...
xcopy /Y "%SOURCE%\*.html" "%DEST%\"

REM Copier tous les fichiers JS (sauf node_modules)
echo [2/10] Copie des scripts JavaScript...
for %%f in ("%SOURCE%\*.js") do (
    xcopy /Y "%%f" "%DEST%\"
)

REM Copier les fichiers de configuration securises
echo [3/10] Copie des fichiers de configuration...
xcopy /Y "%SOURCE%\package.json" "%DEST%\"
xcopy /Y "%SOURCE%\.gitignore" "%DEST%\"
xcopy /Y "%SOURCE%\.env.example" "%DEST%\"

REM Copier les fichiers README et documentation
echo [4/10] Copie de la documentation...
xcopy /Y "%SOURCE%\*.md" "%DEST%\"
xcopy /Y "%SOURCE%\*.txt" "%DEST%\"
xcopy /Y "%SOURCE%\*.bat" "%DEST%\"

REM Copier le dossier images complet
echo [5/10] Copie des images...
if exist "%DEST%\images\" rmdir /S /Q "%DEST%\images\"
xcopy /E /I /Y "%SOURCE%\images" "%DEST%\images"

REM Copier le dossier data (SANS orders.json)
echo [6/10] Copie du dossier data...
if not exist "%DEST%\data\" mkdir "%DEST%\data"
if exist "%SOURCE%\data\products.json" xcopy /Y "%SOURCE%\data\products.json" "%DEST%\data\"
echo [] > "%DEST%\data\orders.json"

REM NE PAS copier node_modules (trop lourd)
echo [7/10] node_modules exclu (npm install a faire apres clone)

REM NE PAS copier .env (sensible)
echo [8/10] .env exclu (fichier sensible)

REM Creer un README pour GitHub
echo [9/10] Creation du README...
(
echo # 🛍️ Zenith Store - Boutique E-commerce Dropshipping
echo.
echo Boutique e-commerce moderne avec dropshipping AliExpress automatise et paiements Stripe.
echo.
echo ## 🚀 Installation
echo.
echo ```bash
echo # 1. Cloner le repo
echo git clone https://github.com/votre-username/zenith-store.git
echo cd zenith-store
echo.
echo # 2. Installer les dependances
echo npm install
echo.
echo # 3. Configurer l'environnement
echo cp .env.example .env
echo # Editer .env avec vos cles API
echo.
echo # 4. Lancer le serveur
echo npm start
echo ```
echo.
echo ## 📋 Fonctionnalites
echo.
echo - ✅ Paiements Stripe ^(CB + Apple Pay^)
echo - ✅ Dropshipping AliExpress automatise
echo - ✅ Panel admin complet
echo - ✅ Support chat temps reel
echo - ✅ Gestion commandes
echo - ✅ 21+ fonctionnalites e-commerce
echo.
echo ## 🔐 Securite
echo.
echo **IMPORTANT :** Ne committez JAMAIS :
echo - Votre fichier `.env`
echo - Le dossier `node_modules/`
echo - Les donnees clients dans `data/orders.json`
echo.
echo ## 📚 Documentation
echo.
echo Consultez `DROPSHIPPING-GUIDE.md` pour le guide complet.
echo.
echo ## 📄 Licence
echo.
echo MIT License - Libre d'utilisation
) > "%DEST%\README.md"

echo [10/10] Synchronisation terminee !
echo.
echo ========================================
echo  TERMINE !
echo ========================================
echo.
echo Les fichiers ont ete copies vers :
echo %DEST%
echo.
echo ATTENTION : Avant de pusher sur GitHub :
echo 1. Verifiez que .env n'est PAS present
echo 2. Verifiez que node_modules/ n'est PAS present
echo 3. Verifiez que data/orders.json est vide
echo.
pause
