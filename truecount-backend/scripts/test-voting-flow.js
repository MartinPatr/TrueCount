const { createPublicClient, createWalletClient, http, keccak256, encodePacked } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

// Set up RPC URL and contract address
const RPC = 'http://127.0.0.1:8545';
const CONTRACT = '0x5fbdb2315678afecb367f032d93f642f64180aa3';

// Contract ABI
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
    "inputs": [
      {"internalType": "uint256", "name": "pollId", "type": "uint256"},
      {"internalType": "bytes32", "name": "commitment", "type": "bytes32"}
    ],
    "name": "commit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "pollId", "type": "uint256"},
      {"internalType": "uint8", "name": "optionIndex", "type": "uint8"},
      {"internalType": "bytes32", "name": "salt", "type": "bytes32"}
    ],
    "name": "reveal",
    "outputs": [],
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
  },
  {
    "inputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "name": "getTally",
    "outputs": [{"internalType": "uint32[]", "name": "tally", "type": "uint32[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "name": "getTitle",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "name": "getOptions",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Create accounts
const account1 = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
const account2 = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');

// Create clients
const publicClient = createPublicClient({ transport: http(RPC) });
const wallet1 = createWalletClient({ account: account1, transport: http(RPC) });
const wallet2 = createWalletClient({ account: account2, transport: http(RPC) });

async function testVotingFlow() {
  try {
    console.log('🎯 Testing complete voting flow...');
    
    // 1. Create a new poll
    const title = "Mock Student Body Election";
    const description = "Vote for your preferred candidate";
    const options = ["Alice Johnson", "Bob Smith", "Carol Davis"];
    const commitMinutes = 2; // 2 minutes for testing
    const commitSeconds = commitMinutes * 60;
    
    console.log('📝 Creating poll...');
    const txHash = await wallet1.writeContract({
      address: CONTRACT,
      abi,
      functionName: 'createPoll',
      args: [3, commitSeconds, title, description, options]
    });
    
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    console.log('✅ Poll created in block:', receipt.blockNumber);
    
    // Get poll ID
    const pollId = await publicClient.readContract({
      address: CONTRACT,
      abi,
      functionName: 'pollCount'
    });
    console.log('🆔 Poll ID:', pollId.toString());
    
    // Get poll details
    const pollTitle = await publicClient.readContract({
      address: CONTRACT,
      abi,
      functionName: 'getTitle',
      args: [pollId]
    });
    const pollOptions = await publicClient.readContract({
      address: CONTRACT,
      abi,
      functionName: 'getOptions',
      args: [pollId]
    });
    console.log('📋 Poll:', pollTitle);
    console.log('📋 Options:', pollOptions);
    
    // 2. Commit votes
    console.log('🔒 Committing votes...');
    
    // Account 1 votes for option 0 (Alice Johnson)
    const option1 = 0;
    const salt1 = '0x' + '11'.repeat(32);
    const commitment1 = keccak256(encodePacked(['uint8','bytes32','address','uint256'], [option1, salt1, account1.address, pollId]));
    
    // Account 2 votes for option 1 (Bob Smith)
    const option2 = 1;
    const salt2 = '0x' + '22'.repeat(32);
    const commitment2 = keccak256(encodePacked(['uint8','bytes32','address','uint256'], [option2, salt2, account2.address, pollId]));
    
    // Submit commitments
    await publicClient.waitForTransactionReceipt({ 
      hash: await wallet1.writeContract({ 
        address: CONTRACT, 
        abi, 
        functionName: 'commit', 
        args: [pollId, commitment1] 
      }) 
    });
    
    await publicClient.waitForTransactionReceipt({ 
      hash: await wallet2.writeContract({ 
        address: CONTRACT, 
        abi, 
        functionName: 'commit', 
        args: [pollId, commitment2] 
      }) 
    });
    
    console.log('✅ Both votes committed');
    
    // 3. Wait for commit phase to end (advance time)
    console.log('⏰ Advancing time to reveal phase...');
    const commitEnd = await publicClient.readContract({
      address: CONTRACT,
      abi,
      functionName: 'getCommitEnd',
      args: [pollId]
    });
    
    // Advance time past commit phase
    await publicClient.request({ method: 'evm_increaseTime', params: [Number(commitEnd) - Math.floor(Date.now() / 1000) + 10] });
    await publicClient.request({ method: 'evm_mine' });
    
    console.log('✅ Time advanced to reveal phase');
    
    // 4. Reveal votes
    console.log('🔓 Revealing votes...');
    
    await publicClient.waitForTransactionReceipt({ 
      hash: await wallet1.writeContract({ 
        address: CONTRACT, 
        abi, 
        functionName: 'reveal', 
        args: [pollId, option1, salt1] 
      }) 
    });
    
    await publicClient.waitForTransactionReceipt({ 
      hash: await wallet2.writeContract({ 
        address: CONTRACT, 
        abi, 
        functionName: 'reveal', 
        args: [pollId, option2, salt2] 
      }) 
    });
    
    console.log('✅ Both votes revealed');
    
    // 5. Check results
    const tally = await publicClient.readContract({
      address: CONTRACT,
      abi,
      functionName: 'getTally',
      args: [pollId]
    });
    
    console.log('📊 Final Results:');
    pollOptions.forEach((option, index) => {
      console.log(`   ${option}: ${tally[index]} votes`);
    });
    
    console.log('🎉 Complete voting flow test successful!');
    
  } catch (error) {
    console.error('❌ Voting flow test failed:', error);
  }
}

testVotingFlow();