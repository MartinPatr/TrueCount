import { Address } from 'viem';

// Contract ABI for SealedVote contract
export const SEALED_VOTE_ABI = [
  {
    "inputs": [
      {"internalType": "uint8", "name": "numOptions", "type": "uint8"},
      {"internalType": "uint32", "name": "commitSeconds", "type": "uint32"},
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "string[]", "name": "options", "type": "string[]"}
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
    "inputs": [],
    "name": "pollCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "name": "getCommitEnd",
    "outputs": [
      {"internalType": "uint64", "name": "commitEnd", "type": "uint64"}
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
      {"internalType": "uint32[]", "name": "tally", "type": "uint32[]"}
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
  },
  {
    "inputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "name": "getTitle",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "name": "getDescription",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "name": "getOptions",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "pollId", "type": "uint256"}],
    "name": "getCreator",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Contract address from environment variables
export const SEALED_VOTE_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3' as Address;

export type PollPhase = 'COMMIT' | 'REVEAL';

export interface PollData {
  id: string;
  title: string;
  description: string;
  commitEnd: number;
  numOptions: number;
  tally: number[];
  options: string[];
  phase: PollPhase;
  timeRemaining: number;
  totalVotes: number;
  isProtected: boolean;
  creator: string;
}
