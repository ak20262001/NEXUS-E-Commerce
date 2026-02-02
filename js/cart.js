// ============================================
// NEXUS RETAIL - MANAJEMEN KERANJANG BELANJA
// ============================================

/**
 * State keranjang belanja
 */
let cart = [];

/**
 * Initialize cart dari localStorage
 */
function initializeCart() {
    cart = JSON.parse(localStorage.getItem('nexusCart')) || [];
    updateCartUI();
}

/**
 * Tambah produk ke keranjang
 * @param {number} productId - ID produk
 */
function addToCart(productId) {
        if (typeof isLoggedIn === 'function' && !isLoggedIn()) {
        showToast('Silakan login dulu untuk belanja! 🛒', 'info');
        renderLoginModal(); 
        return; 
    }
    const product = dummyData.find(p => p.id === productId);

    if (!product) {
        showToast('Produk tidak ditemukan', 'error');
        return;
    }

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.qty++;
        showToast(`${product.name} ditambah (Qty: ${existingItem.qty})`, 'success');
    } else {
        cart.push({ ...product, qty: 1 });
        showToast(`${product.name} ditambahkan ke keranjang`, 'success');
    }

    saveCart();
    updateCartUI();
}

/**
 * Update jumlah item di keranjang
 * @param {number} productId - ID produk
 * @param {number} change - Perubahan jumlah (+ atau -)
 */
function updateItemQty(productId, change) {
    const item = cart.find(item => item.id === productId);

    if (!item) {
        showToast('Item tidak ditemukan', 'error');
        return;
    }

    item.qty += change;

    if (item.qty <= 0) {
        removeFromCart(productId);
        return;
    }

    if (item.qty > 100) {
        item.qty = 100;
        showToast('Jumlah maksimal: 100', 'warning');
    }

    saveCart();
    updateCartUI();
}

/**
 * Hapus satu produk dari keranjang
 * @param {number} productId - ID produk
 */
function removeFromCart(productId) {
    const item = cart.find(i => i.id === productId);
    const itemName = item?.name || 'Item';
    
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
    showToast(`${itemName} dihapus dari keranjang`, 'info');
}

/**
 * Kosongkan semua item di keranjang
 */
function clearAllCart() {
    if (cart.length === 0) {
        showToast('Keranjang sudah kosong', 'warning');
        return;
    }

    if (confirm('Yakin ingin mengosongkan keranjang?')) {
        cart = [];
        saveCart();
        updateCartUI();
        showToast('Keranjang berhasil dikosongkan', 'success');
    }
}

/**
 * Simpan keranjang ke localStorage
 */
function saveCart() {
    localStorage.setItem('nexusCart', JSON.stringify(cart));
}

/**
 * Hitung total harga
 * @returns {number} - Total harga
 */
function calculateCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.qty), 0);
}

/**
 * Hitung total jumlah item
 * @returns {number} - Total item
 */
function calculateItemCount() {
    return cart.reduce((count, item) => count + item.qty, 0);
}

/**
 * Update UI keranjang
 */
function updateCartUI() {
    updateCartBadge();
    updateCartDrawer();
}

/**
 * Update badge di navbar
 */
function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const count = calculateItemCount();

    badge.innerText = count;

    if (count > 0) {
        badge.classList.remove('scale-0');
        badge.classList.add('scale-100');
    } else {
        badge.classList.add('scale-0');
        badge.classList.remove('scale-100');
    }
}

/**
 * Update tampilan cart drawer
 */
function updateCartDrawer() {
    const container = document.getElementById('cartItems');
    const totalPriceEl = document.getElementById('cartTotalPrice');
    const totalItemCountEl = document.getElementById('totalItemCount');
    const total = calculateCartTotal();
    const itemCount = calculateItemCount();

    // Kosongkan container
    container.innerHTML = '';

    // Jika keranjang kosong
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fa-solid fa-bag-shopping text-4xl text-slate-300 dark:text-slate-700 mb-4"></i>
                <p class="text-slate-500 font-medium">Keranjang Anda masih kosong</p>
                <p class="text-slate-400 text-sm mt-2">Tambahkan produk untuk memulai belanja</p>
            </div>
        `;
        totalPriceEl.innerText = `IDR 0`;
        totalItemCountEl.innerText = '0';
        return;
    }

    // Render setiap item
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        const itemEl = document.createElement('div');
        itemEl.className = "flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-dark-border group animate-slide-up";
        itemEl.style.animationDelay = `${index * 50}ms`;

        itemEl.innerHTML = `
            <!-- Item Image -->
            <img src="${item.image}" 
                 alt="${item.name}" 
                 class="w-16 h-16 rounded-xl object-cover shadow-sm">

            <!-- Item Info -->
            <div class="flex-1 min-w-0">
                <p class="text-sm font-bold truncate">${item.name}</p>
                <p class="text-xs text-brand-600 font-bold mb-2">IDR ${item.price.toLocaleString('id-ID')}</p>

                <!-- Quantity Controls -->
                <div class="flex items-center gap-2">
                    <button onclick="updateItemQty(${item.id}, -1)" 
                            class="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition text-xs font-bold active:scale-95">
                        <i class="fa-solid fa-minus text-[10px]"></i>
                    </button>
                    <span class="text-xs font-bold w-6 text-center">${item.qty}</span>
                    <button onclick="updateItemQty(${item.id}, 1)" 
                            class="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition text-xs font-bold active:scale-95">
                        <i class="fa-solid fa-plus text-[10px]"></i>
                    </button>
                </div>
            </div>

            <!-- Delete Button -->
            <div class="flex flex-col items-center gap-2">
                <p class="text-xs font-semibold text-slate-600 dark:text-slate-300">IDR ${itemTotal.toLocaleString('id-ID')}</p>
                <button onclick="removeFromCart(${item.id})" 
                        class="text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        title="Hapus item">
                    <i class="fa-solid fa-trash-alt text-sm"></i>
                </button>
            </div>
        `;

        container.appendChild(itemEl);
    });

    // Update total price dan item count
    totalPriceEl.innerText = `IDR ${total.toLocaleString('id-ID')}`;
    totalItemCountEl.innerText = itemCount;

    // Tampilkan info diskon jika ada (contoh: free shipping)
    if (total >= 2000000) {
        const discountEl = document.createElement('div');
        discountEl.className = "text-center p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-xs font-semibold text-green-600 dark:text-green-400";
        discountEl.innerHTML = '<i class="fa-solid fa-truck"></i> Gratis Ongkir!';
        container.insertBefore(discountEl, container.firstChild);
    }
}

/**
 * Lanjutkan ke checkout
 */
function proceedCheckout() {
    const total = calculateCartTotal();
    const itemCount = calculateItemCount();

    if (cart.length === 0) {
        showToast('Keranjang masih kosong', 'warning');
        return;
    }

    const message = `✓ Siap untuk checkout?\n\nTotal Item: ${itemCount}\nTotal Harga: IDR ${total.toLocaleString('id-ID')}\n\nSilakan lanjutkan ke halaman pembayaran.`;
    alert(message);
    
    // TODO: Redirect ke halaman checkout atau payment gateway
    console.log('Proceeding to checkout...', { cart, total, itemCount });
}

console.log('✅ Cart module loaded');
