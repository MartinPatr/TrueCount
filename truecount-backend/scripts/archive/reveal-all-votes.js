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

// Create clients
const publicClient = createPublicClient({
  transport: http('http://127.0.0.1:8545')
});

const CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3';

async function revealAllVotes() {
  try {
    console.log('🔓 Revealing all votes...');
    
    // Load vote data
    const voteDataFile = path.join(__dirname, 'vote-data.json');
    if (!fs.existsSync(voteDataFile)) {
      console.log('❌ No vote data found. Please run setup-demo-scenario.js first.');
      return;
    }
    
    const voteData = JSON.parse(fs.readFileSync(voteDataFile, 'utf8'));
    console.log(`📊 Found ${voteData.length} votes to reveal`);
    
    // Check if poll is in reveal phase
    const pollId = voteData[0].pollId;
    const commitEnd = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getCommitEnd',
      args: [pollId]
    });
    
    const now = Math.floor(Date.now() / 1000);
    const commitEndTime = Number(commitEnd);
    const phase = now < commitEndTime ? 'COMMIT' : 'REVEAL';
    
    console.log('⏰ Commit phase ended at:', new Date(commitEndTime * 1000).toLocaleString());
    console.log('🕐 Current time:', new Date(now * 1000).toLocaleString());
    console.log('📊 Phase:', phase);
    
    if (phase !== 'REVEAL') {
      console.log('❌ Poll is not in REVEAL phase yet. Please advance time first.');
      return;
    }
    
    // Reveal all votes
    for (let i = 0; i < voteData.length; i++) {
      const vote = voteData[i];
      const account = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
      
      const walletClient = createWalletClient({
        account,
        transport: http('http://127.0.0.1:8545')
      });
      
      console.log(`🔓 Revealing vote ${i + 1}/${voteData.length} for: ${vote.candidateName}`);
      
      try {
        // Reveal vote
        const revealTx = await walletClient.writeContract({
          address: CONTRACT_ADDRESS,
          abi: artifact.abi,
          functionName: 'reveal',
          args: [BigInt(vote.pollId), vote.optionIndex, vote.salt]
        });
        
        const revealReceipt = await publicClient.waitForTransactionReceipt({ hash: revealTx });
        console.log(`✅ Vote ${i + 1} revealed successfully!`);
        
        // Small delay between reveals
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.log(`❌ Vote ${i + 1} reveal failed:`, error.message);
      }
    }
    
    // Get final tally
    const tally = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getTally',
      args: [pollId]
    });
    
    const options = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getOptions',
      args: [pollId]
    });
    
    console.log('\n📊 Final Results:');
    const totalVotes = tally.reduce((sum, count) => sum + Number(count), 0);
    options.forEach((option, index) => {
      const votes = Number(tally[index]);
      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
      console.log(`   ${option}: ${votes} votes (${percentage.toFixed(1)}%)`);
    });
    
    console.log(`\n🎉 All votes revealed! Total: ${totalVotes} votes`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

revealAllVotes();
