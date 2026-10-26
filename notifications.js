// ===== SYSTÈME DE NOTIFICATIONS ZENITH STORE =====

function showNotification(title, message, type = 'info') {
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = 'zenith-notification';
    notification.setAttribute('data-type', type);
    
    const icon = {
        'success': '<i class="fas fa-check-circle"></i>',
        'error': '<i class="fas fa-times-circle"></i>',
        'warning': '<i class="fas fa-exclamation-triangle"></i>',
        'info': '<i class="fas fa-info-circle"></i>',
        'ban': '<i class="fas fa-ban"></i>'
    };
    
    notification.innerHTML = `
        <div class="zenith-notification-content">
            <div class="zenith-notification-icon">
                ${icon[type] || icon['info']}
            </div>
            <div class="zenith-notification-text">
                <div class="zenith-notification-title">${title}</div>
                ${message ? `<div class="zenith-notification-message">${message}</div>` : ''}
            </div>
        </div>
        <button class="zenith-notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Ajouter au body
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Fermer automatiquement après 5 secondes
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Fonction de confirmation moderne
function showConfirm(title, message, onConfirm, onCancel) {
    // Créer la modal de confirmation
    const modal = document.createElement('div');
    modal.className = 'zenith-confirm-modal';
    
    modal.innerHTML = `
        <div class="zenith-confirm-overlay"></div>
        <div class="zenith-confirm-box">
            <div class="zenith-confirm-header">
                <i class="fas fa-exclamation-circle"></i>
                <h3>${title}</h3>
            </div>
            <div class="zenith-confirm-body">
                <p>${message}</p>
            </div>
            <div class="zenith-confirm-actions">
                <button class="zenith-btn-cancel">Annuler</button>
                <button class="zenith-btn-confirm">Confirmer</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animation d'entrée
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Boutons
    const btnCancel = modal.querySelector('.zenith-btn-cancel');
    const btnConfirm = modal.querySelector('.zenith-btn-confirm');
    const overlay = modal.querySelector('.zenith-confirm-overlay');
    
    function closeModal(confirmed) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
            if (confirmed && onConfirm) onConfirm();
            if (!confirmed && onCancel) onCancel();
        }, 300);
    }
    
    btnCancel.addEventListener('click', () => closeModal(false));
    btnConfirm.addEventListener('click', () => closeModal(true));
    overlay.addEventListener('click', () => closeModal(false));
}

// Injecter les styles CSS
const style = document.createElement('style');
style.textContent = `
    /* NOTIFICATIONS */
    .zenith-notification {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.8);
        background: #111;
        border: 1px solid #1a1a1a;
        border-radius: 16px;
        padding: 2rem;
        min-width: 400px;
        max-width: 500px;
        z-index: 10000;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    
    .zenith-notification.show {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
    }
    
    .zenith-notification-content {
        display: flex;
        gap: 1.5rem;
        align-items: flex-start;
    }
    
    .zenith-notification-icon {
        font-size: 36px;
        flex-shrink: 0;
    }
    
    .zenith-notification[data-type="success"] .zenith-notification-icon {
        color: #10b981;
    }
    
    .zenith-notification[data-type="error"] .zenith-notification-icon {
        color: #ef4444;
    }
    
    .zenith-notification[data-type="warning"] .zenith-notification-icon {
        color: #fbbf24;
    }
    
    .zenith-notification[data-type="info"] .zenith-notification-icon {
        color: #8b5cf6;
    }
    
    .zenith-notification[data-type="ban"] .zenith-notification-icon {
        color: #ef4444;
    }
    
    .zenith-notification[data-type="ban"] {
        border: 2px solid #ef4444;
        background: linear-gradient(135deg, #1a0a0f 0%, #0f0a1a 100%);
        box-shadow: 0 20px 60px rgba(239, 68, 68, 0.3);
    }
    
    .zenith-notification[data-type="ban"] .zenith-notification-title {
        color: #ef4444;
    }
    
    .zenith-notification-text {
        flex: 1;
    }
    
    .zenith-notification-title {
        font-size: 18px;
        font-weight: 700;
        color: #fff;
        margin-bottom: 0.5rem;
    }
    
    .zenith-notification-message {
        font-size: 14px;
        color: #aaa;
        line-height: 1.6;
        white-space: pre-line;
    }
    
    .zenith-notification-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: transparent;
        border: none;
        color: #666;
        font-size: 18px;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 6px;
        transition: 0.2s;
    }
    
    .zenith-notification-close:hover {
        background: #1a1a1a;
        color: #fff;
    }
    
    /* MODAL DE CONFIRMATION */
    .zenith-confirm-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .zenith-confirm-modal.show {
        opacity: 1;
    }
    
    .zenith-confirm-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
    }
    
    .zenith-confirm-box {
        position: relative;
        background: #111;
        border: 1px solid #1a1a1a;
        border-radius: 16px;
        min-width: 450px;
        max-width: 550px;
        z-index: 1;
        animation: confirmSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    @keyframes confirmSlideIn {
        from {
            transform: scale(0.9) translateY(-20px);
            opacity: 0;
        }
        to {
            transform: scale(1) translateY(0);
            opacity: 1;
        }
    }
    
    .zenith-confirm-header {
        padding: 2rem 2rem 1rem 2rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        border-bottom: 1px solid #1a1a1a;
    }
    
    .zenith-confirm-header i {
        font-size: 28px;
        color: #fbbf24;
    }
    
    .zenith-confirm-header h3 {
        font-size: 20px;
        font-weight: 700;
        color: #fff;
        margin: 0;
    }
    
    .zenith-confirm-body {
        padding: 2rem;
    }
    
    .zenith-confirm-body p {
        font-size: 15px;
        color: #aaa;
        line-height: 1.6;
        margin: 0;
        white-space: pre-line;
    }
    
    .zenith-confirm-actions {
        padding: 1.5rem 2rem 2rem 2rem;
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }
    
    .zenith-btn-cancel,
    .zenith-btn-confirm {
        padding: 0.8rem 2rem;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: 0.2s;
    }
    
    .zenith-btn-cancel {
        background: transparent;
        border: 1px solid #2a2a2a;
        color: #888;
    }
    
    .zenith-btn-cancel:hover {
        background: #1a1a1a;
        color: #fff;
    }
    
    .zenith-btn-confirm {
        background: #8b5cf6;
        color: #fff;
    }
    
    .zenith-btn-confirm:hover {
        background: #7c3aed;
    }
    
    /* RESPONSIVE */
    @media (max-width: 600px) {
        .zenith-notification {
            min-width: 90%;
            max-width: 90%;
        }
        
        .zenith-confirm-box {
            min-width: 90%;
            max-width: 90%;
        }
    }
`;
document.head.appendChild(style);
