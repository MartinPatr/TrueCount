const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Setting up demo poll...");
  
  // Get the contract
  const SealedVote = await ethers.getContractAt("SealedVote", "0x5fbdb2315678afecb367f032d93f642f64180aa3");
  
  // Create a demo poll with 2 hours duration
  const commitSeconds = 2 * 3600; // 2 hours
  const title = "Demo Poll - Vote and Reveal";
  const description = "This is a demo poll to test the voting and reveal functionality. You can vote in this poll and then reveal your vote.";
  const options = ["Option A", "Option B"];
  
  console.log("📝 Creating demo poll...");
  const tx = await SealedVote.createPoll(2, commitSeconds, title, description, options);
  await tx.wait();
  
  console.log("✅ Demo poll created!");
  console.log("📊 Poll ID: 2");
  console.log("⏰ Commit phase: 2 hours");
  console.log("🎯 Options: Option A, Option B");
  
  // Now vote in the poll
  console.log("\n🗳️ Voting in the demo poll...");
  
  // Generate a random vote (0 for Option A, 1 for Option B)
  const voteOption = 0; // Vote for Option A
  const salt = ethers.randomBytes(32);
  const commitment = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(
    ["uint8", "bytes32", "address", "uint256"],
    [voteOption, salt, await ethers.provider.getSigner().getAddress(), 2]
  ));
  
  const commitTx = await SealedVote.commit(2, commitment);
  await commitTx.wait();
  
  console.log("✅ Vote committed!");
  console.log("🔐 Vote option:", voteOption);
  console.log("🔑 Salt:", ethers.hexlify(salt));
  console.log("📝 Commitment:", commitment);
  
  // Store the vote data for later reveal
  const voteData = {
    pollId: 2,
    optionIndex: voteOption,
    salt: ethers.hexlify(salt),
    commitment: commitment
  };
  
  console.log("\n💾 Vote data for reveal:");
  console.log(JSON.stringify(voteData, null, 2));
  
  console.log("\n🎉 Demo setup complete!");
  console.log("📋 Next steps:");
  console.log("1. Go to the frontend and find poll ID 2");
  console.log("2. You can reveal your vote after the commit phase ends");
  console.log("3. Create another poll to test the full voting flow");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
