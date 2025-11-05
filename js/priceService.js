/**
 * Price Service - Fetches crypto prices and handles USD conversions
 */

import { CONFIG } from './config.js';

export class PriceService {
  constructor() {
    this.prices = {
      ethereum: 0,
      solana: 0,
      binancecoin: 0
    };
    this.lastFetch = 0;
    this.cacheDuration = 60000; // 1 minute cache
  }

  /**
   * Fetch current prices from CoinGecko
   * @returns {Promise<Object>} Price data
   */
  async fetchPrices() {
    const now = Date.now();

    // Return cached prices if less than 1 minute old
    if (now - this.lastFetch < this.cacheDuration && this.prices.ethereum > 0) {
      console.log('Using cached prices:', this.prices);
      return this.prices;
    }

    try {
      const url = `${CONFIG.PRICE_API}?ids=ethereum,solana,binancecoin&vs_currencies=usd`;
      console.log('Fetching prices from CoinGecko...');

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }

      const data = await response.json();

      this.prices = {
        ethereum: data.ethereum?.usd || 0,
        solana: data.solana?.usd || 0,
        binancecoin: data.binancecoin?.usd || 0
      };

      this.lastFetch = now;
      console.log('Fetched prices:', this.prices);

      return this.prices;
    } catch (error) {
      console.error('Error fetching prices:', error);

      // Fallback prices if API fails
      if (this.prices.ethereum === 0) {
        console.warn('Using fallback prices');
        this.prices = {
          ethereum: 3000,
          solana: 100,
          binancecoin: 500
        };
      }

      return this.prices;
    }
  }

  /**
   * Convert USD to ETH
   * @param {number} usdAmount - Amount in USD
   * @returns {Promise<string>} Amount in ETH as string with limited decimals
   */
  async convertUSDtoETH(usdAmount) {
    await this.fetchPrices();
    const ethAmount = usdAmount / this.prices.ethereum;
    // Limit to 18 decimals (ETH max precision)
    const ethAmountString = ethAmount.toFixed(18);
    console.log(`Converting ${usdAmount} USD to ${ethAmountString} ETH (price: $${this.prices.ethereum})`);
    return ethAmountString;
  }

  /**
   * Convert USD to SOL
   * @param {number} usdAmount - Amount in USD
   * @returns {Promise<string>} Amount in SOL as string with limited decimals
   */
  async convertUSDtoSOL(usdAmount) {
    await this.fetchPrices();
    const solAmount = usdAmount / this.prices.solana;
    // Limit to 9 decimals (SOL max precision)
    const solAmountString = solAmount.toFixed(9);
    console.log(`Converting ${usdAmount} USD to ${solAmountString} SOL (price: $${this.prices.solana})`);
    return solAmountString;
  }

  /**
   * Convert USD to BNB
   * @param {number} usdAmount - Amount in USD
   * @returns {Promise<string>} Amount in BNB as string with limited decimals
   */
  async convertUSDtoBNB(usdAmount) {
    await this.fetchPrices();
    const bnbAmount = usdAmount / this.prices.binancecoin;
    // Limit to 18 decimals (BNB max precision)
    const bnbAmountString = bnbAmount.toFixed(18);
    console.log(`Converting ${usdAmount} USD to ${bnbAmountString} BNB (price: $${this.prices.binancecoin})`);
    return bnbAmountString;
  }

  /**
   * Get price for a specific token
   * @param {string} token - Token name (ethereum, solana, binancecoin)
   * @returns {Promise<number>} Price in USD
   */
  async getPrice(token) {
    await this.fetchPrices();
    return this.prices[token] || 0;
  }
}
