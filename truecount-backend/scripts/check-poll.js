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

async function checkPoll(pollId) {
  try {
    console.log(`🔍 Checking poll ${pollId}...`);
    
    // Get poll details
    const [commitEnd, title, description, options, tally, hasCommitted, hasRevealed] = await Promise.all([
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: artifact.abi,
        functionName: 'getCommitEnd',
        args: [pollId]
      }),
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: artifact.abi,
        functionName: 'getTitle',
        args: [pollId]
      }),
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: artifact.abi,
        functionName: 'getDescription',
        args: [pollId]
      }),
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: artifact.abi,
        functionName: 'getOptions',
        args: [pollId]
      }),
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: artifact.abi,
        functionName: 'getTally',
        args: [pollId]
      }),
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: artifact.abi,
        functionName: 'hasCommitted',
        args: [pollId, account.address]
      }),
      publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: artifact.abi,
        functionName: 'hasRevealed',
        args: [pollId, account.address]
      })
    ]);
    
    const now = Math.floor(Date.now() / 1000);
    const commitEndTime = Number(commitEnd);
    const phase = now < commitEndTime ? 'COMMIT' : 'REVEAL';
    
    console.log('📝 Title:', title);
    console.log('📄 Description:', description);
    console.log('🎯 Options:', options);
    console.log('⏰ Commit ends at:', new Date(commitEndTime * 1000).toLocaleString());
    console.log('🕐 Current time:', new Date(now * 1000).toLocaleString());
    console.log('📊 Phase:', phase);
    console.log('🗳️ Has committed:', hasCommitted);
    console.log('🔓 Has revealed:', hasRevealed);
    console.log('📈 Tally:', tally.map(Number));
    
    const totalVotes = tally.reduce((sum, count) => sum + Number(count), 0);
    console.log('📊 Total votes:', totalVotes);
    
  } catch (error) {
    console.error('❌ Error checking poll:', error);
  }
}

// Get poll ID from command line argument
const pollId = process.argv[2];
if (!pollId) {
  console.log('Usage: node check-poll.js <pollId>');
  process.exit(1);
}

checkPoll(BigInt(pollId));
