// ========================================
// PROGRAMME DE FIDÉLITÉ & POINTS - FONCTIONNALITÉ 30
// ========================================

const LoyaltyProgram = {
    pointsPerEuro: 10, // 10 points par euro dépensé
    levels: [
        { name: 'Bronze', minPoints: 0, multiplier: 1, benefits: ['Points standards', 'Offres exclusives'] },
        { name: 'Silver', minPoints: 1000, multiplier: 1.2, benefits: ['Bonus +20%', 'Livraison offerte', 'Accès anticipé'] },
        { name: 'Gold', minPoints: 5000, multiplier: 1.5, benefits: ['Bonus +50%', 'Support prioritaire', 'Cadeaux exclusifs'] },
        { name: 'Platinum', minPoints: 10000, multiplier: 2, benefits: ['Bonus x2', 'Événements VIP', 'Récompenses premium'] }
    ],
    rewards: [
        { id: 'r1', name: '5€ de réduction', points: 500, type: 'discount', value: 5, icon: 'tag' },
        { id: 'r2', name: '10€ de réduction', points: 1000, type: 'discount', value: 10, icon: 'tag' },
        { id: 'r3', name: '25€ de réduction', points: 2500, type: 'discount', value: 25, icon: 'tags' },
        { id: 'r4', name: 'Livraison gratuite', points: 300, type: 'shipping', value: 0, icon: 'shipping-fast' },
        { id: 'r5', name: 'Produit mystère', points: 1500, type: 'gift', value: null, icon: 'gift' },
        { id: 'r6', name: 'Accessoire gaming', points: 3000, type: 'gift', value: null, icon: 'gamepad' }
    ],

    // Obtenir les points de l'utilisateur
    getUserPoints() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return 0;
        
        const allUsers = JSON.parse(localStorage.getItem('users')) || [];
        const user = allUsers.find(u => u.email === currentUser.email);
        
        return user?.loyaltyPoints || 0;
    },

    // Obtenir le niveau de l'utilisateur
    getUserLevel() {
        const points = this.getUserPoints();
        
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (points >= this.levels[i].minPoints) {
                return this.levels[i];
            }
        }
        
        return this.levels[0];
    },

    // Calculer les points pour le prochain niveau
    getPointsToNextLevel() {
        const currentPoints = this.getUserPoints();
        const currentLevel = this.getUserLevel();
        const currentLevelIndex = this.levels.findIndex(l => l.name === currentLevel.name);
        
        if (currentLevelIndex === this.levels.length - 1) {
            return 0; // Niveau max atteint
        }
        
        const nextLevel = this.levels[currentLevelIndex + 1];
        return nextLevel.minPoints - currentPoints;
    },

    // Ajouter des points
    addPoints(amount, reason = 'Achat') {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        const allUsers = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
        
        if (userIndex === -1) return;
        
        const currentLevel = this.getUserLevel();
        const pointsToAdd = Math.floor(amount * currentLevel.multiplier);
        
        allUsers[userIndex].loyaltyPoints = (allUsers[userIndex].loyaltyPoints || 0) + pointsToAdd;
        
        // Historique des points
        if (!allUsers[userIndex].pointsHistory) {
            allUsers[userIndex].pointsHistory = [];
        }
        
        allUsers[userIndex].pointsHistory.push({
            points: pointsToAdd,
            reason,
            date: new Date().toISOString()
        });
        
        localStorage.setItem('users', JSON.stringify(allUsers));
        
        // Notification
        this.showPointsNotification(pointsToAdd, reason);
        
        // Vérifier si niveau supérieur atteint
        this.checkLevelUp(allUsers[userIndex].loyaltyPoints);
    },

    // Dépenser des points
    redeemReward(rewardId) {
        const reward = this.rewards.find(r => r.id === rewardId);
        if (!reward) return { success: false, message: 'Récompense introuvable' };
        
        const currentPoints = this.getUserPoints();
        
        if (currentPoints < reward.points) {
            return { success: false, message: 'Points insuffisants' };
        }
        
        // Retirer les points
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const allUsers = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = allUsers.findIndex(u => u.email === currentUser.email);
        
        allUsers[userIndex].loyaltyPoints -= reward.points;
        
        // Ajouter à l'historique
        allUsers[userIndex].pointsHistory.push({
            points: -reward.points,
            reason: `Échange: ${reward.name}`,
            date: new Date().toISOString()
        });
        
        // Ajouter la récompense aux récompenses obtenues
        if (!allUsers[userIndex].redeemedRewards) {
            allUsers[userIndex].redeemedRewards = [];
        }
        
        allUsers[userIndex].redeemedRewards.push({
            ...reward,
            redeemedAt: new Date().toISOString()
        });
        
        localStorage.setItem('users', JSON.stringify(allUsers));
        
        // Notification
        if (typeof showNotification === 'function') {
            showNotification(`🎉 ${reward.name} obtenu !`, 'success');
        }
        
        return { success: true, message: 'Récompense obtenue !', reward };
    },

    // Vérifier si un nouveau niveau est atteint
    checkLevelUp(newPoints) {
        const currentLevel = this.getUserLevel();
        const nextLevelIndex = this.levels.findIndex(l => l.name === currentLevel.name) + 1;
        
        if (nextLevelIndex < this.levels.length) {
            const nextLevel = this.levels[nextLevelIndex];
            
            if (newPoints >= nextLevel.minPoints) {
                this.showLevelUpNotification(nextLevel);
            }
        }
    },

    // Afficher une notification de points
    showPointsNotification(points, reason) {
        if (typeof showNotification === 'function') {
            showNotification(`+${points} points • ${reason}`, 'success');
        }
    },

    // Afficher une notification de niveau supérieur - SIMPLIFIÉ
    showLevelUpNotification(level) {
        if (typeof showNotification === 'function') {
            showNotification(`Niveau ${level.name} atteint ! Nouveaux avantages debloques`, 'success');
        }
    },

    // Créer le widget de fidélité - VERSION SIMPLE
    createLoyaltyWidget() {
        const points = this.getUserPoints();
        const level = this.getUserLevel();
        const pointsToNext = this.getPointsToNextLevel();
        const currentLevelIndex = this.levels.findIndex(l => l.name === level.name);
        const nextLevel = currentLevelIndex < this.levels.length - 1 ? this.levels[currentLevelIndex + 1] : null;
        
        return `
            <div class="loyalty-widget" style="
                background: rgba(17, 17, 17, 0.95);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 16px;
                padding: 24px;
                margin: 24px 0;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <div>
                        <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 4px; color: #fff;">
                            Programme de Fidelite
                        </h3>
                        <p style="font-size: 13px; color: #888;">
                            Niveau ${level.name}
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 24px; font-weight: 700; color: #8b5cf6;">
                            ${points.toLocaleString()}
                        </div>
                        <div style="font-size: 12px; color: #888;">points</div>
                    </div>
                </div>
                
                ${nextLevel ? `
                    <div style="margin-bottom: 16px;">
                        <div style="font-size: 12px; color: #888; margin-bottom: 6px;">
                            Prochain niveau: ${nextLevel.name} (${pointsToNext} points)
                        </div>
                        <div style="
                            background: rgba(0, 0, 0, 0.3);
                            border-radius: 8px;
                            height: 8px;
                            overflow: hidden;
                        ">
                            <div style="
                                background: #8b5cf6;
                                height: 100%;
                                width: ${((points - level.minPoints) / (nextLevel.minPoints - level.minPoints)) * 100}%;
                            "></div>
                        </div>
                    </div>
                ` : ''}
                
                <button onclick="LoyaltyProgram.showRewardsModal()" style="
                    width: 100%;
                    background: #8b5cf6;
                    border: none;
                    color: #fff;
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                ">
                    Echanger mes points
                </button>
            </div>
        `;
    },

    // Afficher la modale des récompenses
    showRewardsModal() {
        const currentPoints = this.getUserPoints();
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            overflow-y: auto;
        `;
        
        modal.innerHTML = `
            <div style="
                background: rgba(17, 17, 17, 0.98);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 24px;
                padding: 40px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                    <div>
                        <h2 style="font-size: 28px; font-weight: 800; margin-bottom: 8px; color: #fff;">
                            🎁 Boutique de Récompenses
                        </h2>
                        <p style="font-size: 14px; color: #888;">
                            Vous avez <span style="color: #8b5cf6; font-weight: 700;">${currentPoints} points</span>
                        </p>
                    </div>
                    <button onclick="this.closest('div[style*=fixed]').remove()" style="
                        background: rgba(239, 68, 68, 0.2);
                        border: 1px solid rgba(239, 68, 68, 0.4);
                        color: #ef4444;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        font-size: 18px;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">✕</button>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px;">
                    ${this.rewards.map(reward => {
                        const canAfford = currentPoints >= reward.points;
                        return `
                            <div style="
                                background: ${canAfford ? 'rgba(139, 92, 246, 0.1)' : 'rgba(0, 0, 0, 0.3)'};
                                border: 1px solid ${canAfford ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
                                border-radius: 16px;
                                padding: 24px;
                                text-align: center;
                                ${!canAfford ? 'opacity: 0.5;' : ''}
                                transition: all 0.3s;
                            ">
                                <div style="font-size: 48px; margin-bottom: 16px;">
                                    <i class="fas fa-${reward.icon}"></i>
                                </div>
                                <h4 style="font-size: 16px; font-weight: 700; margin-bottom: 8px; color: #fff;">
                                    ${reward.name}
                                </h4>
                                <div style="
                                    font-size: 20px;
                                    font-weight: 800;
                                    color: #8b5cf6;
                                    margin-bottom: 16px;
                                ">
                                    ${reward.points} pts
                                </div>
                                <button 
                                    onclick="LoyaltyProgram.redeemReward('${reward.id}')"
                                    ${!canAfford ? 'disabled' : ''}
                                    style="
                                        width: 100%;
                                        background: ${canAfford ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'rgba(100, 100, 100, 0.2)'};
                                        border: none;
                                        color: #fff;
                                        padding: 12px;
                                        border-radius: 10px;
                                        font-size: 14px;
                                        font-weight: 600;
                                        cursor: ${canAfford ? 'pointer' : 'not-allowed'};
                                    "
                                >
                                    ${canAfford ? 'Échanger' : 'Insuffisant'}
                                </button>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
};

// Initialiser les points lors d'un achat
document.addEventListener('orderCompleted', (e) => {
    const orderTotal = e.detail.total;
    const points = Math.floor(orderTotal * LoyaltyProgram.pointsPerEuro);
    LoyaltyProgram.addPoints(points, 'Achat validé');
});
