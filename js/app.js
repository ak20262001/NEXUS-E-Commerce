// ============================================
// NEXUS RETAIL - MAIN APPLICATION
// ============================================

/**
 * Initialize aplikasi saat DOM loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Nexus Retail...');

    // Initialize theme
    initTheme();

    // Initialize cart from localStorage
    initializeCart();

    // Fetch dan render produk pertama kali
    fetchProducts();

    // Setup event listeners
    setupSearchListener();
    setupEscapeKeyListener();

    console.log('✅ Nexus Retail initialized successfully!');
    console.log(`📦 Items in cart: ${calculateItemCount()}`);
    console.log(`💰 Cart total: IDR ${calculateCartTotal().toLocaleString('id-ID')}`);
});

/**
 * Handle window events
 */
window.addEventListener('load', () => {
    console.log('✨ Page fully loaded');
});

/**
 * Global error handler
 */
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showToast('Terjadi kesalahan. Silakan refresh halaman.', 'error');
});

/**
 * Development Console Log
 */
console.log(`
╔════════════════════════════════════════╗
║   NEXUS RETAIL - Premium E-Commerce    ║
║           Version 2.0.0                ║
╚════════════════════════════════════════╝

🛍️  Ready to shop!
🛒 Cart: ${calculateItemCount()} items
💰 Total: IDR ${calculateCartTotal().toLocaleString('id-ID')}

Available Functions:
- addToCart(productId)
- removeFromCart(productId)
- updateItemQty(productId, change)
- clearAllCart()
- filterCategory(category)
- fetchProducts()
- toggleTheme()
- toggleCart()
- showToast(message, type)
`);

// ============================================
// EXPOSED GLOBAL FUNCTIONS
// ============================================

window.app = {
    // Product functions
    filterCategory,
    fetchProducts,

    // Cart functions
    addToCart,
    removeFromCart,
    updateItemQty,
    clearAllCart,
    calculateCartTotal,
    calculateItemCount,

    // UI functions
    toggleTheme,
    toggleCart,
    showToast,
    proceedCheckout,

    // Utilities
    debounce,

    // State
    cart,
    dummyData
};

console.log('✅ Global app object available - window.app');