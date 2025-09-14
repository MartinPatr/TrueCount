import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, localhost } from 'wagmi/chains';
import contractJson from '../contracts/SealedVote.json';

export const config = getDefaultConfig({
  appName: 'TrueCount',
  projectId: '7dd6439c7ec6f83b35930d38eb9ea781',
  chains: [mainnet, sepolia, localhost],
  ssr: false,
});

export const sealedVoteContract = {
  address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  abi: contractJson.abi,
};


// import { getDefaultConfig } from '@rainbow-me/rainbowkit';
// import { mainnet, sepolia, localhost } from 'wagmi/chains';


// export const config = getDefaultConfig({
//   appName: 'TrueCount',
//   projectId: '7dd6439c7ec6f83b35930d38eb9ea781', //Project ID from WalletConnect
//   chains: [mainnet, sepolia, localhost],
//   ssr: false, // If your dApp uses server side rendering (SSR)
// });
