/**
 * UI Manager - Handles all UI interactions and DOM manipulation
 */

import { escapeHTML, shortenAddress } from './utils.js';

export class UIManager {
  constructor() {
    this.dom = {};
    this.spinner = null;
    this.cacheDOMElements();
  }

  /**
   * Cache all DOM elements for performance
   */
  cacheDOMElements() {
    this.dom = {
      connectWallet: document.getElementById('connect-wallet'),
      walletModal: document.getElementById('wallet-modal'),
      closeModal: document.getElementById('close-modal'),
      connectMetamask: document.getElementById('connect-metamask'),
      connectPhantom: document.getElementById('connect-phantom'),
      connectTrust: document.getElementById('connect-trust'),
      boostSection: document.getElementById('boost-section'),
      amountInput: document.getElementById('amount-input'),
      networkDisplay: document.getElementById('network-display'),
      walletAddressDisplay: document.getElementById('wallet-address-display'),
      boostNowBtn: document.getElementById('boost-now-btn'),
      feedbackContainer: document.querySelector('.feedback-container')
    };
  }

  /**
   * Get a specific DOM element
   * @param {string} key - The key of the cached DOM element
   * @returns {HTMLElement|null} The DOM element or null
   */
  getElement(key) {
    return this.dom[key] || null;
  }

  /**
   * Setup modal behavior (open/close)
   * @param {Function} onOpen - Callback when modal opens
   */
  setupModal(onOpen) {
    if (this.dom.connectWallet && this.dom.walletModal && this.dom.closeModal) {
      this.dom.connectWallet.addEventListener('click', (event) => {
        event.stopPropagation();
        if (onOpen && onOpen()) {
          this.openModal();
        }
      });

      this.dom.closeModal.addEventListener('click', () => {
        this.closeModal();
      });

      document.addEventListener('click', (event) => {
        if (this.dom.walletModal.classList.contains('active') &&
            !this.dom.walletModal.querySelector('.modal-content').contains(event.target) &&
            !this.dom.connectWallet.contains(event.target)) {
          this.closeModal();
        }
      });
    }
  }

  /**
   * Open the wallet modal
   */
  openModal() {
    if (this.dom.walletModal) {
      this.dom.walletModal.classList.add('active');
    }
  }

  /**
   * Close the wallet modal
   */
  closeModal() {
    if (this.dom.walletModal) {
      this.dom.walletModal.classList.remove('active');
    }
  }

  /**
   * Update wallet button state
   * @param {string} state - 'connecting', 'connected', or 'disconnected'
   * @param {string} walletName - Name of the wallet
   * @param {string} address - Wallet address (for connected state)
   */
  updateButtonState(state, walletName, address = '') {
    const button = this.dom[`connect${walletName}`];
    if (!button) return;

    button.classList.remove('animate-pulse', 'connecting', 'connected');
    button.disabled = state === 'connecting';

    switch (state) {
      case 'connecting':
        button.textContent = 'Connecting...';
        button.classList.add('connecting');
        break;
      case 'connected':
        button.textContent = shortenAddress(address);
        button.classList.add('connected');
        break;
      default:
        button.textContent = `Connect ${walletName}`;
        button.classList.add('animate-pulse');
    }
  }

  /**
   * Show the connected UI after successful wallet connection
   * @param {string} networkName - Name of the connected network
   * @param {string} address - Wallet address
   */
  showConnectedUI(networkName, address) {
    if (this.dom.boostSection) {
      this.dom.boostSection.classList.remove('hidden');
    }

    if (this.dom.networkDisplay) {
      this.dom.networkDisplay.textContent = networkName;
    }

    if (this.dom.walletAddressDisplay) {
      this.dom.walletAddressDisplay.textContent = shortenAddress(address);
    }

    if (this.dom.connectWallet) {
      this.dom.connectWallet.textContent = shortenAddress(address);
      this.dom.connectWallet.classList.remove('animate-pulse');
      this.dom.connectWallet.classList.add('connected');
    }

    this.closeModal();
  }

  /**
   * Validate and update boost button state based on amount
   * @param {number} amount - Amount entered by user
   * @param {number} minAmount - Minimum required amount
   * @param {boolean} isWalletConnected - Whether wallet is connected
   * @returns {boolean} True if valid amount
   */
  validateBoostAmount(amount, minAmount, isWalletConnected) {
    const isValid = amount >= minAmount;

    if (this.dom.boostNowBtn) {
      this.dom.boostNowBtn.disabled = !isValid || !isWalletConnected;
    }

    return isValid;
  }

  /**
   * Get the amount from the input field
   * @returns {number} The entered amount
   */
  getAmount() {
    return parseFloat(this.dom.amountInput?.value || 0);
  }

  /**
   * Clear the amount input
   */
  clearAmount() {
    if (this.dom.amountInput) {
      this.dom.amountInput.value = '';
    }
  }

  /**
   * Show feedback message to user
   * @param {string} message - The message to display
   * @param {string} type - Type of message ('success', 'error', 'warning', 'info')
   */
  showFeedback(message, type = 'info') {
    let feedbackContainer = this.dom.feedbackContainer;
    if (!feedbackContainer) {
      feedbackContainer = document.createElement('div');
      feedbackContainer.className = 'feedback-container';
      document.body.appendChild(feedbackContainer);
      this.dom.feedbackContainer = feedbackContainer;
    }

    const feedback = document.createElement('div');
    feedback.className = `feedback feedback-${type}`;
    feedback.innerHTML = `
      <span class="feedback-message">${escapeHTML(message)}</span>
      <button class="feedback-close" aria-label="Close feedback">×</button>
    `;

    const closeBtn = feedback.querySelector('.feedback-close');
    closeBtn.addEventListener('click', () => feedback.remove());

    feedbackContainer.appendChild(feedback);

    const duration = type === 'error' ? 8000 : 4000;
    setTimeout(() => feedback.classList.add('fade-out'), duration);
    setTimeout(() => feedback.remove(), duration + 500);
  }

  /**
   * Show processing spinner overlay
   */
  showProcessingSpinner() {
    if (this.spinner) return;

    this.spinner = document.createElement('div');
    this.spinner.className = 'modal active';
    this.spinner.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
        <div class="spinner"></div>
        <span style="color: white; font-size: 1.125rem; font-weight: 600;">Processing Transaction...</span>
      </div>
    `;
    document.body.appendChild(this.spinner);
  }

  /**
   * Hide processing spinner overlay
   */
  hideProcessingSpinner() {
    if (this.spinner) {
      this.spinner.remove();
      this.spinner = null;
    }
  }

  /**
   * Handle online event
   */
  handleOnline() {
    this.showFeedback('Back online. Ready to connect.', 'success');
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    this.showFeedback('No internet connection. Please reconnect.', 'error');
  }
}
