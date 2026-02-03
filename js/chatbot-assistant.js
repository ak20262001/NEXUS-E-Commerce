// ============================================
// NEXUS RETAIL - INTELLIGENT PRODUCT CHATBOT
// ============================================

/**
 * Chatbot state management
 */
let chatbotState = {
    isOpen: false,
    isTyping: false,
    messageCount: 0,
    conversationHistory: [],
    sessionStartTime: Date.now()
};

/**
 * Chatbot knowledge base
 */
const chatbotKnowledge = {
    // Product-related keywords
    productKeywords: {
        price: ['harga', 'berapa', 'biaya', 'cost', 'price', 'mahal', 'murah'],
        availability: ['stok', 'tersedia', 'ada', 'kehabisan', 'available', 'stock'],
        specifications: ['spesifikasi', 'spec', 'specs', 'fitur', 'feature', 'details', 'detail'],
        category: ['kategori', 'jenis', 'tipe', 'type', 'category', 'produk apa'],
        recommendation: ['rekomendasikan', 'saran', 'recommend', 'suggestion', 'terbaik', 'best'],
        payment: ['pembayaran', 'bayar', 'payment', 'cara bayar', 'metode'],
        shipping: ['ongkir', 'pengiriman', 'gratis ongkir', 'shipping', 'delivery'],
        search: ['cari', 'find', 'search', 'product', 'produk', 'apa ada']
    },

    // Common product questions
    responses: {
        greeting: [
            "Halo! 👋 Selamat datang di Nexus Retail. Apa yang bisa saya bantu hari ini?",
            "Hai there! 🙌 Saya siap membantu Anda menemukan produk terbaik. Ada yang bisa saya bantu?",
            "Selamat datang! 😊 Tanyakan kepada saya tentang produk yang ingin Anda cari."
        ],
        help: [
            "Saya bisa membantu Anda dengan:\n" +
            "✅ Mencari produk spesifik\n" +
            "✅ Membandingkan harga\n" +
            "✅ Memberikan rekomendasi\n" +
            "✅ Informasi pengiriman\n" +
            "✅ Detail produk\n" +
            "Silakan tanyakan apapun! 😊",
            
            "Apa yang bisa saya lakukan:\n" +
            "🛍️ Rekomendasi produk\n" +
            "💰 Info harga\n" +
            "📦 Detail spesifikasi\n" +
            "🚚 Info pengiriman\n" +
            "🔍 Cari produk\n" +
            "Tanyakan apa saja! 💬"
        ],
        unavailable: [
            "Maaf, produk ini sedang tidak tersedia saat ini. 😔 Apakah ada produk lain yang bisa saya bantu?",
            "Stok produk ini telah habis. Ingin saya rekomendasi produk serupa? 🤔"
        ],
        noProduct: [
            "Maaf, saya tidak menemukan produk tersebut. 🤷 Coba deskripsi yang lebih detail?",
            "Produk yang Anda cari tidak ditemukan. Mungkin ada produk lain yang cocok?"
        ],
        thanks: [
            "Senang bisa membantu! 😊 Ada yang lain?",
            "Sama-sama! Jika ada pertanyaan lagi, silakan tanya! 🙌"
        ],
        unknown: [
            "Hmm, saya kurang paham. Bisa jelaskan lebih detail? 🤔",
            "Maaf, bisa ulangi pertanyaannya? Saya ingin memastikan memahami yang Anda maksud. 😊"
        ]
    }
};

/**
 * Initialize chatbot
 */
function initializeChatbot() {
    loadChatHistory();
    setupChatbotListeners();
    console.log('✅ Chatbot initialized');
}

/**
 * Load chat history from localStorage
 */
function loadChatHistory() {
    try {
        const saved = localStorage.getItem('chatbotHistory');
        if (saved) {
            chatbotState.conversationHistory = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading chat history:', e);
        chatbotState.conversationHistory = [];
    }
}

/**
 * Save chat history to localStorage
 */
function saveChatHistory() {
    try {
        localStorage.setItem('chatbotHistory', JSON.stringify(chatbotState.conversationHistory));
    } catch (e) {
        console.error('Error saving chat history:', e);
    }
}

/**
 * Setup chatbot event listeners
 */
function setupChatbotListeners() {
    // Will be setup when DOM is ready
}

/**
 * Toggle chatbot window
 */
function toggleChatbot() {
    chatbotState.isOpen = !chatbotState.isOpen;
    const chatWidget = document.getElementById('nexus-chatbot');
    
    if (chatbotState.isOpen) {
        chatWidget.classList.add('chatbot-open');
        showChatbotGreeting();
    } else {
        chatWidget.classList.remove('chatbot-open');
    }
}

/**
 * Show initial greeting
 */
function showChatbotGreeting() {
    if (chatbotState.conversationHistory.length === 0) {
        const greeting = chatbotKnowledge.responses.greeting[
            Math.floor(Math.random() * chatbotKnowledge.responses.greeting.length)
        ];
        addChatbotMessage(greeting, true);
    }
}

/**
 * Add message to chat
 * @param {string} content - Message content
 * @param {boolean} isBot - Is from bot
 */
function addChatbotMessage(content, isBot = false) {
    const message = {
        id: 'msg_' + Date.now(),
        content: content,
        sender: isBot ? 'bot' : 'user',
        timestamp: Date.now(),
        isBot: isBot
    };

    chatbotState.conversationHistory.push(message);
    saveChatHistory();

    // Update UI
    displayChatbotMessage(message);
}

/**
 * Display message in chatbot UI
 * @param {Object} message - Message object
 */
function displayChatbotMessage(message) {
    const chatBody = document.getElementById('chatbot-messages');
    if (!chatBody) return;

    const messageEl = document.createElement('div');
    messageEl.className = `chatbot-message ${message.isBot ? 'bot-message' : 'user-message'} animate-slide-up`;
    messageEl.innerHTML = `
        <div class="message-content">
            ${message.content}
        </div>
        <span class="message-time">${formatChatTime(message.timestamp)}</span>
    `;

    chatBody.appendChild(messageEl);
    chatBody.scrollTop = chatBody.scrollHeight;
}

/**
 * Handle user input
 * @param {string} userInput - User message
 */
async function handleChatbotInput(userInput) {
    if (!userInput || userInput.trim().length === 0) {
        return;
    }

    // Add user message
    addChatbotMessage(userInput, false);

    // Show typing indicator
    showChatbotTyping();

    // Get bot response
    const response = await getChatbotResponse(userInput);

    // Remove typing indicator and add response
    removeChatbotTyping();
    await new Promise(r => setTimeout(r, 500)); // Simulate thinking
    addChatbotMessage(response, true);
}

/**
 * Get AI response based on user input
 * @param {string} userInput - User message
 * @returns {string} - Bot response
 */
async function getChatbotResponse(userInput) {
    const input = userInput.toLowerCase().trim();

    // Check for greetings
    if (matchesPattern(input, ['halo', 'hi', 'hello', 'hai', 'pagi', 'siang', 'sore', 'malam'])) {
        return pickRandom(chatbotKnowledge.responses.greeting);
    }

    // Check for help
    if (matchesPattern(input, ['bantuan', 'help', 'apa yang bisa', 'bisa apa', 'gimana', 'bagaimana'])) {
        return pickRandom(chatbotKnowledge.responses.help);
    }

    // Check for thanks
    if (matchesPattern(input, ['terima kasih', 'thanks', 'thank you', 'makasih', 'trims'])) {
        return pickRandom(chatbotKnowledge.responses.thanks);
    }

    // Check for price-related questions
    if (matchesPatternKeyword(input, chatbotKnowledge.productKeywords.price)) {
        return await handlePriceQuery(input);
    }

    // Check for product search
    if (matchesPatternKeyword(input, chatbotKnowledge.productKeywords.search)) {
        return await handleProductSearch(input);
    }

    // Check for recommendations
    if (matchesPatternKeyword(input, chatbotKnowledge.productKeywords.recommendation)) {
        return await handleRecommendation();
    }

    // Check for specifications
    if (matchesPatternKeyword(input, chatbotKnowledge.productKeywords.specifications)) {
        return await handleSpecifications(input);
    }

    // Check for category
    if (matchesPatternKeyword(input, chatbotKnowledge.productKeywords.category)) {
        return await handleCategory();
    }

    // Check for shipping info
    if (matchesPatternKeyword(input, chatbotKnowledge.productKeywords.shipping)) {
        return handleShippingInfo();
    }

    // Check for availability
    if (matchesPatternKeyword(input, chatbotKnowledge.productKeywords.availability)) {
        return await handleAvailability(input);
    }

    // Default response
    return pickRandom(chatbotKnowledge.responses.unknown);
}

/**
 * Handle price-related queries
 * @param {string} input - User input
 */
async function handlePriceQuery(input) {
    const products = dummyData || [];
    
    // Extract product name from input
    const productName = extractProductName(input, products);
    
    if (productName) {
        const product = products.find(p => 
            p.name.toLowerCase().includes(productName.toLowerCase())
        );
        
        if (product) {
            return `💰 Harga ${product.name}:\n\n` +
                   `IDR ${product.price.toLocaleString('id-ID')}\n\n` +
                   `Apakah Anda tertarik? Bisa saya bantu dengan yang lain? 😊`;
        }
    }

    // Show all prices
    return `💰 Daftar Harga Produk:\n\n` +
           products.map(p => `• ${p.name}: IDR ${p.price.toLocaleString('id-ID')}`).join('\n') +
           `\n\nKlik salah satu untuk detail lebih lanjut! 🛍️`;
}

/**
 * Handle product search
 * @param {string} input - User input
 */
async function handleProductSearch(input) {
    const products = dummyData || [];
    const productName = extractProductName(input, products);
    
    if (productName) {
        const matches = products.filter(p => 
            p.name.toLowerCase().includes(productName.toLowerCase())
        );
        
        if (matches.length > 0) {
            return `🔍 Saya menemukan ${matches.length} produk:\n\n` +
                   matches.map((p, i) => 
                       `${i + 1}. ${p.name}\n   Kategori: ${p.category}\n   Harga: IDR ${p.price.toLocaleString('id-ID')}`
                   ).join('\n\n') +
                   `\n\nKlik salah satu untuk detail! 👆`;
        }
    }

    return `Maaf, produk tidak ditemukan. 🤷 Coba cari:\n` +
           `${dummyData.map((p, i) => `${i + 1}. ${p.name}`).join('\n')}`;
}

/**
 * Handle recommendations
 */
async function handleRecommendation() {
    if (!dummyData || dummyData.length === 0) {
        return "Maaf, data produk tidak tersedia. 😔";
    }

    const recommended = dummyData[Math.floor(Math.random() * dummyData.length)];
    
    return `⭐ Rekomendasi Untuk Anda:\n\n` +
           `🏆 ${recommended.name}\n` +
           `📁 Kategori: ${recommended.category}\n` +
           `💰 Harga: IDR ${recommended.price.toLocaleString('id-ID')}\n\n` +
           `Ini produk berkualitas dengan harga terbaik! Tertarik? 😊`;
}

/**
 * Handle specifications query
 * @param {string} input - User input
 */
async function handleSpecifications(input) {
    const products = dummyData || [];
    const productName = extractProductName(input, products);
    
    if (productName) {
        const product = products.find(p => 
            p.name.toLowerCase().includes(productName.toLowerCase())
        );
        
        if (product) {
            return `📋 Spesifikasi ${product.name}:\n\n` +
                   `🏷️ Nama: ${product.name}\n` +
                   `📁 Kategori: ${product.category}\n` +
                   `💰 Harga: IDR ${product.price.toLocaleString('id-ID')}\n` +
                   `📅 Rilis: ${new Date(product.created_at).toLocaleDateString('id-ID')}\n` +
                   `⭐ Rating: ${product.rating || 'Belum ada rating'}\n\n` +
                   `Ingin tahu lebih detail? Klik produk di toko! 🛍️`;
        }
    }

    return "Produk tidak ditemukan. Silakan sebutkan nama produk yang lebih jelas! 🤔";
}

/**
 * Handle category query
 */
async function handleCategory() {
    const categories = new Set(dummyData?.map(p => p.category) || []);
    
    return `📂 Kategori Produk Yang Tersedia:\n\n` +
           `${Array.from(categories).map((cat, i) => `${i + 1}. ${cat}`).join('\n')} ` +
           `\n\nKetik nama kategori untuk melihat produk! 🔍`;
}

/**
 * Handle shipping info
 */
function handleShippingInfo() {
    return `🚚 Informasi Pengiriman:\n\n` +
           `✅ Gratis Ongkir: Untuk pembelian > IDR 2.000.000\n` +
           `⏱️ Estimasi: 2-5 hari kerja\n` +
           `📦 Packaging: Aman & profesional\n` +
           `🔄 Retur: Mudah jika tidak puas\n\n` +
           `Pertanyaan lain? Tanya saja! 😊`;
}

/**
 * Handle availability query
 * @param {string} input - User input
 */
async function handleAvailability(input) {
    const products = dummyData || [];
    const productName = extractProductName(input, products);
    
    if (productName) {
        const product = products.find(p => 
            p.name.toLowerCase().includes(productName.toLowerCase())
        );
        
        if (product) {
            return `✅ ${product.name} tersedia!\n\n` +
                   `Stok: Terbatas\n` +
                   `Harga: IDR ${product.price.toLocaleString('id-ID')}\n\n` +
                   `Segera tambahkan ke keranjang! 🛒`;
        }
    }

    return "Produk tidak ditemukan atau tidak tersedia. 😔";
}

/**
 * Extract product name from input
 * @param {string} input - User input
 * @param {Array} products - Product list
 * @returns {string|null} - Extracted product name
 */
function extractProductName(input, products = []) {
    for (const product of products) {
        if (input.includes(product.name.toLowerCase())) {
            return product.name;
        }
    }
    
    // Try partial matching
    const words = input.split(' ');
    for (const word of words) {
        for (const product of products) {
            if (product.name.toLowerCase().includes(word) && word.length > 2) {
                return product.name;
            }
        }
    }
    
    return null;
}

/**
 * Check if input matches pattern
 * @param {string} input - User input
 * @param {Array} patterns - Patterns to match
 * @returns {boolean}
 */
function matchesPattern(input, patterns) {
    return patterns.some(pattern => input.includes(pattern));
}

/**
 * Check if input matches keyword patterns
 * @param {string} input - User input
 * @param {Array} keywords - Keywords to match
 * @returns {boolean}
 */
function matchesPatternKeyword(input, keywords) {
    return keywords.some(keyword => input.includes(keyword));
}

/**
 * Pick random item from array
 * @param {Array} arr - Array
 * @returns {*}
 */
function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Show typing indicator
 */
function showChatbotTyping() {
    const chatBody = document.getElementById('chatbot-messages');
    if (!chatBody) return;

    const typingEl = document.createElement('div');
    typingEl.id = 'chatbot-typing';
    typingEl.className = 'chatbot-message bot-message';
    typingEl.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;

    chatBody.appendChild(typingEl);
    chatBody.scrollTop = chatBody.scrollHeight;
}

/**
 * Remove typing indicator
 */
function removeChatbotTyping() {
    const typingEl = document.getElementById('chatbot-typing');
    if (typingEl) {
        typingEl.remove();
    }
}

/**
 * Format chat time
 * @param {number} timestamp - Timestamp
 * @returns {string}
 */
function formatChatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Clear chat history
 */
function clearChatbotHistory() {
    if (confirm('Yakin ingin menghapus riwayat chat?')) {
        chatbotState.conversationHistory = [];
        saveChatHistory();
        const chatBody = document.getElementById('chatbot-messages');
        if (chatBody) {
            chatBody.innerHTML = '';
        }
        showChatbotGreeting();
    }
}

/**
 * Get chat statistics
 */
function getChatbotStats() {
    const history = chatbotState.conversationHistory;
    return {
        totalMessages: history.length,
        userMessages: history.filter(m => !m.isBot).length,
        botMessages: history.filter(m => m.isBot).length,
        sessionDuration: Date.now() - chatbotState.sessionStartTime
    };
}

console.log('✅ Chatbot module loaded');