import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load contract ABI and bytecode
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

async function deployContract() {
  try {
    console.log('🚀 Deploying SealedVote contract...');
    
    // Deploy the contract
    const hash = await walletClient.deployContract({
      abi: artifact.abi,
      bytecode: artifact.bytecode,
      args: []
    });
    
    console.log('⏳ Waiting for deployment transaction...');
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    console.log('✅ Contract deployed successfully!');
    console.log('📝 Contract Address:', receipt.contractAddress);
    console.log('🔗 Transaction Hash:', hash);
    console.log('⛽ Gas Used:', receipt.gasUsed.toString());
    
    // Test the contract by creating a poll
    console.log('\n🧪 Testing contract with a sample poll...');
    const createPollHash = await walletClient.writeContract({
      address: receipt.contractAddress,
      abi: artifact.abi,
      functionName: 'createPoll',
      args: [2, 60, 'Test Poll', 'This is a test poll created during deployment', ['Option 1', 'Option 2']] // 2 options, 60 seconds commit phase, title, description, options
    });
    
    const createPollReceipt = await publicClient.waitForTransactionReceipt({ hash: createPollHash });
    console.log('✅ Test poll created successfully!');
    console.log('📊 Poll ID: 1');
    
    // Get poll count to verify
    const pollCount = await publicClient.readContract({
      address: receipt.contractAddress,
      abi: artifact.abi,
      functionName: 'pollCount'
    });
    
    console.log('📈 Total polls created:', pollCount.toString());
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
  }
}

deployContract();
