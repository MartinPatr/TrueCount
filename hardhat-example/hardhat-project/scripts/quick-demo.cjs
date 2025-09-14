const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { createPublicClient, createWalletClient, http, keccak256, encodePacked } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

// scripts/e2e-safe.cjs

// Set up RPC URL and contract address
const RPC = process.env.RPC_URL || 'http://127.0.0.1:8545';
const CONTRACT = process.env.CONTRACT_ADDRESS;
if (!CONTRACT) { 
  console.error('Set CONTRACT_ADDRESS=0x...'); 
  process.exit(1); 
}

// Load contract ABI from artifact
const artifactPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'SealedVote.sol', 'SealedVote.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
const abi = artifact.abi;

// Create accounts from private keys
const acct0 = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
const acct1 = privateKeyToAccount('0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d');

// Create public and wallet clients for interacting with the blockchain
const pub = createPublicClient({ transport: http(RPC) });
const w0  = createWalletClient({ account: acct0, transport: http(RPC) });
const w1  = createWalletClient({ account: acct1, transport: http(RPC) });

// Function to get the current block timestamp
async function nowOnChain() {
  const b = await pub.getBlock();
  return Number(b.timestamp);
}

// Function to advance the blockchain time to a target timestamp
/**
 * Advances the blockchain time to a specified target timestamp.
 *
 * This function calculates the difference between the current blockchain time
 * and the target timestamp. If the target timestamp is in the future, it will
 * increase the blockchain time by the necessary amount and mine a new block.
 *
 * @param {number} tsTarget - The target timestamp to advance to.
 * @returns {Promise<void>} A promise that resolves when the time has been advanced.
 *
 * @throws Will throw an error if the time cannot be increased or mined.
 */
async function advanceTo(tsTarget) {
  const ts = await nowOnChain();
  const delta = Math.max(0, tsTarget - ts + 1); // +1s to be strictly after
  if (delta > 0) {
    await pub.request({ method: 'evm_increaseTime', params: [delta] });
    await pub.request({ method: 'evm_mine' });
  }
}

// Main asynchronous function to execute the demo
(async () => {
  console.log('RPC:', RPC);
  console.log('Contract:', CONTRACT);

  // 1) Create poll with comfortable windows
  const commitSecs = 120; // Duration for commit phase
  const revealSecs = 120;  // Duration for reveal phase
  const txCreate = await w0.writeContract({ address: CONTRACT, abi, functionName: 'createPoll', args: [3, commitSecs, revealSecs] });
  await pub.waitForTransactionReceipt({ hash: txCreate });

  // Get the poll ID and its timing details
  const pollId = await pub.readContract({ address: CONTRACT, abi, functionName: 'pollCount' });
  const [commitEnd, revealEnd] = await pub.readContract({ address: CONTRACT, abi, functionName: 'getPollTimes', args: [pollId] });
  console.log('✅ pollId', pollId.toString(), 'commitEnd', Number(commitEnd), 'revealEnd', Number(revealEnd));

  // 2) Commit votes from both accounts
  const opt0 = 2, opt1 = 1; // Options chosen by each account
  const salt0 = '0x' + '11'.repeat(32); // Salt for acct0
  const salt1 = '0x' + '22'.repeat(32); // Salt for acct1
  const comm0 = keccak256(encodePacked(['uint8','bytes32','address','uint256'], [opt0, salt0, acct0.address, pollId])); // Commit hash for acct0
  const comm1 = keccak256(encodePacked(['uint8','bytes32','address','uint256'], [opt1, salt1, acct1.address, pollId])); // Commit hash for acct1

  // Wait for transaction receipts for both commits
  await pub.waitForTransactionReceipt({ hash: await w0.writeContract({ address: CONTRACT, abi, functionName: 'commit', args: [pollId, comm0] }) });
  await pub.waitForTransactionReceipt({ hash: await w1.writeContract({ address: CONTRACT, abi, functionName: 'commit', args: [pollId, comm1] }) });
  console.log('✅ committed from acct0 & acct1');

  // 3) Advance time to the reveal phase (exactly after commitEnd)
  await advanceTo(Number(commitEnd));
  const t1 = await nowOnChain();
  console.log('⏩ at', t1, '(should be >= commitEnd and < revealEnd)');

  // Sanity check: ensure we are still within the reveal window
  if (!(t1 >= Number(commitEnd) && t1 < Number(revealEnd))) {
    throw new Error('Not in REVEAL phase after advance');
  }

  // Reveal vote from acct0 only
  await pub.waitForTransactionReceipt({ hash: await w0.writeContract({ address: CONTRACT, abi, functionName: 'reveal', args: [pollId, opt0, salt0] }) });
  console.log('✅ acct0 revealed');

  // 4) Advance time to finalize phase (strictly after revealEnd)
  await advanceTo(Number(revealEnd));
  const t2 = await nowOnChain();
  console.log('⏩ at', t2, '(should be >= revealEnd)');

  // Finalize the poll
  await pub.waitForTransactionReceipt({ hash: await w0.writeContract({ address: CONTRACT, abi, functionName: 'finalize', args: [pollId] }) });
  console.log('✅ finalized');

  // Get the tally of votes and check if finalized
  const [tally, finalized] = await pub.readContract({ address: CONTRACT, abi, functionName: 'getTally', args: [pollId] });
  const nums = tally.map(Number);
  console.log('tally', nums, 'finalized', finalized);

  // Assertions to verify the results
  assert.equal(finalized, true);
  assert.equal(nums[opt0], 1, 'revealed vote counted');
  assert.equal(nums[opt1], 0, 'unrevealed vote ignored');

  console.log('🎉 E2E safe flow passed');
})().catch((e) => { 
  console.error(e); 
  process.exit(1); 
});