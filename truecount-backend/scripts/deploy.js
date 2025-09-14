import { createPublicClient, createWalletClient, http } from 'viem';
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

async function deployContract() {
  try {
    console.log('🚀 Deploying SealedVote contract...');
    
    // Deploy the contract
    const deployTx = await walletClient.deployContract({
      abi: artifact.abi,
      bytecode: artifact.bytecode,
    });
    
    console.log('📝 Deployment transaction:', deployTx);
    
    // Wait for transaction to be mined
    const receipt = await publicClient.waitForTransactionReceipt({ hash: deployTx });
    console.log('✅ Contract deployed successfully!');
    console.log('📍 Contract address:', receipt.contractAddress);
    
    // Save deployment info
    const deploymentInfo = {
      contractAddress: receipt.contractAddress,
      transactionHash: deployTx,
      blockNumber: receipt.blockNumber,
      deployedAt: new Date().toISOString()
    };
    
    const deploymentFile = path.join(__dirname, 'deployment.json');
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log('💾 Deployment info saved to:', deploymentFile);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
  }
}

deployContract();
