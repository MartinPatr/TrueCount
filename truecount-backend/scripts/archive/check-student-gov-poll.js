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
const USER_ADDRESS = '0xdD2FD4581271e230360230F9337D5c0430Bf44C0';
const POLL_ID = 7;

async function checkStudentGovPoll() {
  try {
    console.log('🏛️ Checking Student Government Poll Status...');
    
    // Get poll details
    const commitEnd = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getCommitEnd',
      args: [POLL_ID]
    });
    
    const title = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getTitle',
      args: [POLL_ID]
    });
    
    const description = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getDescription',
      args: [POLL_ID]
    });
    
    const options = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getOptions',
      args: [POLL_ID]
    });
    
    const tally = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getTally',
      args: [POLL_ID]
    });
    
    const hasCommitted = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'hasCommitted',
      args: [POLL_ID, USER_ADDRESS]
    });
    
    const hasRevealed = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'hasRevealed',
      args: [POLL_ID, USER_ADDRESS]
    });
    
    const now = Math.floor(Date.now() / 1000);
    const commitEndTime = Number(commitEnd);
    const phase = now < commitEndTime ? 'COMMIT' : 'REVEAL';
    
    console.log('\n📊 Student Government Poll Details:');
    console.log('📝 Title:', title);
    console.log('📄 Description:', description);
    console.log('🎯 Candidates:');
    options.forEach((option, index) => {
      console.log(`   ${index}: ${option} - ${tally[index]} votes`);
    });
    
    console.log('\n⏰ Timing:');
    console.log('🕐 Current time:', new Date(now * 1000).toLocaleString());
    console.log('⏰ Commit ended at:', new Date(commitEndTime * 1000).toLocaleString());
    console.log('📊 Phase:', phase);
    
    console.log('\n👤 Your Vote Status:');
    console.log('🗳️ Has committed:', hasCommitted);
    console.log('🔓 Has revealed:', hasRevealed);
    
    if (phase === 'REVEAL' && hasCommitted && !hasRevealed) {
      console.log('\n✅ Ready for reveal!');
      console.log('📋 Next steps:');
      console.log('1. Go to the frontend and find poll ID 7');
      console.log('2. The poll should show "Reveal Phase"');
      console.log('3. Click reveal to show your vote for Sarah Chen');
      console.log('4. Watch the tally update in real-time');
    } else if (hasRevealed) {
      console.log('\n✅ Vote already revealed!');
      console.log('📊 Current tally shows your vote has been counted');
    } else {
      console.log('\n❌ Not ready for reveal yet');
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error);
  }
}

checkStudentGovPoll();
