const { createPublicClient, createWalletClient, http, keccak256, encodePacked } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

// Set up RPC URL and contract address
const RPC = 'http://127.0.0.1:8545';
const CONTRACT = '0x5fbdb2315678afecb367f032d93f642f64180aa3';

// Contract ABI (simplified)
const abi = [
  {
    "inputs": [
      {"internalType": "uint8", "name": "numOptions", "type": "uint8"},
      {"internalType": "uint32", "name": "commitSeconds", "type": "uint32"},
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "string[]", "name": "options", "type": "string[]"}
    ],
    "name": "createPoll",
    "outputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pollCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "name": "getCommitEnd",
    "outputs": [{"internalType": "uint64", "name": "commitEnd", "type": "uint64"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Create account from private key
const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');

// Create clients
const publicClient = createPublicClient({ transport: http(RPC) });
const walletClient = createWalletClient({ account, transport: http(RPC) });

async function testContract() {
  try {
    console.log('Testing contract at:', CONTRACT);
    
    // Check current poll count
    const pollCount = await publicClient.readContract({
      address: CONTRACT,
      abi,
      functionName: 'pollCount'
    });
    console.log('Current poll count:', pollCount.toString());
    
    // Create a new poll
    const title = "Student Body President Election";
    const description = "Vote for your preferred candidate for Student Body President";
    const options = ["Alice Johnson", "Bob Smith", "Carol Davis"];
    const commitHours = 1; // 1 hour commit phase
    const commitSeconds = commitHours * 3600;
    
    console.log('Creating poll...');
    const txHash = await walletClient.writeContract({
      address: CONTRACT,
      abi,
      functionName: 'createPoll',
      args: [3, commitSeconds, title, description, options]
    });
    
    console.log('Transaction hash:', txHash);
    
    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log('Transaction confirmed in block:', receipt.blockNumber);
    
    // Get new poll count
    const newPollCount = await publicClient.readContract({
      address: CONTRACT,
      abi,
      functionName: 'pollCount'
    });
    console.log('New poll count:', newPollCount.toString());
    
    // Get commit end time for the new poll
    const commitEnd = await publicClient.readContract({
      address: CONTRACT,
      abi,
      functionName: 'getCommitEnd',
      args: [newPollCount]
    });
    console.log('Commit phase ends at:', new Date(Number(commitEnd) * 1000).toLocaleString());
    
    console.log('✅ Contract test successful!');
    
  } catch (error) {
    console.error('❌ Contract test failed:', error);
  }
}

testContract();