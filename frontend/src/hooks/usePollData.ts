import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SEALED_VOTE_ABI, SEALED_VOTE_ADDRESS, PollData, PollPhase } from '@/lib/contract';
import { useEffect, useState } from 'react';

export function usePollCount() {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: 'pollCount',
    query: {
      retry: 3,
      retryDelay: 1000,
    },
  });
}

export function useCommitEnd(pollId: string) {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: 'getCommitEnd',
    args: [BigInt(pollId)],
    query: {
      retry: 3,
      retryDelay: 1000,
    },
  });
}

export function useNumOptions(pollId: string) {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: 'getNumOptions',
    args: [BigInt(pollId)],
    query: {
      retry: 3,
      retryDelay: 1000,
    },
  });
}

export function useTally(pollId: string) {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: 'getTally',
    args: [BigInt(pollId)],
    query: {
      retry: 3,
      retryDelay: 1000,
    },
  });
}

export function useHasCommitted(pollId: string, voter: string) {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: 'hasCommitted',
    args: [BigInt(pollId), voter as `0x${string}`],
    query: {
      retry: 3,
      retryDelay: 1000,
    },
  });
}

export function useHasRevealed(pollId: string, voter: string) {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: 'hasRevealed',
    args: [BigInt(pollId), voter as `0x${string}`],
    query: {
      retry: 3,
      retryDelay: 1000,
    },
  });
}

export function usePollTitle(pollId: string) {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: 'getTitle',
    args: [BigInt(pollId)],
    query: {
      retry: 3,
      retryDelay: 1000,
    },
  });
}

export function usePollDescription(pollId: string) {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: 'getDescription',
    args: [BigInt(pollId)],
    query: {
      retry: 3,
      retryDelay: 1000,
    },
  });
}

export function usePollOptions(pollId: string) {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: 'getOptions',
    args: [BigInt(pollId)],
    query: {
      retry: 3,
      retryDelay: 1000,
    },
  });
}

export function usePollCreator(pollId: string) {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: 'getCreator',
    args: [BigInt(pollId)],
    query: {
      retry: 3,
      retryDelay: 1000,
    },
  });
}

export function usePollData(pollId: string): PollData | null {
  const { data: commitEnd } = useCommitEnd(pollId);
  const { data: numOptions } = useNumOptions(pollId);
  const { data: tally } = useTally(pollId);
  const { data: title } = usePollTitle(pollId);
  const { data: description } = usePollDescription(pollId);
  const { data: options } = usePollOptions(pollId);
  const { data: creator } = usePollCreator(pollId);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [phase, setPhase] = useState<PollPhase>('COMMIT');

  useEffect(() => {
    if (!commitEnd) return;
    
    const updatePhase = () => {
      const now = Math.floor(Date.now() / 1000);
      const commitEndTime = Number(commitEnd);
      
      if (now < commitEndTime) {
        setPhase('COMMIT');
        setTimeRemaining(commitEndTime - now);
      } else {
        setPhase('REVEAL');
        setTimeRemaining(0); // Reveal phase is unlimited now
      }
    };

    updatePhase();
    const interval = setInterval(updatePhase, 1000);
    return () => clearInterval(interval);
  }, [commitEnd]);

  if (!commitEnd || !numOptions || !tally) return null;

  const totalVotes = tally.reduce((sum, count) => sum + Number(count), 0);

  return {
    id: pollId,
    title: title || `Poll ${pollId}`,
    description: description || `This is poll number ${pollId} - a secure blockchain-based voting poll created on TrueCount`,
    commitEnd: Number(commitEnd),
    numOptions: Number(numOptions),
    tally: tally.map(Number),
    options: options && options.length > 0 ? [...options] : Array.from({ length: Number(numOptions) }, (_, i) => `Option ${i + 1}`),
    phase,
    timeRemaining,
    totalVotes,
    isProtected: false,
    creator: creator || '',
  };
}

export function useCreatePoll() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createPoll = async (numOptions: number, commitHours: number, title: string, description: string, options: string[]) => {
    // Convert hours to seconds
    const commitSeconds = commitHours * 3600;
    console.log('Creating poll with:', { numOptions, commitHours, commitSeconds, title, description, options, address: SEALED_VOTE_ADDRESS });
    console.log('Current chain ID:', window.ethereum?.chainId);
    console.log('Current account:', window.ethereum?.selectedAddress);
    
    try {
      // Wait a bit longer to ensure blockchain is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Reset wallet nonce by requesting account access
      if (window.ethereum?.request) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      }
      
      writeContract({
        address: SEALED_VOTE_ADDRESS,
        abi: SEALED_VOTE_ABI,
        functionName: 'createPoll',
        args: [numOptions, commitSeconds, title, description, options],
      });
    } catch (err) {
      console.error('Error in createPoll:', err);
    }
  };

  // Log errors for debugging
  if (error) {
    console.error('Create poll error:', error);
  }

  return {
    createPoll,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useCommitVote() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const commitVote = (pollId: string, commitment: `0x${string}`) => {
    writeContract({
      address: SEALED_VOTE_ADDRESS,
      abi: SEALED_VOTE_ABI,
      functionName: 'commit',
      args: [BigInt(pollId), commitment],
    });
  };

  return {
    commitVote,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

export function useRevealVote() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const revealVote = (pollId: string, optionIndex: number, salt: `0x${string}`) => {
    writeContract({
      address: SEALED_VOTE_ADDRESS,
      abi: SEALED_VOTE_ABI,
      functionName: 'reveal',
      args: [BigInt(pollId), optionIndex, salt],
    });
  };

  return {
    revealVote,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

