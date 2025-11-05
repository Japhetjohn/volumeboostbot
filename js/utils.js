/**
 * Utility functions for the Nexium application
 */

/**
 * Shortens a blockchain address for display
 * @param {string} address - The full address
 * @returns {string} Shortened address (e.g., "0x1234...5678")
 */
export function shortenAddress(address) {
  if (!address) return 'Unknown';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Escapes HTML to prevent XSS attacks
 * @param {string} str - The string to escape
 * @returns {string} Escaped HTML string
 */
export function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Checks if the device is mobile
 * @returns {boolean} True if mobile device
 */
export function isMobileDevice() {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/**
 * Checks if device has touch capability
 * @returns {boolean} True if touch-enabled
 */
export function hasTouchSupport() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Debounce function to limit execution rate
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Validates if a string is a valid Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid Ethereum address
 */
export function isValidEthereumAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validates if a string is a valid Solana address
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid Solana address
 */
export function isValidSolanaAddress(address) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

/**
 * Formats a number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Waits for a specified duration
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} Promise that resolves after the wait
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
