// Script de test pour l'API Chat
const API_BASE = 'http://localhost:3000';

async function testChatSystem() {
    console.log('🧪 Test du système de chat MongoDB...\n');

    // 1. Test: Envoyer un message client
    console.log('1️⃣ Test: Client envoie un message...');
    const sessionId = 'test-session-' + Date.now();
    
    const sendResponse = await fetch(`${API_BASE}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId: sessionId,
            message: 'Bonjour, ceci est un message de test !',
            userInfo: {
                ip: 'test-client',
                userAgent: 'Test Script',
                language: 'fr-FR'
            }
        })
    });

    const sendData = await sendResponse.json();
    console.log('   Résultat:', sendData.success ? '✅ Envoyé' : '❌ Erreur');
    console.log('   Réponse:', sendData);
    console.log();

    // 2. Test: Récupérer la conversation
    console.log('2️⃣ Test: Récupérer la conversation...');
    const getResponse = await fetch(`${API_BASE}/api/chat/conversation/${sessionId}`);
    const getData = await getResponse.json();
    
    if (getData.success && getData.conversation) {
        console.log('   Résultat: ✅ Conversation trouvée');
        console.log('   Messages:', getData.conversation.messages.length);
        console.log('   Actif:', getData.conversation.active);
        console.log('   Contenu:', getData.conversation.messages[0].text);
    } else {
        console.log('   Résultat: ❌ Conversation non trouvée');
    }
    console.log();

    // 3. Test: Admin récupère toutes les conversations (nécessite token)
    console.log('3️⃣ Test: Admin récupère les conversations...');
    console.log('   ⚠️  Nécessite authentification admin');
    console.log('   → Testez manuellement via http://localhost:3000/admin-chat.html');
    console.log();

    console.log('✅ Tests terminés !');
    console.log();
    console.log('📋 Session de test créée:', sessionId);
    console.log('🔗 Ouvrez http://localhost:3000/admin-chat.html pour voir la conversation');
}

// Exécuter les tests
testChatSystem().catch(err => {
    console.error('❌ Erreur lors des tests:', err.message);
    process.exit(1);
});
