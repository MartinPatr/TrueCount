import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { SEALED_VOTE_ABI, SEALED_VOTE_ADDRESS } from '@/lib/contract';

// Create a public client for reading from the blockchain
const publicClient = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545'),
});

export async function POST(request: NextRequest) {
  try {
    const { pollId } = await request.json();

    if (!pollId) {
      return NextResponse.json({ error: 'Poll ID is required' }, { status: 400 });
    }

    // Fetch poll data from the blockchain
    const [commitEnd, numOptions, tally, title, description, options, creator] = await Promise.all([
      publicClient.readContract({
        address: SEALED_VOTE_ADDRESS,
        abi: SEALED_VOTE_ABI,
        functionName: 'getCommitEnd',
        args: [BigInt(pollId)],
      }),
      publicClient.readContract({
        address: SEALED_VOTE_ADDRESS,
        abi: SEALED_VOTE_ABI,
        functionName: 'getNumOptions',
        args: [BigInt(pollId)],
      }),
      publicClient.readContract({
        address: SEALED_VOTE_ADDRESS,
        abi: SEALED_VOTE_ABI,
        functionName: 'getTally',
        args: [BigInt(pollId)],
      }),
      publicClient.readContract({
        address: SEALED_VOTE_ADDRESS,
        abi: SEALED_VOTE_ABI,
        functionName: 'getTitle',
        args: [BigInt(pollId)],
      }),
      publicClient.readContract({
        address: SEALED_VOTE_ADDRESS,
        abi: SEALED_VOTE_ABI,
        functionName: 'getDescription',
        args: [BigInt(pollId)],
      }),
      publicClient.readContract({
        address: SEALED_VOTE_ADDRESS,
        abi: SEALED_VOTE_ABI,
        functionName: 'getOptions',
        args: [BigInt(pollId)],
      }),
      publicClient.readContract({
        address: SEALED_VOTE_ADDRESS,
        abi: SEALED_VOTE_ABI,
        functionName: 'getCreator',
        args: [BigInt(pollId)],
      }),
    ]);

    // Calculate phase and time remaining
    const now = Math.floor(Date.now() / 1000);
    const commitEndTime = Number(commitEnd);
    const phase = now < commitEndTime ? 'COMMIT' : 'REVEAL';
    const timeRemaining = Math.max(0, commitEndTime - now);

    // Calculate total votes
    const totalVotes = tally.reduce((sum, count) => sum + Number(count), 0);

    // Use real data from the smart contract
    const pollData = {
      id: pollId,
      title: title || `Poll ${pollId}`,
      description: description || `This is poll number ${pollId} - a secure blockchain-based voting poll created on TrueCount`,
      phase,
      timeRemaining,
      numOptions: Number(numOptions),
      totalVotes,
      isProtected: false, // This could be enhanced with additional contract logic
      options: options && options.length > 0 ? options : Array.from({ length: Number(numOptions) }, (_, i) => `Option ${i + 1}`),
      tally: tally.map(Number),
      creator: creator,
    };

    return NextResponse.json(pollData);
  } catch (error) {
    console.error('Error fetching poll data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch poll data from blockchain' },
      { status: 500 }
    );
  }
}
