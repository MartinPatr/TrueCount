import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Create account from first Hardhat account
const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');

// Create clients
const publicClient = createPublicClient({
  transport: http('http://127.0.0.1:8545')
});

const walletClient = createWalletClient({
  account,
  transport: http('http://127.0.0.1:8545')
});

async function fastForwardTime() {
  try {
    console.log('⏰ Fast-forwarding time to end commit phase...');
    
    // Mine blocks to advance time (each block is ~12 seconds)
    // We need to advance by 1 hour = 3600 seconds = 300 blocks
    const blocksToMine = 300;
    
    console.log(`⛏️ Mining ${blocksToMine} blocks...`);
    
    for (let i = 0; i < blocksToMine; i++) {
      await walletClient.sendTransaction({
        to: account.address,
        value: 0n,
        data: '0x'
      });
      
      if (i % 50 === 0) {
        console.log(`⏳ Mined ${i + 1}/${blocksToMine} blocks...`);
      }
    }
    
    console.log('✅ Time fast-forwarded successfully!');
    console.log('🕐 Current time should be past the commit phase end time');
    
    // Check current block timestamp
    const block = await publicClient.getBlock();
    console.log('📅 Current block timestamp:', new Date(Number(block.timestamp) * 1000).toLocaleString());
    
  } catch (error) {
    console.error('❌ Fast-forward failed:', error);
  }
}

fastForwardTime();
