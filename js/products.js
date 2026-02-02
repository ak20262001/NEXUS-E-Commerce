// ============================================
// NEXUS RETAIL - MANAJEMEN PRODUK
// ============================================

/**
 * State aplikasi
 */
let appState = {
    currentCategory: 'All',
    currentSort: 'default',
    searchQuery: '',
    isLoading: false
};

/**
 * Filter produk berdasarkan kategori
 * @param {string} category - Kategori yang dipilih
 */
function filterCategory(category) {
    appState.currentCategory = category;
    const displayText = category === 'All' ? 'Semua Produk' : category;
    document.getElementById('categoryTitle').innerText = displayText;

    // Update active button
    document.querySelectorAll('.cat-btn').forEach(btn => {
        const btnText = btn.innerText.trim();
        const matchesAll = category === 'All' && btnText === 'Semua';
        const matchesOther = category !== 'All' && btnText === category;

        if (matchesAll || matchesOther) {
            btn.className = "cat-btn px-6 py-3 rounded-2xl bg-brand-600 text-white font-semibold transition-all shadow-lg shadow-brand-600/20 active";
        } else {
            btn.className = "cat-btn px-6 py-3 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border font-semibold hover:border-brand-600 transition-all";
        }
    });

    fetchProducts();
}

/**
 * Fetch dan render produk berdasarkan filter
 */
async function fetchProducts() {
    const grid = document.getElementById('productGrid');
    const searchVal = document.getElementById('searchInput').value.toLowerCase();
    const sortVal = document.getElementById('sortSelect').value;

    // Update app state
    appState.searchQuery = searchVal;
    appState.currentSort = sortVal;
    appState.isLoading = true;

    // Show loading spinner
    grid.innerHTML = `
        <div class="col-span-full flex flex-col items-center py-20 opacity-50">
            <div class="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            <p class="mt-4 text-sm">Memuat produk...</p>
        </div>
    `;

    // Simulate network delay
    await new Promise(r => setTimeout(r, TIMINGS.loadingDelay));

    // Filter berdasarkan kategori
    let filtered = dummyData.filter(product =>
        appState.currentCategory === 'All' || product.category === appState.currentCategory
    );

    // Filter berdasarkan search
    filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchVal) ||
        product.category.toLowerCase().includes(searchVal) ||
        product.description.toLowerCase().includes(searchVal)
    );

    // Sort produk
    filtered = sortProducts(filtered, sortVal);

    appState.isLoading = false;
    renderProducts(filtered);
}

/**
 * Fungsi untuk sorting produk
 * @param {Array} products - Array produk
 * @param {string} sortType - Tipe sorting
 * @returns {Array} - Produk yang sudah diurutkan
 */
function sortProducts(products, sortType) {
    const sorted = [...products];

    switch (sortType) {
        case 'newest':
            return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        case 'oldest':
            return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        case 'price_asc':
            return sorted.sort((a, b) => a.price - b.price);

        case 'price_desc':
            return sorted.sort((a, b) => b.price - a.price);

        case 'default':
        default:
            return sorted.sort((a, b) => a.name.localeCompare(b.name, 'id'));
    }
}

/**
 * Render kartu produk ke dalam grid
 * @param {Array} products - Array produk yang akan ditampilkan
 */
function renderProducts(products) {
    const grid = document.getElementById('productGrid');

    // Jika tidak ada produk
    if (products.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-20">
                <i class="fa-solid fa-box-open text-6xl text-slate-300 dark:text-slate-700 mb-4"></i>
                <p class="text-slate-400 text-lg font-medium">Barang tidak ditemukan</p>
                <p class="text-slate-400 text-sm mt-2">Coba ubah filter atau pencarian Anda</p>
            </div>
        `;
        return;
    }

    // Clear grid
    grid.innerHTML = '';

    // Render setiap produk
    products.forEach((product, index) => {
        const card = createProductCard(product, index);
        grid.appendChild(card);
    });
}

/**
 * Buat element kartu produk
 * @param {Object} product - Data produk
 * @param {number} index - Index untuk delay animasi
 * @returns {HTMLElement}
 */
function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = "product-card bg-white dark:bg-dark-card rounded-[1.5rem] overflow-hidden border border-slate-100 dark:border-dark-border hover:shadow-2xl transition-all duration-500 animate-slide-up cursor-pointer";
    card.style.animationDelay = `${index * 50}ms`;

    // Format harga
    const formattedPrice = new Intl.NumberFormat(APP_CONFIG.language, {
        style: 'currency',
        currency: APP_CONFIG.currency,
        minimumFractionDigits: 0
    }).format(product.price);

    // Format tanggal
    const formattedDate = new Date(product.created_at).toLocaleDateString(APP_CONFIG.language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Rating stars
    const stars = createStarRating(product.rating);

    card.innerHTML = `
        <div class="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img src="${product.image}" 
                 alt="${product.name}" 
                 class="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                 loading="lazy">
            <span class="absolute top-4 left-4 bg-white/90 dark:bg-dark-bg/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                ${product.category}
            </span>
            <button class="absolute top-4 right-4 w-10 h-10 bg-white dark:bg-dark-card rounded-full flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all shadow-md opacity-0 hover:opacity-100 group-hover:opacity-100" 
                    onclick="toggleFavorite(${product.id})" 
                    title="Tambah ke favorit">
                <i class="fa-regular fa-heart text-lg"></i>
            </button>
        </div>

        <div class="p-6">
            <h4 class="font-bold text-lg mb-1 truncate line-clamp-2">${product.name}</h4>

            <!-- Rating -->
            <div class="flex items-center gap-2 mb-3">
                <div class="flex gap-0.5">${stars}</div>
                <span class="text-[10px] text-slate-400 font-medium">(${product.reviews})</span>
            </div>

            <p class="text-[10px] text-slate-400 mb-4 italic line-clamp-2">${product.description}</p>

            <!-- Price & Button -->
            <div class="flex justify-between items-center">
                <div>
                    <p class="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Harga</p>
                    <p class="text-xl font-extrabold text-brand-600">${formattedPrice}</p>
                </div>
                <button onclick="addToCart(${product.id})" 
                        class="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center hover:bg-brand-600 hover:text-white transition-all shadow-md active:scale-95">
                    <i class="fa-solid fa-cart-plus text-lg"></i>
                </button>
            </div>
        </div>
    `;

    // Add click listener untuk product details (optional)
    card.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
            console.log('Product clicked:', product);
            // Bisa digunakan untuk membuka detail page
        }
    });

    return card;
}

/**
 * Buat rating stars
 * @param {number} rating - Rating value (0-5)
 * @returns {string} - HTML stars
 */
function createStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fa-solid fa-star text-yellow-400 text-xs"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fa-solid fa-star-half-stroke text-yellow-400 text-xs"></i>';
        } else {
            stars += '<i class="fa-regular fa-star text-slate-300 text-xs"></i>';
        }
    }
    return stars;
}

/**
 * Toggle favorit produk
 * @param {number} productId - ID produk
 */
function toggleFavorite(productId) {
    const favorites = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites)) || [];
    const index = favorites.indexOf(productId);

    if (index > -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push(productId);
    }

    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
    console.log('Favorit updated:', favorites);
}

/**
 * Cari produk berdasarkan query
 * @param {string} query - Query pencarian
 * @returns {Array} - Produk yang cocok
 */
function searchProducts(query) {
    const searchVal = query.toLowerCase();
    return dummyData.filter(product =>
        product.name.toLowerCase().includes(searchVal) ||
        product.category.toLowerCase().includes(searchVal) ||
        product.description.toLowerCase().includes(searchVal)
    );
}

console.log('✅ Products module loaded');