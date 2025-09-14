import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, rainbowWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { mainnet, sepolia } from 'wagmi/chains';
import { createConfig, http } from 'wagmi';
import { defineChain, Address } from 'viem';
import { createStorage, cookieStorage } from 'wagmi';
import contractJson from '../contracts/SealedVote.json';

// Define localhost with correct chain ID for Hardhat
const localhost = defineChain({
  id: Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 31337,
  name: 'Localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545',
    },
  },
  testnet: true,
});

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet,
      rainbowWallet,
      walletConnectWallet,
    ],
  },
], {
  appName: 'TrueCount',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '0x5fbdb2315678afecb367f032d93f642f64180aa3',
});

export const config = createConfig({
  chains: [localhost, mainnet, sepolia], // localhost first for development
  connectors,
  transports: {
    [localhost.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545', {
      retryCount: 5,
      retryDelay: 1000,
      timeout: 10000,
    }), // explicit localhost URL with retry and timeout
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  storage: createStorage({
    storage: cookieStorage,
  }),
});

export const sealedVoteContract = {
  address: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) as Address,
  abi: contractJson.abi,
};

