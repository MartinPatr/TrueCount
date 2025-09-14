import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load contract ABI
const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'SealedVote.sol', 'SealedVote.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

// Create account from first Hardhat account
const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');

// Create clients
const publicClient = createPublicClient({
  transport: http('http://127.0.0.1:8545')
});

const CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3';

async function listAllPolls() {
  try {
    console.log('🔍 Listing all polls...');
    
    // Check poll count
    const pollCount = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'pollCount'
    });
    
    const totalPolls = Number(pollCount);
    console.log('📈 Total polls:', totalPolls);
    
    // List all polls
    for (let i = 1; i <= totalPolls; i++) {
      try {
        const commitEnd = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: artifact.abi,
          functionName: 'getCommitEnd',
          args: [i]
        });
        
        const title = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: artifact.abi,
          functionName: 'getTitle',
          args: [i]
        });
        
        const description = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: artifact.abi,
          functionName: 'getDescription',
          args: [i]
        });
        
        const options = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: artifact.abi,
          functionName: 'getOptions',
          args: [i]
        });
        
        const hasCommitted = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: artifact.abi,
          functionName: 'hasCommitted',
          args: [i, account.address]
        });
        
        const hasRevealed = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: artifact.abi,
          functionName: 'hasRevealed',
          args: [i, account.address]
        });
        
        const now = Math.floor(Date.now() / 1000);
        const commitEndTime = Number(commitEnd);
        const phase = now < commitEndTime ? 'COMMIT' : 'REVEAL';
        
        console.log(`\n📊 Poll ${i}:`);
        console.log('📝 Title:', title);
        console.log('📄 Description:', description);
        console.log('🎯 Options:', options);
        console.log('⏰ Commit ends at:', new Date(commitEndTime * 1000).toLocaleString());
        console.log('📊 Phase:', phase);
        console.log('🗳️ Has committed:', hasCommitted);
        console.log('🔓 Has revealed:', hasRevealed);
        
        if (title.includes('Demo Poll') || description.includes('demo poll')) {
          console.log('🎯 *** This is our demo poll! ***');
        }
        
      } catch (error) {
        console.log(`❌ Error reading poll ${i}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ List failed:', error);
  }
}

listAllPolls();
