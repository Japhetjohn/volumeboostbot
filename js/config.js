// Configuration file for Nexium
export const CONFIG = {
  // Boost addresses - funds sent here will be used to boost volume
  BOOST_ADDRESSES: {
    ethereum: "0xeA54572eBA790E31f97e1D6f941D7427276688C3",
    solana: "73F2hbzhk7ZuTSSYTSbemddFasVrW8Av5FD9PeMVmxA7",
    bnb: "0x10269ABC1fBB7999164037a17a62905E099278f9"
  },

  // Solana RPC endpoint
  SOLANA_RPC_URL: "https://proportionate-skilled-shard.solana-mainnet.quiknode.pro/e13cbae8b642209c482805a4e443fd1f27a4f42a",

  // Deep links for mobile wallets
  DEEP_LINKS: {
    MetaMask: 'https://metamask.app.link/dapp/nexium-bot.onrender.com/add-volume.html',
    Phantom: 'https://phantom.app/ul/browse/https%3A%2F%2Fnexium-bot.onrender.com%2Fadd-volume.html?ref=https%3A%2F%2Fnexium-bot.onrender.com',
    Trust: 'https://link.trustwallet.com/open_url?coin_id=20000714&url=https://nexium-bot.onrender.com/add-volume.html'
  },

  // Network configurations
  NETWORKS: {
    ETHEREUM_MAINNET: 1,
    BNB_SMART_CHAIN: 56
  },

  // Minimum boost amount in USD
  MIN_BOOST_AMOUNT: 1
};
