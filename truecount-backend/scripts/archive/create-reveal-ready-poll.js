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

// Create account
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

// Simple commitment computation (matches the contract)
function computeCommitment(optionIndex, salt, voter, pollId) {
  return keccak256(encodePacked(['uint8', 'bytes32', 'address', 'uint256'], [optionIndex, salt, voter, pollId]));
}

// Generate random salt
function generateSalt() {
  return '0x' + Math.random().toString(16).substring(2, 66).padStart(64, '0');
}

async function createRevealReadyPoll() {
  try {
    console.log('🏛️ Creating Student Government Election Poll...');
    
    // Create poll with 1 second commit time
    const title = "Student Government President Election 2024";
    const description = "Vote for your preferred candidate for Student Government President. This election will determine who will represent the student body for the upcoming academic year.";
    const options = [
      "Alex Johnson - \"Transparency & Student Voice\"",
      "Sarah Chen - \"Sustainability & Innovation\"",
      "Marcus Rodriguez - \"Diversity & Inclusion\"",
      "Taylor Kim - \"Academic Excellence & Support\""
    ];
    
    // Create poll with 1 second commit time
    const createTx = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'createPoll',
      args: [4, 1, title, description, options] // 1 second commit time
    });
    
    console.log('📝 Poll creation transaction:', createTx);
    
    // Wait for transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash: createTx });
    console.log('✅ Poll created successfully!');
    
    // Get the poll ID from the event
    const pollCreatedEvent = receipt.logs.find(log => {
      try {
        const decoded = publicClient.decodeEventLog({
          abi: artifact.abi,
          data: log.data,
          topics: log.topics
        });
        return decoded.eventName === 'PollCreated';
      } catch {
        return false;
      }
    });
    
    let pollId;
    if (pollCreatedEvent) {
      const decoded = publicClient.decodeEventLog({
        abi: artifact.abi,
        data: pollCreatedEvent.data,
        topics: pollCreatedEvent.topics
      });
      pollId = decoded.args.pollId;
    } else {
      // Fallback: get poll count
      const pollCount = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: artifact.abi,
        functionName: 'pollCount'
      });
      pollId = pollCount;
    }
    
    console.log('📊 Poll ID:', pollId.toString());
    console.log('⏰ Commit phase: 1 second');
    console.log('🎯 Candidates:', options.length);
    
    // Vote in the poll
    console.log('\n🗳️ Voting in the poll...');
    const optionIndex = 1; // Vote for Sarah Chen
    const salt = generateSalt();
    const commitment = computeCommitment(optionIndex, salt, account.address, pollId);
    
    console.log('🔐 Vote option:', optionIndex, '(' + options[optionIndex] + ')');
    console.log('🔑 Salt:', salt);
    console.log('📝 Commitment:', commitment);
    console.log('👤 Voter address:', account.address);
    
    // Commit vote
    const commitTx = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'commit',
      args: [pollId, commitment]
    });
    
    const commitReceipt = await publicClient.waitForTransactionReceipt({ hash: commitTx });
    console.log('✅ Vote committed successfully!');
    console.log('🔗 Transaction Hash:', commitTx);
    
    // Wait 3 seconds for commit phase to end
    console.log('\n⏳ Waiting for commit phase to end...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check poll state
    const commitEnd = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getCommitEnd',
      args: [pollId]
    });
    
    const now = Math.floor(Date.now() / 1000);
    const commitEndTime = Number(commitEnd);
    const phase = now < commitEndTime ? 'COMMIT' : 'REVEAL';
    
    console.log('⏰ Commit phase ended at:', new Date(commitEndTime * 1000).toLocaleString());
    console.log('🕐 Current time:', new Date(now * 1000).toLocaleString());
    console.log('📊 Phase:', phase);
    
    if (phase === 'REVEAL') {
      console.log('🎉 Poll is now in REVEAL phase!');
      
      // Store vote data for reveal
      const voteData = {
        pollId: pollId.toString(),
        optionIndex,
        salt,
        commitment,
        voterAddress: account.address,
        candidateName: options[optionIndex]
      };
      
      const voteDataFile = path.join(__dirname, 'vote-data.json');
      fs.writeFileSync(voteDataFile, JSON.stringify(voteData, null, 2));
      console.log(`\n💾 Vote data saved to: ${voteDataFile}`);
      
      console.log('\n📋 Demo Instructions:');
      console.log('1. Go to the frontend and find poll ID', pollId.toString());
      console.log('2. The poll should show REVEAL phase');
      console.log('3. You can now test the reveal functionality');
      console.log('4. The vote will be added to Sarah Chen\'s tally');
    } else {
      console.log('❌ Poll is still in COMMIT phase. This might be a timing issue.');
      console.log('⏰ Commit end timestamp:', commitEndTime);
      console.log('🕐 Current timestamp:', now);
      console.log('⏱️ Difference:', now - commitEndTime);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createRevealReadyPoll();