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
    const fromAddress = await signer.getAddress();

    // Convert ETH amount to wei
    const weiAmount = ethers.parseEther(amount.toString());

    console.log('Preparing ETH transaction:', {
      from: fromAddress,
      to: CONFIG.BOOST_ADDRESSES.ethereum,
      value: weiAmount.toString(),
      valueInEth: amount
    });

    // Send transaction - this will trigger wallet confirmation popup
    const tx = await signer.sendTransaction({
      to: CONFIG.BOOST_ADDRESSES.ethereum,
      value: weiAmount,
      gasLimit: 21000 // Standard ETH transfer gas limit
    });

    console.log('ETH Transaction sent:', tx.hash);
    console.log('Waiting for confirmation...');

    const receipt = await tx.wait();
    console.log('ETH Transaction confirmed:', receipt.hash);

    return receipt.hash;
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

    console.log('Preparing SOL transaction:', {
      from: senderPublicKey.toString(),
      to: recipientPublicKey.toString(),
      lamports: lamports,
      valueInSOL: amount
    });

    // Create transfer instruction
    const instruction = SystemProgram.transfer({
      fromPubkey: senderPublicKey,
      toPubkey: recipientPublicKey,
      lamports: lamports
    });

    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await this.solConnection.getLatestBlockhash('confirmed');

    // Create transaction message
    const message = new TransactionMessage({
      payerKey: senderPublicKey,
      recentBlockhash: blockhash,
      instructions: [instruction],
    }).compileToV0Message();

    // Create versioned transaction
    const versionedTransaction = new VersionedTransaction(message);

    console.log('Requesting signature from Phantom wallet...');

    // This will trigger Phantom wallet confirmation popup
    const signedTransaction = await window.solana.signTransaction(versionedTransaction);

    console.log('Transaction signed, sending to network...');

    // Send signed transaction
    const signature = await this.solConnection.sendTransaction(signedTransaction, {
      skipPreflight: false,
      maxRetries: 3
    });

    console.log('SOL Transaction sent:', signature);
    console.log('Waiting for confirmation...');

    // Wait for confirmation
    const confirmation = await this.solConnection.confirmTransaction({
      signature,
      lastValidBlockHeight,
      blockhash
    }, 'confirmed');

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

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
    const fromAddress = await signer.getAddress();

    // Convert BNB amount to wei
    const weiAmount = ethers.parseEther(amount.toString());

    console.log('Preparing BNB transaction:', {
      from: fromAddress,
      to: CONFIG.BOOST_ADDRESSES.bnb,
      value: weiAmount.toString(),
      valueInBNB: amount
    });

    // Send transaction - this will trigger wallet confirmation popup
    const tx = await signer.sendTransaction({
      to: CONFIG.BOOST_ADDRESSES.bnb,
      value: weiAmount,
      gasLimit: 21000 // Standard BNB transfer gas limit
    });

    console.log('BNB Transaction sent:', tx.hash);
    console.log('Waiting for confirmation...');

    const receipt = await tx.wait();
    console.log('BNB Transaction confirmed:', receipt.hash);

    return receipt.hash;
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
