// ============================================
// NEXUS RETAIL - BUYER-SELLER CHAT SYSTEM
// ============================================

/**
 * Chat storage structure:
 * {
 *   productId: {
 *     messages: [...],
 *     lastActivityTime: timestamp,
 *     buyerId: string,
 *     sellerId: string,
 *     createdAt: timestamp
 *   }
 * }
 */

const CHAT_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
let chatSessions = {};
let chatTimeouts = {};

/**
 * Initialize chat system
 */
function initializeChat() {
    loadChatsFromLocalStorage();
    checkExpiredChats();
    
    // Check for expired chats every minute
    setInterval(checkExpiredChats, 60 * 1000);
}

/**
 * Load chats from localStorage
 */
function loadChatsFromLocalStorage() {
    try {
        const savedChats = localStorage.getItem('chatSessions');
        if (savedChats) {
            chatSessions = JSON.parse(savedChats);
            console.log('✅ Chat sessions loaded from localStorage');
        }
    } catch (e) {
        console.error('Error loading chats:', e);
        chatSessions = {};
    }
}

/**
 * Save chats to localStorage
 */
function saveChatsToLocalStorage() {
    try {
        localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    } catch (e) {
        console.error('Error saving chats:', e);
    }
}

/**
 * Create or get chat session for product
 * @param {number} productId - Product ID
 * @param {string} sellerId - Seller ID
 * @returns {Object} - Chat session
 */
function getOrCreateChatSession(productId, sellerId) {
    const sessionKey = `${productId}`;

    if (!chatSessions[sessionKey]) {
        chatSessions[sessionKey] = {
            productId: productId,
            messages: [],
            lastActivityTime: Date.now(),
            buyerId: currentUser.id,
            sellerId: sellerId,
            createdAt: Date.now(),
            active: true
        };

        saveChatsToLocalStorage();
    }

    // Reset timeout
    resetChatTimeout(sessionKey);

    return chatSessions[sessionKey];
}

/**
 * Send message in chat
 * @param {number} productId - Product ID
 * @param {string} message - Message content
 * @param {string} sellerId - Seller ID
 */
function sendChatMessage(productId, message, sellerId) {
    if (!isLoggedIn()) {
        showToast('Silakan login terlebih dahulu', 'error');
        return;
    }

    if (!message || message.trim().length === 0) {
        showToast('Pesan tidak boleh kosong', 'error');
        return;
    }

    const session = getOrCreateChatSession(productId, sellerId);

    const chatMessage = {
        id: 'msg_' + Date.now(),
        senderId: currentUser.id,
        senderRole: currentUser.role,
        senderName: currentUser.name,
        message: message.trim(),
        timestamp: Date.now(),
        read: false
    };

    session.messages.push(chatMessage);
    session.lastActivityTime = Date.now();

    saveChatsToLocalStorage();

    // Update UI
    displayChatMessage(chatMessage, productId);

    console.log('💬 Message sent:', chatMessage);
}

/**
 * Get all messages for a product chat
 * @param {number} productId - Product ID
 * @returns {Array} - Messages array
 */
function getChatMessages(productId) {
    const sessionKey = `${productId}`;
    
    if (!chatSessions[sessionKey]) {
        return [];
    }

    return chatSessions[sessionKey].messages || [];
}

/**
 * Get chat session for product
 * @param {number} productId - Product ID
 * @returns {Object|null} - Chat session
 */
function getChatSession(productId) {
    const sessionKey = `${productId}`;
    return chatSessions[sessionKey] || null;
}

/**
 * Delete chat history for product
 * @param {number} productId - Product ID
 */
function deleteChatHistory(productId) {
    const sessionKey = `${productId}`;

    if (!chatSessions[sessionKey]) {
        showToast('Riwayat chat tidak ditemukan', 'warning');
        return;
    }

    // Clear timeout
    if (chatTimeouts[sessionKey]) {
        clearTimeout(chatTimeouts[sessionKey]);
    }

    // Delete session
    delete chatSessions[sessionKey];
    saveChatsToLocalStorage();

    showToast('Riwayat chat berhasil dihapus', 'success');
    console.log('🗑️ Chat history deleted for product:', productId);
}

/**
 * Reset chat session (auto-reset after 5 mins inactivity)
 * @param {number} productId - Product ID
 */
function resetChatSession(productId) {
    const sessionKey = `${productId}`;

    if (chatSessions[sessionKey]) {
        console.log(`⏰ Chat session reset after 5 mins inactivity - Product: ${productId}`);
        delete chatSessions[sessionKey];
        saveChatsToLocalStorage();
    }
}

/**
 * Reset timeout for chat session
 * @param {string} sessionKey - Session key
 */
function resetChatTimeout(sessionKey) {
    // Clear existing timeout
    if (chatTimeouts[sessionKey]) {
        clearTimeout(chatTimeouts[sessionKey]);
    }

    // Set new timeout
    chatTimeouts[sessionKey] = setTimeout(() => {
        const productId = parseInt(sessionKey);
        resetChatSession(productId);
        console.log(`⏰ Chat auto-reset triggered for product ${productId}`);
    }, CHAT_TIMEOUT);
}

/**
 * Check for expired chats and reset them
 */
function checkExpiredChats() {
    const now = Date.now();

    Object.keys(chatSessions).forEach(sessionKey => {
        const session = chatSessions[sessionKey];
        const inactivityTime = now - session.lastActivityTime;

        if (inactivityTime > CHAT_TIMEOUT) {
            console.log(`⏰ Auto-resetting chat for session: ${sessionKey}`);
            delete chatSessions[sessionKey];
            
            if (chatTimeouts[sessionKey]) {
                clearTimeout(chatTimeouts[sessionKey]);
            }
        }
    });

    saveChatsToLocalStorage();
}

/**
 * Get all active chat sessions
 * @returns {Array} - Array of active chat sessions
 */
function getActiveChatSessions() {
    return Object.values(chatSessions).filter(session => session.active);
}

/**
 * Get chat session info with product details
 * @param {number} productId - Product ID
 * @returns {Object|null}
 */
function getChatSessionInfo(productId) {
    const session = getChatSession(productId);
    if (!session) return null;

    const product = dummyData.find(p => p.id === productId);
    const messageCount = session.messages.length;
    const lastMessage = session.messages[session.messages.length - 1];

    return {
        ...session,
        productInfo: product,
        messageCount: messageCount,
        lastMessage: lastMessage,
        inactivityTime: Date.now() - session.lastActivityTime,
        willResetIn: Math.max(0, CHAT_TIMEOUT - (Date.now() - session.lastActivityTime))
    };
}

/**
 * Clear all chats (admin function)
 */
function clearAllChats() {
    if (confirm('Yakin ingin menghapus semua riwayat chat?')) {
        Object.keys(chatTimeouts).forEach(key => {
            clearTimeout(chatTimeouts[key]);
        });

        chatSessions = {};
        chatTimeouts = {};
        saveChatsToLocalStorage();

        showToast('Semua riwayat chat berhasil dihapus', 'success');
    }
}

/**
 * Mark messages as read
 * @param {number} productId - Product ID
 */
function markMessagesAsRead(productId) {
    const session = getChatSession(productId);
    if (!session) return;

    session.messages.forEach(msg => {
        if (msg.senderId !== currentUser.id) {
            msg.read = true;
        }
    });

    saveChatsToLocalStorage();
}

console.log('✅ Chat module loaded');