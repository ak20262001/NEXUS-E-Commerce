// =====================================================
// LIVE CHAT SYSTEM - REAL-TIME SELLER-BUYER MESSAGING
// =====================================================

/**
 * Live Chat State Management
 */
let liveChatState = {
    currentUser: null,
    currentChat: null,
    chatList: [],
    messages: [],
    isTyping: false,
    unreadCount: 0,
    pollInterval: null,
    lastMessageId: 0
};

/**
 * Initialize Live Chat System
 */
function initializeLiveChat() {
    loadChatsFromStorage();
    setupChatListeners();
    startPolling();
    console.log('✅ Live Chat System Initialized');
}

/**
 * Load chats from localStorage
 */
function loadChatsFromStorage() {
    try {
        const saved = localStorage.getItem('liveChats');
        if (saved) {
            liveChatState.chatList = JSON.parse(saved);
        }
    } catch (e) {
        console.error('Error loading chats:', e);
        liveChatState.chatList = [];
    }
}

/**
 * Save chats to localStorage
 */
function saveChatsToStorage() {
    try {
        localStorage.setItem('liveChats', JSON.stringify(liveChatState.chatList));
    } catch (e) {
        console.error('Error saving chats:', e);
    }
}

/**
 * Setup chat event listeners
 */
function setupChatListeners() {
    // This will be called when chat UI is loaded
    const sendBtn = document.getElementById('liveChatSendBtn');
    const input = document.getElementById('liveChatInput');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', sendLiveMessage);
    }
    
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendLiveMessage();
            }
        });
    }
}

/**
 * Start polling for new messages (simulating real-time)
 */
function startPolling() {
    // Poll every 500ms for new messages (simulating real-time)
    liveChatState.pollInterval = setInterval(() => {
        if (liveChatState.currentChat) {
            checkForNewMessages();
            updateTypingStatus();
        }
    }, 500);
}

/**
 * Stop polling
 */
function stopPolling() {
    if (liveChatState.pollInterval) {
        clearInterval(liveChatState.pollInterval);
        liveChatState.pollInterval = null;
    }
}

/**
 * Get or create chat between user and other party
 */
function getOrCreateChat(userId, otherUserId, otherUserName, otherUserAvatar, productId = null, productName = null) {
    let chat = liveChatState.chatList.find(c => 
        (c.user1Id === userId && c.user2Id === otherUserId) ||
        (c.user1Id === otherUserId && c.user2Id === userId)
    );
    
    if (!chat) {
        chat = {
            id: 'chat_' + Date.now(),
            user1Id: userId,
            user1Name: getCurrentUserName(),
            user1Avatar: getCurrentUserAvatar(),
            user2Id: otherUserId,
            user2Name: otherUserName,
            user2Avatar: otherUserAvatar,
            productId: productId,
            productName: productName,
            messages: [],
            createdAt: Date.now(),
            lastMessageAt: Date.now(),
            lastMessage: null,
            unreadCount: 0
        };
        
        liveChatState.chatList.push(chat);
        saveChatsToStorage();
    }
    
    return chat;
}

/**
 * Open chat window
 */
function openLiveChat(chatId) {
    const chat = liveChatState.chatList.find(c => c.id === chatId);
    
    if (!chat) {
        console.error('Chat not found:', chatId);
        return;
    }
    
    liveChatState.currentChat = chat;
    liveChatState.messages = chat.messages || [];
    chat.unreadCount = 0; // Mark as read
    
    saveChatsToStorage();
    renderChatWindow(chat);
    renderMessageList();
}

/**
 * Send live message
 */
function sendLiveMessage() {
    const input = document.getElementById('liveChatInput');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message || !liveChatState.currentChat) return;
    
    const currentUser = getCurrentUser();
    const newMessage = {
        id: 'msg_' + Date.now(),
        chatId: liveChatState.currentChat.id,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        senderRole: currentUser.role, // 'buyer' or 'seller'
        content: message,
        timestamp: Date.now(),
        read: false,
        isEdited: false
    };
    
    // Add to current chat messages
    liveChatState.messages.push(newMessage);
    liveChatState.currentChat.messages.push(newMessage);
    liveChatState.currentChat.lastMessage = message;
    liveChatState.currentChat.lastMessageAt = Date.now();
    
    // Save to storage
    saveChatsToStorage();
    
    // Clear input
    input.value = '';
    input.focus();
    
    // Update UI
    renderMessageList();
    updateChatPreview(liveChatState.currentChat.id);
    
    // Show new message animation
    setTimeout(() => {
        const messagesContainer = document.getElementById('liveChatMessages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, 50);
}

/**
 * Check for new messages (polling)
 */
function checkForNewMessages() {
    if (!liveChatState.currentChat) return;
    
    // In a real app, this would fetch from server
    // For now, we just render what's in localStorage
    const updatedChat = liveChatState.chatList.find(c => c.id === liveChatState.currentChat.id);
    if (updatedChat) {
        const newMessages = updatedChat.messages.filter(m => m.id > liveChatState.lastMessageId);
        if (newMessages.length > 0) {
            liveChatState.messages = updatedChat.messages;
            liveChatState.lastMessageId = Math.max(...updatedChat.messages.map(m => parseInt(m.id.split('_')[1])));
            renderMessageList();
        }
    }
}

/**
 * Update typing status
 */
function updateTypingStatus() {
    // This would show "User is typing..." indicator
    // In a real app, this would come from server
}

/**
 * Render chat window
 */
function renderChatWindow(chat) {
    const otherUser = getCurrentUser().id === chat.user1Id ? chat.user2Name : chat.user1Name;
    const otherAvatar = getCurrentUser().id === chat.user1Id ? chat.user2Avatar : chat.user1Avatar;
    
    const header = document.getElementById('liveChatHeader');
    if (!header) return;
    
    header.innerHTML = `
        <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-3">
                <img src="${otherAvatar}" alt="Avatar" class="w-10 h-10 rounded-full object-cover">
                <div>
                    <h3 class="font-bold text-sm">${otherUser}</h3>
                    ${chat.productName ? `<p class="text-xs text-gray-500">Re: ${chat.productName}</p>` : ''}
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="toggleCallInfo()" class="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition" title="Info">
                    <i class="fa-solid fa-info text-lg"></i>
                </button>
                <button onclick="closeLiveChat()" class="p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition" title="Close">
                    <i class="fa-solid fa-times text-lg"></i>
                </button>
            </div>
        </div>
    `;
}

/**
 * Render message list
 */
function renderMessageList() {
    const messagesContainer = document.getElementById('liveChatMessages');
    if (!messagesContainer) return;
    
    const currentUser = getCurrentUser();
    
    messagesContainer.innerHTML = liveChatState.messages.map(msg => {
        const isOwnMessage = msg.senderId === currentUser.id;
        const timestamp = new Date(msg.timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-3 animate-slideIn">
                <div class="flex gap-2 max-w-xs lg:max-w-sm ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}">
                    <img src="${msg.senderAvatar}" alt="Avatar" class="w-8 h-8 rounded-full object-cover flex-shrink-0">
                    <div class="${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-1">
                        <div class="flex items-center gap-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}">
                            <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">${msg.senderName}</span>
                            <span class="text-xs text-gray-400">${timestamp}</span>
                        </div>
                        <div class="group relative">
                            <div class="p-3 rounded-2xl ${
                                isOwnMessage 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'
                            } break-words shadow-sm">
                                ${escapeHtml(msg.content)}
                            </div>
                            ${isOwnMessage ? `
                                <div class="absolute -right-20 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onclick="editLiveMessage('${msg.id}')" class="text-xs px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400" title="Edit">
                                        <i class="fa-solid fa-edit"></i>
                                    </button>
                                    <button onclick="deleteLiveMessage('${msg.id}')" class="text-xs px-2 py-1 bg-red-300 dark:bg-red-700 rounded hover:bg-red-400 ml-1" title="Delete">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Auto scroll to bottom
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 50);
}

/**
 * Edit live message
 */
function editLiveMessage(messageId) {
    const message = liveChatState.messages.find(m => m.id === messageId);
    if (!message) return;
    
    const newContent = prompt('Edit message:', message.content);
    if (!newContent || newContent.trim() === message.content) return;
    
    message.content = newContent.trim();
    message.isEdited = true;
    
    saveChatsToStorage();
    renderMessageList();
}

/**
 * Delete live message
 */
function deleteLiveMessage(messageId) {
    if (!confirm('Hapus pesan ini?')) return;
    
    const index = liveChatState.messages.findIndex(m => m.id === messageId);
    if (index !== -1) {
        liveChatState.messages.splice(index, 1);
        
        if (liveChatState.currentChat) {
            liveChatState.currentChat.messages = liveChatState.messages;
        }
        
        saveChatsToStorage();
        renderMessageList();
    }
}

/**
 * Update chat preview
 */
function updateChatPreview(chatId) {
    const chatItem = document.getElementById(`chat-item-${chatId}`);
    if (!chatItem) return;
    
    const chat = liveChatState.chatList.find(c => c.id === chatId);
    if (!chat) return;
    
    const preview = chatItem.querySelector('.chat-preview');
    const time = chatItem.querySelector('.chat-time');
    
    if (preview) {
        preview.innerHTML = escapeHtml(chat.lastMessage || 'Tidak ada pesan');
    }
    
    if (time) {
        time.innerHTML = formatRelativeTime(chat.lastMessageAt);
    }
}

/**
 * Close live chat
 */
function closeLiveChat() {
    liveChatState.currentChat = null;
    liveChatState.messages = [];
    
    const chatWindow = document.getElementById('liveChatWindow');
    if (chatWindow) {
        chatWindow.classList.add('hidden');
    }
}

/**
 * Render chat list
 */
function renderChatList() {
    const chatList = document.getElementById('liveChatList');
    if (!chatList) return;
    
    if (liveChatState.chatList.length === 0) {
        chatList.innerHTML = `
            <div class="p-8 text-center text-gray-500">
                <i class="fa-solid fa-comments text-4xl mb-2"></i>
                <p>Belum ada percakapan</p>
                <p class="text-xs">Mulai chat dengan pembeli atau penjual</p>
            </div>
        `;
        return;
    }
    
    chatList.innerHTML = liveChatState.chatList
        .sort((a, b) => b.lastMessageAt - a.lastMessageAt)
        .map(chat => {
            const otherUser = getCurrentUser().id === chat.user1Id 
                ? { name: chat.user2Name, avatar: chat.user2Avatar } 
                : { name: chat.user1Name, avatar: chat.user1Avatar };
            
            const isActive = liveChatState.currentChat?.id === chat.id;
            
            return `
                <div id="chat-item-${chat.id}" 
                    class="p-4 border-b dark:border-gray-700 cursor-pointer transition-all ${
                        isActive ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }"
                    onclick="openLiveChat('${chat.id}')">
                    <div class="flex items-start gap-3">
                        <div class="relative flex-shrink-0">
                            <img src="${otherUser.avatar}" alt="Avatar" class="w-12 h-12 rounded-full object-cover">
                            ${chat.unreadCount > 0 ? `
                                <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    ${chat.unreadCount}
                                </span>
                            ` : ''}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-start gap-2">
                                <h4 class="font-semibold text-sm truncate">${otherUser.name}</h4>
                                <span class="chat-time text-xs text-gray-500 flex-shrink-0">${formatRelativeTime(chat.lastMessageAt)}</span>
                            </div>
                            ${chat.productName ? `
                                <p class="text-xs text-gray-500 truncate">📦 ${chat.productName}</p>
                            ` : ''}
                            <p class="chat-preview text-sm text-gray-600 dark:text-gray-400 truncate line-clamp-2">
                                ${escapeHtml(chat.lastMessage || 'Tidak ada pesan')}
                            </p>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
}

/**
 * Toggle call info
 */
function toggleCallInfo() {
    if (!liveChatState.currentChat) return;
    
    const chat = liveChatState.currentChat;
    const otherUser = getCurrentUser().id === chat.user1Id 
        ? { name: chat.user2Name, avatar: chat.user2Avatar } 
        : { name: chat.user1Name, avatar: chat.user1Avatar };
    
    alert(`
📋 INFO PERCAKAPAN

Dengan: ${otherUser.name}
Produk: ${chat.productName || 'Umum'}
Dimulai: ${new Date(chat.createdAt).toLocaleString('id-ID')}
Pesan: ${chat.messages.length}

Fitur:
✅ Edit pesan
✅ Hapus pesan
✅ Real-time messaging
✅ Notifikasi
    `);
}

/**
 * Get current user (mocked - would come from auth system)
 */
function getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        return JSON.parse(user);
    }
    
    // Default current user
    return {
        id: 'user_1',
        name: 'Pembeli',
        avatar: 'https://placehold.co/40x40/3b82f6/white?text=PB',
        role: 'buyer'
    };
}

/**
 * Get current user name
 */
function getCurrentUserName() {
    return getCurrentUser().name;
}

/**
 * Get current user avatar
 */
function getCurrentUserAvatar() {
    return getCurrentUser().avatar;
}

/**
 * Set current user (for switching between accounts)
 */
function setCurrentUser(userId, name, avatar, role) {
    const user = { id: userId, name, avatar, role };
    localStorage.setItem('currentUser', JSON.stringify(user));
    liveChatState.currentUser = user;
    
    // Refresh UI
    renderChatList();
    if (liveChatState.currentChat) {
        openLiveChat(liveChatState.currentChat.id);
    }
}

/**
 * Format relative time
 */
function formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'Baru saja';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return 'Kemarin';
    
    return new Date(timestamp).toLocaleDateString('id-ID');
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Get unread message count
 */
function getUnreadCount() {
    return liveChatState.chatList.reduce((sum, chat) => sum + chat.unreadCount, 0);
}

/**
 * Update unread badge
 */
function updateUnreadBadge() {
    const badge = document.getElementById('liveChat UnreadBadge');
    const count = getUnreadCount();
    
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

console.log('✅ Live Chat System Module Loaded');