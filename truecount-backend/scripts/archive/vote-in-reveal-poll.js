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
const USER_ADDRESS = '0xdD2FD4581271e230360230F9337D5c0430Bf44C0';

async function voteInRevealPoll() {
  try {
    console.log('🏛️ Voting in Student Government Poll - Ready for Reveal');
    
    // Use poll 1 which is already in REVEAL phase
    const pollId = 1;
    
    // Get poll details
    const title = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getTitle',
      args: [pollId]
    });
    
    const description = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getDescription',
      args: [pollId]
    });
    
    const options = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getOptions',
      args: [pollId]
    });
    
    const commitEnd = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'getCommitEnd',
      args: [pollId]
    });
    
    const now = Math.floor(Date.now() / 1000);
    const commitEndTime = Number(commitEnd);
    const phase = now < commitEndTime ? 'COMMIT' : 'REVEAL';
    
    console.log(`\n📊 Poll ${pollId}: ${title}`);
    console.log('📄 Description:', description);
    console.log('🎯 Options:');
    options.forEach((option, index) => {
      console.log(`   ${index}: ${option}`);
    });
    
    console.log('\n⏰ Timing:');
    console.log('🕐 Current time:', new Date(now * 1000).toLocaleString());
    console.log('⏰ Commit ended at:', new Date(commitEndTime * 1000).toLocaleString());
    console.log('📊 Phase:', phase);
    
    if (phase !== 'REVEAL') {
      console.log('❌ Poll is not in reveal phase yet. Advancing time...');
      
      // Mine blocks to advance time
      for (let i = 0; i < 1000; i++) {
        try {
          await walletClient.sendTransaction({
            to: account.address,
            value: 0n,
            data: '0x'
          });
        } catch (error) {
          // Ignore errors
        }
      }
      
      console.log('✅ Time advanced!');
    }
    
    // Check if we can still commit (we shouldn't be able to)
    const hasCommitted = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'hasCommitted',
      args: [pollId, USER_ADDRESS]
    });
    
    const hasRevealed = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: artifact.abi,
      functionName: 'hasRevealed',
      args: [pollId, USER_ADDRESS]
    });
    
    console.log('\n👤 Your Vote Status:');
    console.log('🗳️ Has committed:', hasCommitted);
    console.log('🔓 Has revealed:', hasRevealed);
    
    if (!hasCommitted) {
      console.log('\n❌ No vote to reveal. Need to commit a vote first.');
      console.log('📝 Note: This poll is in REVEAL phase, so we cannot commit new votes.');
      console.log('💡 For demo purposes, let\'s create a new poll that we can vote in.');
      
      // Create a new poll with a short commit phase
      console.log('\n🏛️ Creating new Student Government poll...');
      
      const newCommitSeconds = 10; // 10 seconds
      const newTitle = 'Student Government President Election 2024 - Demo';
      const newDescription = 'Vote for your preferred candidate for Student Government President. This election will determine who will represent the student body for the upcoming academic year.';
      const newOptions = [
        'Alex Johnson - "Transparency & Student Voice"',
        'Sarah Chen - "Sustainability & Innovation"', 
        'Marcus Rodriguez - "Diversity & Inclusion"',
        'Taylor Kim - "Academic Excellence & Support"'
      ];
      
      const createPollHash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: artifact.abi,
        functionName: 'createPoll',
        args: [4, newCommitSeconds, newTitle, newDescription, newOptions]
      });
      
      const createPollReceipt = await publicClient.waitForTransactionReceipt({ hash: createPollHash });
      console.log('✅ New poll created successfully!');
      
      // Get the new poll ID
      const pollCount = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: artifact.abi,
        functionName: 'pollCount'
      });
      
      const newPollId = Number(pollCount);
      console.log('📊 New Poll ID:', newPollId);
      
      // Vote in the new poll
      console.log('\n🗳️ Voting in new poll...');
      
      const voteOption = 1; // Sarah Chen
      const salt = '0x' + Array.from({length: 32}, () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('');
      
      const commitment = keccak256(encodePacked(
        ['uint8', 'bytes32', 'address', 'uint256'],
        [voteOption, salt, USER_ADDRESS, BigInt(newPollId)]
      ));
      
      console.log('🔐 Vote option:', voteOption, `(${newOptions[voteOption]})`);
      console.log('🔑 Salt:', salt);
      console.log('📝 Commitment:', commitment);
      console.log('👤 Voter address:', USER_ADDRESS);
      
      const commitHash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: artifact.abi,
        functionName: 'commit',
        args: [newPollId, commitment]
      });
      
      const commitReceipt = await publicClient.waitForTransactionReceipt({ hash: commitHash });
      console.log('✅ Vote committed successfully!');
      
      // Wait for commit phase to end
      console.log('\n⏳ Waiting for commit phase to end...');
      await new Promise(resolve => setTimeout(resolve, 12000)); // Wait 12 seconds
      
      // Mine blocks to ensure time has advanced
      console.log('⛏️ Mining blocks to advance time...');
      for (let i = 0; i < 1000; i++) {
        try {
          await walletClient.sendTransaction({
            to: account.address,
            value: 0n,
            data: '0x'
          });
        } catch (error) {
          // Ignore errors
        }
      }
      
      // Check final status
      const finalCommitEnd = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: artifact.abi,
        functionName: 'getCommitEnd',
        args: [newPollId]
      });
      
      const finalNow = Math.floor(Date.now() / 1000);
      const finalCommitEndTime = Number(finalCommitEnd);
      const finalPhase = finalNow < finalCommitEndTime ? 'COMMIT' : 'REVEAL';
      
      console.log('\n⏰ Final Status:');
      console.log('🕐 Current time:', new Date(finalNow * 1000).toLocaleString());
      console.log('⏰ Commit ended at:', new Date(finalCommitEndTime * 1000).toLocaleString());
      console.log('📊 Phase:', finalPhase);
      
      // Show current tally
      const tally = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: artifact.abi,
        functionName: 'getTally',
        args: [newPollId]
      });
      
      console.log('\n📊 Current Tally:');
      newOptions.forEach((option, index) => {
        console.log(`   ${index}: ${option} - ${tally[index]} votes`);
      });
      
      if (finalPhase === 'REVEAL') {
        console.log('\n🎉 PERFECT! Poll is ready for reveal demo!');
        console.log('📋 Demo Instructions:');
        console.log(`1. Go to the frontend and find poll ID ${newPollId}`);
        console.log('2. The poll should show "REVEAL PHASE"');
        console.log('3. Click the reveal button to show your vote for Sarah Chen');
        console.log('4. Watch Sarah Chen\'s vote count increase from 0 to 1');
        console.log('5. The vote will be publicly counted and verifiable');
        
        // Store the vote data for reveal
        const voteData = {
          pollId: newPollId,
          optionIndex: voteOption,
          salt: salt,
          commitment: commitment,
          voterAddress: USER_ADDRESS,
          candidateName: newOptions[voteOption]
        };
        
        console.log('\n💾 Vote Data for Reveal:');
        console.log(JSON.stringify(voteData, null, 2));
        
        console.log('\n🚀 Ready to demonstrate the reveal feature!');
        
      } else {
        console.log('❌ Poll still not in reveal phase. Time advancement may not be working properly.');
      }
      
    } else {
      console.log('\n✅ You have a vote to reveal!');
      console.log('📋 Demo Instructions:');
      console.log(`1. Go to the frontend and find poll ID ${pollId}`);
      console.log('2. The poll should show "REVEAL PHASE"');
      console.log('3. Click the reveal button to show your vote');
      console.log('4. Watch the vote count increase');
      console.log('5. The vote will be publicly counted and verifiable');
    }
    
  } catch (error) {
    console.error('❌ Demo setup failed:', error);
  }
}

voteInRevealPoll();
