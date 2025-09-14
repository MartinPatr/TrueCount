'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import FloatingParticles from '@/components/FloatingParticles';
import FlowingBackground from '@/components/FlowingBackground';
import { usePollCount, usePollData } from '@/hooks/usePollData';
import { formatTimeRemaining } from '@/lib/voteUtils';

export default function FindPollPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  interface Poll {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    createdAt: string;
    votes: number;
    options: string[];
    isProtected: boolean;
    phase: string;
    timeRemaining: number;
  }

  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  const { address } = useAccount();
  const { data: pollCount } = usePollCount();

  const loadPollData = useCallback(async (pollId: string): Promise<Poll> => {
    try {
      const response = await fetch('/api/poll-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pollId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch poll data');
      }

      const pollData = await response.json();
      
      // Determine status based on phase
      const status = pollData.phase === 'COMMIT' ? 'open' : 'closed';
      
      return {
        id: pollData.id,
        title: pollData.title,
        description: pollData.description,
        category: 'general', // This could be enhanced with additional contract logic
        status,
        createdAt: new Date().toISOString(), // This could be enhanced with creation time from contract
        votes: pollData.totalVotes,
        options: pollData.options,
        isProtected: pollData.isProtected,
        phase: pollData.phase,
        timeRemaining: pollData.timeRemaining
      };
    } catch (error) {
      console.error('Error loading poll data:', error);
      // Fallback to basic data if API fails
      return {
        id: pollId,
        title: `Poll ${pollId}`,
        description: `This is poll number ${pollId}`,
        category: 'general',
        status: 'active',
        createdAt: new Date().toISOString(),
        votes: 0,
        options: ['Option 1', 'Option 2'],
        isProtected: false,
        phase: 'COMMIT',
        timeRemaining: 0
      };
    }
  }, []);

  // Load polls from contract
  useEffect(() => {
    if (pollCount) {
      setIsLoading(true);
      const pollPromises = [];
      for (let i = 1; i <= Number(pollCount); i++) {
        pollPromises.push(loadPollData(i.toString()));
      }
      Promise.all(pollPromises).then((polls) => {
        setPolls(polls);
        setIsLoading(false);
      }).catch((error) => {
        console.error('Error loading polls:', error);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [pollCount, loadPollData]);

  // Timer to update current time and recalculate time remaining
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Refresh poll data every 30 seconds to update time remaining
  useEffect(() => {
    if (!pollCount || Number(pollCount) === 0) return;

    const refreshInterval = setInterval(() => {
      const pollPromises = Array.from({ length: Number(pollCount) }, (_, i) => 
        loadPollData((i + 1).toString())
      );

      Promise.all(pollPromises).then((polls) => {
        setPolls(polls);
      }).catch((error) => {
        console.error('Error refreshing polls:', error);
      });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [pollCount, loadPollData]);

  // Helper function to format time remaining
  const formatTimeRemaining = (timeRemaining: number) => {
    if (timeRemaining <= 0) return 'Expired';
    
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const filteredPolls = polls.filter(poll => {
    const title = poll.title || '';
    const description = poll.description || '';
    const id = poll.id || '';
    
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         id.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || poll.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || poll.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedPolls = [...filteredPolls].sort((a, b) => {
    if (sortBy === 'recent') {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    } else if (sortBy === 'popular') {
      const aVotes = a.votes || 0;
      const bVotes = b.votes || 0;
      return bVotes - aVotes;
    }
    return 0;
  });

  const handlePollAccess = (pollId: string, isProtected: boolean) => {
    if (isProtected) {
      setSelectedPollId(pollId);
      setShowPasswordModal(true);
    } else {
      // Navigate to poll details
      window.location.href = `/poll/${pollId}`;
    }
  };

  const handlePasswordSubmit = () => {
    if (password) {
      // Handle password verification
      console.log('Verifying password for poll:', selectedPollId);
      setShowPasswordModal(false);
      setPassword('');
      setSelectedPollId(null);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Background Effects */}
      <FlowingBackground />
      <FloatingParticles count={25} />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <section className="relative py-20 px-6 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
              Find Poll
            </h1>
            <p className="text-xl text-gray-300">
              Discover and participate in community polls
            </p>
          </div>

          {/* Search and Filters */}
          <div className="glass rounded-xl p-6 mb-8">
            <div className="space-y-6">
              {/* Search Bar */}
              <div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by poll title, keyword, or ID…"
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300"
                />
                <p className="text-sm text-gray-400 mt-2">
                  Example: "e.g., Waterloo Engineering Society President Election Vote"
                </p>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Filter by category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300"
                  >
                    <option value="all">All Categories</option>
                    <option value="hackathon">Hackathon</option>
                    <option value="governance">Governance</option>
                    <option value="technology">Technology</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Filter by status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Sort by</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Poll Results */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="glass rounded-xl p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Loading polls from blockchain...
                </h3>
                <p className="text-gray-400">
                  Fetching poll data and metadata
                </p>
              </div>
            ) : sortedPolls.length > 0 ? (
              sortedPolls.map((poll) => (
                <div key={poll.id} className="glass rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {poll.title}
                      </h3>
                      <p className="text-gray-300 mb-3">
                        {poll.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <span className="px-2 py-1 bg-white/10 rounded">
                          {poll.category}
                        </span>
                        <span className={`px-2 py-1 rounded ${
                          poll.status === 'open' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                        }`}>
                          {poll.status}
                        </span>
                        <span>{poll.votes} votes</span>
                        {poll.phase === 'COMMIT' && poll.timeRemaining > 0 && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                            ⏰ {formatTimeRemaining(poll.timeRemaining)} left
                          </span>
                        )}
                        {poll.phase === 'REVEAL' && (
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded">
                            🔓 Reveal Phase
                          </span>
                        )}
                        {poll.isProtected && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">
                            🔒 Protected
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handlePollAccess(poll.id, poll.isProtected)}
                        className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
                          poll.status === 'open' 
                            ? 'bg-gradient-to-r from-teal-500 to-blue-500 hover:shadow-lg hover:shadow-teal-500/25' 
                            : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:shadow-lg hover:shadow-gray-500/25'
                        }`}
                      >
                        {poll.isProtected ? 'Access Poll →' : poll.status === 'open' ? 'View Details →' : 'View Results →'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass rounded-xl p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No polls match your search criteria.
                </h3>
                <p className="text-gray-400">
                  Try adjusting your keywords or browse recent polls.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="glass rounded-xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              This poll requires a code to access.
            </h3>
            <p className="text-gray-400 mb-6">
              Enter the code provided by the poll creator.
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter access code"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300 mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setSelectedPollId(null);
                }}
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300"
              >
                Access Poll →
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
