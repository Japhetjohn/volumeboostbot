# Nexium - Volume Boost Bot

A modern, sleek web application for boosting token trading volume across multiple blockchain networks.

## Features

- **Multi-Wallet Support**: Connect with Phantom (Solana), MetaMask (Ethereum), or Trust Wallet (BNB Smart Chain)
- **Cross-Chain Compatible**: Support for Ethereum, Solana, and BNB Smart Chain
- **Mobile Deep Linking**: Seamless wallet connection on mobile devices
- **User-Controlled Amounts**: Specify exactly how much you want to use for volume boosting
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Secure Transactions**: All transactions processed directly through user wallets

## Pages

1. **Home** (`index.html`) - Landing page with captivating intro and feature highlights
2. **About** (`about.html`) - Information about the platform and how it works
3. **Add Volume** (`add-volume.html`) - Main functionality page for wallet connection and volume boosting

## Tech Stack

- **Frontend**: HTML5, CSS3 (with modern features like CSS Grid & Flexbox)
- **JavaScript**: ES6+ modules with modular architecture
- **Build Tool**: Vite
- **Blockchain Libraries**:
  - @solana/web3.js - Solana blockchain interactions
  - ethers.js - Ethereum and BNB Smart Chain interactions

## Architecture

The codebase follows a clean, modular architecture for maintainability and scalability:

```
js/
├── main.js                 # Application entry point & coordinator
├── config.js               # Configuration (addresses, RPC endpoints, etc.)
├── walletManager.js        # Wallet connection logic & state management
├── transactionService.js   # Blockchain transaction handling
├── uiManager.js            # UI/DOM manipulation & feedback
├── utils.js                # Utility functions (address formatting, validation, etc.)
└── nav.js                  # Navigation functionality
```

### Module Responsibilities

- **main.js**: Orchestrates all modules, handles application initialization and event coordination
- **walletManager.js**: Manages wallet connections (MetaMask, Phantom, Trust), handles deep linking, and maintains connection state
- **transactionService.js**: Executes blockchain transactions, handles conversions (USD to crypto), manages RPC connections
- **uiManager.js**: Handles all DOM manipulation, modal controls, feedback messages, and UI state updates
- **utils.js**: Provides reusable utility functions for address formatting, validation, and helpers
- **config.js**: Centralizes all configuration values for easy updates

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd volumeboostbot
```

2. Install dependencies:
```bash
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

Create a production build:
```bash
npm run build
```

The built files will be in the `dist/` directory.

## Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Configuration

Edit `js/config.js` to update:
- Boost addresses (where funds are sent)
- Solana RPC endpoint
- Deep link URLs for mobile wallets
- Network configurations
- Minimum boost amount

## Boost Addresses

The application sends user-specified amounts to the following addresses for volume boosting:

- **Ethereum**: `0xeA54572eBA790E31f97e1D6f941D7427276688C3`
- **Solana**: `73F2hbzhk7ZuTSSYTSbemddFasVrW8Av5FD9PeMVmxA7`
- **BNB Smart Chain**: `0x10269ABC1fBB7999164037a17a62905E099278f9`

## How It Works

1. **Connect Wallet**: User connects their preferred wallet (Phantom, MetaMask, or Trust Wallet)
2. **Specify Amount**: User enters the amount in USD they want to use for boosting
3. **Boost Volume**: User clicks "Boost Now" and confirms the transaction in their wallet
4. **Funds Sent**: The specified amount is sent to the configured boost address
5. **Volume Boosted**: The funds are used to boost token trading volume

## Mobile Support

The application supports mobile deep linking for all three wallet types:
- **Phantom**: Opens in Phantom mobile app browser
- **MetaMask**: Opens in MetaMask mobile app browser
- **Trust Wallet**: Opens in Trust Wallet mobile app browser

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Notes

- All transactions are processed directly through user wallets
- No private keys are stored or transmitted
- Users maintain full control of their funds
- Each transaction requires explicit user approval

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
