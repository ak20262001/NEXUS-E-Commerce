// ═══════════════════════════════════════════════════════════════════════════════
// CHATBOT INTELLIGENT PRO v4.0
// BUYER ARE KING - Smart Product Filtering & Context-Aware Responses
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Configuration
 */
const CHATBOT_CONFIG = {
    name: 'Nexus Assistant Pro',
    version: '4.0',
    language: 'id-ID',
    timezone: 'Asia/Jakarta',
    responseDelay: 800,
    typingSpeed: 50,
    maxHistoryLength: 50,
    enableLogging: true,
    maxProductsToShow: 5
};

/**
 * Chatbot State
 */
let chatbotState = {
    isOpen: false,
    isTyping: false,
    messageCount: 0,
    sessionStart: Date.now(),
    conversationHistory: [],
    currentProducts: null,      // Menyimpan produk yang sedang ditampilkan
    lastCategory: null,         // Kategori terakhir yang dicari
    lastFilter: null            // Filter terakhir yang diterapkan
};

/**
 * Product Filter Utility - INTI DARI BUYER ARE KING
 */
const ProductFilter = {
    /**
     * Filter by category atau keyword
     */
    findProducts: (keyword) => {
        if (!window.dummyData) return [];
        
        const search = keyword.toLowerCase().trim();
        
        // Jika kosong, return semua
        if (!search) return window.dummyData;
        
        // Cari di kategori atau nama produk
        return window.dummyData.filter(p => 
            p.name.toLowerCase().includes(search) ||
            p.category.toLowerCase().includes(search)
        );
    },

    /**
     * Sort by price ascending (Termurah)
     */
    sortByPriceAsc: (products) => {
        return [...products].sort((a, b) => a.price - b.price);
    },

    /**
     * Sort by price descending (Termahal)
     */
    sortByPriceDesc: (products) => {
        return [...products].sort((a, b) => b.price - a.price);
    },

    /**
     * Sort by newest (Terbaru) - berdasarkan created_at
     */
    sortByNewest: (products) => {
        return [...products].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );
    },

    /**
     * Sort by oldest (Terlama) - berdasarkan created_at
     */
    sortByOldest: (products) => {
        return [...products].sort((a, b) => 
            new Date(a.created_at) - new Date(b.created_at)
        );
    },

    /**
     * Sort by rating highest (Terpopuler)
     */
    sortByRatingHighest: (products) => {
        return [...products].sort((a, b) => {
            const ratingA = parseFloat(a.rating) || 0;
            const ratingB = parseFloat(b.rating) || 0;
            return ratingB - ratingA;
        });
    },

    /**
     * Sort by rating lowest (Paling tidak populer)
     */
    sortByRatingLowest: (products) => {
        return [...products].sort((a, b) => {
            const ratingA = parseFloat(a.rating) || 0;
            const ratingB = parseFloat(b.rating) || 0;
            return ratingA - ratingB;
        });
    },

    /**
     * Get all categories
     */
    getAllCategories: () => {
        if (!window.dummyData) return [];
        return [...new Set(window.dummyData.map(p => p.category))];
    },

    /**
     * Get price stats
     */
    getPriceStats: (products) => {
        if (!products || products.length === 0) {
            return { min: 0, max: 0, avg: 0 };
        }
        const prices = products.map(p => p.price);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices),
            avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        };
    }
};

/**
 * Initialize Chatbot
 */
function initializeChatbot() {
    loadChatbotHistory();
    setupChatbotEventListeners();
    console.log('✅ Chatbot Pro initialized - ' + CHATBOT_CONFIG.name + ' v' + CHATBOT_CONFIG.version);
}

/**
 * Load chat history
 */
function loadChatbotHistory() {
    try {
        const saved = localStorage.getItem('chatbotHistory');
        if (saved) {
            chatbotState.conversationHistory = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading history:', e);
        chatbotState.conversationHistory = [];
    }
}

/**
 * Save chat history
 */
function saveChatbotHistory() {
    try {
        const history = chatbotState.conversationHistory.slice(-CHATBOT_CONFIG.maxHistoryLength);
        localStorage.setItem('chatbotHistory', JSON.stringify(history));
    } catch (e) {
        console.error('Error saving history:', e);
    }
}

/**
 * Setup event listeners
 */
function setupChatbotEventListeners() {
    const chatbotInput = document.getElementById('chatbotInput');
    if (chatbotInput) {
        chatbotInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleChatbotMessage();
            }
        });
    }
}

/**
 * Toggle chatbot
 */
function toggleChatbot() {
    const chatWindow = document.getElementById('chatbotWindow');
    const chatButton = document.getElementById('chatbotButton');
    
    if (!chatWindow) return;

    chatbotState.isOpen = !chatbotState.isOpen;

    if (chatbotState.isOpen) {
        chatWindow.classList.add('open');
        chatButton.classList.add('active');
        
        setTimeout(() => {
            const input = document.getElementById('chatbotInput');
            if (input) input.focus();
        }, 100);

        if (chatbotState.messageCount === 0) {
            showChatbotWelcome();
        }
    } else {
        chatWindow.classList.remove('open');
        chatButton.classList.remove('active');
    }
}

/**
 * Show welcome message
 */
function showChatbotWelcome() {
    const messages = [
        '👋 Halo! Saya Nexus Assistant Pro.',
        '👑 Anda adalah prioritas utama kami!',
        '🛍️ Anda bisa menanyakan produk apa saja, dan saya akan memberikan pilihan terbaik.',
        '💬 Contoh: "Aku ingin sepatu", "Laptop termurah", "Tas terbaru", "Handphone paling populer"'
    ];

    messages.forEach((msg, idx) => {
        setTimeout(() => {
            addChatbotMessage(msg, 'bot');
        }, idx * 400);
    });
}

/**
 * Handle user message
 */
function handleChatbotMessage() {
    const input = document.getElementById('chatbotInput');
    if (!input) return;

    const userMessage = input.value.trim();
    if (!userMessage) return;

    addChatbotMessage(userMessage, 'user');
    input.value = '';

    showChatbotTyping();

    setTimeout(() => {
        const response = generateIntelligentResponse(userMessage);
        removeChatbotTyping();
        addChatbotMessage(response, 'bot');
        saveChatbotHistory();
    }, CHATBOT_CONFIG.responseDelay);
}

/**
 * Add message
 */
function addChatbotMessage(message, sender) {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;

    const messageEl = document.createElement('div');
    messageEl.className = `chatbot-message ${sender}-message`;
    messageEl.innerHTML = `
        <div class="message-content">
            ${sender === 'bot' ? '<span class="bot-avatar">🤖</span>' : ''}
            <div class="message-text">${escapeHtml(message)}</div>
            ${sender === 'bot' ? '' : '<span class="user-avatar">👤</span>'}
        </div>
    `;

    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    chatbotState.conversationHistory.push({
        sender,
        message,
        timestamp: Date.now()
    });
    chatbotState.messageCount++;

    logMessage(sender, message);
}

/**
 * Show typing indicator
 */
function showChatbotTyping() {
    const messagesContainer = document.getElementById('chatbotMessages');
    if (!messagesContainer) return;

    const typingEl = document.createElement('div');
    typingEl.className = 'chatbot-typing';
    typingEl.id = 'chatbotTyping';
    typingEl.innerHTML = `
        <span class="bot-avatar">🤖</span>
        <div class="typing-indicator">
            <span></span><span></span><span></span>
        </div>
    `;

    messagesContainer.appendChild(typingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    chatbotState.isTyping = true;
}

/**
 * Remove typing indicator
 */
function removeChatbotTyping() {
    const typingEl = document.getElementById('chatbotTyping');
    if (typingEl) typingEl.remove();
    chatbotState.isTyping = false;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * MAIN INTELLIGENCE ENGINE - BUYER ARE KING PHILOSOPHY
 * ═══════════════════════════════════════════════════════════════════════════════
 */
function generateIntelligentResponse(userMessage) {
    const input = userMessage.toLowerCase().trim();

    // 1. GREETING
    if (matchesKeywords(input, ['halo', 'hi', 'hello', 'hai', 'salam', 'pagi', 'sore', 'malam', 'apa kabar'])) {
        return '👋 Halo! Ada yang bisa saya bantu? Tanyakan tentang produk apa yang Anda inginkan! 😊';
    }

    // 2. HELP
    if (matchesKeywords(input, ['bantuan', 'help', 'apa yang bisa', 'gimana', 'bagaimana'])) {
        return getHelpMessage();
    }

    // 3. THANK YOU
    if (matchesKeywords(input, ['terima kasih', 'thanks', 'makasih', 'trims', 'thanks'])) {
        return '😊 Sama-sama! Ada lagi yang bisa saya bantu? 🙏';
    }

    // 4. GOODBYE
    if (matchesKeywords(input, ['bye', 'selamat tinggal', 'goodbye', 'sampai jumpa', 'dadah'])) {
        return '👋 Terima kasih! Semoga Anda menemukan produk yang sempurna! 🛍️';
    }

    // 5. SEARCH & FILTER LOGIC - INI YANG PALING PENTING!
    
    // 5a. Cek apakah user mencari produk dengan filter sekaligus
    // Contoh: "Laptop termurah", "Sepatu terbaru", "Handphone paling populer"
    const priceFilterMatch = matchesKeywords(input, ['termurah', 'harga paling rendah', 'paling murah', 'murah sekali']);
    const priceFilterExpensive = matchesKeywords(input, ['termahal', 'harga paling tinggi', 'paling mahal']);
    const dateFilterNewest = matchesKeywords(input, ['terbaru', 'terbaru sekali', 'paling baru']);
    const dateFilterOldest = matchesKeywords(input, ['terlama', 'paling lama']);
    const ratingFilterBest = matchesKeywords(input, ['terpopuler', 'paling populer', 'rating tinggi', 'paling baik']);
    const ratingFilterWorst = matchesKeywords(input, ['paling tidak populer', 'rating rendah', 'rating terendah', 'tidak populer']);

    // Jika ada filter tanpa kategori spesifik, gunakan currentProducts atau tampilkan kategori dulu
    if (priceFilterMatch || priceFilterExpensive || dateFilterNewest || dateFilterOldest || ratingFilterBest || ratingFilterWorst) {
        return handleFilterRequest(input, priceFilterMatch, priceFilterExpensive, dateFilterNewest, dateFilterOldest, ratingFilterBest, ratingFilterWorst);
    }

    // 5b. Cek apakah user ingin mencari produk
    if (matchesKeywords(input, ['aku ingin', 'saya ingin', 'cari', 'punya', 'ada', 'ingin', 'yang'])) {
        return handleProductSearch(input);
    }

    // 5c. Kategori inquiry
    if (matchesKeywords(input, ['kategori', 'jenis', 'tipe', 'macam'])) {
        return handleCategoryInquiry();
    }

    // Default fallback
    return getSuggestions();
}

/**
 * Handle Product Search - CORE FEATURE
 */
function handleProductSearch(input) {
    // Extract keyword/kategori
    const keyword = input
        .replace(/aku ingin|saya ingin|cari|punya|ada|ingin|yang/gi, '')
        .trim();

    let products = keyword 
        ? ProductFilter.findProducts(keyword)
        : window.dummyData || [];

    if (!products || products.length === 0) {
        return '😔 Maaf, produk yang Anda cari tidak ditemukan. Coba dengan keyword lain atau tanyakan kategori apa saja yang tersedia! 🔍';
    }

    // Simpan produk & kategori untuk filtering berikutnya
    chatbotState.currentProducts = products;
    chatbotState.lastCategory = keyword;

    return formatProductResults(products, keyword || 'pencarian Anda');
}

/**
 * Handle Filter Request - BUYER CONTROL
 */
function handleFilterRequest(input, isPriceCheap, isPriceExpensive, isNewest, isOldest, isBestRating, isWorstRating) {
    // Jika user belum mencari, tanya dulu
    if (!chatbotState.currentProducts || chatbotState.currentProducts.length === 0) {
        // Coba extract kategori dari input
        const categories = ProductFilter.getAllCategories();
        for (const cat of categories) {
            if (input.includes(cat.toLowerCase())) {
                const products = window.dummyData.filter(p => p.category.toLowerCase() === cat.toLowerCase());
                chatbotState.currentProducts = products;
                chatbotState.lastCategory = cat;
                break;
            }
        }

        if (!chatbotState.currentProducts || chatbotState.currentProducts.length === 0) {
            return '😊 Coba dulu tanyakan produk apa yang Anda inginkan! Contoh: "Aku ingin sepatu" atau "Cari laptop". Setelah itu saya bisa filter untuk Anda! 🔍';
        }
    }

    // Apply filter ke currentProducts
    let filtered = chatbotState.currentProducts;

    if (isPriceCheap) {
        filtered = ProductFilter.sortByPriceAsc(filtered);
        chatbotState.lastFilter = 'TERMURAH';
    } else if (isPriceExpensive) {
        filtered = ProductFilter.sortByPriceDesc(filtered);
        chatbotState.lastFilter = 'TERMAHAL';
    } else if (isNewest) {
        filtered = ProductFilter.sortByNewest(filtered);
        chatbotState.lastFilter = 'TERBARU';
    } else if (isOldest) {
        filtered = ProductFilter.sortByOldest(filtered);
        chatbotState.lastFilter = 'TERLAMA';
    } else if (isBestRating) {
        filtered = ProductFilter.sortByRatingHighest(filtered);
        chatbotState.lastFilter = 'TERPOPULER';
    } else if (isWorstRating) {
        filtered = ProductFilter.sortByRatingLowest(filtered);
        chatbotState.lastFilter = 'PALING TIDAK POPULER';
    }

    if (!filtered || filtered.length === 0) {
        return '😔 Tidak ada produk yang sesuai dengan filter ini.';
    }

    return formatFilteredResults(filtered, chatbotState.lastFilter);
}

/**
 * Handle Category Inquiry
 */
function handleCategoryInquiry() {
    const categories = ProductFilter.getAllCategories();
    const categoryList = categories.map((cat, idx) => `${idx + 1}. ${cat}`).join('\n');

    return `📂 Kategori Produk Kami:\n\n${categoryList}\n\n💡 Coba: "Aku ingin [kategori]" untuk melihat produk spesifik!`;
}

/**
 * Format Product Results
 */
function formatProductResults(products, title) {
    const toShow = products.slice(0, CHATBOT_CONFIG.maxProductsToShow);
    const productList = toShow.map((p, idx) => {
        const rating = p.rating ? `⭐ ${p.rating}` : '⭐ Belum ada rating';
        return `${idx + 1}. ${p.name}\n   💰 IDR ${p.price.toLocaleString('id-ID')} | ${rating}`;
    }).join('\n\n');

    const moreText = products.length > CHATBOT_CONFIG.maxProductsToShow 
        ? `\n\n...dan ${products.length - CHATBOT_CONFIG.maxProductsToShow} produk lainnya`
        : '';

    return `🛍️ Hasil pencarian ${title}:\n\n${productList}${moreText}\n\n💡 Tanya "termurah", "termahal", "terbaru", "terlama", atau "terpopuler" untuk filter! 😊`;
}

/**
 * Format Filtered Results
 */
function formatFilteredResults(products, filterLabel) {
    const toShow = products.slice(0, CHATBOT_CONFIG.maxProductsToShow);
    const productList = toShow.map((p, idx) => {
        const rating = p.rating ? `⭐ ${p.rating}` : '⭐ N/A';
        return `${idx + 1}. ${p.name}\n   💰 IDR ${p.price.toLocaleString('id-ID')} | ${rating}`;
    }).join('\n\n');

    const moreText = products.length > CHATBOT_CONFIG.maxProductsToShow
        ? `\n\n...dan ${products.length - CHATBOT_CONFIG.maxProductsToShow} produk lainnya`
        : '';

    return `🎯 ${filterLabel} dari hasil pencarian:\n\n${productList}${moreText}\n\n✨ Ingin filter berbeda? Tanya "termurah", "termahal", "terbaru", dll! 😊`;
}

/**
 * Get Help Message
 */
function getHelpMessage() {
    return `ℹ️ Cara Pakai Nexus Assistant Pro:\n\n👑 Anda adalah PRIORITAS UTAMA!\n\n💬 Tanyakan apa saja:\n  🛍️ "Aku ingin sepatu"\n  🛍️ "Cari laptop"\n  🛍️ "Ada tas?"\n\n📊 Atau gunakan filter:\n  💰 "Sepatu termurah"\n  💰 "Laptop termahal"\n  📅 "Tas terbaru"\n  📅 "Handphone terlama"\n  ⭐ "Jam tangan paling populer"\n  ⭐ "Produk paling tidak populer"\n\n📂 Atau lihat kategori:\n  "Apa saja kategorinya?"\n\nSaya akan memberikan pilihan terbaik untuk Anda! 🎉`;
}

/**
 * Get Suggestions
 */
function getSuggestions() {
    return `🤔 Hmm, saya kurang paham. Coba dengan:\n\n📌 "Aku ingin [produk]"\n📌 "Cari [kategori]"\n📌 "Ada [produk]?"\n📌 "[Kategori] termurah"\n📌 "[Kategori] terpopuler"\n\nContoh:\n  • "Aku ingin sepatu"\n  • "Cari laptop"\n  • "Tas termurah"\n  • "Handphone terbaru"\n\n💡 Atau tanya "Apa kategorinya?" untuk melihat semua kategori! 😊`;
}

/**
 * Helper: Match Keywords
 */
function matchesKeywords(input, keywords) {
    return keywords.some(keyword => input.includes(keyword.toLowerCase()));
}

/**
 * Helper: Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Helper: Log message
 */
function logMessage(sender, message) {
    if (CHATBOT_CONFIG.enableLogging) {
        console.log(`[${sender.toUpperCase()}] ${message}`);
    }
}

/**
 * Clear chat history
 */
function clearChatbotHistory() {
    if (confirm('Hapus semua riwayat chat? Tindakan ini tidak dapat dibatalkan.')) {
        chatbotState.conversationHistory = [];
        chatbotState.messageCount = 0;
        chatbotState.currentProducts = null;
        chatbotState.lastCategory = null;
        chatbotState.lastFilter = null;
        localStorage.removeItem('chatbotHistory');

        const messagesContainer = document.getElementById('chatbotMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }

        showChatbotWelcome();
        if (typeof showToast === 'function') {
            showToast('Riwayat chat berhasil dihapus', 'success');
        }
    }
}

/**
 * Get chatbot stats
 */
function getChatbotStats() {
    const sessionDuration = Math.round((Date.now() - chatbotState.sessionStart) / 1000 / 60);
    const userMessages = chatbotState.conversationHistory.filter(m => m.sender === 'user').length;
    const botMessages = chatbotState.conversationHistory.filter(m => m.sender === 'bot').length;

    return `📊 Statistik Chatbot:\n  💬 Total Pesan: ${chatbotState.messageCount}\n  👤 Pesan Anda: ${userMessages}\n  🤖 Pesan Bot: ${botMessages}\n  ⏱️ Durasi Sesi: ${sessionDuration} menit`;
}

console.log('✅ Chatbot Intelligent Pro v4.0 loaded - BUYER ARE KING! 👑');