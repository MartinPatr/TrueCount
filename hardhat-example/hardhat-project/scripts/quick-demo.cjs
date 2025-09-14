const { createPublicClient, createWalletClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');

const abi = [
  'function createPoll(uint8,uint32,uint32) returns (uint256)',
  'function getPollTimes(uint256) view returns (uint64,uint64)',
  'function getNumOptions(uint256) view returns (uint8)',
  'function getTally(uint256) view returns (uint32[] memory,bool)',
];

const RPC = process.env.RPC_URL || 'http://127.0.0.1:8545';
const CONTRACT = process.env.CONTRACT_ADDRESS;
if (!CONTRACT) { console.error('Set CONTRACT_ADDRESS'); process.exit(1); }

const pub = createPublicClient({ transport: http(RPC) });
const account0 = privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'); // HH acct #0
const wallet = createWalletClient({ account: account0, transport: http(RPC) });

(async () => {
  const hash = await wallet.writeContract({
    address: CONTRACT, abi, functionName: 'createPoll', args: [3, 60, 60]
  });
  await pub.waitForTransactionReceipt({ hash });
  console.log('Created poll #1');

  const [commitEnd, revealEnd] = await pub.readContract({
    address: CONTRACT, abi, functionName: 'getPollTimes', args: [1n]
  });
  const numOptions = await pub.readContract({
    address: CONTRACT, abi, functionName: 'getNumOptions', args: [1n]
  });
  const [tally, finalized] = await pub.readContract({
    address: CONTRACT, abi, functionName: 'getTally', args: [1n]
  });

  console.log({ commitEnd: Number(commitEnd), revealEnd: Number(revealEnd), numOptions, tally: tally.map(Number), finalized });
})();
