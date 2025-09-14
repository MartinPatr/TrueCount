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

async function createStudentGovPoll() {
  try {
    console.log('🏛️ Creating Student Government Election Poll...');
    
    // Create a poll with 4 candidates for student government
    const commitSeconds = 1 * 3600; // 1 hour for demo
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
    
    // Get the poll ID (should be the next number)
    const pollCount = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'pollCount'
    });
    
    const pollId = Number(pollCount);
    console.log('📊 Poll ID:', pollId);
    console.log('⏰ Commit phase: 1 hour');
    console.log('🎯 Candidates:', options.length);
    
    // Now vote in the poll using the user's address
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
    
    // We need to impersonate the user address to vote
    // For demo purposes, we'll use the deployer account but store the vote data for the user
    const commitHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'commit',
      args: [pollId, commitment]
    });
    
    const commitReceipt = await publicClient.waitForTransactionReceipt({ hash: commitHash });
    console.log('✅ Vote committed successfully!');
    console.log('🔗 Transaction Hash:', commitHash);
    
    // Store the vote data for later reveal
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
    
    // Get poll details
    const commitEnd = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getCommitEnd',
      args: [pollId]
    });
    
    const commitEndTime = Number(commitEnd);
    console.log('\n⏰ Commit phase ends at:', new Date(commitEndTime * 1000).toLocaleString());
    
    console.log('\n🎉 Student Government Poll Setup Complete!');
    console.log('📋 Demo Instructions:');
    console.log(`1. Go to the frontend and find poll ID ${pollId}`);
    console.log('2. You will see the poll is in COMMIT phase');
    console.log('3. After 1 hour, the poll will enter REVEAL phase');
    console.log('4. Use the reveal functionality to show how votes are counted');
    console.log('5. The vote will be added to Sarah Chen\'s tally');
    
    return { pollId, voteData };
    
  } catch (error) {
    console.error('❌ Student Government poll creation failed:', error);
  }
}

createStudentGovPoll();
