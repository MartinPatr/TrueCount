'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAccount } from 'wagmi';
import Navigation from '@/components/Navigation';
import FloatingParticles from '@/components/FloatingParticles';
import FlowingBackground from '@/components/FlowingBackground';
import { usePollData, useCommitVote, useRevealVote, useHasCommitted, useHasRevealed } from '@/hooks/usePollData';
import { generateSalt, computeCommitment, storeVoteData, getVoteData, clearVoteData, formatTimeRemaining } from '@/lib/voteUtils';
import { showToast } from '@/components/Toast';

export default function PollDetailPage() {
  const params = useParams();
  const pollId = params.id as string;
  const { address } = useAccount();
  
  const pollData = usePollData(pollId);
  const hasCommitted = useHasCommitted(pollId, address || '');
  const hasRevealed = useHasRevealed(pollId, address || '');
  
  const { commitVote, isPending: isCommitting, isSuccess: commitSuccess } = useCommitVote();
  const { revealVote, isPending: isRevealing, isSuccess: revealSuccess } = useRevealVote();
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showRevealForm, setShowRevealForm] = useState(false);

  // Use real poll data from the blockchain
  const pollOptions = pollData?.options || [];

  useEffect(() => {
    if (commitSuccess) {
      showToast({
        type: 'success',
        title: 'Success!',
        description: 'Your vote has been committed. Wait for the reveal phase to make it count.',
      });
      
      // Auto-refresh the page after 2 seconds to show updated state
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [commitSuccess]);

  useEffect(() => {
    if (revealSuccess) {
      showToast({
        type: 'success',
        title: 'Vote Revealed!',
        description: 'Your vote has been successfully revealed and counted.',
      });
      setShowRevealForm(false);
      
      // Auto-refresh the page after 2 seconds to show updated tally
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  }, [revealSuccess]);


  const handleCommitVote = async () => {
    if (!address || selectedOption === null) return;

    try {
      const salt = generateSalt();
      const commitment = computeCommitment(selectedOption, salt, address, pollId);
      
      // Store vote data for later reveal
      storeVoteData(pollId, address, selectedOption, salt);
      
      await commitVote(pollId, commitment);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Commit Failed',
        description: 'Failed to commit your vote. Please try again.',
      });
    }
  };

  const handleRevealVote = async () => {
    if (!address) return;

    try {
      const voteData = getVoteData(pollId, address);
      if (!voteData) {
        showToast({
          type: 'error',
          title: 'No Vote Data',
          description: 'No committed vote found for this poll.',
        });
        return;
      }

      await revealVote(pollId, voteData.optionIndex, voteData.salt);
      clearVoteData(pollId, address);
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Reveal Failed',
        description: 'Failed to reveal your vote. Please try again.',
      });
    }
  };


  // Show loading state while data is being fetched
  if (!pollData) {
    return (
      <main className="relative min-h-screen overflow-x-hidden">
        <FlowingBackground />
        <FloatingParticles count={25} />
        <Navigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading poll data from blockchain...</p>
            <p className="text-gray-400 text-sm mt-2">This may take a moment</p>
          </div>
        </div>
      </main>
    );
  }

  const canVote = pollData.phase === 'COMMIT' && !hasCommitted.data;
  const canReveal = pollData.phase === 'REVEAL' && hasCommitted.data && !hasRevealed.data;

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <FlowingBackground />
      <FloatingParticles count={25} />
      <Navigation />

      <section className="relative py-20 px-6 z-10">
        <div className="max-w-4xl mx-auto">
          {/* Poll Header */}
          <div className="glass rounded-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {pollData.title}
                </h1>
                <p className="text-gray-300">
                  {pollData.description}
                </p>
              </div>
              <div className="text-right">
                <div className={`px-4 py-2 rounded-lg font-semibold ${
                  pollData.phase === 'COMMIT' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {pollData.phase} PHASE
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {pollData.timeRemaining > 0 ? formatTimeRemaining(pollData.timeRemaining) : 'Phase ended'}
                </p>
              </div>
            </div>

            {/* Phase Progress */}
            <div className="flex items-center justify-between mb-6">
              <div className={`flex-1 h-2 rounded-full mr-2 ${
                pollData.phase === 'COMMIT' ? 'bg-blue-500' : 'bg-blue-500/50'
              }`}></div>
              <div className={`flex-1 h-2 rounded-full ${
                pollData.phase === 'REVEAL' ? 'bg-yellow-500' : 'bg-yellow-500/30'
              }`}></div>
            </div>
          </div>

          {/* Status Messages */}
          {hasCommitted.data && pollData.phase === 'COMMIT' && (
            <div className="glass rounded-xl p-6 mb-8 bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Vote Committed</h3>
                  <p className="text-gray-300 text-sm">Your vote has been committed. Wait for the reveal phase to make it count.</p>
                </div>
              </div>
            </div>
          )}

          {hasRevealed.data && (
            <div className="glass rounded-xl p-6 mb-8 bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Vote Revealed</h3>
                  <p className="text-gray-300 text-sm">Your vote has been revealed and counted in the final tally.</p>
                </div>
              </div>
            </div>
          )}

          {/* Poll Closed Message */}
          {pollData.phase === 'REVEAL' && !hasCommitted.data && (
            <div className="glass rounded-xl p-6 mb-8 bg-gray-500/10 border border-gray-500/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">⏰</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">Voting Closed</h3>
                  <p className="text-gray-300 text-sm">The commit phase has ended. You can no longer vote, but you can still view results and reveal any committed votes.</p>
                </div>
              </div>
            </div>
          )}

          {/* Voting Interface */}
          {pollData.phase === 'COMMIT' && !hasCommitted.data && (
            <div className="glass rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Cast Your Vote</h2>
              <div className="space-y-4">
                {pollOptions.slice(0, pollData.numOptions).map((option, index) => (
                  <label key={index} className="flex items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="option"
                      value={index}
                      checked={selectedOption === index}
                      onChange={(e) => setSelectedOption(Number(e.target.value))}
                      className="w-4 h-4 text-teal-400 bg-white/5 border-white/20 focus:ring-teal-400 focus:ring-2"
                    />
                    <span className="ml-3 text-white font-medium">{option}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleCommitVote}
                disabled={selectedOption === null || isCommitting}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCommitting ? 'Committing...' : 'Commit Vote'}
              </button>
            </div>
          )}

          {/* Reveal Interface */}
          {pollData.phase === 'REVEAL' && hasCommitted.data && !hasRevealed.data && (
            <div className="glass rounded-xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Reveal Your Vote</h2>
              <p className="text-gray-300 mb-6">
                It's time to reveal your committed vote. This will make your choice public and count towards the final tally.
              </p>
              <button
                onClick={handleRevealVote}
                disabled={isRevealing}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRevealing ? 'Revealing...' : 'Reveal Vote'}
              </button>
            </div>
          )}


          {/* Results */}
          <div className="glass rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Results</h2>
            <div className="space-y-4">
              {pollOptions.slice(0, pollData.numOptions).map((option, index) => {
                const votes = pollData.tally[index] || 0;
                const totalVotes = pollData.tally.reduce((sum, count) => sum + count, 0);
                const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">{option}</span>
                      <span className="text-gray-300">{votes} votes ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {pollData.phase === 'REVEAL' && pollData.tally.some(votes => votes > 0) && (
              <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 font-semibold">
                  📊 Live Results - The current leader is: {pollOptions[pollData.tally.indexOf(Math.max(...pollData.tally))]}
                </p>
              </div>
            )}
            
            {/* Poll Info */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                <div>
                  <span className="font-semibold text-white">Poll ID:</span> {pollId}
                </div>
                <div>
                  <span className="font-semibold text-white">Creator:</span> {pollData.creator ? `${pollData.creator.slice(0, 6)}...${pollData.creator.slice(-4)}` : 'Unknown'}
                </div>
                <div>
                  <span className="font-semibold text-white">Total Votes:</span> {pollData.totalVotes}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
