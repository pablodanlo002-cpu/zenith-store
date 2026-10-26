// ===== ANIMATIONS AU SCROLL ZENITH STORE =====

// Observer pour détecter les éléments visibles
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1 // Déclenche quand 10% de l'élément est visible
};

// Callback quand un élément devient visible
function handleIntersection(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            // Une fois animé, on arrête d'observer
            observer.unobserve(entry.target);
        }
    });
}

// Créer l'observer
const scrollObserver = new IntersectionObserver(handleIntersection, observerOptions);

// Fonction pour initialiser les animations
function initScrollAnimations() {
    // Sélectionner tous les éléments à animer
    const elementsToAnimate = document.querySelectorAll(
        '.product-card, .category-card, .info-card, .feature-card, .stat-card, .section-title, .hero-content'
    );
    
    // Ajouter la classe initiale et observer chaque élément
    elementsToAnimate.forEach((element, index) => {
        element.classList.add('scroll-animate');
        element.style.animationDelay = `${index * 0.1}s`; // Délai progressif
        scrollObserver.observe(element);
    });
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    // Petit délai pour que le DOM soit bien chargé
    setTimeout(initScrollAnimations, 100);
});

// Injecter les styles CSS pour les animations
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    /* ANIMATIONS AU SCROLL */
    .scroll-animate {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    
    .scroll-animate.animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* ANIMATIONS SPÉCIFIQUES PAR TYPE */
    .product-card.scroll-animate {
        transform: translateY(40px) scale(0.95);
    }
    
    .product-card.animate-in {
        transform: translateY(0) scale(1);
    }
    
    .category-card.scroll-animate {
        transform: translateX(-30px);
        opacity: 0;
    }
    
    .category-card.animate-in {
        transform: translateX(0);
        opacity: 1;
    }
    
    .hero-content.scroll-animate {
        transform: translateY(50px);
        opacity: 0;
    }
    
    .hero-content.animate-in {
        transform: translateY(0);
        opacity: 1;
    }
    
    /* ANIMATION FADE IN POUR LES SECTIONS */
    .section-title.scroll-animate {
        transform: translateY(20px);
        opacity: 0;
    }
    
    .section-title.animate-in {
        transform: translateY(0);
        opacity: 1;
    }
    
    /* ANIMATION DE ROTATION LÉGÈRE */
    @keyframes fadeInRotate {
        from {
            opacity: 0;
            transform: translateY(30px) rotate(-2deg);
        }
        to {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
        }
    }
    
    /* DÉLAIS D'ANIMATION PROGRESSIFS */
    .scroll-animate:nth-child(1) { transition-delay: 0s; }
    .scroll-animate:nth-child(2) { transition-delay: 0.1s; }
    .scroll-animate:nth-child(3) { transition-delay: 0.2s; }
    .scroll-animate:nth-child(4) { transition-delay: 0.3s; }
    .scroll-animate:nth-child(5) { transition-delay: 0.4s; }
    .scroll-animate:nth-child(6) { transition-delay: 0.5s; }
    .scroll-animate:nth-child(7) { transition-delay: 0.6s; }
    .scroll-animate:nth-child(8) { transition-delay: 0.7s; }
    
    /* DÉSACTIVER LES ANIMATIONS SUR MOBILE POUR PERFORMANCES */
    @media (prefers-reduced-motion: reduce) {
        .scroll-animate {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
        }
    }
    
    /* SMOOTH SCROLL POUR TOUTE LA PAGE */
    html {
        scroll-behavior: smooth;
    }
    
    /* ANIMATION AU HOVER AMÉLIORÉE */
    .product-card.animate-in:hover {
        animation: hoverPulse 0.3s ease-in-out;
    }
    
    @keyframes hoverPulse {
        0%, 100% { transform: translateY(-12px) scale(1.02); }
        50% { transform: translateY(-14px) scale(1.03); }
    }
`;
document.head.appendChild(animationStyle);

// Export pour utilisation externe
window.initScrollAnimations = initScrollAnimations;
