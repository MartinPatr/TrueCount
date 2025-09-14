import { Address } from 'viem';

// Contract ABI for SealedVote contract
export const SEALED_VOTE_ABI = [
  {
    "inputs": [
      {"internalType": "uint8", "name": "numOptions", "type": "uint8"},
      {"internalType": "uint32", "name": "commitSeconds", "type": "uint32"},
      {"internalType": "uint32", "name": "revealSeconds", "type": "uint32"}
    ],
    "name": "createPoll",
    "outputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "pollId", "type": "uint256"},
      {"internalType": "bytes32", "name": "commitment", "type": "bytes32"}
    ],
    "name": "commit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "pollId", "type": "uint256"},
      {"internalType": "uint8", "name": "optionIndex", "type": "uint8"},
      {"internalType": "bytes32", "name": "salt", "type": "bytes32"}
    ],
    "name": "reveal",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "name": "finalize",
    "outputs": [{"internalType": "uint8", "name": "winning", "type": "uint8"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pollCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "name": "getPollTimes",
    "outputs": [
      {"internalType": "uint64", "name": "commitEnd", "type": "uint64"},
      {"internalType": "uint64", "name": "revealEnd", "type": "uint64"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "name": "getNumOptions",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "name": "getTally",
    "outputs": [
      {"internalType": "uint32[]", "name": "tally", "type": "uint32[]"},
      {"internalType": "bool", "name": "finalized", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "pollId", "type": "uint256"},
      {"internalType": "address", "name": "voter", "type": "address"}
    ],
    "name": "hasCommitted",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "pollId", "type": "uint256"},
      {"internalType": "address", "name": "voter", "type": "address"}
    ],
    "name": "hasRevealed",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

//UPDATE THIS WITH YOUR DEPLOYED CONTRACT ADDRESS
export const SEALED_VOTE_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3' as Address;

export type PollPhase = 'COMMIT' | 'REVEAL' | 'FINALIZE';

export interface PollData {
  id: string;
  commitEnd: number;
  revealEnd: number;
  numOptions: number;
  tally: number[];
  finalized: boolean;
  phase: PollPhase;
  timeRemaining: number;
}
