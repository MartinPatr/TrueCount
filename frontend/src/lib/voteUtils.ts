import { keccak256, encodePacked } from 'viem';

// Generate a 32-byte random salt
export function generateSalt(): `0x${string}` {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return `0x${Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')}`;
}

// Compute commitment hash
export function computeCommitment(
  optionIndex: number,
  salt: `0x${string}`,
  voter: `0x${string}`,
  pollId: string
): `0x${string}` {
  return keccak256(
    encodePacked(
      ['uint8', 'bytes32', 'address', 'uint256'],
      [optionIndex, salt, voter, BigInt(pollId)]
    )
  );
}

// Store vote data in localStorage
export function storeVoteData(pollId: string, voter: string, optionIndex: number, salt: `0x${string}`) {
  const key = `vote_${pollId}_${voter}`;
  const data = { optionIndex, salt };
  localStorage.setItem(key, JSON.stringify(data));
}

// Retrieve vote data from localStorage
export function getVoteData(pollId: string, voter: string): { optionIndex: number; salt: `0x${string}` } | null {
  const key = `vote_${pollId}_${voter}`;
  const data = localStorage.getItem(key);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Remove vote data from localStorage
export function clearVoteData(pollId: string, voter: string) {
  const key = `vote_${pollId}_${voter}`;
  localStorage.removeItem(key);
}

// Format time remaining for display
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '0s';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
}
