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

async function createDemoPoll() {
  try {
    console.log('🚀 Creating demo poll...');
    
    // Create a poll with 2 hours duration
    const commitSeconds = 2 * 3600; // 2 hours
    const title = 'Demo Poll - Vote and Reveal';
    const description = 'This is a demo poll to test the voting and reveal functionality. You can vote in this poll and then reveal your vote.';
    const options = ['Option A', 'Option B'];
    
    const createPollHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'createPoll',
      args: [2, commitSeconds, title, description, options]
    });
    
    const createPollReceipt = await publicClient.waitForTransactionReceipt({ hash: createPollHash });
    console.log('✅ Demo poll created successfully!');
    console.log('📊 Poll ID: 2');
    console.log('⏰ Commit phase: 2 hours');
    console.log('🎯 Options: Option A, Option B');
    
    // Now vote in the poll
    console.log('\n🗳️ Voting in the demo poll...');
    
    // Generate a random vote (0 for Option A, 1 for Option B)
    const voteOption = 0; // Vote for Option A
    const salt = '0x' + Array.from({length: 32}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
    
    // Create commitment: keccak256(optionIndex, salt, voter, pollId)
    // Using the same encoding as in the contract: abi.encodePacked(optionIndex, salt, msg.sender, pollId)
    const commitment = keccak256(encodePacked(
      ['uint8', 'bytes32', 'address', 'uint256'],
      [voteOption, salt, account.address, 2n]
    ));
    
    const commitHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'commit',
      args: [2, commitment]
    });
    
    const commitReceipt = await publicClient.waitForTransactionReceipt({ hash: commitHash });
    console.log('✅ Vote committed!');
    console.log('🔐 Vote option:', voteOption);
    console.log('🔑 Salt:', salt);
    console.log('📝 Commitment:', commitment);
    
    // Store the vote data for later reveal
    const voteData = {
      pollId: 2,
      optionIndex: voteOption,
      salt: salt,
      commitment: commitment
    };
    
    console.log('\n💾 Vote data for reveal:');
    console.log(JSON.stringify(voteData, null, 2));
    
    console.log('\n🎉 Demo setup complete!');
    console.log('📋 Next steps:');
    console.log('1. Go to the frontend and find poll ID 2');
    console.log('2. You can reveal your vote after the commit phase ends');
    console.log('3. Create another poll to test the full voting flow');
    
  } catch (error) {
    console.error('❌ Demo setup failed:', error);
  }
}

createDemoPoll();
