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

async function voteInDemo() {
  try {
    console.log('🗳️ Voting in demo poll...');
    
    // Check if we can still commit
    const commitEnd = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getCommitEnd',
      args: [5]
    });
    
    const now = Math.floor(Date.now() / 1000);
    const commitEndTime = Number(commitEnd);
    
    console.log('⏰ Current time:', new Date(now * 1000).toLocaleString());
    console.log('⏰ Commit ends at:', new Date(commitEndTime * 1000).toLocaleString());
    
    if (now >= commitEndTime) {
      console.log('❌ Commit phase has ended. Cannot vote anymore.');
      return;
    }
    
    // Generate a random vote (0 for Option A, 1 for Option B)
    const voteOption = 0; // Vote for Option A
    const salt = '0x' + Array.from({length: 32}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
    
    // Create commitment: keccak256(optionIndex, salt, voter, pollId)
    // Using the same encoding as in the contract: abi.encodePacked(optionIndex, salt, msg.sender, pollId)
    const commitment = keccak256(encodePacked(
      ['uint8', 'bytes32', 'address', 'uint256'],
      [voteOption, salt, account.address, 5n]
    ));
    
    console.log('🔐 Vote option:', voteOption);
    console.log('🔑 Salt:', salt);
    console.log('📝 Commitment:', commitment);
    
    const commitHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'commit',
      args: [5, commitment]
    });
    
    const commitReceipt = await publicClient.waitForTransactionReceipt({ hash: commitHash });
    console.log('✅ Vote committed successfully!');
    console.log('🔗 Transaction Hash:', commitHash);
    
    // Store the vote data for later reveal
    const voteData = {
      pollId: 5,
      optionIndex: voteOption,
      salt: salt,
      commitment: commitment
    };
    
    console.log('\n💾 Vote data for reveal:');
    console.log(JSON.stringify(voteData, null, 2));
    
    console.log('\n🎉 Vote successful!');
    console.log('📋 Next steps:');
    console.log('1. Wait for the commit phase to end (2 hours)');
    console.log('2. Go to the frontend and reveal your vote');
    console.log('3. The poll will show "Reveal Phase" after commit ends');
    
  } catch (error) {
    console.error('❌ Voting failed:', error);
  }
}

voteInDemo();
