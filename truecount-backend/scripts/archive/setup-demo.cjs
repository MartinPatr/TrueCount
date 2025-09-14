const { createPublicClient, createWalletClient, http, keccak256, encodePacked } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const fs = require('fs');
const path = require('path');

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

async function setupDemo() {
  try {
    console.log('🏛️ Setting up Student Government Election Demo...');
    
    // Use existing poll 27
    const pollId = 27;
    
    console.log('📊 Using Poll ID:', pollId);
    
    // Get poll details
    const title = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getTitle',
      args: [pollId]
    });
    
    const options = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getOptions',
      args: [pollId]
    });
    
    console.log('📝 Title:', title);
    console.log('🎯 Options:', options);
    
    // Add more votes to the existing poll
    console.log('\n🗳️ Adding more votes to the poll...');
    
    const voteData = [];
    const voteDistribution = [2, 3, 1, 1]; // Additional votes for each candidate
    
    let voteIndex = 0;
    for (let candidateIndex = 0; candidateIndex < options.length; candidateIndex++) {
      const votesForCandidate = voteDistribution[candidateIndex];
      
      for (let i = 0; i < votesForCandidate; i++) {
        const salt = generateSalt();
        const commitment = computeCommitment(candidateIndex, salt, account.address, pollId);
        
        console.log(`👤 Vote ${voteIndex + 1} for: ${options[candidateIndex]}`);
        
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
            voteId: voteIndex + 1
          });
          
          voteIndex++;
        } catch (error) {
          console.log(`❌ Vote ${voteIndex + 1} failed:`, error.message);
          voteIndex++;
        }
      }
    }
    
    console.log(`\n📊 Total new votes committed: ${voteData.length}`);
    console.log('📈 Additional vote distribution:');
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
    console.log('1. Go to the frontend and find poll ID', pollId);
    console.log('2. You will see the poll is in COMMIT phase with', voteData.length, 'new committed votes');
    console.log('3. The poll already has 2 votes from before, so total will be', voteData.length + 2);
    console.log('4. Run: node scripts/advance-time.js to advance time');
    console.log('5. After advancing time, the poll will enter REVEAL phase');
    console.log('6. Use the reveal functionality to show how votes are counted');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupDemo();