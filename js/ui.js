// ============================================
// NEXUS RETAIL - UI & UTILITY FUNCTIONS
// ============================================

/**
 * Toggle tema dark/light
 */
function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    const themeIcon = document.getElementById('themeIcon');

    if (isDark) {
        themeIcon.className = 'fa-solid fa-sun text-yellow-400 text-lg';
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.className = 'fa-solid fa-moon text-lg';
        localStorage.setItem('theme', 'light');
    }
}

/**
 * Inisialisasi tema saat page load
 */
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('themeIcon');

    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        themeIcon.className = 'fa-solid fa-sun text-yellow-400 text-lg';
    } else {
        document.documentElement.classList.remove('dark');
        themeIcon.className = 'fa-solid fa-moon text-lg';
    }
}

/**
 * Toggle cart drawer
 */
function toggleCart() {
    const cartContent = document.getElementById('cartContent');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartDrawer = document.getElementById('cartDrawer');

    const isOpen = cartContent.classList.contains('translate-x-full');

    cartContent.classList.toggle('translate-x-full');
    cartOverlay.classList.toggle('opacity-0');

    if (isOpen) {
        cartDrawer.classList.remove('pointer-events-none');
    } else {
        setTimeout(() => {
            cartDrawer.classList.add('pointer-events-none');
        }, 500);
    }
}

/**
 * Buat notifikasi toast
 * @param {string} message - Pesan notifikasi
 * @param {string} type - Tipe notifikasi (success, error, warning, info)
 * @param {number} duration - Durasi tampilan (ms)
 */
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toastContainer');
    
    const colors = {
        success: {
            bg: 'bg-green-500',
            icon: 'fa-check-circle'
        },
        error: {
            bg: 'bg-red-500',
            icon: 'fa-exclamation-circle'
        },
        warning: {
            bg: 'bg-yellow-500',
            icon: 'fa-exclamation-triangle'
        },
        info: {
            bg: 'bg-brand-600',
            icon: 'fa-info-circle'
        }
    };

    const colorStyle = colors[type] || colors.info;

    const toast = document.createElement('div');
    toast.className = `${colorStyle.bg} text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3 toast-notification`;
    toast.innerHTML = `
        <i class="fa-solid ${colorStyle.icon}"></i>
        <span class="text-sm font-medium">${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(400px)';
        toast.style.transition = 'all 0.3s ease-out';
        
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Debounce function untuk mengurangi frequency function calls
 * @param {Function} func - Function yang akan di-debounce
 * @param {number} wait - Waktu delay (ms)
 * @returns {Function}
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Setup event listeners untuk search
 */
function setupSearchListener() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            fetchProducts();
        }, 300));
    }
}

/**
 * Setup close drawer on escape key
 */
function setupEscapeKeyListener() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const cartContent = document.getElementById('cartContent');

            // Close cart drawer jika open
            if (!cartContent.classList.contains('translate-x-full')) {
                toggleCart();
            }
        }
    });
}

console.log('✅ UI module loaded');