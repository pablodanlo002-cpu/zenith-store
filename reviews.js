// ===== SYSTÈME D'AVIS & NOTES ZENITH STORE =====

// Récupérer les avis d'un produit
function getReviews(productId) {
    const allReviews = JSON.parse(localStorage.getItem('reviews')) || {};
    return allReviews[productId] || [];
}

// Sauvegarder les avis
function saveReviews(productId, reviews) {
    const allReviews = JSON.parse(localStorage.getItem('reviews')) || {};
    allReviews[productId] = reviews;
    localStorage.setItem('reviews', JSON.stringify(allReviews));
}

// Ajouter un avis
function addReview(productId, rating, comment, userName) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        showNotification('Connexion requise', 'Vous devez être connecté pour laisser un avis', 'warning');
        return false;
    }
    
    const reviews = getReviews(productId);
    
    // Vérifier si l'utilisateur a déjà laissé un avis
    const existingReview = reviews.find(r => r.userId === currentUser.id);
    if (existingReview) {
        showNotification('Avis déjà posté', 'Vous avez déjà laissé un avis pour ce produit', 'info');
        return false;
    }
    
    const review = {
        id: Date.now(),
        userId: currentUser.id,
        userName: userName || currentUser.name || currentUser.email.split('@')[0],
        rating: rating,
        comment: comment,
        date: new Date().toISOString(),
        helpful: 0,
        verified: true // Vérifier si achat vérifié (à implémenter)
    };
    
    reviews.unshift(review); // Ajouter au début
    saveReviews(productId, reviews);
    
    showNotification('Avis publié', 'Merci pour votre avis !', 'success');
    return true;
}

// Calculer la note moyenne
function getAverageRating(productId) {
    const reviews = getReviews(productId);
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
}

// Calculer la distribution des notes
function getRatingDistribution(productId) {
    const reviews = getReviews(productId);
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviews.forEach(review => {
        distribution[review.rating]++;
    });
    
    return distribution;
}

// Marquer un avis comme utile
function markHelpful(productId, reviewId) {
    const reviews = getReviews(productId);
    const review = reviews.find(r => r.id === reviewId);
    
    if (review) {
        review.helpful++;
        saveReviews(productId, reviews);
        return true;
    }
    
    return false;
}

// Générer les étoiles HTML
function generateStars(rating, interactive = false, size = 'medium') {
    const sizeClass = size === 'large' ? 'stars-large' : size === 'small' ? 'stars-small' : 'stars-medium';
    let starsHTML = '<div class="stars-container ' + sizeClass + '">';
    
    for (let i = 1; i <= 5; i++) {
        const filled = i <= rating;
        const half = i === Math.ceil(rating) && rating % 1 !== 0;
        
        if (interactive) {
            starsHTML += `<i class="star-interactive ${filled ? 'fas' : 'far'} fa-star" data-rating="${i}"></i>`;
        } else {
            if (half) {
                starsHTML += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHTML += `<i class="${filled ? 'fas' : 'far'} fa-star"></i>`;
            }
        }
    }
    
    starsHTML += '</div>';
    return starsHTML;
}

// Créer le widget d'avis complet
function createReviewsWidget(productId, productName) {
    const reviews = getReviews(productId);
    const avgRating = getAverageRating(productId);
    const distribution = getRatingDistribution(productId);
    
    const widget = document.createElement('div');
    widget.className = 'reviews-widget';
    widget.id = 'reviewsWidget';
    
    // Résumé des notes
    const summaryHTML = `
        <div class="reviews-summary">
            <div class="rating-overview">
                <div class="avg-rating">
                    <div class="rating-number">${avgRating.toFixed(1)}</div>
                    <div class="rating-stars">${generateStars(avgRating)}</div>
                    <div class="rating-count">${reviews.length} avis</div>
                </div>
                <div class="rating-bars">
                    ${[5, 4, 3, 2, 1].map(star => {
                        const count = distribution[star];
                        const percentage = reviews.length > 0 ? (count / reviews.length * 100) : 0;
                        return `
                            <div class="rating-bar-row">
                                <span class="bar-label">${star} <i class="fas fa-star"></i></span>
                                <div class="bar-container">
                                    <div class="bar-fill" style="width: ${percentage}%"></div>
                                </div>
                                <span class="bar-count">${count}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            <button class="btn-write-review" onclick="showReviewForm()">
                <i class="fas fa-pen"></i> Écrire un avis
            </button>
        </div>
    `;
    
    // Formulaire d'avis (caché par défaut)
    const formHTML = `
        <div class="review-form" id="reviewForm" style="display: none;">
            <h3>Laisser un avis</h3>
            <div class="form-group">
                <label>Votre note *</label>
                <div class="rating-input" id="ratingInput">
                    ${generateStars(0, true, 'large')}
                </div>
                <input type="hidden" id="selectedRating" value="0">
            </div>
            <div class="form-group">
                <label>Votre avis *</label>
                <textarea id="reviewComment" rows="5" placeholder="Partagez votre expérience avec ce produit..."></textarea>
            </div>
            <div class="form-actions">
                <button class="btn-cancel" onclick="hideReviewForm()">Annuler</button>
                <button class="btn-submit" onclick="submitReview('${productId}', '${productName}')">Publier</button>
            </div>
        </div>
    `;
    
    // Liste des avis
    const reviewsListHTML = `
        <div class="reviews-list">
            ${reviews.length === 0 ? `
                <div class="no-reviews">
                    <i class="far fa-comment-dots"></i>
                    <p>Aucun avis pour le moment</p>
                    <p class="no-reviews-sub">Soyez le premier à donner votre avis !</p>
                </div>
            ` : reviews.map(review => `
                <div class="review-item">
                    <div class="review-header">
                        <div class="reviewer-info">
                            <div class="reviewer-avatar">${review.userName.charAt(0).toUpperCase()}</div>
                            <div>
                                <div class="reviewer-name">
                                    ${review.userName}
                                    ${review.verified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> Achat vérifié</span>' : ''}
                                </div>
                                <div class="review-date">${new Date(review.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                            </div>
                        </div>
                        <div class="review-rating">${generateStars(review.rating, false, 'small')}</div>
                    </div>
                    <div class="review-comment">${review.comment}</div>
                    <div class="review-footer">
                        <button class="btn-helpful" onclick="markReviewHelpful('${productId}', ${review.id})">
                            <i class="far fa-thumbs-up"></i> Utile (${review.helpful})
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    widget.innerHTML = summaryHTML + formHTML + reviewsListHTML;
    
    return widget;
}

// Afficher le formulaire d'avis
function showReviewForm() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('Connexion requise', 'Connectez-vous pour laisser un avis', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    document.getElementById('reviewForm').style.display = 'block';
    document.getElementById('reviewForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // Ajouter les événements de clic sur les étoiles
    const stars = document.querySelectorAll('.star-interactive');
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            document.getElementById('selectedRating').value = rating;
            
            // Mettre à jour l'affichage des étoiles
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.style.color = '#fbbf24';
                }
            });
        });
        
        star.addEventListener('mouseleave', function() {
            const selectedRating = parseInt(document.getElementById('selectedRating').value);
            stars.forEach((s, index) => {
                if (index >= selectedRating) {
                    s.style.color = '';
                }
            });
        });
    });
}

// Cacher le formulaire
function hideReviewForm() {
    document.getElementById('reviewForm').style.display = 'none';
}

// Soumettre un avis
function submitReview(productId, productName) {
    const rating = parseInt(document.getElementById('selectedRating').value);
    const comment = document.getElementById('reviewComment').value.trim();
    
    if (rating === 0) {
        showNotification('Note requise', 'Veuillez sélectionner une note', 'warning');
        return;
    }
    
    if (comment === '') {
        showNotification('Commentaire requis', 'Veuillez écrire un commentaire', 'warning');
        return;
    }
    
    if (comment.length < 10) {
        showNotification('Commentaire trop court', 'Votre avis doit contenir au moins 10 caractères', 'warning');
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const success = addReview(productId, rating, comment, currentUser.name);
    
    if (success) {
        // Recharger le widget
        const widget = createReviewsWidget(productId, productName);
        document.getElementById('reviewsWidget').replaceWith(widget);
    }
}

// Marquer un avis comme utile
function markReviewHelpful(productId, reviewId) {
    markHelpful(productId, reviewId);
    
    // Recharger seulement la section des avis
    location.reload();
}

// Injecter les styles CSS
const reviewsStyle = document.createElement('style');
reviewsStyle.textContent = `
    /* WIDGET AVIS */
    .reviews-widget {
        background: var(--bg-secondary, #111);
        border: 1px solid var(--border-color, #1a1a1a);
        border-radius: 16px;
        padding: 2rem;
        margin-top: 3rem;
    }
    
    .reviews-summary {
        display: flex;
        gap: 3rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid var(--border-color, #1a1a1a);
        margin-bottom: 2rem;
    }
    
    .rating-overview {
        display: flex;
        gap: 3rem;
        flex: 1;
    }
    
    .avg-rating {
        text-align: center;
    }
    
    .rating-number {
        font-size: 48px;
        font-weight: 700;
        color: var(--primary-color, #8b5cf6);
        margin-bottom: 0.5rem;
    }
    
    .rating-stars {
        margin-bottom: 0.5rem;
    }
    
    .rating-count {
        font-size: 14px;
        color: var(--text-secondary, #aaa);
    }
    
    .rating-bars {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .rating-bar-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-size: 14px;
    }
    
    .bar-label {
        width: 60px;
        color: var(--text-secondary, #aaa);
    }
    
    .bar-label i {
        color: #fbbf24;
        font-size: 12px;
    }
    
    .bar-container {
        flex: 1;
        height: 8px;
        background: var(--bg-tertiary, #1a1a1a);
        border-radius: 4px;
        overflow: hidden;
    }
    
    .bar-fill {
        height: 100%;
        background: #fbbf24;
        transition: width 0.3s;
    }
    
    .bar-count {
        width: 40px;
        text-align: right;
        color: var(--text-tertiary, #888);
    }
    
    .btn-write-review {
        padding: 1rem 2rem;
        background: var(--primary-color, #8b5cf6);
        color: #fff;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: 0.2s;
        white-space: nowrap;
    }
    
    .btn-write-review:hover {
        background: var(--primary-hover, #7c3aed);
    }
    
    /* FORMULAIRE AVIS */
    .review-form {
        background: var(--bg-tertiary, #1a1a1a);
        border: 1px solid var(--border-color, #2a2a2a);
        border-radius: 12px;
        padding: 2rem;
        margin-bottom: 2rem;
    }
    
    .review-form h3 {
        margin-bottom: 1.5rem;
    }
    
    .form-group {
        margin-bottom: 1.5rem;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
    }
    
    .rating-input {
        display: flex;
        gap: 0.5rem;
    }
    
    .star-interactive {
        font-size: 32px;
        color: #666;
        cursor: pointer;
        transition: 0.2s;
    }
    
    .star-interactive:hover {
        color: #fbbf24;
        transform: scale(1.2);
    }
    
    .star-interactive.fas {
        color: #fbbf24;
    }
    
    .review-form textarea {
        width: 100%;
        padding: 1rem;
        background: var(--bg-primary, #0a0a0a);
        border: 1px solid var(--border-color, #2a2a2a);
        border-radius: 8px;
        color: var(--text-primary, #fff);
        font-family: inherit;
        font-size: 14px;
        resize: vertical;
    }
    
    .review-form textarea:focus {
        outline: none;
        border-color: var(--primary-color, #8b5cf6);
    }
    
    .form-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }
    
    .btn-cancel,
    .btn-submit {
        padding: 0.8rem 2rem;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: 0.2s;
    }
    
    .btn-cancel {
        background: transparent;
        border: 1px solid var(--border-color, #2a2a2a);
        color: var(--text-secondary, #aaa);
    }
    
    .btn-cancel:hover {
        background: var(--bg-secondary, #111);
    }
    
    .btn-submit {
        background: var(--primary-color, #8b5cf6);
        color: #fff;
    }
    
    .btn-submit:hover {
        background: var(--primary-hover, #7c3aed);
    }
    
    /* LISTE DES AVIS */
    .reviews-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }
    
    .no-reviews {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--text-tertiary, #666);
    }
    
    .no-reviews i {
        font-size: 64px;
        margin-bottom: 1rem;
        color: var(--text-tertiary, #333);
    }
    
    .no-reviews-sub {
        font-size: 14px;
        margin-top: 0.5rem;
    }
    
    .review-item {
        background: var(--bg-tertiary, #1a1a1a);
        border: 1px solid var(--border-color, #2a2a2a);
        border-radius: 12px;
        padding: 1.5rem;
    }
    
    .review-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
    }
    
    .reviewer-info {
        display: flex;
        gap: 1rem;
    }
    
    .reviewer-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--primary-color, #8b5cf6);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        font-weight: 700;
    }
    
    .reviewer-name {
        font-weight: 600;
        margin-bottom: 0.25rem;
    }
    
    .verified-badge {
        margin-left: 0.5rem;
        font-size: 12px;
        color: #10b981;
        font-weight: 500;
    }
    
    .review-date {
        font-size: 13px;
        color: var(--text-tertiary, #666);
    }
    
    .review-comment {
        margin-bottom: 1rem;
        line-height: 1.6;
        color: var(--text-secondary, #aaa);
    }
    
    .review-footer {
        display: flex;
        gap: 1rem;
    }
    
    .btn-helpful {
        padding: 0.5rem 1rem;
        background: transparent;
        border: 1px solid var(--border-color, #2a2a2a);
        color: var(--text-secondary, #aaa);
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        transition: 0.2s;
    }
    
    .btn-helpful:hover {
        border-color: var(--primary-color, #8b5cf6);
        color: var(--primary-color, #8b5cf6);
    }
    
    /* ÉTOILES */
    .stars-container {
        display: inline-flex;
        gap: 0.25rem;
        color: #fbbf24;
    }
    
    .stars-small {
        font-size: 14px;
    }
    
    .stars-medium {
        font-size: 16px;
    }
    
    .stars-large {
        font-size: 24px;
    }
    
    /* RESPONSIVE */
    @media (max-width: 768px) {
        .reviews-summary {
            flex-direction: column;
            gap: 2rem;
        }
        
        .rating-overview {
            flex-direction: column;
            gap: 2rem;
        }
    }
`;
document.head.appendChild(reviewsStyle);

// Export pour utilisation externe
window.createReviewsWidget = createReviewsWidget;
window.showReviewForm = showReviewForm;
window.hideReviewForm = hideReviewForm;
window.submitReview = submitReview;
window.markReviewHelpful = markReviewHelpful;
