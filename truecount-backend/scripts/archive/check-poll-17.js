const { ethers } = require('hardhat');

async function checkPoll17() {
  try {
    const contract = await ethers.getContractAt('SealedVote', '0x5fbdb2315678afecb367f032d93f642f64180aa3');
    
    console.log('🔍 Checking Poll 17...');
    
    const commitEnd = await contract.getCommitEnd(17);
    const title = await contract.getTitle(17);
    const description = await contract.getDescription(17);
    const options = await contract.getOptions(17);
    const tally = await contract.getTally(17);
    
    const now = Math.floor(Date.now() / 1000);
    const commitEndTime = Number(commitEnd);
    const phase = now < commitEndTime ? 'COMMIT' : 'REVEAL';
    
    console.log('📝 Title:', title);
    console.log('📄 Description:', description);
    console.log('🎯 Options:', options);
    console.log('⏰ Commit ends at:', new Date(commitEndTime * 1000).toLocaleString());
    console.log('🕐 Current time:', new Date(now * 1000).toLocaleString());
    console.log('📊 Phase:', phase);
    console.log('📈 Tally:', tally.map(Number));
    
    // Check if we have committed
    const [owner] = await ethers.getSigners();
    const hasCommitted = await contract.hasCommitted(17, owner.address);
    const hasRevealed = await contract.hasRevealed(17, owner.address);
    
    console.log('🗳️ Has committed:', hasCommitted);
    console.log('🔓 Has revealed:', hasRevealed);
    
    if (phase === 'REVEAL' && hasCommitted && !hasRevealed) {
      console.log('✅ Ready to reveal vote!');
    } else if (phase === 'COMMIT') {
      console.log('⏳ Still in commit phase');
    } else if (hasRevealed) {
      console.log('✅ Vote already revealed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPoll17();
