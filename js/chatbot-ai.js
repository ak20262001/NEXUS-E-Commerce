// ============================================
// NEXUS RETAIL - INTELLIGENT PRODUCT CHATBOT
// ============================================

/**
 * Chatbot configuration
 */
const CHATBOT_CONFIG = {
    name: 'Nexus Assistant',
    version: '2.0',
    language: 'id-ID',
    timezone: 'Asia/Jakarta',
    responseDelay: 800,
    typingSpeed: 50,
    maxHistoryLength: 50,
    enableLogging: true
};

/**
 * Chatbot state
 */
let chatbotState = {
    isOpen: false,
    isTyping: false,
    messageCount: 0,
    sessionStart: Date.now(),
    conversationHistory: []
};

/**
 * Initialize chatbot
 */
function initializeChatbot() {
    loadChatbotHistory();
    setupChatbotEventListeners();
    console.log('✅ Chatbot initialized - ' + CHATBOT_CONFIG.name + ' v' + CHATBOT_CONFIG.version);
}

/**
 * Load chat history from localStorage
 */
function loadChatbotHistory() {
    try {
        const saved = localStorage.getItem('chatbotHistory');
        if (saved) {
            chatbotState.conversationHistory = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading chatbot history:', e);
        chatbotState.conversationHistory = [];
    }
}

/**
 * Save chat history to localStorage
 */
function saveChatbotHistory() {
    try {
        const history = chatbotState.conversationHistory.slice(-CHATBOT_CONFIG.maxHistoryLength);
        localStorage.setItem('chatbotHistory', JSON.stringify(history));
    } catch (e) {
        console.error('Error saving chatbot history:', e);
    }
}

/**
 * Setup chatbot event listeners
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
 * Toggle chatbot window
 */
function toggleChatbot() {
    const chatWindow = document.getElementById('chatbotWindow');
    const chatButton = document.getElementById('chatbotButton');
    
    if (!chatWindow) return;

    chatbotState.isOpen = !chatbotState.isOpen;

    if (chatbotState.isOpen) {
        chatWindow.classList.add('open');
        chatButton.classList.add('active');
        
        // Focus on input
        setTimeout(() => {
            const input = document.getElementById('chatbotInput');
            if (input) input.focus();
        }, 100);

        // Show welcome message if first time
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
        '👋 Halo! Saya Nexus Assistant.',
        '🛍️ Saya siap membantu Anda menemukan produk yang tepat.',
        '💬 Anda bisa bertanya tentang harga, spesifikasi, kategori, atau produk apapun.',
        '🔍 Contoh: "Berapa harga iPhone?", "Apa saja kategori?", "Produk laptop apa?"'
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

    // Add user message
    addChatbotMessage(userMessage, 'user');
    input.value = '';

    // Show typing indicator
    showChatbotTyping();

    // Process message
    setTimeout(() => {
        const response = generateChatbotResponse(userMessage);
        removeChatbotTyping();
        addChatbotMessage(response, 'bot');

        // Save to history
        saveChatbotHistory();
    }, CHATBOT_CONFIG.responseDelay);
}

/**
 * Add message to chatbot window
 * @param {string} message - Message text
 * @param {string} sender - 'user' or 'bot'
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

    // Store in history
    chatbotState.conversationHistory.push({
        sender,
        message,
        timestamp: Date.now()
    });
    chatbotState.messageCount++;

    logChatbotMessage(sender, message);
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
    if (typingEl) {
        typingEl.remove();
    }
    chatbotState.isTyping = false;
}

/**
 * Generate chatbot response menggunakan AI logic
 * @param {string} userMessage - User input
 * @returns {string} - Bot response
 */
function generateChatbotResponse(userMessage) {
    const message = userMessage.toLowerCase().trim();

    // Intent detection & response generation
    
    // 1. GREETING
    if (isGreeting(message)) {
        return getRandomResponse([
            '👋 Halo! Ada yang bisa saya bantu?',
            '✨ Selamat datang! Apa yang Anda cari?',
            '🙂 Halo! Apa kabar? Ada yang bisa saya bantu?'
        ]);
    }

    // 2. PRICE INQUIRY
    if (containsKeywords(message, ['harga', 'berapa', 'price', 'cost'])) {
        return handlePriceInquiry(message);
    }

    // 3. PRODUCT SEARCH
    if (containsKeywords(message, ['produk', 'ada', 'punya', 'product', 'apa'])) {
        return handleProductSearch(message);
    }

    // 4. CATEGORY INQUIRY
    if (containsKeywords(message, ['kategori', 'jenis', 'tipe', 'category', 'apa aja'])) {
        return handleCategoryInquiry(message);
    }

    // 5. SPECIFIC PRODUCT INFO
    const product = findProductByName(message);
    if (product) {
        return getProductInfo(product);
    }

    // 6. CATEGORY PRODUCTS
    const category = findCategoryByName(message);
    if (category) {
        return getCategoryProducts(category);
    }

    // 7. COMPARE PRODUCTS
    if (containsKeywords(message, ['bandingkan', 'banding', 'compare', 'vs', 'mana'])) {
        return handleComparison(message);
    }

    // 8. STOCK/AVAILABILITY
    if (containsKeywords(message, ['stok', 'tersedia', 'ada', 'stock', 'available'])) {
        return '✅ Semua produk kami tersedia dan stok terbatas. Silakan segera tambahkan ke keranjang!';
    }

    // 9. CHAT FEATURE
    if (containsKeywords(message, ['chat', 'seller', 'penjual', 'tanya'])) {
        return '💬 Anda bisa melakukan chat langsung dengan penjual di halaman produk! Klik ikon chat untuk memulai percakapan.';
    }

    // 10. PRICING FEATURE
    if (containsKeywords(message, ['harga berubah', 'diskon', 'promo', 'hemat'])) {
        return '💰 Harga produk bisa berubah! Penjual dapat mengubah harga melalui chat. Perubahan harga berlaku 5 menit, lalu kembali normal otomatis.';
    }

    // 11. HELP
    if (containsKeywords(message, ['bantuan', 'help', 'bagaimana', 'cara'])) {
        return getHelpMessage();
    }

    // 12. CART/SHOPPING
    if (containsKeywords(message, ['keranjang', 'cart', 'beli', 'belanja', 'add'])) {
        return '🛒 Anda bisa menambahkan produk ke keranjang dengan klik tombol "+" di setiap produk atau "Add to Cart".';
    }

    // 13. THANKS
    if (containsKeywords(message, ['terima kasih', 'thank', 'thanks', 'makasih'])) {
        return getRandomResponse([
            '😊 Sama-sama! Ada lagi yang bisa saya bantu?',
            '🙏 Senang bisa membantu! Ada pertanyaan lain?',
            '✨ Dengan senang hati! Butuh info lebih?'
        ]);
    }

    // 14. GOODBYE
    if (containsKeywords(message, ['bye', 'selamat tinggal', 'dada', 'goodbye'])) {
        return getRandomResponse([
            '👋 Sampai jumpa! Selamat berbelanja!',
            '😊 Terima kasih telah berkunjung. Selamat berbelanja!',
            '✨ Semoga menemukan produk yang Anda cari!'
        ]);
    }

    // 15. FALLBACK - SMART SUGGESTIONS
    return getSuggestions(message);
}

/**
 * Check if message is greeting
 * @param {string} message - User message
 * @returns {boolean}
 */
function isGreeting(message) {
    const greetings = ['halo', 'hi', 'hello', 'hai', 'salam', 'pagi', 'sore', 'malam'];
    return greetings.some(g => message.includes(g));
}

/**
 * Check if message contains keywords
 * @param {string} message - User message
 * @param {Array} keywords - Keywords to check
 * @returns {boolean}
 */
function containsKeywords(message, keywords) {
    return keywords.some(keyword => message.includes(keyword));
}

/**
 * Handle price inquiry
 * @param {string} message - User message
 * @returns {string}
 */
function handlePriceInquiry(message) {
    const product = findProductByName(message);
    if (product) {
        return `💰 ${product.name}\nHarga: IDR ${product.price.toLocaleString('id-ID')}\n\nApakah Anda tertarik? Silakan klik tombol chat untuk menanyakan lebih lanjut kepada penjual!`;
    }

    // If no specific product, show price ranges
    const minPrice = Math.min(...dummyData.map(p => p.price));
    const maxPrice = Math.max(...dummyData.map(p => p.price));

    return `💰 Harga produk kami berkisar:\n\n🔹 Termurah: IDR ${minPrice.toLocaleString('id-ID')}\n🔹 Termahal: IDR ${maxPrice.toLocaleString('id-ID')}\n\nUntuk harga spesifik produk, silakan tanyakan nama produknya!`;
}

/**
 * Handle product search
 * @param {string} message - User message
 * @returns {string}
 */
function handleProductSearch(message) {
    const product = findProductByName(message);
    if (product) {
        return getProductInfo(product);
    }

    // Show all products
    const products = dummyData.map(p => 
        `🛍️ ${p.name} - IDR ${p.price.toLocaleString('id-ID')}`
    ).join('\n');

    return `Kami memiliki ${dummyData.length} produk:\n\n${products}\n\nTanya nama produk spesifik untuk info lebih detail!`;
}

/**
 * Handle category inquiry
 * @param {string} message - User message
 * @returns {string}
 */
function handleCategoryInquiry(message) {
    const categories = [...new Set(dummyData.map(p => p.category))];
    const categoryList = categories.map((cat, idx) => `${idx + 1}. ${cat}`).join('\n');

    return `📂 Kategori produk kami:\n\n${categoryList}\n\nTanya kategori mana yang ingin dilihat!`;
}

/**
 * Find product by name in message
 * @param {string} message - User message
 * @returns {Object|null}
 */
function findProductByName(message) {
    return dummyData.find(product => 
        message.includes(product.name.toLowerCase()) ||
        message.includes(product.category.toLowerCase())
    );
}

/**
 * Get product info
 * @param {Object} product - Product object
 * @returns {string}
 */
function getProductInfo(product) {
    return `📦 ${product.name}

📊 Detail Produk:
  🏷️ Kategori: ${product.category}
  💰 Harga: IDR ${product.price.toLocaleString('id-ID')}
  📅 Dirilis: ${new Date(product.created_at).toLocaleDateString('id-ID')}

💬 Ingin tahu lebih? Silakan chat langsung dengan penjual untuk:
  ✅ Negosiasi harga
  ✅ Tanya spesifikasi detail
  ✅ Konfirmasi ketersediaan
  ✅ Berbagai pertanyaan lainnya

Klik ikon chat di produk untuk memulai!`;
}

/**
 * Find category by name
 * @param {string} message - User message
 * @returns {string|null}
 */
function findCategoryByName(message) {
    const categories = [...new Set(dummyData.map(p => p.category))];
    return categories.find(cat => message.includes(cat.toLowerCase()));
}

/**
 * Get products in category
 * @param {string} category - Category name
 * @returns {string}
 */
function getCategoryProducts(category) {
    const products = dummyData.filter(p => p.category.toLowerCase() === category.toLowerCase());
    
    const productList = products.map(p => 
        `• ${p.name} - IDR ${p.price.toLocaleString('id-ID')}`
    ).join('\n');

    return `🛍️ Produk kategori ${category}:\n\n${productList}\n\nTanya nama produk untuk info lebih detail!`;
}

/**
 * Handle product comparison
 * @param {string} message - User message
 * @returns {string}
 */
function handleComparison(message) {
    const words = message.split(' ');
    const products = dummyData.filter(p => 
        words.some(w => p.name.toLowerCase().includes(w))
    );

    if (products.length < 2) {
        return '🤔 Sebutkan 2 produk yang ingin dibandingkan! Contoh: "Bandingkan iPhone dan Laptop"';
    }

    const comparison = products.slice(0, 2).map(p => 
        `${p.name}
  💰 Harga: IDR ${p.price.toLocaleString('id-ID')}
  📂 Kategori: ${p.category}`
    ).join('\n\n');

    return `⚖️ Perbandingan Produk:\n\n${comparison}\n\nUntuk analisis mendalam, tanya langsung ke penjual!`;
}

/**
 * Get help message
 * @returns {string}
 */
function getHelpMessage() {
    return `ℹ️ Panduan Chatbot:

Anda bisa menanyakan:
  📦 "Apa saja produk yang ada?"
  💰 "Berapa harga iPhone?"
  📂 "Apa saja kategori?"
  🛍️ "Produk dari kategori laptop"
  ⚖️ "Bandingkan produk A dan B"
  💬 "Bagaimana cara chat dengan penjual?"
  🛒 "Bagaimana cara belanja?"
  💰 "Bagaimana tentang diskon/promo?"

Atau tanya nama produk langsung untuk info lengkap!`;
}

/**
 * Get suggestions based on user input
 * @param {string} message - User message
 * @returns {string}
 */
function getSuggestions(message) {
    const suggestions = [
        '🤔 Sepertinya saya tidak sepenuhnya memahami pertanyaan Anda.',
        'Berikut saran yang mungkin membantu:',
        '',
        '• Tanya nama produk spesifik: "Harga iPhone?"',
        '• Tanya kategori: "Apa saja kategori?"',
        '• Lihat semua produk: "Apa aja produk?"',
        '• Bandingkan produk: "Bandingkan laptop dan handphone"',
        '',
        '✨ Atau gunakan chat langsung dengan penjual di halaman produk!'
    ];

    return suggestions.join('\n');
}

/**
 * Get random response from array
 * @param {Array} responses - Response options
 * @returns {string}
 */
function getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Clear chatbot history
 */
function clearChatbotHistory() {
    if (confirm('Hapus semua riwayat chat? Tindakan ini tidak dapat dibatalkan.')) {
        chatbotState.conversationHistory = [];
        chatbotState.messageCount = 0;
        localStorage.removeItem('chatbotHistory');
        
        const messagesContainer = document.getElementById('chatbotMessages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        
        showChatbotWelcome();
        showToast('Riwayat chat berhasil dihapus', 'success');
    }
}

/**
 * Export chat history
 */
function exportChatbotHistory() {
    const history = chatbotState.conversationHistory
        .map(msg => `[${new Date(msg.timestamp).toLocaleTimeString('id-ID')}] ${msg.sender.toUpperCase()}: ${msg.message}`)
        .join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(history));
    element.setAttribute('download', 'chatbot-history.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast('Riwayat chat berhasil diunduh', 'success');
}

/**
 * Get chatbot statistics
 */
function getChatbotStats() {
    const sessionDuration = Math.round((Date.now() - chatbotState.sessionStart) / 1000 / 60);
    const userMessages = chatbotState.conversationHistory.filter(m => m.sender === 'user').length;
    const botMessages = chatbotState.conversationHistory.filter(m => m.sender === 'bot').length;

    return `
📊 Statistik Chatbot:
  💬 Total Pesan: ${chatbotState.messageCount}
  👤 Pesan Anda: ${userMessages}
  🤖 Pesan Bot: ${botMessages}
  ⏱️ Durasi Sesi: ${sessionDuration} menit
  🕐 Dimulai: ${new Date(chatbotState.sessionStart).toLocaleTimeString('id-ID')}
    `;
}

/**
 * Log chatbot message
 * @param {string} sender - Message sender
 * @param {string} message - Message text
 */
function logChatbotMessage(sender, message) {
    if (CHATBOT_CONFIG.enableLogging) {
        console.log(`[${sender.toUpperCase()}] ${message}`);
    }
}

console.log('✅ Chatbot module loaded - ' + CHATBOT_CONFIG.name + ' v' + CHATBOT_CONFIG.version);