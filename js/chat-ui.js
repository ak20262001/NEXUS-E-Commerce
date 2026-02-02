// ============================================
// NEXUS RETAIL - CHAT UI & DISPLAY
// ============================================

/**
 * Display chat message in UI
 * @param {Object} message - Message object
 * @param {number} productId - Product ID
 */
function displayChatMessage(message, productId) {
    const chatContainer = document.getElementById(`chat-messages-${productId}`);
    if (!chatContainer) return;

    const isSender = message.senderId === currentUser.id;
    
    const messageEl = document.createElement('div');
    messageEl.className = `message-item ${isSender ? 'sender' : 'receiver'} animate-slide-up`;
    messageEl.innerHTML = `
        <div class="message-bubble">
            <p class="message-sender">${message.senderName}</p>
            <p class="message-text">${escapeHtml(message.message)}</p>
            <span class="message-time">${formatTime(message.timestamp)}</span>
        </div>
    `;

    chatContainer.appendChild(messageEl);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/**
 * Render full chat window for product
 * @param {number} productId - Product ID
 * @param {string} sellerId - Seller ID
 */
function renderChatWindow(productId, sellerId) {
    const product = dummyData.find(p => p.id === productId);
    if (!product) return;

    const session = getOrCreateChatSession(productId, sellerId);
    const messages = getChatMessages(productId);

    const chatHTML = `
        <div class="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center animate-fade-in" onclick="closeChatWindow(event)">
            <div class="bg-white dark:bg-dark-card rounded-3xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col" onclick="event.stopPropagation()">
                <!-- Header -->
                <div class="p-6 border-b dark:border-dark-border flex justify-between items-center bg-brand-600 text-white rounded-t-3xl">
                    <div>
                        <h2 class="text-xl font-bold">${product.name}</h2>
                        <p class="text-sm text-brand-100">Chat dengan penjual</p>
                    </div>
                    <button onclick="closeChatWindow()" class="text-white hover:text-brand-100 transition">
                        <i class="fa-solid fa-xmark text-2xl"></i>
                    </button>
                </div>

                <!-- Messages Container -->
                <div id="chat-messages-${productId}" class="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-dark-bg/50">
                    ${messages.length === 0 ? `
                        <div class="text-center py-12">
                            <i class="fa-solid fa-comment text-4xl text-slate-300 dark:text-slate-700 mb-4"></i>
                            <p class="text-slate-500 dark:text-slate-400">Belum ada chat</p>
                            <p class="text-slate-400 text-sm mt-2">Mulai percakapan dengan penjual</p>
                        </div>
                    ` : messages.map((msg, idx) => {
                        const isSender = msg.senderId === currentUser.id;
                        return `
                            <div class="message-item ${isSender ? 'sender' : 'receiver'} animate-slide-up" style="animation-delay: ${idx * 50}ms">
                                <div class="message-bubble ${isSender ? 'bg-brand-600 text-white' : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border'}">
                                    <p class="message-sender text-xs font-semibold mb-1">${msg.senderName} (${msg.senderRole === 'seller' ? '🏪 Penjual' : '👤 Pembeli'})</p>
                                    <p class="message-text text-sm">${escapeHtml(msg.message)}</p>
                                    <span class="message-time text-xs mt-2 opacity-70">${formatTime(msg.timestamp)}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Input Area -->
                <div class="p-6 border-t dark:border-dark-border bg-white dark:bg-dark-card rounded-b-3xl">
                    <form onsubmit="handleSendMessage(event, ${productId}, '${sellerId}')" class="flex gap-3">
                        <input type="text" id="chat-input-${productId}" placeholder="Ketik pesan..." 
                            class="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-600 outline-none text-sm">
                        <button type="submit" class="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center hover:bg-brand-700 transition">
                            <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </form>
                    
                    <!-- Chat Info -->
                    <div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-xs text-blue-600 dark:text-blue-400 text-center">
                        ⏰ Chat akan direset jika tidak ada aktivitas selama 5 menit
                    </div>

                    <!-- Actions -->
                    ${isSeller() ? `
                        <div class="mt-4 flex gap-2">
                            <button onclick="openEditPrice(${productId})" class="flex-1 py-2 px-4 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition text-sm font-semibold">
                                <i class="fa-solid fa-tag mr-2"></i>Edit Harga
                            </button>
                        </div>
                    ` : ''}

                    <button onclick="deleteChat(${productId})" class="mt-2 w-full py-2 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition text-sm font-semibold">
                        <i class="fa-solid fa-trash-alt mr-2"></i>Hapus Riwayat Chat
                    </button>
                </div>
            </div>
        </div>
    `;

    // Insert modal
    const modalContainer = document.getElementById('chat-modal-container') || createModalContainer();
    modalContainer.innerHTML = chatHTML;
    modalContainer.style.display = 'flex';

    // Focus input
    setTimeout(() => {
        document.getElementById(`chat-input-${productId}`)?.focus();
    }, 100);
}

/**
 * Create modal container if not exists
 */
function createModalContainer() {
    const container = document.createElement('div');
    container.id = 'chat-modal-container';
    container.className = 'fixed inset-0 z-[70] flex items-center justify-center pointer-events-auto';
    document.body.appendChild(container);
    return container;
}

/**
 * Close chat window
 * @param {Event} event - Click event
 */
function closeChatWindow(event) {
    if (event && event.target.id !== 'chat-modal-container') return;
    
    const container = document.getElementById('chat-modal-container');
    if (container) {
        container.style.display = 'none';
    }
}

/**
 * Handle send message
 * @param {Event} event - Form submit event
 * @param {number} productId - Product ID
 * @param {string} sellerId - Seller ID
 */
function handleSendMessage(event, productId, sellerId) {
    event.preventDefault();

    const input = document.getElementById(`chat-input-${productId}`);
    if (!input) return;

    const message = input.value.trim();
    if (message.length === 0) {
        showToast('Pesan tidak boleh kosong', 'warning');
        return;
    }

    sendChatMessage(productId, message, sellerId);
    input.value = '';
    input.focus();
}

/**
 * Delete chat history
 * @param {number} productId - Product ID
 */
function deleteChat(productId) {
    if (confirm('Yakin ingin menghapus riwayat chat? Chat akan dihapus untuk semua pengguna.')) {
        deleteChatHistory(productId);
        closeChatWindow();
        showToast('Riwayat chat berhasil dihapus', 'success');
    }
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string}
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format timestamp to readable time
 * @param {number} timestamp - Unix timestamp
 * @returns {string}
 */
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }
    
    // If yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Kemarin';
    }
    
    // Otherwise
    return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
}



console.log('✅ Chat UI module loaded');