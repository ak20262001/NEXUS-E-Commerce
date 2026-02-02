// ============================================
// NEXUS RETAIL - LOGIN UI & MODALS
// ============================================

/**
 * Render login modal
 */
function renderLoginModal() {
    const loginHTML = `
        <div class="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center animate-fade-in" id="login-modal-overlay">
            <div class="bg-white dark:bg-dark-card rounded-3xl shadow-2xl w-full max-w-md p-8" onclick="event.stopPropagation()">
                <!-- Header -->
                <div class="text-center mb-8">
                    <div class="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <i class="fa-solid fa-lock text-white text-xl"></i>
                    </div>
                    <h2 class="text-3xl font-bold">Login</h2>
                    <p class="text-slate-500 dark:text-slate-400 mt-2">Masuk ke akun Anda</p>
                </div>

                <!-- Form -->
                <form onsubmit="handleLogin(event)" class="space-y-4">
                    <!-- Email Input -->
                    <div>
                        <label class="block text-sm font-semibold mb-2">Email</label>
                        <input type="email" id="login-email" placeholder="nama@user atau nama@seller"
                            class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-dark-border dark:bg-slate-800 focus:ring-2 focus:ring-brand-600 outline-none transition">
                        <p class="text-xs text-slate-500 mt-2">
                            💡 Gunakan <strong>@user</strong> untuk pembeli atau <strong>@seller</strong> untuk penjual
                        </p>
                    </div>

                    <!-- Password Input -->
                    <div>
                        <label class="block text-sm font-semibold mb-2">Password</label>
                        <input type="password" id="login-password" placeholder="Minimal 6 karakter"
                            class="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-dark-border dark:bg-slate-800 focus:ring-2 focus:ring-brand-600 outline-none transition">
                    </div>

                    <!-- Login Button -->
                    <button type="submit" class="w-full py-3 rounded-2xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition mt-6">
                        Login
                    </button>
                </form>

                <!-- Info -->
                <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-sm text-blue-600 dark:text-blue-400">
                    <p class="font-semibold mb-2">📝 Demo Login:</p>
                    <ul class="space-y-1 text-xs">
                        <li>✅ Pembeli: <strong>john@user</strong> / password123</li>
                        <li>✅ Penjual: <strong>toko@seller</strong> / password123</li>
                    </ul>
                </div>

                <!-- Close Button -->
                <button onclick="closeLoginModal()" class="mt-6 w-full py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition">
                    Tutup
                </button>
            </div>
        </div>
    `;

    let container = document.getElementById('login-modal-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'login-modal-container';
        document.body.appendChild(container);
    }

    container.innerHTML = loginHTML;
    container.style.display = 'flex';
}

/**
 * Close login modal
 */
function closeLoginModal() {
    const container = document.getElementById('login-modal-container');
    if (container) {
        container.style.display = 'none';
    }
}

/**
 * Handle login form submit
 * @param {Event} event - Form submit event
 */
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const user = loginUser(email, password);

    if (user) {
        closeLoginModal();
        updateAuthUI();
        
        // Refresh product grid to show chat buttons
        setTimeout(() => {
            fetchProducts();
        }, 500);
    }
}

/**
 * Update UI based on auth state
 */
function updateAuthUI() {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;

    if (!isLoggedIn()) {
        authContainer.innerHTML = `
            <button onclick="renderLoginModal()" class="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 transition">
                <i class="fa-solid fa-sign-in-alt mr-2"></i>Login
            </button>
        `;
    } else {
        const user = getCurrentUser();
        const roleIcon = isSeller() ? '🏪' : '👤';
        
        authContainer.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="hidden sm:block text-right">
                    <p class="text-sm font-semibold">${user.name}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">${roleIcon} ${isSeller() ? 'Penjual' : 'Pembeli'}</p>
                </div>
                <div class="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold">
                    ${user.name.charAt(0).toUpperCase()}
                </div>
                <button onclick="showUserMenu()" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                    <i class="fa-solid fa-chevron-down"></i>
                </button>
            </div>
        `;
    }
}

/**
 * Show user menu dropdown
 */
function showUserMenu() {
    const user = getCurrentUser();
    if (!user) return;

    const menuHTML = `
        <div class="fixed inset-0 z-[90]" onclick="closeUserMenu()" id="user-menu-overlay"></div>
        <div class="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-dark-card rounded-2xl shadow-2xl p-4 z-[95] animate-slide-up" id="user-menu">
            <!-- User Info -->
            <div class="pb-4 border-b dark:border-dark-border">
                <p class="font-semibold">${user.name}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">${user.email}</p>
                <p class="text-xs text-brand-600 mt-2">
                    ${isSeller() ? '🏪 Penjual' : '👤 Pembeli'}
                </p>
            </div>

            <!-- Menu Items -->
            <div class="py-2 space-y-2">
                <button onclick="showProfile()" class="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-sm">
                    <i class="fa-solid fa-user mr-2"></i>Profil
                </button>
                
                ${isSeller() ? `
                    <button onclick="showSellerDashboard()" class="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-sm">
                        <i class="fa-solid fa-chart-bar mr-2"></i>Dashboard
                    </button>
                ` : ''}

                <button onclick="showChatHistory()" class="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-sm">
                    <i class="fa-solid fa-comments mr-2"></i>Riwayat Chat
                </button>

                <button onclick="showSettings()" class="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-sm">
                    <i class="fa-solid fa-cog mr-2"></i>Pengaturan
                </button>
            </div>

            <!-- Logout Button -->
            <div class="pt-2 border-t dark:border-dark-border">
                <button onclick="handleLogout()" class="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition text-sm font-semibold">
                    <i class="fa-solid fa-sign-out-alt mr-2"></i>Logout
                </button>
            </div>
        </div>
    `;

    let container = document.getElementById('user-menu-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'user-menu-container';
        container.className = 'relative';
        const authContainer = document.getElementById('auth-container');
        authContainer.parentElement.insertBefore(container, authContainer.nextSibling);
    }

    container.innerHTML = menuHTML;
}

/**
 * Close user menu
 */
function closeUserMenu() {
    const container = document.getElementById('user-menu-container');
    if (container) {
        container.innerHTML = '';
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    logoutUser();
    closeUserMenu();
    updateAuthUI();
    fetchProducts();
    showToast('Anda telah logout', 'success');
}

/**
 * Show user profile modal
 */
function showProfile() {
    const user = getCurrentUser();
    if (!user) return;

    alert(`
👤 PROFIL PENGGUNA

Nama: ${user.name}
Email: ${user.email}
Role: ${isSeller() ? '🏪 Penjual' : '👤 Pembeli'}
ID: ${user.id}
Login Sejak: ${new Date(user.loginTime).toLocaleString('id-ID')}
    `);

    closeUserMenu();
}

/**
 * Show chat history
 */
function showChatHistory() {
    const sessions = getActiveChatSessions();
    
    if (sessions.length === 0) {
        showToast('Belum ada riwayat chat', 'info');
        return;
    }

    let historyText = '💬 RIWAYAT CHAT\n\n';
    sessions.forEach(session => {
        const product = dummyData.find(p => p.id === session.productId);
        historyText += `📦 ${product.name}\n`;
        historyText += `   Pesan: ${session.messages.length}\n`;
        historyText += `   Dibuat: ${new Date(session.createdAt).toLocaleString('id-ID')}\n\n`;
    });

    alert(historyText);
    closeUserMenu();
}

/**
 * Show settings
 */
function showSettings() {
    alert('⚙️ PENGATURAN\n\nFitur pengaturan akan segera tersedia.');
    closeUserMenu();
}

/**
 * Show seller dashboard
 */
function showSellerDashboard() {
    const user = getCurrentUser();
    if (!isSeller()) {
        showToast('Hanya penjual yang bisa akses dashboard', 'error');
        return;
    }

    const sessions = getActiveChatSessions().filter(s => s.sellerId === user.id);
    let dashboardText = '📊 DASHBOARD PENJUAL\n\n';
    dashboardText += `Total Chat Aktif: ${sessions.length}\n`;
    dashboardText += `Total Pesan: ${sessions.reduce((sum, s) => sum + s.messages.length, 0)}\n\n`;

    alert(dashboardText);
    closeUserMenu();
}

console.log('✅ Login UI module loaded');