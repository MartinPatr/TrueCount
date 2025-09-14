'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePollCount } from '@/hooks/usePollData';
import { formatTimeRemaining } from '@/lib/voteUtils';

interface PollDisplay {
  id: string;
  title: string;
  description: string;
  phase: 'COMMIT' | 'REVEAL';
  timeRemaining: number;
  numOptions: number;
  totalVotes: number;
  isProtected: boolean;
}

export default function CurrentPolls() {
  const [polls, setPolls] = useState<PollDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: pollCount, error: pollCountError } = usePollCount();

  useEffect(() => {
    if (pollCountError) {
      setError('Failed to load polls from blockchain');
      setLoading(false);
      return;
    }

    if (!pollCount) {
      setLoading(true);
      return;
    }

    // For now, just show the latest few polls
    const latestPolls = [];
    const startId = Math.max(1, Number(pollCount) - 2); // Show last 3 polls
    
    for (let i = startId; i <= Number(pollCount); i++) {
      latestPolls.push({
        id: i.toString(),
        title: `Poll ${i}`,
        description: `This is poll number ${i} - a secure blockchain-based voting poll`,
        phase: 'COMMIT' as const,
        timeRemaining: 3600, // 1 hour
        numOptions: 3,
        totalVotes: 0,
        isProtected: false
      });
    }
    
    setPolls(latestPolls);
    setLoading(false);
  }, [pollCount, pollCountError]);

  if (loading) {
    return (
      <section className="relative py-20 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold gradient-text text-center mb-16">
            Current Polls
          </h2>
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative py-20 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold gradient-text text-center mb-16">
            Current Polls
          </h2>
          <div className="text-center py-20">
            <div className="text-red-400 text-lg mb-4">⚠️ {error}</div>
            <p className="text-gray-400">Please check your blockchain connection and try again.</p>
          </div>
        </div>
      </section>
    );
  }

  if (polls.length === 0) {
    return (
      <section className="relative py-20 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold gradient-text text-center mb-16">
            Current Polls
          </h2>
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🗳️</div>
            <h3 className="text-2xl font-bold text-white mb-4">No polls yet</h3>
            <p className="text-gray-400 mb-8">Be the first to create a poll and start the voting!</p>
            <Link 
              href="/create-poll" 
              className="inline-block px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg font-semibold text-white text-lg hover:shadow-2xl hover:shadow-teal-500/25 transition-all duration-300 transform hover:scale-105"
            >
              Create First Poll
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 px-6 z-10">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold gradient-text text-center mb-16">
          Current Polls
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {polls.map((poll) => (
            <div key={poll.id} className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    poll.phase === 'COMMIT' ? 'bg-teal-400 animate-glow' : 'bg-purple-400 animate-glow'
                  }`}></div>
                  <span className={`text-sm font-medium ${
                    poll.phase === 'COMMIT' ? 'text-teal-300' : 'text-purple-300'
                  }`}>
                    {poll.phase} PHASE
                  </span>
                </div>
                {poll.isProtected && (
                  <div className="text-yellow-400 text-sm">🔒 Protected</div>
                )}
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-teal-300 transition-colors">
                {poll.title}
              </h3>
              
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {poll.description}
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Options:</span>
                  <span className="text-white">{poll.numOptions}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Votes:</span>
                  <span className="text-white">{poll.totalVotes}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Time Left:</span>
                  <span className="text-white">{formatTimeRemaining(poll.timeRemaining)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link 
                  href={`/poll/${poll.id}`}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg font-semibold text-white text-center hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300 transform hover:scale-105"
                >
                  View Poll
                </Link>
                <Link 
                  href={`/poll/${poll.id}`}
                  className="px-4 py-2 glass rounded-lg font-semibold text-white hover:bg-white/10 transition-all duration-300 border border-white/20"
                >
                  Vote
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            href="/find-poll"
            className="inline-block px-8 py-4 glass rounded-lg font-semibold text-white text-lg hover:bg-white/10 transition-all duration-300 border border-white/20"
          >
            View All Polls
          </Link>
        </div>
      </div>
    </section>
  );
}
