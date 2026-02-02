# 🚀 NEXUS RETAIL v3.1

**Premium E-Commerce Platform dengan Login, Real-Time Chat, dan Dynamic Pricing**

[![Version](https://img.shields.io/badge/version-3.1.0-blue.svg)](https://github.com/nexus-retail/nexus-retail)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![Status](https://img.shields.io/badge/status-Production%20Ready-success.svg)](#status)

---

## 📋 Table of Contents

- [Features](#-features)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Usage](#-usage)
- [Architecture](#-architecture)
- [API Reference](#-api-reference)
- [File Structure](#-file-structure)
- [Demo Accounts](#-demo-accounts)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🛍️ E-Commerce Core
- ✅ Product catalog dengan 8 produk high-quality
- ✅ Advanced filtering (kategori, sort, search)
- ✅ Real-time product search dengan debounce
- ✅ Shopping cart dengan persistent storage
- ✅ Add/Remove/Update quantity
- ✅ Clear cart functionality
- ✅ Total price & item counter
- ✅ Dark/Light mode theme toggle

### 🔐 Authentication System
- ✅ Email & password authentication
- ✅ Role-based access control (Buyer/Seller)
- ✅ Session persistence (localStorage)
- ✅ Auto-restore user session
- ✅ User profile menu
- ✅ Logout functionality
- ✅ Email validation (@user, @seller)
- ✅ Password requirements (min 6 chars)

### 💬 Real-Time Chat System
- ✅ One buyer - Many sellers architecture
- ✅ Per-product chat rooms
- ✅ Real-time messaging
- ✅ Independent chat sessions
- ✅ Message history persistence
- ✅ Sender role indication (Buyer/Seller)
- ✅ Timestamp tracking
- ✅ Read/Unread status
- ✅ Beautiful chat UI with animations

### ⏰ Auto-Reset Chat (5 Minutes)
- ✅ Inactivity detection
- ✅ Per-session timeout
- ✅ Automatic session clearing
- ✅ Timeout reset on new activity
- ✅ Manual delete option
- ✅ Confirmation dialogs
- ✅ Chat notifications on reset

### 💰 Dynamic Pricing System
- ✅ Real-time price changes (seller only)
- ✅ Automatic display update (no reload)
- ✅ Visual indicators (badges, countdown)
- ✅ Auto-revert after 5 minutes inactivity
- ✅ Independent price timers
- ✅ Chat notifications on change
- ✅ Price history tracking
- ✅ localStorage persistence
- ✅ Percentage change calculation
- ✅ Perfect for flash sales

### 🎨 UI/UX
- ✅ Responsive design (mobile-first)
- ✅ Glass morphism effects
- ✅ Smooth animations
- ✅ Dark mode support
- ✅ Toast notifications
- ✅ Modal dialogs
- ✅ Loading states
- ✅ Error handling
- ✅ Accessibility ready (WCAG)

---

## 🚀 Quick Start

### Minimal Setup (3 Steps)

```bash
# 1. Open in browser
# Simply open: login-app.html in your web browser

# 2. Login
# Email: john@user (Buyer) or toko@seller (Seller)
# Password: password123

# 3. Explore!
# - Browse products
# - Add to cart
# - Chat with sellers
# - Change prices (seller)
```

---

## 💻 Installation

### Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript support
- LocalStorage enabled
- No backend required! (Client-side only)

### Download

```bash
# Clone or download the project
git clone https://github.com/nexus-retail/nexus-retail.git
cd nexus-retail

# Or simply extract the zip file to your folder
```

### Setup

```bash
# Option 1: Direct Open
# Just open: login-app.html in your browser

# Option 2: Local Server (Recommended)
# Using Python:
python -m http.server 8000

# Using Node.js:
npx http-server -p 8000

# Using VS Code Live Server:
# Right-click on login-app.html → Open with Live Server

# Then visit: http://localhost:8000/login-app.html
```

---

## 📖 Usage

### For Buyers (@user)

```javascript
// 1. Login
Email: john@user
Password: password123

// 2. Browse Products
- Filter by category
- Sort by price/name/date
- Search with real-time results

// 3. Add to Cart
- Click "+" button on product
- Manage quantity in cart drawer
- View total price

// 4. Chat with Sellers
- Click chat icon on product
- Send messages
- Receive notifications
- View price changes in real-time

// 5. Logout
- Click user menu → Logout
```

### For Sellers (@seller)

```javascript
// 1. Login
Email: toko@seller
Password: password123

// 2. Manage Products
- View product catalog
- See all products available

// 3. Chat with Buyers
- Receive chat messages
- Send responses
- Edit product prices
- Track conversations

// 4. Dynamic Pricing
- Open chat for product
- Click "Edit Harga"
- Enter new price
- Watch display update in real-time
- Auto-revert after 5 minutes
- See notifications in chat

// 5. Dashboard (Optional)
- View stats
- Manage multiple shops
- Track active chats
```

---

## 🏗️ Architecture

### Technology Stack

```
Frontend:
├─ HTML5 (Semantic markup)
├─ CSS3 (Tailwind, Glass morphism)
├─ Vanilla JavaScript (ES6+)
├─ LocalStorage API
└─ CDN resources (Tailwind, Font Awesome, Google Fonts)

No Build Tools Required ✅
No Backend Required ✅
No Dependencies ✅
```

### Module Structure

```
login-app.html (Main entry point)
    ↓
js/ (JavaScript modules)
├── config.js              (Product data, constants)
├── products.js            (Product management, filtering)
├── cart.js                (Shopping cart logic)
├── ui.js                  (UI utilities, theme)
├── auth.js                (Authentication, user management)
├── chat.js                (Chat logic, messaging)
├── chat-ui.js             (Chat interface rendering)
├── login-ui.js            (Login modal, user menu)
├── price-manager.js       (Dynamic pricing system)
└── app-with-chat.js       (App initialization)

styles/ (CSS files)
├── main.css               (Main styling)
├── animations.css         (Keyframe animations)
└── scrollbar.css          (Custom scrollbar)
```

---

## 🔧 API Reference

### Authentication API

```javascript
loginUser(email, password)              // Login user
logoutUser()                            // Logout
isLoggedIn()                            // Check login status
isSeller()                              // Check if seller
isBuyer()                               // Check if buyer
getCurrentUser()                        // Get current user
updateUserProfile(userData)             // Update profile
```

### Products API

```javascript
fetchProducts()                         // Get all products
filterCategory(category)                // Filter by category
getChatMessages(productId)              // Get chat messages
```

### Cart API

```javascript
addToCart(productId)                    // Add item to cart
removeFromCart(productId)               // Remove item
updateItemQty(productId, change)        // Update quantity
clearAllCart()                          // Clear entire cart
calculateCartTotal()                    // Get total price
calculateItemCount()                    // Get total items
```

### Chat API

```javascript
sendChatMessage(productId, message, sellerId)     // Send message
getChatMessages(productId)                        // Get messages
deleteChatHistory(productId)                      // Delete chat
getActiveChatSessions()                          // Get all sessions
markMessagesAsRead(productId)                    // Mark as read
```

### Pricing API

```javascript
modifyProductPrice(productId, newPrice)          // Change price
getCurrentPrice(productId)                       // Get current price
getOriginalPrice(productId)                      // Get original price
isPriceModified(productId)                       // Check if modified
getPriceModificationInfo(productId)              // Get mod info
resetProductPrice(productId)                     // Reset price
getActivePriceModifications()                    // Get all changes
```

### UI API

```javascript
toggleTheme()                           // Toggle dark/light
toggleCart()                            // Open/close cart
showToast(message, type, duration)      // Show notification
renderLoginModal()                      // Show login
renderChatWindow(productId, sellerId)   // Show chat
```

---

## 📁 File Structure

```
nexus-retail/
├── login-app.html                    # Main application
├── index.html                        # Alternative (v2.0)
│
├── js/
│   ├── config.js                     # Product data & constants
│   ├── products.js                   # Product management
│   ├── cart.js                       # Cart system
│   ├── ui.js                         # UI utilities
│   ├── auth.js                       # Authentication
│   ├── chat.js                       # Chat logic
│   ├── chat-ui.js                    # Chat interface
│   ├── login-ui.js                   # Login & profile
│   ├── price-manager.js              # Dynamic pricing
│   └── app-with-chat.js              # App initialization
│
├── styles/
│   ├── main.css                      # Main stylesheet
│   ├── animations.css                # Animations
│   └── scrollbar.css                 # Scrollbar styles
│
├── docs/
│   ├── README.md                     # This file
│   ├── START_HERE.md                 # Getting started
│   ├── UPDATE_v3.1.md                # Latest update
│   ├── LOGIN_CHAT_GUIDE.md           # Chat & login docs
│   ├── DYNAMIC_PRICING_GUIDE.md      # Pricing docs
│   ├── CART_FEATURES.md              # Cart docs
│   └── SETUP_GUIDE.md                # Setup guide
│
├── config/
│   ├── .env.example                  # Environment variables
│   ├── .gitignore                    # Git ignore rules
│   ├── credentials.json              # Default credentials
│   └── package.json                  # Project metadata
│
└── LICENSE                           # MIT License
```

---

## 👥 Demo Accounts

### Buyer Account
```
Email:    john@user
Password: password123
Role:     👤 Pembeli (Buyer)
Features: Browse, Chat, Cart
```

### Seller Account
```
Email:    toko@seller
Password: password123
Role:     🏪 Penjual (Seller)
Features: Chat, Edit Price, Dashboard
```

### Additional Demo Accounts

```
# Buyer 2
Email:    alice@user
Password: 123456

# Seller 2
Email:    shop@seller
Password: 123456

# Feel free to create more!
# Just use @user or @seller format
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file:

```env
VITE_APP_NAME=Nexus Retail
VITE_APP_VERSION=3.1.0
VITE_API_URL=http://localhost:8000
VITE_CHAT_TIMEOUT=300000
VITE_PRICE_TIMEOUT=300000
VITE_CURRENCY=IDR
VITE_LANGUAGE=id-ID
```

### Feature Toggles

Edit `js/config.js`:

```javascript
const FEATURES = {
    ENABLE_CHAT: true,
    ENABLE_PRICING: true,
    ENABLE_DARK_MODE: true
};

const TIMEOUTS = {
    CHAT_TIMEOUT: 5 * 60 * 1000,       // 5 minutes
    PRICE_TIMEOUT: 5 * 60 * 1000       // 5 minutes
};
```

---

## 🌍 Deployment

### GitHub Pages
```bash
# Push to main branch → Auto-deploy
# Enable in repo settings
```

### Netlify
```bash
# Drag & drop or connect GitHub
# Auto-deploys on push
```

### Traditional Host
```bash
# Upload files via FTP
# Configure .htaccess for routing
```

---

## 🐛 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Chat not opening | Login first |
| Price not changing | Must be @seller |
| History disappearing | Auto-reset after 5 min (normal) |
| localStorage full | Clear old data |

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file

---

## 👨‍💻 Author

**Nexus Retail Team**
- Version: 3.1.0
- Status: Production Ready
- Created: February 2024

---

## 📞 Support & Documentation

- 📖 [START_HERE.md](START_HERE.md)
- 📖 [LOGIN_CHAT_GUIDE.md](LOGIN_CHAT_GUIDE.md)
- 📖 [DYNAMIC_PRICING_GUIDE.md](DYNAMIC_PRICING_GUIDE.md)

---

**Made with ❤️ for better e-commerce**

⭐ Star this project if you like it!
