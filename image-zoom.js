// ========================================
// ZOOM D'IMAGES PRODUIT - FONCTIONNALITÉ 24
// ========================================

const ImageZoom = {
    zoomLevel: 2,
    isZooming: false,

    // Initialiser sur toutes les images produit
    init() {
        this.attachZoomToImages();
    },

    // Attacher le zoom aux images
    attachZoomToImages() {
        const productImages = document.querySelectorAll('.product-image, .product-card img, [data-zoomable]');
        
        productImages.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', (e) => this.openZoomModal(e.target));
            
            // Hover zoom pour desktop
            if (window.innerWidth > 768) {
                img.addEventListener('mouseenter', (e) => this.enableHoverZoom(e.target));
                img.addEventListener('mouseleave', (e) => this.disableHoverZoom(e.target));
            }
        });
    },

    // Activer le zoom au survol
    enableHoverZoom(img) {
        const parent = img.parentElement;
        parent.style.position = 'relative';
        parent.style.overflow = 'hidden';
        
        img.addEventListener('mousemove', this.handleMouseMove.bind(this, img));
        img.style.transition = 'transform 0.1s ease';
    },

    // Désactiver le zoom au survol
    disableHoverZoom(img) {
        img.removeEventListener('mousemove', this.handleMouseMove);
        img.style.transform = 'scale(1)';
    },

    // Gérer le mouvement de la souris
    handleMouseMove(img, e) {
        const rect = img.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        img.style.transformOrigin = `${x}% ${y}%`;
        img.style.transform = `scale(${this.zoomLevel})`;
    },

    // Ouvrir la modale de zoom
    openZoomModal(img) {
        const modal = document.createElement('div');
        modal.id = 'imageZoomModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
            cursor: zoom-out;
        `;

        const zoomedImg = document.createElement('img');
        zoomedImg.src = img.src;
        zoomedImg.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
            animation: zoomIn 0.3s ease;
        `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(239, 68, 68, 0.9);
            border: none;
            color: #fff;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            font-size: 20px;
            cursor: pointer;
            transition: all 0.3s;
            z-index: 10001;
        `;
        closeBtn.onmouseover = () => closeBtn.style.transform = 'scale(1.1) rotate(90deg)';
        closeBtn.onmouseout = () => closeBtn.style.transform = 'scale(1) rotate(0deg)';

        const zoomControls = document.createElement('div');
        zoomControls.style.cssText = `
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 12px;
            background: rgba(17, 17, 17, 0.9);
            padding: 12px 20px;
            border-radius: 50px;
            border: 1px solid rgba(139, 92, 246, 0.3);
        `;

        const zoomInBtn = this.createZoomButton('fa-search-plus', () => {
            this.zoomLevel = Math.min(this.zoomLevel + 0.5, 5);
            zoomedImg.style.transform = `scale(${this.zoomLevel})`;
        });

        const zoomOutBtn = this.createZoomButton('fa-search-minus', () => {
            this.zoomLevel = Math.max(this.zoomLevel - 0.5, 1);
            zoomedImg.style.transform = `scale(${this.zoomLevel})`;
        });

        const resetBtn = this.createZoomButton('fa-redo', () => {
            this.zoomLevel = 1;
            zoomedImg.style.transform = 'scale(1)';
        });

        zoomControls.appendChild(zoomOutBtn);
        zoomControls.appendChild(resetBtn);
        zoomControls.appendChild(zoomInBtn);

        modal.appendChild(zoomedImg);
        modal.appendChild(closeBtn);
        modal.appendChild(zoomControls);
        document.body.appendChild(modal);

        // Fermer au clic sur le fond
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeZoomModal();
            }
        });

        closeBtn.addEventListener('click', () => this.closeZoomModal());

        // Fermer avec Escape
        document.addEventListener('keydown', this.handleEscapeKey);

        // Ajouter les animations CSS
        this.addZoomStyles();

        // Drag to pan
        this.enablePanZoom(zoomedImg);
    },

    // Créer un bouton de zoom
    createZoomButton(icon, onClick) {
        const btn = document.createElement('button');
        btn.innerHTML = `<i class="fas ${icon}"></i>`;
        btn.style.cssText = `
            background: rgba(139, 92, 246, 0.2);
            border: 1px solid rgba(139, 92, 246, 0.4);
            color: #8b5cf6;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
        `;
        btn.onmouseover = () => {
            btn.style.background = 'rgba(139, 92, 246, 0.4)';
            btn.style.transform = 'scale(1.1)';
        };
        btn.onmouseout = () => {
            btn.style.background = 'rgba(139, 92, 246, 0.2)';
            btn.style.transform = 'scale(1)';
        };
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            onClick();
        });
        return btn;
    },

    // Activer le drag pour déplacer l'image zoomée
    enablePanZoom(img) {
        let isDragging = false;
        let startX, startY, translateX = 0, translateY = 0;

        img.style.cursor = 'grab';
        img.style.transition = 'none';

        img.addEventListener('mousedown', (e) => {
            if (this.zoomLevel > 1) {
                isDragging = true;
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
                img.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                translateX = e.clientX - startX;
                translateY = e.clientY - startY;
                img.style.transform = `scale(${this.zoomLevel}) translate(${translateX / this.zoomLevel}px, ${translateY / this.zoomLevel}px)`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                img.style.cursor = 'grab';
            }
        });
    },

    // Fermer la modale de zoom
    closeZoomModal() {
        const modal = document.getElementById('imageZoomModal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => modal.remove(), 300);
        }
        document.removeEventListener('keydown', this.handleEscapeKey);
        this.zoomLevel = 2;
    },

    // Gérer la touche Escape
    handleEscapeKey(e) {
        if (e.key === 'Escape') {
            ImageZoom.closeZoomModal();
        }
    },

    // Ajouter les styles d'animation
    addZoomStyles() {
        if (document.getElementById('zoomStyles')) return;

        const style = document.createElement('style');
        style.id = 'zoomStyles';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            @keyframes zoomIn {
                from { 
                    opacity: 0;
                    transform: scale(0.8);
                }
                to { 
                    opacity: 1;
                    transform: scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }
};

// Initialiser - DÉSACTIVÉ
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => ImageZoom.init());
// } else {
//     ImageZoom.init();
// }
