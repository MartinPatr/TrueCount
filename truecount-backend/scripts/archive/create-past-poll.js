import { createPublicClient, createWalletClient, http, keccak256, encodePacked } from 'viem';
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

const walletClient = createWalletClient({
  account,
  transport: http('http://127.0.0.1:8545')
});

const CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3';
const USER_ADDRESS = '0xdD2FD4581271e230360230F9337D5c0430Bf44C0';

async function createPastPoll() {
  try {
    console.log('🏛️ Creating Student Government Poll (Past Commit Phase)...');
    
    // Create a poll with commit phase ending in the past
    const commitSeconds = 1; // 1 second (will be in the past by the time we vote)
    const title = 'Student Government President Election 2024';
    const description = 'Vote for your preferred candidate for Student Government President. This election will determine who will represent the student body for the upcoming academic year.';
    const options = [
      'Alex Johnson - "Transparency & Student Voice"',
      'Sarah Chen - "Sustainability & Innovation"', 
      'Marcus Rodriguez - "Diversity & Inclusion"',
      'Taylor Kim - "Academic Excellence & Support"'
    ];
    
    const createPollHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'createPoll',
      args: [4, commitSeconds, title, description, options]
    });
    
    const createPollReceipt = await publicClient.waitForTransactionReceipt({ hash: createPollHash });
    console.log('✅ Student Government poll created successfully!');
    
    // Get the poll ID
    const pollCount = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'pollCount'
    });
    
    const pollId = Number(pollCount);
    console.log('📊 Poll ID:', pollId);
    
    // Vote in the poll
    console.log('\n🗳️ Voting in the poll...');
    
    // Vote for candidate 1 (Sarah Chen - index 1)
    const voteOption = 1; // Sarah Chen
    const salt = '0x' + Array.from({length: 32}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
    
    // Create commitment: keccak256(optionIndex, salt, voter, pollId)
    const commitment = keccak256(encodePacked(
      ['uint8', 'bytes32', 'address', 'uint256'],
      [voteOption, salt, USER_ADDRESS, BigInt(pollId)]
    ));
    
    console.log('🔐 Vote option:', voteOption, `(${options[voteOption]})`);
    console.log('🔑 Salt:', salt);
    console.log('📝 Commitment:', commitment);
    console.log('👤 Voter address:', USER_ADDRESS);
    
    const commitHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'commit',
      args: [pollId, commitment]
    });
    
    const commitReceipt = await publicClient.waitForTransactionReceipt({ hash: commitHash });
    console.log('✅ Vote committed successfully!');
    console.log('🔗 Transaction Hash:', commitHash);
    
    // Wait a moment for the commit phase to end
    console.log('\n⏳ Waiting for commit phase to end...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check poll status
    const commitEnd = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getCommitEnd',
      args: [pollId]
    });
    
    const now = Math.floor(Date.now() / 1000);
    const commitEndTime = Number(commitEnd);
    const phase = now < commitEndTime ? 'COMMIT' : 'REVEAL';
    
    console.log('🕐 Current time:', new Date(now * 1000).toLocaleString());
    console.log('⏰ Commit ended at:', new Date(commitEndTime * 1000).toLocaleString());
    console.log('📊 Phase:', phase);
    
    // Get current tally
    const tally = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getTally',
      args: [pollId]
    });
    
    console.log('\n📊 Current Tally:');
    options.forEach((option, index) => {
      console.log(`   ${index}: ${option} - ${tally[index]} votes`);
    });
    
    if (phase === 'REVEAL') {
      console.log('\n✅ Poll is in REVEAL phase!');
      console.log('🎉 Ready for reveal demonstration!');
      console.log('📋 Demo Instructions:');
      console.log(`1. Go to the frontend and find poll ID ${pollId}`);
      console.log('2. The poll should show "Reveal Phase"');
      console.log('3. Click reveal to show your vote for Sarah Chen');
      console.log('4. Watch Sarah Chen\'s vote count increase from 0 to 1');
      
      // Store the vote data for reveal
      const voteData = {
        pollId: pollId,
        optionIndex: voteOption,
        salt: salt,
        commitment: commitment,
        voterAddress: USER_ADDRESS,
        candidateName: options[voteOption]
      };
      
      console.log('\n💾 Vote data for reveal:');
      console.log(JSON.stringify(voteData, null, 2));
      
    } else {
      console.log('❌ Poll is still in COMMIT phase.');
      console.log('⏰ Commit end time:', new Date(commitEndTime * 1000).toLocaleString());
      console.log('🕐 Current time:', new Date(now * 1000).toLocaleString());
    }
    
  } catch (error) {
    console.error('❌ Past poll creation failed:', error);
  }
}

createPastPoll();
