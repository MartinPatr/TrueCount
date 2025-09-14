const { createPublicClient, http } = require('viem');

// Set up RPC URL and contract address
const RPC = 'http://127.0.0.1:8545';
const CONTRACT = '0x5fbdb2315678afecb367f032d93f642f64180aa3';

// Contract ABI
const abi = [
  {
    "inputs": [],
    "name": "pollCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
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
    "name": "getDescription",
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
  }
];

// Create public client
const publicClient = createPublicClient({ transport: http(RPC) });

async function testFrontendConnection() {
  try {
    console.log('🔗 Testing frontend connection to contract...');
    console.log('Contract:', CONTRACT);
    console.log('RPC:', RPC);
    
    // Test basic connection
    const pollCount = await publicClient.readContract({
      address: CONTRACT,
      abi,
      functionName: 'pollCount'
    });
    console.log('✅ Connected! Poll count:', pollCount.toString());
    
    // Test reading latest poll
    if (Number(pollCount) > 0) {
      const latestPollId = pollCount;
      console.log(`\n📋 Testing poll ${latestPollId}:`);
      
      const title = await publicClient.readContract({
        address: CONTRACT,
        abi,
        functionName: 'getTitle',
        args: [latestPollId]
      });
      
      const description = await publicClient.readContract({
        address: CONTRACT,
        abi,
        functionName: 'getDescription',
        args: [latestPollId]
      });
      
      const options = await publicClient.readContract({
        address: CONTRACT,
        abi,
        functionName: 'getOptions',
        args: [latestPollId]
      });
      
      const commitEnd = await publicClient.readContract({
        address: CONTRACT,
        abi,
        functionName: 'getCommitEnd',
        args: [latestPollId]
      });
      
      const tally = await publicClient.readContract({
        address: CONTRACT,
        abi,
        functionName: 'getTally',
        args: [latestPollId]
      });
      
      console.log('  Title:', title);
      console.log('  Description:', description);
      console.log('  Options:', options);
      console.log('  Commit End:', new Date(Number(commitEnd) * 1000).toLocaleString());
      console.log('  Tally:', tally.map(Number));
      
      // Check if poll is in commit or reveal phase
      const now = Math.floor(Date.now() / 1000);
      const phase = now < Number(commitEnd) ? 'COMMIT' : 'REVEAL';
      console.log('  Phase:', phase);
    }
    
    console.log('\n✅ Frontend connection test successful!');
    console.log('The frontend should be able to connect to this contract.');
    
  } catch (error) {
    console.error('❌ Frontend connection test failed:', error);
  }
}

testFrontendConnection();
