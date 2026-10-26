// ========================================
// GALERIE PLEIN ÉCRAN - FONCTIONNALITÉ 35
// ========================================

const FullGallery = {
    currentImages: [],
    currentIndex: 0,

    // Ouvrir la galerie en plein écran
    open(images, startIndex = 0) {
        this.currentImages = Array.isArray(images) ? images : [images];
        this.currentIndex = startIndex;
        
        this.createGalleryModal();
        this.displayCurrentImage();
    },

    // Créer la modale de galerie
    createGalleryModal() {
        // Supprimer l'ancienne modale si elle existe
        const existingModal = document.getElementById('fullGalleryModal');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.id = 'fullGalleryModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.98);
            z-index: 100000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        `;

        modal.innerHTML = `
            <!-- Close Button -->
            <button id="galleryClose" style="
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(239, 68, 68, 0.9);
                border: none;
                color: #fff;
                width: 48px;
                height: 48px;
                border-radius: 50%;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.3s;
                z-index: 100002;
            " onmouseover="this.style.transform='scale(1.1) rotate(90deg)'" onmouseout="this.style.transform='scale(1)'">
                <i class="fas fa-times"></i>
            </button>

            <!-- Navigation Précédent -->
            <button id="galleryPrev" style="
                position: absolute;
                left: 20px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(139, 92, 246, 0.8);
                border: none;
                color: #fff;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.3s;
                z-index: 100002;
                ${this.currentImages.length <= 1 ? 'display: none;' : ''}
            " onmouseover="this.style.background='rgba(139, 92, 246, 1)'; this.style.transform='translateY(-50%) scale(1.1)'" onmouseout="this.style.background='rgba(139, 92, 246, 0.8)'; this.style.transform='translateY(-50%)'">
                <i class="fas fa-chevron-left"></i>
            </button>

            <!-- Navigation Suivant -->
            <button id="galleryNext" style="
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
                background: rgba(139, 92, 246, 0.8);
                border: none;
                color: #fff;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.3s;
                z-index: 100002;
                ${this.currentImages.length <= 1 ? 'display: none;' : ''}
            " onmouseover="this.style.background='rgba(139, 92, 246, 1)'; this.style.transform='translateY(-50%) scale(1.1)'" onmouseout="this.style.background='rgba(139, 92, 246, 0.8)'; this.style.transform='translateY(-50%)'">
                <i class="fas fa-chevron-right"></i>
            </button>

            <!-- Image Container -->
            <div id="galleryImageContainer" style="
                width: 90%;
                height: 90%;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <img id="galleryMainImage" style="
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
                ">
            </div>

            <!-- Thumbnails -->
            <div id="galleryThumbnails" style="
                position: absolute;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 12px;
                padding: 12px 20px;
                background: rgba(17, 17, 17, 0.9);
                border-radius: 16px;
                border: 1px solid rgba(139, 92, 246, 0.3);
                max-width: 90%;
                overflow-x: auto;
                ${this.currentImages.length <= 1 ? 'display: none;' : ''}
            "></div>

            <!-- Counter -->
            <div style="
                position: absolute;
                top: 20px;
                left: 20px;
                background: rgba(17, 17, 17, 0.9);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 12px;
                padding: 12px 20px;
                color: #fff;
                font-size: 14px;
                font-weight: 600;
                ${this.currentImages.length <= 1 ? 'display: none;' : ''}
            ">
                <span id="galleryCounter"></span>
            </div>

            <!-- Controls -->
            <div style="
                position: absolute;
                top: 80px;
                right: 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
            ">
                <button id="galleryZoomIn" style="
                    background: rgba(139, 92, 246, 0.8);
                    border: none;
                    color: #fff;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    font-size: 18px;
                    cursor: pointer;
                    transition: all 0.3s;
                ">
                    <i class="fas fa-search-plus"></i>
                </button>
                <button id="galleryZoomOut" style="
                    background: rgba(139, 92, 246, 0.8);
                    border: none;
                    color: #fff;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    font-size: 18px;
                    cursor: pointer;
                    transition: all 0.3s;
                ">
                    <i class="fas fa-search-minus"></i>
                </button>
                <button id="galleryRotate" style="
                    background: rgba(139, 92, 246, 0.8);
                    border: none;
                    color: #fff;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    font-size: 18px;
                    cursor: pointer;
                    transition: all 0.3s;
                ">
                    <i class="fas fa-redo"></i>
                </button>
                <button id="galleryDownload" style="
                    background: rgba(139, 92, 246, 0.8);
                    border: none;
                    color: #fff;
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    font-size: 18px;
                    cursor: pointer;
                    transition: all 0.3s;
                ">
                    <i class="fas fa-download"></i>
                </button>
            </div>
        `;

        document.body.appendChild(modal);

        // Attacher les event listeners
        document.getElementById('galleryClose').addEventListener('click', () => this.close());
        document.getElementById('galleryPrev')?.addEventListener('click', () => this.prev());
        document.getElementById('galleryNext')?.addEventListener('click', () => this.next());
        document.getElementById('galleryZoomIn').addEventListener('click', () => this.zoom(1.2));
        document.getElementById('galleryZoomOut').addEventListener('click', () => this.zoom(0.8));
        document.getElementById('galleryRotate').addEventListener('click', () => this.rotate());
        document.getElementById('galleryDownload').addEventListener('click', () => this.download());

        // Navigation au clavier
        document.addEventListener('keydown', this.handleKeyPress.bind(this));

        // Créer les miniatures
        this.createThumbnails();
    },

    // Afficher l'image actuelle
    displayCurrentImage() {
        const img = document.getElementById('galleryMainImage');
        const counter = document.getElementById('galleryCounter');
        
        if (img) {
            img.src = this.currentImages[this.currentIndex];
            img.style.transform = 'scale(1) rotate(0deg)';
        }

        if (counter) {
            counter.textContent = `${this.currentIndex + 1} / ${this.currentImages.length}`;
        }

        this.updateThumbnails();
    },

    // Créer les miniatures
    createThumbnails() {
        const container = document.getElementById('galleryThumbnails');
        if (!container || this.currentImages.length <= 1) return;

        container.innerHTML = this.currentImages.map((src, index) => `
            <img 
                src="${src}" 
                data-index="${index}"
                style="
                    width: 80px;
                    height: 60px;
                    object-fit: cover;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: 2px solid ${index === this.currentIndex ? '#8b5cf6' : 'transparent'};
                    opacity: ${index === this.currentIndex ? '1' : '0.6'};
                "
                onclick="FullGallery.goToIndex(${index})"
                onmouseover="this.style.opacity='1'; this.style.transform='scale(1.1)'"
                onmouseout="this.style.opacity='${index === this.currentIndex ? '1' : '0.6'}'; this.style.transform='scale(1)'"
            >
        `).join('');
    },

    // Mettre à jour les miniatures
    updateThumbnails() {
        const thumbnails = document.querySelectorAll('#galleryThumbnails img');
        thumbnails.forEach((thumb, index) => {
            thumb.style.border = index === this.currentIndex ? '2px solid #8b5cf6' : '2px solid transparent';
            thumb.style.opacity = index === this.currentIndex ? '1' : '0.6';
        });
    },

    // Image précédente
    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.currentImages.length) % this.currentImages.length;
        this.displayCurrentImage();
    },

    // Image suivante
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.currentImages.length;
        this.displayCurrentImage();
    },

    // Aller à un index spécifique
    goToIndex(index) {
        this.currentIndex = index;
        this.displayCurrentImage();
    },

    // Zoomer
    zoom(factor) {
        const img = document.getElementById('galleryMainImage');
        if (!img) return;

        const currentTransform = img.style.transform || 'scale(1) rotate(0deg)';
        const scaleMatch = currentTransform.match(/scale\(([\d.]+)\)/);
        const rotateMatch = currentTransform.match(/rotate\(([\d.-]+)deg\)/);
        
        const currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
        const currentRotate = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
        
        const newScale = Math.max(0.5, Math.min(5, currentScale * factor));
        img.style.transform = `scale(${newScale}) rotate(${currentRotate}deg)`;
    },

    // Rotation
    rotate() {
        const img = document.getElementById('galleryMainImage');
        if (!img) return;

        const currentTransform = img.style.transform || 'scale(1) rotate(0deg)';
        const scaleMatch = currentTransform.match(/scale\(([\d.]+)\)/);
        const rotateMatch = currentTransform.match(/rotate\(([\d.-]+)deg\)/);
        
        const currentScale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;
        const currentRotate = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
        
        const newRotate = (currentRotate + 90) % 360;
        img.style.transform = `scale(${currentScale}) rotate(${newRotate}deg)`;
    },

    // Télécharger l'image
    download() {
        const link = document.createElement('a');
        link.href = this.currentImages[this.currentIndex];
        link.download = `image-${this.currentIndex + 1}.jpg`;
        link.click();
    },

    // Gérer les touches du clavier
    handleKeyPress(e) {
        switch(e.key) {
            case 'ArrowLeft':
                this.prev();
                break;
            case 'ArrowRight':
                this.next();
                break;
            case 'Escape':
                this.close();
                break;
            case '+':
            case '=':
                this.zoom(1.2);
                break;
            case '-':
                this.zoom(0.8);
                break;
        }
    },

    // Fermer la galerie
    close() {
        const modal = document.getElementById('fullGalleryModal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        }
        document.removeEventListener('keydown', this.handleKeyPress);
    }
};

// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);
