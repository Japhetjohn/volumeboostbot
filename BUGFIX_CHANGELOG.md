# Bug Fix Changelog

## Fix: Infinite Reload Loop on Add Volume Page

**Date**: 2025-11-05
**Severity**: Critical
**Status**: ✅ Fixed

### Problem

The add-volume.html page was stuck in an infinite reload loop, continuously refreshing itself and preventing users from using the application.

### Root Cause

The issue was caused by:

1. **Duplicate Event Listeners**: The `setupEventListeners()` method was being called multiple times, adding duplicate listeners each time
2. **False Account Change Detection**: The `accountsChanged` event was firing even when no actual account change occurred (e.g., on page load)
3. **Automatic Page Reload**: The `handleAccountChange()` function was calling `window.location.reload()` unconditionally, creating an infinite loop

### Solution

#### 1. Prevent Duplicate Listeners (`walletManager.js`)

Added a flag to track if listeners are already set up:

```javascript
export class WalletManager {
  constructor() {
    this.publicKey = null;
    this.connectedWalletType = null;
    this.connecting = false;
    this.solConnection = null;
    this.listenersSetup = false; // NEW: Track listener setup
  }
}
```

#### 2. Only Trigger on Actual Account Changes (`walletManager.js`)

Modified `setupEventListeners()` to compare old and new accounts:

```javascript
setupEventListeners(onAccountChange) {
  // Prevent duplicate listeners
  if (this.listenersSetup) {
    return;
  }

  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      const newAccount = accounts[0]?.toLowerCase();
      const currentAccount = this.publicKey?.toLowerCase();

      // Only trigger callback if account actually changed
      if (newAccount !== currentAccount) {
        if (onAccountChange) onAccountChange();
      }
    });
  }

  // ... similar for Solana

  this.listenersSetup = true;
}
```

#### 3. Graceful Account Change Handling (`main.js`)

Changed `handleAccountChange()` to disconnect and reset UI instead of reloading:

```javascript
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

  // Show feedback
  this.ui.showFeedback('Wallet disconnected. Please reconnect.', 'warning');
}
```

### Files Modified

- `js/walletManager.js` (lines 11-17, 341-382)
- `js/main.js` (lines 270-297)

### Testing

✅ Page no longer refreshes infinitely
✅ Event listeners are set up only once
✅ Account changes are detected correctly
✅ UI gracefully handles account changes without page reload
✅ Build successful without errors

### Behavior After Fix

**Before**:
- Page loads → Sets up listeners → Triggers account change → Reloads → Infinite loop

**After**:
- Page loads → Sets up listeners (once)
- No account change on load → No callback triggered
- Actual account change → Disconnects wallet, resets UI, shows warning
- User can reconnect with new account

### Additional Improvements

1. Added console logging for debugging account change events
2. Added case-insensitive account comparison for Ethereum addresses
3. Chain changes still trigger page reload (expected behavior)
4. Better user feedback with warning message instead of silent reload

### Prevention

To prevent this issue in the future:

1. Always check if event listeners are already set up before adding new ones
2. Compare old vs new values before triggering callbacks
3. Avoid page reloads unless absolutely necessary
4. Use console logs to debug event firing patterns
