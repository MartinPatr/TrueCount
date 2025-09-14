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

async function advanceTime() {
  try {
    console.log('⏰ Advancing blockchain time...');
    
    // Get current block
    const currentBlock = await publicClient.getBlock();
    console.log('📅 Current block timestamp:', new Date(Number(currentBlock.timestamp) * 1000).toLocaleString());
    
    // Mine blocks to advance time
    console.log('⛏️ Mining blocks to advance time...');
    const blocksToMine = 1000;
    
    for (let i = 1; i <= blocksToMine; i++) {
      await walletClient.sendTransaction({
        to: account.address,
        value: 0n,
        data: '0x'
      });
      
      if (i % 100 === 0) {
        console.log(`⏳ Mined ${i}/${blocksToMine} blocks...`);
      }
    }
    
    // Get new block
    const newBlock = await publicClient.getBlock();
    const timeAdvanced = Number(newBlock.timestamp) - Number(currentBlock.timestamp);
    
    console.log('📅 New block timestamp:', new Date(Number(newBlock.timestamp) * 1000).toLocaleString());
    console.log('⏱️ Time advanced by:', timeAdvanced, 'seconds');
    
  } catch (error) {
    console.error('❌ Error advancing time:', error);
  }
}

advanceTime();