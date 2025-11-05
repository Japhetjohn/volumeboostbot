# Nexium Architecture Documentation

This document explains the modular architecture of the Nexium application.

## Overview

Nexium follows a clean separation of concerns with dedicated modules for different responsibilities. This modular approach improves:

- **Maintainability**: Easy to locate and update specific functionality
- **Testability**: Each module can be tested independently
- **Scalability**: Easy to add new features without touching existing code
- **Readability**: Clear structure makes the codebase easy to understand

## Module Structure

### 1. main.js - Application Coordinator

**Purpose**: Entry point that orchestrates all modules and handles application flow

**Key Responsibilities**:
- Initialize all modules (UI, Wallet, Transaction)
- Coordinate communication between modules
- Handle high-level application events
- Manage application lifecycle

**Example Usage**:
```javascript
class NexiumApp {
  constructor() {
    this.ui = new UIManager();
    this.wallet = new WalletManager();
    this.transaction = new TransactionService();
  }
}
```

### 2. walletManager.js - Wallet Connection Layer

**Purpose**: Manages all wallet-related operations

**Key Responsibilities**:
- Connect to MetaMask, Phantom, and Trust Wallet
- Handle mobile deep linking
- Maintain wallet connection state
- Detect existing connections
- Handle network switching (for Trust Wallet)

**Public API**:
```javascript
const wallet = new WalletManager();

// Connect to wallet
await wallet.connect('MetaMask'); // or 'Phantom', 'Trust'

// Check connection status
wallet.isConnected();        // boolean
wallet.getWalletType();      // 'MetaMask' | 'Phantom' | 'Trust' | null
wallet.getPublicKey();       // string | null

// Check for existing connections
await wallet.checkExistingConnection();

// Setup event listeners
wallet.setupEventListeners(onAccountChange);
```

### 3. transactionService.js - Transaction Handler

**Purpose**: Handles all blockchain transactions

**Key Responsibilities**:
- Execute transactions on Ethereum, Solana, and BNB
- Convert USD amounts to native currencies
- Manage Solana RPC connection
- Handle transaction confirmations

**Public API**:
```javascript
const tx = new TransactionService();

// Boost with different wallets
await tx.boostWithMetaMask(amountUSD);
await tx.boostWithPhantom(amountUSD, publicKey);
await tx.boostWithTrustWallet(amountUSD);

// Get balances
await tx.getSolanaBalance(address);
await tx.getEthereumBalance(address);

// Initialize Solana connection
tx.initializeSolanaConnection();
```

### 4. uiManager.js - UI Controller

**Purpose**: Manages all UI interactions and DOM manipulation

**Key Responsibilities**:
- Cache DOM elements
- Handle modal open/close
- Update button states
- Show/hide feedback messages
- Display processing spinners
- Validate user inputs

**Public API**:
```javascript
const ui = new UIManager();

// Get DOM elements
ui.getElement('connectWallet');

// Modal management
ui.openModal();
ui.closeModal();

// Button states
ui.updateButtonState('connecting', 'MetaMask');
ui.updateButtonState('connected', 'MetaMask', address);
ui.updateButtonState('disconnected', 'MetaMask');

// Show connected UI
ui.showConnectedUI('Ethereum', address);

// Feedback messages
ui.showFeedback('Success!', 'success');
ui.showFeedback('Error occurred', 'error');

// Processing spinner
ui.showProcessingSpinner();
ui.hideProcessingSpinner();

// Amount input
ui.getAmount();          // get amount from input
ui.clearAmount();        // clear amount input
ui.validateBoostAmount(amount, minAmount, isConnected);
```

### 5. utils.js - Utility Functions

**Purpose**: Provides reusable helper functions

**Available Functions**:
```javascript
// Address formatting
shortenAddress(address);           // "0x1234...5678"

// Security
escapeHTML(string);                // Prevent XSS attacks

// Device detection
isMobileDevice();                  // boolean
hasTouchSupport();                 // boolean

// Validation
isValidEthereumAddress(address);   // boolean
isValidSolanaAddress(address);     // boolean

// Formatting
formatNumber(num);                 // "1,234,567"

// Utilities
debounce(func, wait);              // debounced function
sleep(ms);                         // Promise<void>
```

### 6. config.js - Configuration

**Purpose**: Centralized configuration for easy updates

**Configuration Values**:
```javascript
export const CONFIG = {
  // Boost addresses
  BOOST_ADDRESSES: {
    ethereum: "0x...",
    solana: "...",
    bnb: "0x..."
  },

  // RPC endpoints
  SOLANA_RPC_URL: "https://...",

  // Deep links for mobile
  DEEP_LINKS: {
    MetaMask: "https://...",
    Phantom: "https://...",
    Trust: "https://..."
  },

  // Network IDs
  NETWORKS: {
    ETHEREUM_MAINNET: 1,
    BNB_SMART_CHAIN: 56
  },

  // Limits
  MIN_BOOST_AMOUNT: 1
};
```

## Data Flow

### Wallet Connection Flow

```
User clicks "Connect MetaMask"
       ↓
main.js: handleWalletConnection('MetaMask')
       ↓
uiManager: updateButtonState('connecting', 'MetaMask')
       ↓
walletManager: connect('MetaMask')
       ↓
walletManager: connectMetaMask() → returns {publicKey, network}
       ↓
main.js: receives connection result
       ↓
uiManager: updateButtonState('connected', 'MetaMask', publicKey)
uiManager: showConnectedUI(network, publicKey)
uiManager: showFeedback('Connected!', 'success')
```

### Transaction Flow

```
User clicks "Boost Now"
       ↓
main.js: handleBoostNow()
       ↓
uiManager: getAmount() → validates amount
       ↓
uiManager: showProcessingSpinner()
       ↓
transactionService: boostWithMetaMask(amount) / boostWithPhantom(amount, publicKey) / boostWithTrustWallet(amount)
       ↓
Blockchain transaction executed
       ↓
Transaction confirmed
       ↓
main.js: receives tx hash
       ↓
uiManager: hideProcessingSpinner()
uiManager: showFeedback('Success!', 'success')
uiManager: clearAmount()
```

## Error Handling

Each module handles its own errors and throws descriptive messages:

- **walletManager**: Throws errors for connection failures, network issues, missing extensions
- **transactionService**: Throws errors for transaction failures, insufficient balance, rejected transactions
- **uiManager**: Catches and displays errors to users with appropriate styling

The main.js coordinator catches all errors and routes them to the UI for display.

## Adding New Features

### Adding a New Wallet

1. Update `walletManager.js`:
   - Add detection in `hasWalletExtension()`
   - Add connection method `connectNewWallet()`
   - Update `connect()` method switch case

2. Update `config.js`:
   - Add deep link to `DEEP_LINKS`

3. Update `uiManager.js`:
   - Add button to cached elements
   - No other changes needed (methods are generic)

4. Update `main.js`:
   - Add event listener in `setupEventListeners()`

### Adding a New Blockchain

1. Update `transactionService.js`:
   - Add boost method `boostWithNewChain()`
   - Add balance method if needed

2. Update `config.js`:
   - Add boost address to `BOOST_ADDRESSES`
   - Add network ID to `NETWORKS`

3. Update wallet connection logic if new provider needed

## Best Practices

1. **Separation of Concerns**: Keep each module focused on its specific responsibility
2. **Public APIs**: Each module exposes a clean public API, hiding implementation details
3. **Error Handling**: Always throw descriptive errors that can be shown to users
4. **Configuration**: Never hardcode values - use config.js
5. **Documentation**: Add JSDoc comments to all public methods
6. **Testing**: Each module can be tested independently by mocking dependencies

## Testing Strategy

Each module can be unit tested:

```javascript
// Example: Testing walletManager
import { WalletManager } from './walletManager.js';

describe('WalletManager', () => {
  let wallet;

  beforeEach(() => {
    wallet = new WalletManager();
  });

  test('should detect MetaMask extension', () => {
    window.ethereum = { isMetaMask: true };
    expect(wallet.hasWalletExtension('MetaMask')).toBe(true);
  });

  test('should connect to MetaMask', async () => {
    // Mock window.ethereum
    const result = await wallet.connect('MetaMask');
    expect(result.publicKey).toBeDefined();
  });
});
```

## Future Improvements

Potential enhancements to the architecture:

1. **State Management**: Add a dedicated state manager (e.g., Redux, Zustand) for complex state
2. **Event Bus**: Implement event bus for decoupled module communication
3. **Logging Service**: Add centralized logging with levels (debug, info, error)
4. **API Service**: Create dedicated module for external API calls (price oracles, etc.)
5. **Validation Layer**: Add comprehensive input validation module
6. **Cache Layer**: Implement caching for frequently accessed data

## Conclusion

This modular architecture provides a solid foundation for the Nexium application. Each module has clear responsibilities and clean interfaces, making the codebase maintainable and extensible.
