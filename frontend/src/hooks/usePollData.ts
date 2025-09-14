import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { SEALED_VOTE_ABI, SEALED_VOTE_ADDRESS, PollData, PollPhase } from '@/lib/contract';
import { useEffect, useState } from 'react';

export function usePollCount() {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: 'pollCount',
  });
}

export function usePollTimes(pollId: string) {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: 'getPollTimes',
    args: [BigInt(pollId)],
  });
}

export function useNumOptions(pollId: string) {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: 'getNumOptions',
    args: [BigInt(pollId)],
  });
}

export function useTally(pollId: string) {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: 'getTally',
    args: [BigInt(pollId)],
  });
}

export function useHasCommitted(pollId: string, voter: string) {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: 'hasCommitted',
    args: [BigInt(pollId), voter as `0x${string}`],
  });
}

export function useHasRevealed(pollId: string, voter: string) {
  return useReadContract({
    address: SEALED_VOTE_ADDRESS,
    abi: SEALED_VOTE_ABI,
    functionName: 'hasRevealed',
    args: [BigInt(pollId), voter as `0x${string}`],
  });
}

export function usePollData(pollId: string): PollData | null {
  const { data: times } = usePollTimes(pollId);
  const { data: numOptions } = useNumOptions(pollId);
  const { data: tallyData } = useTally(pollId);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [phase, setPhase] = useState<PollPhase>('COMMIT');

  useEffect(() => {
    if (!times) return;

    const [commitEnd, revealEnd] = times;
    const now = Math.floor(Date.now() / 1000);
    
    const updatePhase = () => {
      if (now < Number(commitEnd)) {
        setPhase('COMMIT');
        setTimeRemaining(Number(commitEnd) - now);
      } else if (now < Number(revealEnd)) {
        setPhase('REVEAL');
        setTimeRemaining(Number(revealEnd) - now);
      } else {
        setPhase('FINALIZE');
        setTimeRemaining(0);
      }
    };

    updatePhase();
    const interval = setInterval(updatePhase, 1000);
    return () => clearInterval(interval);
  }, [times]);

  if (!times || !numOptions || !tallyData) return null;

  const [tally, finalized] = tallyData;

  return {
    id: pollId,
    commitEnd: Number(times[0]),
    revealEnd: Number(times[1]),
    numOptions: Number(numOptions),
    tally: tally.map(Number),
    finalized,
    phase,
    timeRemaining,
  };
}

export function useCreatePoll() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const createPoll = (numOptions: number, commitSeconds: number, revealSeconds: number) => {
    writeContract({
      address: SEALED_VOTE_ADDRESS,
      abi: SEALED_VOTE_ABI,
      functionName: 'createPoll',
      args: [numOptions, commitSeconds, revealSeconds],
    });
  };

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

export function useFinalizePoll() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const finalizePoll = (pollId: string) => {
    writeContract({
      address: SEALED_VOTE_ADDRESS,
      abi: SEALED_VOTE_ABI,
      functionName: 'finalize',
      args: [BigInt(pollId)],
    });
  };

  return {
    finalizePoll,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
