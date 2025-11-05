# Nexium Project Structure

This document provides a complete overview of the project's file structure.

```
volumeboostbot/
│
├── index.html                      # Home page (landing/get started)
├── about.html                      # About page (platform information)
├── add-volume.html                 # Add Volume page (main functionality)
│
├── css/
│   └── styles.css                  # Complete styling (modern, responsive design)
│
├── js/
│   ├── main.js                     # Application entry point & coordinator
│   ├── config.js                   # Centralized configuration
│   ├── walletManager.js            # Wallet connection management
│   ├── transactionService.js       # Blockchain transaction handling
│   ├── uiManager.js                # UI/DOM manipulation
│   ├── utils.js                    # Utility helper functions
│   └── nav.js                      # Navigation functionality
│
├── package.json                    # Project dependencies & scripts
├── package-lock.json               # Locked dependency versions
├── vite.config.js                  # Vite build configuration
├── .gitignore                      # Git ignore rules
│
├── README.md                       # Project documentation
├── ARCHITECTURE.md                 # Architecture documentation
└── PROJECT_STRUCTURE.md            # This file
```

## File Descriptions

### HTML Pages

- **index.html**: Landing page with hero section, features, stats, and CTAs
- **about.html**: Information about Nexium, how it works, trust indicators, and supported networks
- **add-volume.html**: Main application page with wallet connection and boost functionality

### Stylesheets

- **css/styles.css**: Complete CSS with:
  - Modern design system (CSS variables, gradients)
  - Responsive layouts (mobile-first approach)
  - Animations and transitions
  - Component styles (buttons, cards, modals, etc.)
  - Utility classes

### JavaScript Modules

#### Core Modules

- **js/main.js** (277 lines)
  - Application orchestrator
  - Module initialization
  - Event coordination
  - High-level business logic

- **js/config.js** (29 lines)
  - Boost addresses (Ethereum, Solana, BNB)
  - RPC endpoints
  - Deep link URLs
  - Network configurations
  - Application constants

#### Feature Modules

- **js/walletManager.js** (290 lines)
  - MetaMask connection
  - Phantom connection
  - Trust Wallet connection
  - Mobile deep linking
  - Connection state management
  - Network switching
  - Event listener setup

- **js/transactionService.js** (190 lines)
  - MetaMask transactions (Ethereum)
  - Phantom transactions (Solana)
  - Trust Wallet transactions (BNB)
  - USD to crypto conversions
  - RPC connection management
  - Balance queries

- **js/uiManager.js** (245 lines)
  - DOM element caching
  - Modal management
  - Button state updates
  - Feedback messages
  - Processing spinners
  - Input validation
  - UI state synchronization

#### Utility Modules

- **js/utils.js** (95 lines)
  - Address formatting (shortenAddress)
  - HTML escaping (security)
  - Device detection
  - Address validation
  - Number formatting
  - Debounce function
  - Sleep utility

- **js/nav.js** (26 lines)
  - Mobile menu toggle
  - Navigation state management
  - Click-outside handling

### Configuration Files

- **package.json**: Dependencies (@solana/web3.js, ethers, buffer, vite)
- **vite.config.js**: Build configuration with multi-page support
- **.gitignore**: Excludes node_modules, dist, logs, and IDE files

### Documentation

- **README.md**: Installation, usage, configuration, and general information
- **ARCHITECTURE.md**: Detailed architecture documentation with examples
- **PROJECT_STRUCTURE.md**: This file - complete project structure overview

## Module Dependency Graph

```
main.js
  ├─→ config.js
  ├─→ uiManager.js
  │     └─→ utils.js
  ├─→ walletManager.js
  │     ├─→ config.js
  │     ├─→ utils.js
  │     └─→ ethers
  └─→ transactionService.js
        ├─→ config.js
        ├─→ @solana/web3.js
        └─→ ethers

nav.js (standalone)
```

## Lines of Code Summary

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| main.js | JS | 277 | App coordinator |
| walletManager.js | JS | 290 | Wallet logic |
| transactionService.js | JS | 190 | Transactions |
| uiManager.js | JS | 245 | UI management |
| utils.js | JS | 95 | Utilities |
| config.js | JS | 29 | Configuration |
| nav.js | JS | 26 | Navigation |
| **Total JS** | | **1,152** | |
| styles.css | CSS | 1,043 | Styling |
| index.html | HTML | 198 | Home page |
| about.html | HTML | 198 | About page |
| add-volume.html | HTML | 136 | Main app page |
| **Total** | | **2,727** | |

## Build Output

When you run `npm run build`, Vite creates the following in `dist/`:

```
dist/
├── index.html
├── about.html
├── add-volume.html
└── assets/
    ├── styles-[hash].css           # Bundled CSS (~17 KB)
    ├── nav-[hash].js                # Navigation code (~0.5 KB)
    ├── styles-[hash].js             # Style loader (~0.7 KB)
    └── addVolume-[hash].js          # Main app bundle (~556 KB)
```

The large bundle size is due to blockchain libraries (@solana/web3.js and ethers.js). This is expected for Web3 applications.

## Development Workflow

1. **Install**: `npm install`
2. **Develop**: `npm run dev` (starts Vite dev server on port 5173)
3. **Build**: `npm run build` (creates production build in dist/)
4. **Preview**: `npm run preview` (preview production build)

## Key Features by File

| Feature | Files Involved |
|---------|----------------|
| Wallet Connection | walletManager.js, uiManager.js, main.js |
| Mobile Deep Links | walletManager.js, config.js |
| Transactions | transactionService.js, walletManager.js |
| UI Updates | uiManager.js, utils.js |
| Feedback Messages | uiManager.js |
| Amount Validation | uiManager.js, main.js |
| Network Switching | walletManager.js (Trust Wallet) |
| Event Handling | main.js, walletManager.js |

## Extensibility

The modular structure makes it easy to:

- Add new wallets (update walletManager.js)
- Add new blockchains (update transactionService.js)
- Change styling (edit styles.css)
- Update addresses (edit config.js)
- Add new pages (create HTML, update nav)
- Add features (create new modules)

## Performance

- **CSS**: Minified and gzipped to ~3.6 KB
- **JS**: Code-split by page
- **Images**: SVG icons (inline, no HTTP requests)
- **Fonts**: System fonts (no external requests)
- **Build**: Vite for fast HMR and optimized builds

## Security

- Input validation (utils.js)
- HTML escaping (uiManager.js)
- No private key storage
- User-controlled transactions
- HTTPS-only deep links
