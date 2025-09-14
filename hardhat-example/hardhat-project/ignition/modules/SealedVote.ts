import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SealedVoteModule = buildModule("SealedVoteModule", (m) => {
  // This line tells Ignition to deploy the compiled contract named "SealedVote"
  const sealedVote = m.contract("SealedVote");
  // Anything you want to reference later (address, etc.) should be returned
  return { sealedVote };
});

export default SealedVoteModule;