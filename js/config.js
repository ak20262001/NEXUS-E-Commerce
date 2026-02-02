// ============================================
// NEXUS RETAIL - KONFIGURASI & DATA PRODUK
// ============================================

/**
 * Data produk dengan semua informasi lengkap
 * @type {Array<Object>}
 */
const dummyData = [
    {
        id: 1,
        name: "Nexus Phantom Sneaker",
        category: "Sepatu",
        price: 1850000,
        image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=400",
        created_at: "2024-01-01",
        description: "Sepatu sneaker berkualitas tinggi dengan desain modern",
        rating: 4.5,
        reviews: 128
    },
    {
        id: 2,
        name: "MacBook Pro M3 14-inch",
        category: "Laptop",
        price: 28500000,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400",
        created_at: "2024-02-15",
        description: "Laptop profesional dengan performa tinggi",
        rating: 5,
        reviews: 342
    },
    {
        id: 3,
        name: "Horizon Smart Watch v2",
        category: "Jam Tangan",
        price: 4200000,
        image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&q=80&w=400",
        created_at: "2023-11-20",
        description: "Jam tangan pintar dengan teknologi terkini",
        rating: 4.7,
        reviews: 256
    },
    {
        id: 4,
        name: "Nomad Leather Backpack",
        category: "Tas",
        price: 2100000,
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=400",
        created_at: "2023-12-10",
        description: "Tas punggung kulit asli berkualitas premium",
        rating: 4.6,
        reviews: 198
    },
    {
        id: 5,
        name: "iPhone 15 Pro Titanium",
        category: "Handphone",
        price: 19500000,
        image: "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=400",
        created_at: "2024-03-01",
        description: "Smartphone flagship terbaru dengan fitur unggulan",
        rating: 4.8,
        reviews: 512
    },
    {
        id: 6,
        name: "ROG Zephyrus G14",
        category: "Laptop",
        price: 24000000,
        image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=400",
        created_at: "2024-01-20",
        description: "Laptop gaming dengan spesifikasi tinggi",
        rating: 4.9,
        reviews: 289
    },
    {
        id: 7,
        name: "Classic Silver Watch",
        category: "Jam Tangan",
        price: 1200000,
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=400",
        created_at: "2023-10-05",
        description: "Jam tangan klasik dengan desain elegan",
        rating: 4.4,
        reviews: 167
    },
    {
        id: 8,
        name: "Ultra Messenger Bag",
        category: "Tas",
        price: 850000,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=400",
        created_at: "2024-02-01",
        description: "Tas messenger praktis untuk penggunaan sehari-hari",
        rating: 4.3,
        reviews: 145
    },
];

/**
 * Konstanta kategori produk
 */
const CATEGORIES = [
    { id: 'All', label: 'Semua' },
    { id: 'Tas', label: 'Tas' },
    { id: 'Sepatu', label: 'Sepatu' },
    { id: 'Jam Tangan', label: 'Jam Tangan' },
    { id: 'Laptop', label: 'Laptop' },
    { id: 'Handphone', label: 'Handphone' }
];

/**
 * Opsi pengurutan produk
 */
const SORT_OPTIONS = {
    default: 'Default (A-Z)',
    newest: 'Terbaru',
    oldest: 'Terlama',
    price_asc: 'Termurah',
    price_desc: 'Termahal'
};

/**
 * Pesan respon chatbot
 */
const CHATBOT_RESPONSES = {
    greetings: [
        "Halo! Ada yang bisa saya bantu carikan hari ini?",
        "Selamat datang! Apa yang Anda cari?",
        "Halo! Anda mencari produk apa?"
    ],
    help: "Saya bisa membantu Anda mencari produk (ketik 'Cari Laptop'), cek promo, atau info pengiriman.",
    promo: "Saat ini kami ada promo <strong>Gratis Ongkir</strong> untuk pembelian di atas 2 juta!",
    notFound: "Maaf, saya tidak mengerti. Coba ketik nama barang seperti 'Laptop', 'Tas', atau 'Jam'.",
    emptyCart: "Keranjang Anda masih kosong. Mulai belanja sekarang!",
    addedCart: "Item berhasil ditambahkan ke keranjang!"
};

/**
 * Konstanta waktu (dalam ms)
 */
const TIMINGS = {
    loadingDelay: 300,
    botResponseDelay: 1000,
    botResponseVariance: 500,
    debounceSearch: 300,
    animationDuration: 300
};

/**
 * Local Storage Keys
 */
const STORAGE_KEYS = {
    cart: 'nexusCart',
    theme: 'theme',
    favorites: 'nexusFavorites',
    userPreferences: 'nexusPreferences'
};

/**
 * App Configuration
 */
const APP_CONFIG = {
    appName: 'NEXUS RETAIL',
    version: '1.0.0',
    currency: 'IDR',
    language: 'id-ID',
    maxCartItems: 50,
    shippingThreshold: 2000000, // Free shipping di atas ini
    currency_format: {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }
};

console.log('✅ Config loaded - Nexus Retail v' + APP_CONFIG.version);