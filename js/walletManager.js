/**
 * Wallet Manager - Handles wallet connections and state
 */

import { CONFIG } from './config.js';
import { isMobileDevice } from './utils.js';
import * as ethers from 'ethers';
import { Connection } from '@solana/web3.js';

export class WalletManager {
  constructor() {
    this.publicKey = null;
    this.connectedWalletType = null;
    this.connecting = false;
    this.solConnection = null;
    this.listenersSetup = false; // Track if listeners are already set up
  }

  /**
   * Get connection state
   * @returns {boolean} True if currently connecting
   */
  isConnecting() {
    return this.connecting;
  }

  /**
   * Get wallet connection status
   * @returns {boolean} True if wallet is connected
   */
  isConnected() {
    return !!this.publicKey && !!this.connectedWalletType;
  }

  /**
   * Get connected wallet type
   * @returns {string|null} Wallet type or null
   */
  getWalletType() {
    return this.connectedWalletType;
  }

  /**
   * Get public key
   * @returns {string|null} Public key or null
   */
  getPublicKey() {
    return this.publicKey;
  }

  /**
   * Check if wallet extensions are available
   * @param {string} walletName - Name of wallet to check
   * @returns {boolean} True if extension is available
   */
  hasWalletExtension(walletName) {
    const hasEthereum = !!window.ethereum;
    const hasSolana = !!window.solana;
    const hasTrust = hasEthereum && (window.ethereum.isTrustWallet || /Trust/i.test(navigator.userAgent));

    switch (walletName) {
      case 'MetaMask':
        return hasEthereum && window.ethereum.isMetaMask;
      case 'Phantom':
        return hasSolana && window.solana.isPhantom;
      case 'Trust':
        return hasTrust;
      default:
        return false;
    }
  }

  /**
   * Connect to MetaMask wallet
   * @returns {Promise<{publicKey: string, network: string}>} Connection result
   */
  async connectMetaMask() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length === 0) {
      throw new Error('MetaMask failed to provide accounts. Please unlock it.');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();

    if (network.chainId !== 1n) {
      throw new Error('Please switch MetaMask to Ethereum Mainnet.');
    }

    this.publicKey = accounts[0];
    this.connectedWalletType = 'MetaMask';

    return {
      publicKey: this.publicKey,
      network: 'Ethereum'
    };
  }

  /**
   * Connect to Phantom wallet
   * @returns {Promise<{publicKey: string, network: string}>} Connection result
   */
  async connectPhantom() {
    const response = await window.solana.connect();
    this.publicKey = response.publicKey.toString();
    this.connectedWalletType = 'Phantom';
    this.solConnection = new Connection(CONFIG.SOLANA_RPC_URL, {
      commitment: 'confirmed',
      wsEndpoint: ''
    });

    return {
      publicKey: this.publicKey,
      network: 'Solana'
    };
  }

  /**
   * Connect to Trust Wallet
   * @returns {Promise<{publicKey: string, network: string}>} Connection result
   */
  async connectTrustWallet() {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (accounts.length === 0) {
      throw new Error('Trust Wallet failed to provide accounts. Please unlock it.');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    let network = await provider.getNetwork();

    // Switch to BNB Smart Chain if not already on it
    if (network.chainId !== 56n) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x38' }],
        });
        network = await provider.getNetwork();
      } catch (switchError) {
        if (switchError.code === 4902) {
          // Chain not added, add it
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x38',
              chainName: 'BNB Smart Chain',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18,
              },
              rpcUrls: ['https://bsc-dataseed.binance.org/'],
              blockExplorerUrls: ['https://bscscan.com'],
            }],
          });
          network = await provider.getNetwork();
        } else {
          throw new Error(`Failed to switch to BNB Smart Chain: ${switchError.message}`);
        }
      }

      if (network.chainId !== 56n) {
        throw new Error('Please switch Trust Wallet to BNB Smart Chain.');
      }
    }

    this.publicKey = accounts[0];
    this.connectedWalletType = 'Trust';

    return {
      publicKey: this.publicKey,
      network: 'BNB Smart Chain'
    };
  }

  /**
   * Connect to wallet (handles both desktop and mobile)
   * @param {string} walletName - Name of wallet to connect
   * @param {Function} onProgress - Callback for connection progress
   * @returns {Promise<{publicKey: string, network: string}>} Connection result
   */
  async connect(walletName, onProgress = null) {
    if (this.connecting) {
      throw new Error('Connection already in progress');
    }

    if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network.');
    }

    this.connecting = true;

    try {
      const isMobile = isMobileDevice();
      const hasExtension = this.hasWalletExtension(walletName);

      // Desktop or extension detected
      if (!isMobile || hasExtension) {
        if (!hasExtension) {
          throw new Error(`${walletName} extension not detected. Please install it.`);
        }

        let result;
        switch (walletName) {
          case 'MetaMask':
            result = await this.connectMetaMask();
            break;
          case 'Phantom':
            result = await this.connectPhantom();
            break;
          case 'Trust':
            result = await this.connectTrustWallet();
            break;
          default:
            throw new Error(`Unknown wallet: ${walletName}`);
        }

        this.connecting = false;
        return result;
      }

      // Mobile deep linking
      const deeplink = CONFIG.DEEP_LINKS[walletName];
      if (!deeplink) {
        throw new Error(`No deeplink configured for ${walletName}`);
      }

      console.log(`Opening ${walletName} with deeplink...`);

      // Open deeplink
      window.location.href = deeplink;

      // Poll for connection after deeplink
      return new Promise((resolve, reject) => {
        const checkConnection = setInterval(async () => {
          if (walletName === 'MetaMask' && window.ethereum?.isMetaMask) {
            clearInterval(checkConnection);
            try {
              const result = await this.connectMetaMask();
              this.connecting = false;
              resolve(result);
            } catch (error) {
              this.connecting = false;
              reject(error);
            }
          } else if (walletName === 'Phantom' && window.solana?.isPhantom) {
            clearInterval(checkConnection);
            try {
              const result = await this.connectPhantom();
              this.connecting = false;
              resolve(result);
            } catch (error) {
              this.connecting = false;
              reject(error);
            }
          } else if (walletName === 'Trust' && window.ethereum && (window.ethereum.isTrustWallet || /Trust/i.test(navigator.userAgent))) {
            clearInterval(checkConnection);
            try {
              const result = await this.connectTrustWallet();
              this.connecting = false;
              resolve(result);
            } catch (error) {
              this.connecting = false;
              reject(error);
            }
          }
        }, 1000);

        // Timeout after 30 seconds
        setTimeout(() => {
          if (this.connecting) {
            clearInterval(checkConnection);
            this.connecting = false;
            reject(new Error('Connection timed out. Please open the site in your wallet browser.'));
          }
        }, 30000);
      });

    } catch (error) {
      this.connecting = false;
      throw error;
    }
  }

  /**
   * Check for existing wallet connections on page load
   * @returns {Promise<{publicKey: string, network: string}|null>} Connection info or null
   */
  async checkExistingConnection() {
    // Check Phantom
    if (window.solana?.isPhantom && window.solana.isConnected) {
      try {
        const response = await window.solana.connect({ onlyIfTrusted: true });
        this.publicKey = response.publicKey.toString();
        this.connectedWalletType = 'Phantom';
        this.solConnection = new Connection(CONFIG.SOLANA_RPC_URL, {
          commitment: 'confirmed',
          wsEndpoint: ''
        });
        return {
          publicKey: this.publicKey,
          network: 'Solana',
          walletType: 'Phantom'
        };
      } catch (error) {
        // User hasn't approved connection yet
      }
    }

    // Check MetaMask/Trust Wallet
    if (window.ethereum?.selectedAddress) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      this.publicKey = window.ethereum.selectedAddress;

      if (window.ethereum.isMetaMask && network.chainId === 1n) {
        this.connectedWalletType = 'MetaMask';
        return {
          publicKey: this.publicKey,
          network: 'Ethereum',
          walletType: 'MetaMask'
        };
      } else if ((window.ethereum.isTrustWallet || /Trust/i.test(navigator.userAgent)) && network.chainId === 56n) {
        this.connectedWalletType = 'Trust';
        return {
          publicKey: this.publicKey,
          network: 'BNB Smart Chain',
          walletType: 'Trust'
        };
      }
    }

    return null;
  }

  /**
   * Setup wallet event listeners
   * @param {Function} onAccountChange - Callback when account changes
   */
  setupEventListeners(onAccountChange) {
    // Prevent duplicate listeners
    if (this.listenersSetup) {
      return;
    }

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        console.log('Ethereum accounts changed:', accounts);
        const newAccount = accounts[0]?.toLowerCase();
        const currentAccount = this.publicKey?.toLowerCase();

        // Only trigger callback if account actually changed
        if (newAccount !== currentAccount) {
          console.log('Account change detected, triggering callback');
          if (onAccountChange) onAccountChange();
        }
      });

      window.ethereum.on('chainChanged', (chainId) => {
        console.log('Chain changed:', chainId);
        // Reload on chain change
        window.location.reload();
      });
    }

    if (window.solana) {
      window.solana.on('accountChanged', (publicKey) => {
        console.log('Solana account changed:', publicKey?.toString());
        const newAccount = publicKey?.toString();
        const currentAccount = this.publicKey;

        // Only trigger callback if account actually changed
        if (newAccount !== currentAccount) {
          console.log('Account change detected, triggering callback');
          if (onAccountChange) onAccountChange();
        }
      });
    }

    this.listenersSetup = true;
  }

  /**
   * Disconnect wallet
   */
  disconnect() {
    this.publicKey = null;
    this.connectedWalletType = null;
    this.solConnection = null;
  }

  /**
   * Get connection error message
   * @param {Error} error - The error object
   * @param {string} walletName - Name of the wallet
   * @returns {string} User-friendly error message
   */
  getConnectionErrorMessage(error, walletName) {
    let message = error.message || `Failed to connect ${walletName}`;

    if (error.message?.includes('rejected')) {
      message = `Connection to ${walletName} was declined.`;
    } else if (error.message?.includes('locked')) {
      message = `${walletName} is locked. Please unlock it.`;
    } else if (error.message?.includes('not detected')) {
      message = `Please install the ${walletName} extension.`;
    } else if (error.message?.includes('timed out')) {
      message = 'Connection timed out. Please try again.';
    }

    return message;
  }
}
