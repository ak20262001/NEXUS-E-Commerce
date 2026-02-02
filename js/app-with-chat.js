// ============================================
// NEXUS RETAIL - APP INITIALIZATION WITH CHAT & LOGIN
// ============================================

/**
 * Initialize aplikasi saat DOM loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Nexus Retail v3.0 with Chat, Login & Price Management...');

    // Initialize theme
    initTheme();

    // Initialize auth (restore user from localStorage)
    const isRestored = initializeAuth();
    updateAuthUI();

    // Initialize chat system
    initializeChat();

    // Initialize price management
    initializePriceManager();

    // Initialize cart
    initializeCart();

    // Fetch products
    fetchProducts();

    // Setup event listeners
    setupSearchListener();
    setupEscapeKeyListener();

    console.log(`
╔════════════════════════════════════════╗
║   NEXUS RETAIL v3.0 - COMPLETE         ║
║   Chat, Login & Real-Time Pricing      ║
╚════════════════════════════════════════╝

✅ Initialized:
   - Theme system
   - Auth system (${isRestored ? '✨ User restored' : 'Guest mode'})
   - Chat system (5-min auto-reset)
   - Price management (Real-time, 5-min auto-reset)
   - Cart system
   - Product management
   - Event listeners

📝 Demo Accounts:
   Buyer: john@user / password123
   Seller: toko@seller / password123
   
🎯 Ready to use!
    `);
});

/**
 * Override fetchProducts to include chat button for sellers
 */
const originalFetchProducts = fetchProducts;
fetchProducts = async function() {
    await originalFetchProducts.call(this);
    
    // Enhance product cards with chat buttons if user is logged in
    if (isLoggedIn()) {
        enhanceProductCardsWithChat();
    }
};

/**
 * Enhance product cards dengan chat button
 */
function enhanceProductCardsWithChat() {
    const cards = document.querySelectorAll('.product-card');
    
    cards.forEach(card => {
        // Check if chat button already exists
        if (card.querySelector('[data-chat-btn]')) return;

        // Find the button container
        const buttonContainer = card.querySelector('button[onclick*="addToCart"]')?.parentElement;
        if (!buttonContainer) return;

        // Add chat button
        const chatButton = document.createElement('button');
        chatButton.type = 'button';
        chatButton.setAttribute('data-chat-btn', 'true');
        chatButton.className = 'w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all text-blue-600 dark:text-blue-400';
        chatButton.title = 'Chat dengan penjual';
        chatButton.innerHTML = '<i class="fa-solid fa-comments"></i>';

        // Extract product ID from card
        const productName = card.querySelector('h4')?.textContent || '';
        const productId = dummyData.find(p => p.name === productName)?.id || 1;

        // Add click handler
        chatButton.onclick = (e) => {
            e.preventDefault();
            openProductChat(productId);
        };

        // Insert after add to cart button
        buttonContainer.parentElement.insertBefore(chatButton, buttonContainer.nextSibling);
    });
}

/**
 * Open chat window for product
 * @param {number} productId - Product ID
 */
function openProductChat(productId) {
    if (!isLoggedIn()) {
        showToast('Silakan login terlebih dahulu untuk chat', 'error');
        renderLoginModal();
        return;
    }

    const product = dummyData.find(p => p.id === productId);
    if (!product) {
        showToast('Produk tidak ditemukan', 'error');
        return;
    }

    // For demo: assign first seller in list as the product seller
    // In real app, product would have seller ID
    const defaultSellerId = 'seller_' + productId;

    renderChatWindow(productId, defaultSellerId);
    markMessagesAsRead(productId);
}

/**
 * Window events
 */
window.addEventListener('load', () => {
    console.log('✨ Page fully loaded');
});

/**
 * Handle visibility change (tab switch)
 */
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('👋 App went to background');
    } else {
        console.log('👋 App came to foreground');
        // Check for expired chats
        checkExpiredChats();
    }
});

/**
 * Global error handler
 */
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showToast('Terjadi kesalahan. Silakan refresh halaman.', 'error');
});

/**
 * Exposed global functions for debugging
 */
window.app = {
    // Auth
    loginUser,
    logoutUser,
    isLoggedIn,
    isSeller,
    isBuyer,
    getCurrentUser,

    // Products
    filterCategory,
    fetchProducts,

    // Cart
    addToCart,
    removeFromCart,
    updateItemQty,
    clearAllCart,
    calculateCartTotal,
    calculateItemCount,

    // Chat
    sendChatMessage,
    getChatMessages,
    deleteChatHistory,
    getActiveChatSessions,
    clearAllChats,
    openProductChat,

    // UI
    toggleTheme,
    toggleCart,
    showToast,
    renderLoginModal,
    renderChatWindow,

    // State
    currentUser: () => getCurrentUser(),
    cart,
    dummyData
};

console.log('✅ App initialized successfully!');
console.log('💡 Access app functions via: window.app');
console.log('📞 Example: app.sendChatMessage(1, "Hello!", "seller_1")');