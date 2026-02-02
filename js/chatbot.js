// ============================================
// NEXUS RETAIL - CHATBOT ASSISTANT
// ============================================

/**
 * State chatbot
 */
let chatState = {
    isOpen: false,
    isTyping: false,
    messageCount: 0
};

/**
 * Toggle chat window
 */
function toggleChat() {
    const chatWindow = document.getElementById('chatWindow');
    const chatInput = document.getElementById('chatInput');

    chatState.isOpen = !chatState.isOpen;

    if (chatState.isOpen) {
        chatWindow.classList.remove('scale-0', 'opacity-0');
        setTimeout(() => chatInput.focus(), TIMINGS.animationDuration);
    } else {
        chatWindow.classList.add('scale-0', 'opacity-0');
    }

    console.log('Chat toggled:', chatState.isOpen);
}

/**
 * Kirim quick reply
 * @param {string} message - Pesan yang akan dikirim
 */
function sendQuickReply(message) {
    const chatInput = document.getElementById('chatInput');
    chatInput.value = message;
    handleChatSubmit({ preventDefault: () => { } });
}

/**
 * Handle form submit dari chat
 * @param {Event} e - Form submit event
 */
function handleChatSubmit(e) {
    e.preventDefault();

    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();

    if (!message || chatState.isTyping) {
        return;
    }

    // Reset input
    chatInput.value = '';

    // Add user message
    addChatMessage(message, 'user');

    // Show typing indicator
    showChatTypingIndicator();
    chatState.isTyping = true;

    // Get bot response
    setTimeout(() => {
        removeChatTypingIndicator();
        const response = getBotResponse(message);
        addChatMessage(response, 'bot');
        chatState.isTyping = false;
    }, TIMINGS.botResponseDelay + Math.random() * TIMINGS.botResponseVariance);
}

/**
 * Tambah pesan ke chat
 * @param {string} content - Konten pesan (bisa HTML)
 * @param {string} sender - 'user' atau 'bot'
 */
function addChatMessage(content, sender) {
    const container = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    const isUser = sender === 'user';

    chatState.messageCount++;

    messageDiv.className = `flex gap-3 max-w-[85%] message-anim ${isUser ? 'ml-auto flex-row-reverse' : ''}`;

    messageDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
            isUser
                ? 'bg-brand-600 text-white'
                : 'bg-brand-100 dark:bg-brand-900 text-brand-600'
        }">
            <i class="fa-solid ${isUser ? 'fa-user' : 'fa-robot'} text-xs"></i>
        </div>
        <div class="${
            isUser
                ? 'bg-brand-600 text-white rounded-tr-none'
                : 'bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-700 rounded-tl-none'
        } p-3 rounded-2xl text-sm shadow-sm max-w-full overflow-hidden">
            ${content}
        </div>
    `;

    container.appendChild(messageDiv);

    // Auto scroll ke bottom
    scrollToBottom();
}

/**
 * Tampilkan typing indicator
 */
function showChatTypingIndicator() {
    const container = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');

    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'flex gap-3 max-w-[85%] message-anim';

    typingDiv.innerHTML = `
        <div class="w-8 h-8 bg-brand-100 dark:bg-brand-900 rounded-full flex-shrink-0 flex items-center justify-center">
            <i class="fa-solid fa-robot text-brand-600 text-xs"></i>
        </div>
        <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-700 p-4 rounded-2xl rounded-tl-none text-sm shadow-sm flex gap-1">
            <div class="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
            <div class="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
            <div class="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
        </div>
    `;

    container.appendChild(typingDiv);
    scrollToBottom();
}

/**
 * Hapus typing indicator
 */
function removeChatTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => typingIndicator.remove(), 300);
    }
}

/**
 * Scroll chat ke bottom
 */
function scrollToBottom() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Get bot response berdasarkan user message
 * @param {string} message - User message
 * @returns {string} - Bot response (bisa HTML)
 */
function getBotResponse(message) {
    const lower = message.toLowerCase();

    // --- GREETING RESPONSES ---
    if (lower.includes('halo') || lower.includes('hi') || lower.includes('pagi') ||
        lower.includes('siang') || lower.includes('malam') || lower.includes('hello')) {
        const greetings = [
            "Halo! Ada yang bisa saya bantu carikan hari ini? 😊",
            "Selamat datang! Apa yang Anda cari?",
            "Halo! Anda mencari produk apa?"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // --- HELP & ASSISTANCE ---
    if (lower.includes('bantuan') || lower.includes('help') || lower.includes('gimana') ||
        lower.includes('bagaimana') || lower.includes('cara')) {
        return `Saya bisa membantu Anda dengan:
        <ul class="mt-2 space-y-1 text-xs">
            <li>🔍 <strong>Cari produk</strong> - ketik nama barang (contoh: "Cari Laptop")</li>
            <li>💰 <strong>Info harga</strong> - tanyakan harga produk tertentu</li>
            <li>🎁 <strong>Promo</strong> - ketik "Promo" untuk lihat penawaran</li>
            <li>📦 <strong>Pengiriman</strong> - tanyakan tentang ongkos kirim</li>
            <li>❓ <strong>FAQ</strong> - tanyakan pertanyaan umum</li>
        </ul>`;
    }

    // --- PROMO & DISCOUNT ---
    if (lower.includes('promo') || lower.includes('diskon') || lower.includes('penawaran') ||
        lower.includes('sale') || lower.includes('potongan')) {
        return `🎉 <strong>Promo Terbaru Kami:</strong>
        <ul class="mt-2 space-y-2 text-xs">
            <li>✨ <strong>Gratis Ongkir</strong> untuk pembelian di atas 2 juta</li>
            <li>💳 <strong>Cashback 10%</strong> untuk pembayaran pakai kartu kredit</li>
            <li>⭐ <strong>Flash Sale</strong> setiap Jumat pukul 12:00 - 14:00</li>
            <li>👥 <strong>Referral</strong> ajak teman dan dapatkan bonus</li>
        </ul>
        <p class="mt-2 text-[10px] text-slate-400">Promo berlaku sampai akhir bulan!</p>`;
    }

    // --- SHIPPING & DELIVERY ---
    if (lower.includes('pengiriman') || lower.includes('ongkir') || lower.includes('kirim') ||
        lower.includes('shipping') || lower.includes('delivery')) {
        return `📦 <strong>Informasi Pengiriman:</strong>
        <ul class="mt-2 space-y-1 text-xs">
            <li><strong>Gratis Ongkir:</strong> Pembelian minimal Rp 2.000.000</li>
            <li><strong>Reguler:</strong> 3-5 hari kerja (Rp 25.000 - Rp 150.000)</li>
            <li><strong>Express:</strong> 1-2 hari kerja (Rp 75.000 - Rp 300.000)</li>
            <li><strong>Same Day:</strong> Hari yang sama (area Jakarta, min Rp 500.000)</li>
        </ul>`;
    }

    // --- PRODUCT SEARCH ---
    const foundProducts = searchProducts(message);

    if (foundProducts.length > 0) {
        let html = `Saya menemukan <strong>${foundProducts.length}</strong> produk yang cocok:<br><ul class="space-y-2 mt-2">`;

        foundProducts.slice(0, 3).forEach(product => {
            const formattedPrice = formatCurrency(product.price);
            html += `
                <li class="flex gap-2 items-center bg-slate-50 dark:bg-slate-800 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer" 
                    onclick="addToCart(${product.id}); toggleChat(); showNotification('Item ditambahkan ke keranjang!', 'success')">
                    <img src="${product.image}" class="w-8 h-8 rounded object-cover flex-shrink-0">
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold truncate">${product.name}</p>
                        <p class="text-[10px] text-brand-600 font-semibold">${formattedPrice}</p>
                    </div>
                    <i class="fa-solid fa-plus text-xs text-slate-400 flex-shrink-0"></i>
                </li>`;
        });

        html += '</ul>';

        if (foundProducts.length > 3) {
            html += `<p class="text-[10px] mt-2 italic text-slate-400">+ ${foundProducts.length - 3} produk lainnya.</p>`;
        }

        return html;
    }

    // --- PAYMENT INFO ---
    if (lower.includes('pembayaran') || lower.includes('bayar') || lower.includes('metode') ||
        lower.includes('payment')) {
        return `💳 <strong>Metode Pembayaran:</strong>
        <ul class="mt-2 space-y-1 text-xs">
            <li>💰 Transfer Bank (BCA, Mandiri, BRI, BNI, CIMB)</li>
            <li>📱 E-wallet (GCash, OVO, Dana, LINKAJA)</li>
            <li>💳 Kartu Kredit (Visa, MasterCard, AmEx)</li>
            <li>🏦 Cicilan (0% cicilan up to 12 bulan)</li>
            <li>📦 COD (Cash On Delivery untuk area tertentu)</li>
        </ul>`;
    }

    // --- CART & CHECKOUT ---
    if (lower.includes('keranjang') || lower.includes('cart') || lower.includes('checkout')) {
        const itemCount = calculateItemCount();
        const total = calculateTotal();

        if (itemCount === 0) {
            return "Keranjang Anda masih kosong. Mulai belanja sekarang! 🛍️";
        } else {
            const formattedTotal = formatCurrency(total);
            return `Keranjang Anda ada <strong>${itemCount} item</strong> dengan total <strong>${formattedTotal}</strong>. Siap checkout? 💳`;
        }
    }

    // --- ACCOUNT & USER ---
    if (lower.includes('akun') || lower.includes('login') || lower.includes('register') ||
        lower.includes('profile')) {
        return "Untuk login atau membuat akun, silakan klik tombol <strong>Login</strong> di pojok kanan atas navbar. 👤";
    }

    // --- FALLBACK RESPONSE ---
    return `Maaf, saya tidak terlalu mengerti 😅. Coba ketik:
    <ul class="mt-2 space-y-1 text-xs">
        <li>✨ Nama produk (contoh: "Cari Laptop")</li>
        <li>💬 "Bantuan" untuk daftar perintah</li>
        <li>🎁 "Promo" untuk melihat penawaran</li>
    </ul>`;
}

/**
 * Clear chat history
 */
function clearChatHistory() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="flex gap-3 max-w-[85%]">
            <div class="w-8 h-8 bg-brand-100 dark:bg-brand-900 rounded-full flex-shrink-0 flex items-center justify-center">
                <i class="fa-solid fa-robot text-brand-600 text-xs"></i>
            </div>
            <div class="bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none text-sm shadow-sm">
                <p>Chat history dihapus. Ada yang bisa saya bantu? 👋</p>
            </div>
        </div>
    `;
    chatState.messageCount = 0;
    scrollToBottom();
}

console.log('✅ Chatbot module loaded');