// ===== SYSTÈME DE CHANGEMENT DE THÈME ZENITH STORE =====

// Thèmes disponibles
const themes = {
    dark: {
        '--bg-primary': '#0a0a0a',
        '--bg-secondary': '#111',
        '--bg-tertiary': '#1a1a1a',
        '--text-primary': '#ffffff',
        '--text-secondary': '#aaa',
        '--text-tertiary': '#888',
        '--border-color': '#1a1a1a',
        '--border-hover': 'rgba(139, 92, 246, 0.6)',
        '--card-bg': 'linear-gradient(145deg, #1a1a1a 0%, #151515 100%)',
        '--hover-bg': 'rgba(139, 92, 246, 0.1)',
        '--shadow': 'rgba(0, 0, 0, 0.5)'
    },
    light: {
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f9fafb',
        '--bg-tertiary': '#f3f4f6',
        '--text-primary': '#0a0a0a',
        '--text-secondary': '#4b5563',
        '--text-tertiary': '#6b7280',
        '--border-color': '#e5e7eb',
        '--border-hover': 'rgba(139, 92, 246, 0.4)',
        '--card-bg': 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
        '--hover-bg': 'rgba(139, 92, 246, 0.05)',
        '--shadow': 'rgba(0, 0, 0, 0.1)'
    }
};

// Récupérer le thème actuel
function getCurrentTheme() {
    return localStorage.getItem('theme') || 'dark';
}

// Sauvegarder le thème
function saveTheme(themeName) {
    localStorage.setItem('theme', themeName);
}

// Appliquer le thème
function applyTheme(themeName) {
    const theme = themes[themeName];
    const root = document.documentElement;
    
    // Appliquer les variables CSS
    Object.keys(theme).forEach(key => {
        root.style.setProperty(key, theme[key]);
    });
    
    // Mettre à jour l'attribut data-theme
    root.setAttribute('data-theme', themeName);
    
    // Mettre à jour le bouton toggle
    updateThemeToggle(themeName);
}

// Toggle entre les thèmes
function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    applyTheme(newTheme);
    saveTheme(newTheme);
    
    // Notification
    const themeName = newTheme === 'dark' ? 'sombre' : 'clair';
    showNotification('Thème changé', 'Thème ' + themeName + ' activé', 'info');
}

// Mettre à jour le bouton toggle
function updateThemeToggle(themeName) {
    const toggleBtns = document.querySelectorAll('.theme-toggle');
    toggleBtns.forEach(btn => {
        const icon = btn.querySelector('i');
        if (icon) {
            if (themeName === 'dark') {
                icon.className = 'fas fa-sun';
                btn.setAttribute('title', 'Mode clair');
            } else {
                icon.className = 'fas fa-moon';
                btn.setAttribute('title', 'Mode sombre');
            }
        }
    });
}

// Créer le bouton toggle
function createThemeToggle() {
    const button = document.createElement('button');
    button.className = 'theme-toggle';
    button.setAttribute('onclick', 'toggleTheme()');
    button.setAttribute('title', 'Changer le thème');
    button.innerHTML = '<i class="fas fa-sun"></i>';
    
    return button;
}

// Initialiser le thème au chargement
document.addEventListener('DOMContentLoaded', function() {
    const currentTheme = getCurrentTheme();
    applyTheme(currentTheme);
});

// Injecter les styles CSS
const themeStyle = document.createElement('style');
themeStyle.textContent = `
    /* VARIABLES CSS POUR LES THÈMES */
    :root {
        --bg-primary: #0a0a0a;
        --bg-secondary: #111;
        --bg-tertiary: #1a1a1a;
        --text-primary: #ffffff;
        --text-secondary: #aaa;
        --text-tertiary: #888;
        --border-color: #1a1a1a;
        --border-hover: rgba(139, 92, 246, 0.6);
        --card-bg: linear-gradient(145deg, #1a1a1a 0%, #151515 100%);
        --hover-bg: rgba(139, 92, 246, 0.1);
        --shadow: rgba(0, 0, 0, 0.5);
        --primary-color: #8b5cf6;
        --primary-hover: #7c3aed;
    }
    
    /* APPLIQUER LES VARIABLES */
    body {
        background: var(--bg-primary) !important;
        color: var(--text-primary) !important;
        transition: background-color 0.3s ease, color 0.3s ease;
    }
    
    .header {
        background: var(--bg-secondary) !important;
        border-bottom-color: var(--border-color) !important;
    }
    
    .product-card,
    .stat-card,
    .orders-container,
    .filters {
        background: var(--card-bg) !important;
        border-color: var(--border-color) !important;
    }
    
    .product-info,
    .modal-content,
    .login-box,
    .register-box,
    .zenith-notification,
    .zenith-confirm-box {
        background: var(--bg-secondary) !important;
        border-color: var(--border-color) !important;
    }
    
    /* BOUTON TOGGLE THÈME */
    .theme-toggle {
        background: transparent;
        border: 2px solid var(--primary-color);
        color: var(--primary-color);
        padding: 10px;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .theme-toggle:hover {
        background: var(--hover-bg);
        transform: rotate(180deg) scale(1.1);
        box-shadow: 0 4px 12px var(--shadow);
    }
    
    .theme-toggle:active {
        transform: rotate(180deg) scale(0.95);
    }
    
    /* MODE CLAIR - AJUSTEMENTS SPÉCIFIQUES */
    [data-theme="light"] .product-badge,
    [data-theme="light"] .stat-value,
    [data-theme="light"] .product-name,
    [data-theme="light"] h1,
    [data-theme="light"] h2,
    [data-theme="light"] h3 {
        color: var(--text-primary) !important;
    }
    
    [data-theme="light"] .product-brand,
    [data-theme="light"] .rating-count,
    [data-theme="light"] .stock-text,
    [data-theme="light"] .old-price {
        color: var(--text-tertiary) !important;
    }
    
    [data-theme="light"] .product-image,
    [data-theme="light"] .hero-banner {
        background: var(--bg-tertiary) !important;
    }
    
    [data-theme="light"] .nav a {
        color: var(--text-tertiary) !important;
    }
    
    [data-theme="light"] .nav a:hover,
    [data-theme="light"] .nav a.active {
        color: var(--primary-color) !important;
    }
    
    [data-theme="light"] input,
    [data-theme="light"] select,
    [data-theme="light"] textarea {
        background: var(--bg-primary) !important;
        color: var(--text-primary) !important;
        border-color: var(--border-color) !important;
    }
    
    [data-theme="light"] .btn-secondary,
    [data-theme="light"] .filter-btn {
        background: transparent !important;
        border-color: var(--border-color) !important;
        color: var(--text-secondary) !important;
    }
    
    [data-theme="light"] .btn-secondary:hover,
    [data-theme="light"] .filter-btn:hover {
        border-color: var(--primary-color) !important;
        color: var(--primary-color) !important;
    }
    
    /* BADGES EN MODE CLAIR */
    [data-theme="light"] .product-badge {
        background: var(--primary-color) !important;
        color: #ffffff !important;
        font-weight: 700;
    }
    
    /* FEATURE TAGS EN MODE CLAIR */
    [data-theme="light"] .feature-tag {
        background: #e0d4fc !important;
        color: #6d28d9 !important;
        border-color: #c4b5fd !important;
    }
    
    /* STOCK EN MODE CLAIR */
    [data-theme="light"] .stock {
        background: #d1fae5 !important;
        color: #065f46 !important;
    }
    
    [data-theme="light"] .stock-dot {
        background: #10b981 !important;
    }
    
    [data-theme="light"] .stock-text {
        color: #065f46 !important;
    }
    
    /* PRIX EN MODE CLAIR */
    [data-theme="light"] .current-price {
        color: var(--text-primary) !important;
    }
    
    [data-theme="light"] .discount {
        background: #dc2626 !important;
        color: #ffffff !important;
    }
    
    /* RATING EN MODE CLAIR */
    [data-theme="light"] .stars {
        color: #fbbf24 !important;
    }
    
    /* BOUTONS EN MODE CLAIR */
    [data-theme="light"] .btn-add,
    [data-theme="light"] .cart-btn,
    [data-theme="light"] .wishlist-btn-header {
        box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
    }
    
    [data-theme="light"] .btn-quick {
        background: var(--bg-tertiary) !important;
        color: var(--text-primary) !important;
        border-color: var(--border-color) !important;
    }
    
    [data-theme="light"] .btn-quick:hover {
        background: var(--bg-secondary) !important;
        border-color: var(--primary-color) !important;
        color: var(--primary-color) !important;
    }
    
    /* IMAGES EN MODE CLAIR */
    [data-theme="light"] .product-image img,
    [data-theme="light"] .logo img {
        filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1));
    }
    
    /* OMBRES EN MODE CLAIR */
    [data-theme="light"] .product-card:hover,
    [data-theme="light"] .cart-btn:hover,
    [data-theme="light"] .wishlist-btn-header:hover {
        box-shadow: 0 8px 24px var(--shadow);
    }
    
    /* HERO SECTION EN MODE CLAIR */
    [data-theme="light"] .hero-content h1 {
        color: var(--text-primary) !important;
    }
    
    [data-theme="light"] .hero-content p {
        color: var(--text-secondary) !important;
    }
    
    /* CATÉGORIES EN MODE CLAIR */
    [data-theme="light"] .category-card {
        background: var(--bg-secondary) !important;
        border-color: var(--border-color) !important;
    }
    
    [data-theme="light"] .category-card:hover {
        border-color: var(--primary-color) !important;
    }
    
    /* FOOTER EN MODE CLAIR */
    [data-theme="light"] .footer {
        background: var(--bg-secondary) !important;
        border-top-color: var(--border-color) !important;
    }
    
    [data-theme="light"] .footer h3,
    [data-theme="light"] .footer a {
        color: var(--text-primary) !important;
    }
    
    [data-theme="light"] .footer a:hover {
        color: var(--primary-color) !important;
    }
    
    /* SLIDER DOTS EN MODE CLAIR */
    [data-theme="light"] .slider-dot {
        background: rgba(0, 0, 0, 0.2) !important;
    }
    
    [data-theme="light"] .slider-dot.active {
        background: var(--primary-color) !important;
    }
`;
document.head.appendChild(themeStyle);
