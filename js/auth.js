// ============================================
// NEXUS RETAIL - AUTHENTICATION & USER MANAGEMENT
// ============================================

/**
 * Current logged-in user
 */
let currentUser = null;

/**
 * User role enum
 */
const USER_ROLES = {
    BUYER: 'buyer',
    SELLER: 'seller',
    GUEST: 'guest'
};

/**
 * Determine user role based on email
 * @param {string} email - User email
 * @returns {string} - USER_ROLES.BUYER or USER_ROLES.SELLER
 */
function getUserRole(email) {
    if (email.includes('@seller')) {
        return USER_ROLES.SELLER;
    } else if (email.includes('@user')) {
        return USER_ROLES.BUYER;
    }
    return USER_ROLES.GUEST;
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - Password (minimal 6 chars)
 * @returns {Object|null} - User object atau null jika gagal
 */
function loginUser(email, password) {
    // Validation
    if (!email || !password) {
        showToast('Email dan password harus diisi', 'error');
        return null;
    }

    if (password.length < 6) {
        showToast('Password minimal 6 karakter', 'error');
        return null;
    }

    if (!email.includes('@')) {
        showToast('Format email tidak valid', 'error');
        return null;
    }

    const role = getUserRole(email);

    if (role === USER_ROLES.GUEST) {
        showToast('Gunakan email dengan @user (pembeli) atau @seller (penjual)', 'error');
        return null;
    }

    // Create user object
    const user = {
        id: generateUserId(),
        email: email,
        password: password, // In production, never store plaintext!
        role: role,
        name: email.split('@')[0],
        loginTime: new Date().toISOString(),
        isOnline: true,
        shops: role === USER_ROLES.SELLER ? [] : null // Sellers can have multiple shops
    };

    // Save to localStorage
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('userRole', user.role);

    showToast(`Login berhasil sebagai ${role === USER_ROLES.SELLER ? 'Penjual' : 'Pembeli'}`, 'success');
    
    return user;
}

/**
 * Logout user
 */
function logoutUser() {
    if (!currentUser) {
        showToast('Belum login', 'warning');
        return;
    }

    const role = currentUser.role;
    const email = currentUser.email;

    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userRole');

    showToast(`${email} berhasil logout`, 'success');
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
function isLoggedIn() {
    return currentUser !== null;
}

/**
 * Check if current user is seller
 * @returns {boolean}
 */
function isSeller() {
    return currentUser && currentUser.role === USER_ROLES.SELLER;
}

/**
 * Check if current user is buyer
 * @returns {boolean}
 */
function isBuyer() {
    return currentUser && currentUser.role === USER_ROLES.BUYER;
}

/**
 * Get current user
 * @returns {Object|null}
 */
function getCurrentUser() {
    return currentUser;
}

/**
 * Initialize auth (restore user from localStorage)
 */
function initializeAuth() {
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log('✅ User restored from localStorage:', currentUser.email);
            return true;
        } catch (e) {
            console.error('Error restoring user:', e);
            localStorage.removeItem('currentUser');
            return false;
        }
    }

    return false;
}

/**
 * Generate unique user ID
 * @returns {string}
 */
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Update user profile
 * @param {Object} userData - Data to update
 */
function updateUserProfile(userData) {
    if (!currentUser) {
        showToast('User tidak ditemukan', 'error');
        return;
    }

    currentUser = { ...currentUser, ...userData };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    showToast('Profil berhasil diperbarui', 'success');
}

/**
 * Add shop for seller
 * @param {string} shopName - Nama toko
 * @returns {Object} - Shop object
 */
function addSellerShop(shopName) {
    if (!isSeller()) {
        showToast('Hanya penjual yang bisa menambah toko', 'error');
        return null;
    }

    const shop = {
        id: 'shop_' + Date.now(),
        name: shopName,
        sellerId: currentUser.id,
        createdAt: new Date().toISOString(),
        rating: 0,
        reviewCount: 0
    };

    currentUser.shops.push(shop);
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    showToast(`Toko "${shopName}" berhasil dibuat`, 'success');
    return shop;
}

console.log('✅ Auth module loaded');