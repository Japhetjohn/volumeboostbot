/**
 * Nexium Application - Main Entry Point
 * Modular architecture for clean, maintainable code
 */

// === Polyfill Buffer globally (required by @solana/web3.js) ===
import { Buffer } from 'buffer';
if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}
if (typeof window !== 'undefined' && !window.Buffer) {
  window.Buffer = Buffer;
}

// === Import modules ===
import { CONFIG } from './config.js';
import { UIManager } from './uiManager.js';
import { WalletManager } from './walletManager.js';
import { TransactionService } from './transactionService.js';

/**
 * Main Application Class
 * Coordinates all modules and handles application flow
 */
class NexiumApp {
  constructor() {
    // Initialize modules
    this.ui = new UIManager();
    this.wallet = new WalletManager();
    this.transaction = new TransactionService();

    console.log('Initializing Nexium App...');
    this.initApp();
  }

  /**
   * Initialize the application
   */
  async initApp() {
    try {
      // Wait for DOM to be ready
      await this.waitForDOM();

      // Setup UI components
      this.setupUI();

      // Setup event listeners
      this.setupEventListeners();

      // Check for existing wallet connections
      await this.checkExistingConnections();

      console.log('Nexium App initialized successfully');
    } catch (error) {
      console.error('Init error:', error);
      this.ui.showFeedback(error.message, 'error');
    }
  }

  /**
   * Wait for DOM to be ready
   * @returns {Promise<void>}
   */
  waitForDOM() {
    return new Promise(resolve => {
      if (document.readyState !== 'loading') {
        resolve();
      } else {
        document.addEventListener('DOMContentLoaded', () => resolve());
      }
    });
  }

  /**
   * Setup UI components and modal
   */
  setupUI() {
    // Setup wallet modal with callback
    this.ui.setupModal(() => {
      // Only open modal if wallet is not connected
      return !this.wallet.isConnected();
    });

    // Setup network status listeners
    window.addEventListener('online', () => this.ui.handleOnline());
    window.addEventListener('offline', () => this.ui.handleOffline());
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // MetaMask connection button
    const metamaskBtn = this.ui.getElement('connectMetamask');
    if (metamaskBtn) {
      metamaskBtn.addEventListener('click', () => {
        if (!this.wallet.isConnecting()) {
          this.handleWalletConnection('MetaMask');
        }
      });
    }

    // Phantom connection button
    const phantomBtn = this.ui.getElement('connectPhantom');
    if (phantomBtn) {
      phantomBtn.addEventListener('click', () => {
        if (!this.wallet.isConnecting()) {
          this.handleWalletConnection('Phantom');
        }
      });
    }

    // Trust Wallet connection button
    const trustBtn = this.ui.getElement('connectTrust');
    if (trustBtn) {
      trustBtn.addEventListener('click', () => {
        if (!this.wallet.isConnecting()) {
          this.handleWalletConnection('Trust');
        }
      });
    }

    // Amount input validation
    const amountInput = this.ui.getElement('amountInput');
    if (amountInput) {
      amountInput.addEventListener('input', () => {
        this.validateBoostAmount();
      });
    }

    // Boost Now button
    const boostBtn = this.ui.getElement('boostNowBtn');
    if (boostBtn) {
      boostBtn.addEventListener('click', () => {
        this.handleBoostNow();
      });
    }

    // Setup wallet event listeners
    this.wallet.setupEventListeners(() => {
      this.handleAccountChange();
    });
  }

  /**
   * Handle wallet connection
   * @param {string} walletName - Name of wallet to connect
   */
  async handleWalletConnection(walletName) {
    this.ui.updateButtonState('connecting', walletName);

    try {
      const result = await this.wallet.connect(walletName);

      // Determine token symbol based on network
      let tokenSymbol = 'ETH';
      if (result.network === 'Solana') tokenSymbol = 'SOL';
      if (result.network === 'BNB Smart Chain') tokenSymbol = 'BNB';

      // Update UI with connection success
      this.ui.updateButtonState('connected', walletName, result.publicKey);
      this.ui.showConnectedUI(result.network, result.publicKey, tokenSymbol);
      this.ui.showFeedback(`${walletName} connected successfully!`, 'success');

      // Validate boost amount with new connection state
      this.validateBoostAmount();

    } catch (error) {
      console.error(`Connection error for ${walletName}:`, error);

      const errorMessage = this.wallet.getConnectionErrorMessage(error, walletName);
      this.ui.showFeedback(errorMessage, 'error');
      this.ui.updateButtonState('disconnected', walletName);
    }
  }

  /**
   * Check for existing wallet connections on page load
   */
  async checkExistingConnections() {
    try {
      const connection = await this.wallet.checkExistingConnection();

      if (connection) {
        // Determine token symbol based on network
        let tokenSymbol = 'ETH';
        if (connection.network === 'Solana') tokenSymbol = 'SOL';
        if (connection.network === 'BNB Smart Chain') tokenSymbol = 'BNB';

        this.ui.updateButtonState('connected', connection.walletType, connection.publicKey);
        this.ui.showConnectedUI(connection.network, connection.publicKey, tokenSymbol);
        this.validateBoostAmount();
      }
    } catch (error) {
      console.error('Error checking existing connections:', error);
    }
  }

  /**
   * Validate boost amount and update button state
   */
  validateBoostAmount() {
    const amount = this.ui.getAmount();
    this.ui.validateBoostAmount(
      amount,
      CONFIG.MIN_BOOST_AMOUNT,
      this.wallet.isConnected()
    );
  }

  /**
   * Handle boost now button click
   */
  async handleBoostNow() {
    const amount = this.ui.getAmount();
    const tokenAddress = this.ui.getTokenAddress();

    // Validate token address
    if (!tokenAddress) {
      this.ui.showFeedback('Please enter a token address.', 'error');
      return;
    }

    // Validate amount
    if (amount < CONFIG.MIN_BOOST_AMOUNT) {
      this.ui.showFeedback(`Minimum boost amount is ${CONFIG.MIN_BOOST_AMOUNT}`, 'error');
      return;
    }

    // Check wallet connection
    if (!this.wallet.isConnected()) {
      this.ui.showFeedback('Please connect your wallet first.', 'error');
      return;
    }

    try {
      this.ui.showProcessingSpinner();

      const walletType = this.wallet.getWalletType();
      const publicKey = this.wallet.getPublicKey();

      console.log('Boosting volume for token:', tokenAddress);
      console.log('Amount:', amount);
      console.log('Wallet type:', walletType);

      let txHash;

      // Execute transaction based on wallet type
      switch (walletType) {
        case 'MetaMask':
          txHash = await this.transaction.boostWithMetaMask(amount);
          break;
        case 'Phantom':
          txHash = await this.transaction.boostWithPhantom(amount, publicKey);
          break;
        case 'Trust':
          txHash = await this.transaction.boostWithTrustWallet(amount);
          break;
        default:
          throw new Error('Unknown wallet type');
      }

      this.ui.showFeedback('Volume boost successful!', 'success');
      console.log('Transaction successful:', txHash);
      console.log('Token address for volume boost:', tokenAddress);

      // Clear amount input
      this.ui.clearAmount();
      this.validateBoostAmount();

    } catch (error) {
      console.error('Boost error:', error);

      let errorMessage = 'Failed to boost volume. Please try again.';

      if (error.message?.includes('rejected') || error.message?.includes('denied')) {
        errorMessage = 'Transaction rejected by user.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      this.ui.showFeedback(errorMessage, 'error');

    } finally {
      this.ui.hideProcessingSpinner();
    }
  }

  /**
   * Handle wallet account change
   */
  handleAccountChange() {
    console.log('Account changed, disconnecting wallet');

    // Disconnect wallet
    this.wallet.disconnect();

    // Reset UI
    this.ui.updateButtonState('disconnected', 'MetaMask');
    this.ui.updateButtonState('disconnected', 'Phantom');
    this.ui.updateButtonState('disconnected', 'Trust');

    // Hide boost section
    const boostSection = this.ui.getElement('boostSection');
    if (boostSection) {
      boostSection.classList.add('hidden');
    }

    // Update connect wallet button
    const connectWallet = this.ui.getElement('connectWallet');
    if (connectWallet) {
      connectWallet.textContent = 'Connect Wallet';
      connectWallet.classList.remove('connected');
      connectWallet.classList.add('animate-pulse');
    }

    // Show feedback
    this.ui.showFeedback('Wallet disconnected. Please reconnect.', 'warning');
  }
}

// Initialize the application
new NexiumApp();
