// ============================================
// NEXUS RETAIL - DYNAMIC PRICE MANAGEMENT
// ============================================

/**
 * Price modification storage structure:
 * {
 *   productId: {
 *     originalPrice: number,
 *     currentPrice: number,
 *     modifiedBy: string (seller email),
 *     modifiedAt: timestamp,
 *     expiresAt: timestamp,
 *     reason: string (optional)
 *   }
 * }
 */

const PRICE_MODIFICATION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
let priceModifications = {};
let priceTimeouts = {};

/**
 * Initialize price manager
 */
function initializePriceManager() {
    loadPriceModificationsFromLocalStorage();
    checkExpiredPriceModifications();
    
    // Check for expired modifications every minute
    setInterval(checkExpiredPriceModifications, 60 * 1000);
}

/**
 * Load price modifications from localStorage
 */
function loadPriceModificationsFromLocalStorage() {
    try {
        const savedModifications = localStorage.getItem('priceModifications');
        if (savedModifications) {
            priceModifications = JSON.parse(savedModifications);
            console.log('✅ Price modifications loaded from localStorage');
            
            // Restore timeouts for existing modifications
            Object.keys(priceModifications).forEach(productId => {
                resetPriceTimeout(productId);
            });
        }
    } catch (e) {
        console.error('Error loading price modifications:', e);
        priceModifications = {};
    }
}

/**
 * Save price modifications to localStorage
 */
function savePriceModificationsToLocalStorage() {
    try {
        localStorage.setItem('priceModifications', JSON.stringify(priceModifications));
    } catch (e) {
        console.error('Error saving price modifications:', e);
    }
}

/**
 * Modify product price (seller only)
 * @param {number} productId - Product ID
 * @param {number} newPrice - New price
 * @returns {Object|null} - Modification object or null if failed
 */
function modifyProductPrice(productId, newPrice) {
    if (!isSeller()) {
        showToast('Hanya penjual yang bisa mengubah harga', 'error');
        return null;
    }

    const product = dummyData.find(p => p.id === productId);
    if (!product) {
        showToast('Produk tidak ditemukan', 'error');
        return null;
    }

    // Validation
    const priceNum = parseInt(newPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
        showToast('Harga harus berupa angka positif', 'error');
        return null;
    }

    if (priceNum === product.price) {
        showToast('Harga baru sama dengan harga sebelumnya', 'warning');
        return null;
    }

    const seller = getCurrentUser();
    const now = Date.now();
    const expiresAt = now + PRICE_MODIFICATION_TIMEOUT;

    // Get original price (or current if already modified)
    const originalPrice = priceModifications[productId]?.originalPrice || product.price;

    // Create modification record
    const modification = {
        productId: productId,
        originalPrice: originalPrice,
        currentPrice: priceNum,
        modifiedBy: seller.email,
        modifiedAt: now,
        expiresAt: expiresAt,
        sellerId: seller.id,
        reason: `Harga diubah menjadi IDR ${priceNum.toLocaleString('id-ID')}`
    };

    // Store modification
    priceModifications[productId] = modification;
    savePriceModificationsToLocalStorage();

    // Update product price in memory
    product.price = priceNum;

    // Reset timeout
    resetPriceTimeout(productId);

    // Broadcast update
    broadcastPriceChange(modification);

    // Log
    console.log('💰 Price modified:', modification);

    return modification;
}

/**
 * Get current price for product (with modification if exists)
 * @param {number} productId - Product ID
 * @returns {number} - Current price
 */
function getCurrentPrice(productId) {
    const modification = priceModifications[productId];
    
    if (modification && Date.now() < modification.expiresAt) {
        return modification.currentPrice;
    }

    // Find original price from dummyData
    const product = dummyData.find(p => p.id === productId);
    return product ? product.price : 0;
}

/**
 * Get original price (before any modification)
 * @param {number} productId - Product ID
 * @returns {number} - Original price
 */
function getOriginalPrice(productId) {
    const modification = priceModifications[productId];
    
    if (modification) {
        return modification.originalPrice;
    }

    const product = dummyData.find(p => p.id === productId);
    return product ? product.price : 0;
}

/**
 * Check if price is modified
 * @param {number} productId - Product ID
 * @returns {boolean}
 */
function isPriceModified(productId) {
    const modification = priceModifications[productId];
    return modification && Date.now() < modification.expiresAt;
}

/**
 * Get price modification info
 * @param {number} productId - Product ID
 * @returns {Object|null} - Modification info
 */
function getPriceModificationInfo(productId) {
    const modification = priceModifications[productId];
    
    if (!modification || Date.now() >= modification.expiresAt) {
        return null;
    }

    const now = Date.now();
    const timeRemaining = modification.expiresAt - now;
    const minutesRemaining = Math.ceil(timeRemaining / 60000);

    return {
        ...modification,
        timeRemaining: timeRemaining,
        minutesRemaining: minutesRemaining,
        secondsRemaining: Math.ceil((timeRemaining % 60000) / 1000),
        expired: false
    };
}

/**
 * Reset price timeout for product
 * @param {number} productId - Product ID
 */
function resetPriceTimeout(productId) {
    const modification = priceModifications[productId];
    if (!modification) return;

    // Clear existing timeout
    if (priceTimeouts[productId]) {
        clearTimeout(priceTimeouts[productId]);
    }

    // Set new timeout
    priceTimeouts[productId] = setTimeout(() => {
        resetProductPrice(productId);
    }, modification.expiresAt - Date.now());
}

/**
 * Reset product price to original (auto-reset after 5 mins)
 * @param {number} productId - Product ID
 */
function resetProductPrice(productId) {
    const modification = priceModifications[productId];
    if (!modification) return;

    const originalPrice = modification.originalPrice;

    // Restore original price
    const product = dummyData.find(p => p.id === productId);
    if (product) {
        product.price = originalPrice;
    }

    // Remove modification record
    delete priceModifications[productId];
    savePriceModificationsToLocalStorage();

    // Clear timeout
    if (priceTimeouts[productId]) {
        clearTimeout(priceTimeouts[productId]);
        delete priceTimeouts[productId];
    }

    // Broadcast reset
    broadcastPriceReset(productId, originalPrice);

    // Log
    console.log(`⏰ Price reset for product ${productId} to original: IDR ${originalPrice.toLocaleString('id-ID')}`);

    // Update UI
    updateProductDisplayedPrice(productId);
}

/**
 * Broadcast price change to all connected users (via events)
 * @param {Object} modification - Modification object
 */
function broadcastPriceChange(modification) {
    // Create custom event
    const event = new CustomEvent('priceChanged', {
        detail: modification
    });

    document.dispatchEvent(event);

    // Also send chat notification
    if (getChatSession(modification.productId)) {
        const product = dummyData.find(p => p.id === modification.productId);
        const priceChangeMsg = `💰 PEMBERITAHUAN HARGA\nHarga produk ${product.name} telah diubah menjadi IDR ${modification.currentPrice.toLocaleString('id-ID')}. Perubahan ini berlaku selama 5 menit.`;
        
        // Send as system message (if user is logged in)
        if (isLoggedIn()) {
            sendChatMessage(
                modification.productId,
                priceChangeMsg,
                modification.sellerId
            );
        }
    }

    // Update all product displays
    updateAllProductPriceDisplays();
}

/**
 * Broadcast price reset to all connected users
 * @param {number} productId - Product ID
 * @param {number} originalPrice - Original price
 */
function broadcastPriceReset(productId, originalPrice) {
    const event = new CustomEvent('priceReset', {
        detail: {
            productId: productId,
            restoredPrice: originalPrice
        }
    });

    document.dispatchEvent(event);

    // Send chat notification
    if (getChatSession(productId)) {
        const product = dummyData.find(p => p.id === productId);
        const resetMsg = `✅ Harga ${product.name} telah kembali normal ke IDR ${originalPrice.toLocaleString('id-ID')}`;
        
        if (isLoggedIn()) {
            sendChatMessage(productId, resetMsg, 'system');
        }
    }

    // Update all product displays
    updateAllProductPriceDisplays();
}

/**
 * Check for expired price modifications
 */
function checkExpiredPriceModifications() {
    const now = Date.now();
    const expiredProducts = [];

    Object.keys(priceModifications).forEach(productId => {
        const modification = priceModifications[productId];
        
        if (now >= modification.expiresAt) {
            expiredProducts.push(parseInt(productId));
        }
    });

    // Reset expired prices
    expiredProducts.forEach(productId => {
        resetProductPrice(productId);
    });
}

/**
 * Update displayed price for a specific product
 * @param {number} productId - Product ID
 */
function updateProductDisplayedPrice(productId) {
    const priceElements = document.querySelectorAll(`[data-product-id="${productId}"] [data-price]`);
    const currentPrice = getCurrentPrice(productId);
    
    priceElements.forEach(el => {
        const isModified = isPriceModified(productId);
        
        // Update price text
        el.textContent = `IDR ${currentPrice.toLocaleString('id-ID')}`;
        
        // Update styling
        if (isModified) {
            el.classList.add('price-modified');
            el.title = `Harga diubah (kembali normal dalam 5 menit)`;
        } else {
            el.classList.remove('price-modified');
            el.title = '';
        }
    });
}

/**
 * Update all product price displays
 */
function updateAllProductPriceDisplays() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const priceEl = card.querySelector('[data-price]');
        if (!priceEl) return;

        // Extract product ID from card
        const productName = card.querySelector('h4')?.textContent || '';
        const product = dummyData.find(p => p.name === productName);
        
        if (!product) return;

        const currentPrice = getCurrentPrice(product.id);
        const isModified = isPriceModified(product.id);
        const modInfo = getPriceModificationInfo(product.id);

        // Update price text
        priceEl.textContent = `IDR ${currentPrice.toLocaleString('id-ID')}`;

        // Update styling
        if (isModified) {
            priceEl.classList.add('price-modified');
            priceEl.style.color = '#ef4444'; // Red
            
            // Add timer info
            let timerEl = card.querySelector('[data-price-timer]');
            if (!timerEl) {
                timerEl = document.createElement('small');
                timerEl.setAttribute('data-price-timer', 'true');
                timerEl.className = 'block text-xs text-red-600 dark:text-red-400 mt-1 font-semibold';
                priceEl.parentElement.appendChild(timerEl);
            }
            
            timerEl.textContent = `⏰ Kembali normal dalam ${modInfo.minutesRemaining} menit`;
        } else {
            priceEl.classList.remove('price-modified');
            priceEl.style.color = '';
            
            // Remove timer
            const timerEl = card.querySelector('[data-price-timer]');
            if (timerEl) timerEl.remove();
        }
    });
}

/**
 * Get all active price modifications
 * @returns {Array} - Array of active modifications
 */
function getActivePriceModifications() {
    const now = Date.now();
    return Object.values(priceModifications).filter(mod => now < mod.expiresAt);
}

/**
 * Clear all price modifications (admin function)
 */
function clearAllPriceModifications() {
    if (confirm('Yakin ingin mereset semua harga produk?')) {
        Object.keys(priceModifications).forEach(productId => {
            resetProductPrice(parseInt(productId));
        });

        showToast('Semua harga produk telah direset', 'success');
    }
}

/**
 * Get price modification history for product
 * @param {number} productId - Product ID
 * @returns {Object|null}
 */
function getPriceModificationHistory(productId) {
    const modification = priceModifications[productId];
    
    if (!modification) return null;

    const product = dummyData.find(p => p.id === productId);
    const modInfo = getPriceModificationInfo(productId);

    return {
        product: product?.name,
        originalPrice: modification.originalPrice,
        newPrice: modification.currentPrice,
        priceDifference: modification.currentPrice - modification.originalPrice,
        percentageChange: ((modification.currentPrice - modification.originalPrice) / modification.originalPrice * 100).toFixed(2),
        modifiedBy: modification.modifiedBy,
        modifiedAt: new Date(modification.modifiedAt).toLocaleString('id-ID'),
        expiresAt: new Date(modification.expiresAt).toLocaleString('id-ID'),
        timeRemaining: modInfo ? `${modInfo.minutesRemaining} menit ${modInfo.secondsRemaining} detik` : 'Expired',
        status: modInfo ? 'ACTIVE' : 'EXPIRED'
    };
}

console.log('✅ Price Manager module loaded');