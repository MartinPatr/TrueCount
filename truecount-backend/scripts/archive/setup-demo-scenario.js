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

// Create multiple accounts for voting (using valid Hardhat private keys)
const accounts = [
  privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'),
  privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'),
  privateKeyToAccount('0x5de4111daa5ba4e54b9d4b4d4b4d4b4d4b4d4b4d4b4d4b4d4b4d4b4d4b4d4b4d'),
  privateKeyToAccount('0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b07a79'),
  privateKeyToAccount('0x47e17934a6d7d54c7a39d462126f2d27d6cafb4787c0a536a9ca8fe0a61f0ed'),
  privateKeyToAccount('0x8b3a350cf5c34c9194ca85829a2df0ec3153be56d4912eb6be73ae47d919d0b'),
  privateKeyToAccount('0x92db14e403b83dfe3df233f83dfa233a233da233d233d233d233d233d233d23'),
  privateKeyToAccount('0x4bbbf85ce3377467afe5d46f804f2212b4bb616e901a040eb8586f3ce0e77e4'),
  privateKeyToAccount('0xdbda1821b80560c4691c6dc91fcb8182a3da25a642290195e807b15c093c6b5'),
  privateKeyToAccount('0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6')
];

// Create clients
const publicClient = createPublicClient({
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

async function setupDemoScenario() {
  try {
    console.log('🏛️ Setting up Student Government Election Demo...');
    
    // Create poll with 1 hour commit time
    const title = "Student Government President Election 2024";
    const description = "Vote for your preferred candidate for Student Government President. This election will determine who will represent the student body for the upcoming academic year.";
    const options = [
      "Alex Johnson - \"Transparency & Student Voice\"",
      "Sarah Chen - \"Sustainability & Innovation\"",
      "Marcus Rodriguez - \"Diversity & Inclusion\"",
      "Taylor Kim - \"Academic Excellence & Support\""
    ];
    
    const walletClient = createWalletClient({
      account: accounts[0],
      transport: http('http://127.0.0.1:8545')
    });
    
    // Create poll with 1 hour commit time
    const createTx = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'createPoll',
      args: [4, 3600, title, description, options] // 1 hour commit time
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
    console.log('⏰ Commit phase: 1 hour');
    console.log('🎯 Candidates:', options.length);
    
    // Vote with multiple accounts
    console.log('\n🗳️ Adding votes from multiple students...');
    
    const voteData = [];
    const voteDistribution = [3, 4, 2, 1]; // Votes for each candidate
    
    let voteIndex = 0;
    for (let candidateIndex = 0; candidateIndex < options.length; candidateIndex++) {
      const votesForCandidate = voteDistribution[candidateIndex];
      
      for (let i = 0; i < votesForCandidate; i++) {
        if (voteIndex >= accounts.length) break;
        
        const account = accounts[voteIndex];
        const walletClient = createWalletClient({
          account,
          transport: http('http://127.0.0.1:8545')
        });
        
        const salt = generateSalt();
        const commitment = computeCommitment(candidateIndex, salt, account.address, pollId);
        
        console.log(`👤 Student ${voteIndex + 1} voting for: ${options[candidateIndex]}`);
        
        try {
          // Commit vote
          const commitTx = await walletClient.writeContract({
            address: CONTRACT_ADDRESS,
            abi: artifact.abi,
            functionName: 'commit',
            args: [pollId, commitment]
          });
          
          const commitReceipt = await publicClient.waitForTransactionReceipt({ hash: commitTx });
          console.log(`✅ Vote ${voteIndex + 1} committed successfully!`);
          
          // Store vote data for reveal
          voteData.push({
            pollId: pollId.toString(),
            optionIndex: candidateIndex,
            salt,
            commitment,
            voterAddress: account.address,
            candidateName: options[candidateIndex],
            studentId: voteIndex + 1
          });
          
          voteIndex++;
        } catch (error) {
          console.log(`❌ Vote ${voteIndex + 1} failed:`, error.message);
          voteIndex++;
        }
      }
    }
    
    console.log(`\n📊 Total votes committed: ${voteData.length}`);
    console.log('📈 Vote distribution:');
    voteDistribution.forEach((count, index) => {
      console.log(`   ${options[index]}: ${count} votes`);
    });
    
    // Store vote data for reveal
    const voteDataFile = path.join(__dirname, 'vote-data.json');
    fs.writeFileSync(voteDataFile, JSON.stringify(voteData, null, 2));
    console.log(`\n💾 Vote data saved to: ${voteDataFile}`);
    
    // Get commit end time
    const commitEnd = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getCommitEnd',
      args: [pollId]
    });
    
    console.log('\n⏰ Commit phase ends at:', new Date(Number(commitEnd) * 1000).toLocaleString());
    
    console.log('\n🎉 Student Government Poll Demo Setup Complete!');
    console.log('📋 Demo Instructions:');
    console.log('1. Go to the frontend and find poll ID', pollId.toString());
    console.log('2. You will see the poll is in COMMIT phase with', voteData.length, 'committed votes');
    console.log('3. Run: node scripts/advance-time.js to advance time');
    console.log('4. After advancing time, the poll will enter REVEAL phase');
    console.log('5. Use the reveal functionality to show how votes are counted');
    console.log('6. The votes will be distributed as:');
    voteDistribution.forEach((count, index) => {
      console.log(`   - ${options[index]}: ${count} votes`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupDemoScenario();