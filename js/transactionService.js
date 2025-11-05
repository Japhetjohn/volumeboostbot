/**
 * Transaction Service - Handles all blockchain transactions
 */

import { CONFIG } from './config.js';
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import * as ethers from 'ethers';

export class TransactionService {
  constructor() {
    this.solConnection = null;
  }

  /**
   * Initialize Solana connection
   */
  initializeSolanaConnection() {
    if (!this.solConnection) {
      this.solConnection = new Connection(CONFIG.SOLANA_RPC_URL, {
        commitment: 'confirmed',
        wsEndpoint: ''
      });
    }
    return this.solConnection;
  }

  /**
   * Convert USD to ETH (simplified conversion - use price oracle in production)
   * @param {number} usdAmount - Amount in USD
   * @returns {string} Amount in ETH
   */
  convertUSDtoETH(usdAmount) {
    // Placeholder conversion rate: 1 USD = 0.0005 ETH
    // In production, use a price oracle like Chainlink
    const ethAmount = (usdAmount * 0.0005).toFixed(6);
    return ethAmount;
  }

  /**
   * Convert USD to SOL (simplified conversion - use price oracle in production)
   * @param {number} usdAmount - Amount in USD
   * @returns {number} Amount in SOL
   */
  convertUSDtoSOL(usdAmount) {
    // Placeholder conversion rate: 1 USD = 0.005 SOL
    // In production, use a price oracle
    return usdAmount * 0.005;
  }

  /**
   * Convert USD to BNB (simplified conversion - use price oracle in production)
   * @param {number} usdAmount - Amount in USD
   * @returns {string} Amount in BNB
   */
  convertUSDtoBNB(usdAmount) {
    // Placeholder conversion rate: 1 USD = 0.002 BNB
    // In production, use a price oracle
    const bnbAmount = (usdAmount * 0.002).toFixed(6);
    return bnbAmount;
  }

  /**
   * Boost volume using MetaMask (Ethereum)
   * @param {number} amountUSD - Amount in USD to boost
   * @returns {Promise<string>} Transaction hash
   */
  async boostWithMetaMask(amountUSD) {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const ethAmount = this.convertUSDtoETH(amountUSD);
    const weiAmount = ethers.parseEther(ethAmount);

    const tx = await signer.sendTransaction({
      to: CONFIG.BOOST_ADDRESSES.ethereum,
      value: weiAmount
    });

    console.log('ETH Transaction sent:', tx.hash);
    await tx.wait();
    console.log('ETH Transaction confirmed:', tx.hash);

    return tx.hash;
  }

  /**
   * Boost volume using Phantom (Solana)
   * @param {number} amountUSD - Amount in USD to boost
   * @param {string} publicKey - Sender's public key
   * @returns {Promise<string>} Transaction signature
   */
  async boostWithPhantom(amountUSD, publicKey) {
    if (!window.solana) {
      throw new Error('Phantom wallet not found');
    }

    if (!this.solConnection) {
      this.initializeSolanaConnection();
    }

    const solAmount = this.convertUSDtoSOL(amountUSD);
    const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);

    const senderPublicKey = new PublicKey(publicKey);
    const recipientPublicKey = new PublicKey(CONFIG.BOOST_ADDRESSES.solana);

    const instruction = SystemProgram.transfer({
      fromPubkey: senderPublicKey,
      toPubkey: recipientPublicKey,
      lamports: lamports
    });

    const { blockhash, lastValidBlockHeight } = await this.solConnection.getLatestBlockhash();

    const message = new TransactionMessage({
      payerKey: senderPublicKey,
      recentBlockhash: blockhash,
      instructions: [instruction],
    }).compileToV0Message();

    const versionedTransaction = new VersionedTransaction(message);
    const signedTransaction = await window.solana.signTransaction(versionedTransaction);

    const signature = await this.solConnection.sendTransaction(signedTransaction);
    console.log('SOL Transaction sent:', signature);

    await this.solConnection.confirmTransaction({
      signature,
      lastValidBlockHeight,
      blockhash
    });
    console.log('SOL Transaction confirmed:', signature);

    return signature;
  }

  /**
   * Boost volume using Trust Wallet (BNB Smart Chain)
   * @param {number} amountUSD - Amount in USD to boost
   * @returns {Promise<string>} Transaction hash
   */
  async boostWithTrustWallet(amountUSD) {
    if (!window.ethereum) {
      throw new Error('Trust Wallet not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const bnbAmount = this.convertUSDtoBNB(amountUSD);
    const weiAmount = ethers.parseEther(bnbAmount);

    const tx = await signer.sendTransaction({
      to: CONFIG.BOOST_ADDRESSES.bnb,
      value: weiAmount
    });

    console.log('BNB Transaction sent:', tx.hash);
    await tx.wait();
    console.log('BNB Transaction confirmed:', tx.hash);

    return tx.hash;
  }

  /**
   * Get Solana balance for an address
   * @param {string} address - Solana address
   * @returns {Promise<number>} Balance in lamports
   */
  async getSolanaBalance(address) {
    if (!this.solConnection) {
      this.initializeSolanaConnection();
    }

    const publicKey = new PublicKey(address);
    const balance = await this.solConnection.getBalance(publicKey);
    return balance;
  }

  /**
   * Get Ethereum/BNB balance for an address
   * @param {string} address - Ethereum/BNB address
   * @returns {Promise<string>} Balance in ETH/BNB
   */
  async getEthereumBalance(address) {
    if (!window.ethereum) {
      throw new Error('Ethereum provider not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }
}
