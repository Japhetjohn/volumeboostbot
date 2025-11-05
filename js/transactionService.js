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
   * Boost volume using MetaMask (Ethereum)
   * @param {number} amount - Amount in ETH to boost
   * @returns {Promise<string>} Transaction hash
   */
  async boostWithMetaMask(amount) {
    if (!window.ethereum) {
      throw new Error('MetaMask not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Convert ETH amount to wei
    const weiAmount = ethers.parseEther(amount.toString());

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
   * @param {number} amount - Amount in SOL to boost
   * @param {string} publicKey - Sender's public key
   * @returns {Promise<string>} Transaction signature
   */
  async boostWithPhantom(amount, publicKey) {
    if (!window.solana) {
      throw new Error('Phantom wallet not found');
    }

    if (!this.solConnection) {
      this.initializeSolanaConnection();
    }

    // Convert SOL amount to lamports
    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

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
   * @param {number} amount - Amount in BNB to boost
   * @returns {Promise<string>} Transaction hash
   */
  async boostWithTrustWallet(amount) {
    if (!window.ethereum) {
      throw new Error('Trust Wallet not found');
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Convert BNB amount to wei
    const weiAmount = ethers.parseEther(amount.toString());

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
