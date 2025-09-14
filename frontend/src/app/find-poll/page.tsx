'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import FloatingParticles from '@/components/FloatingParticles';
import FlowingBackground from '@/components/FlowingBackground';

export default function FindPollPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState<string | null>(null);
  const [password, setPassword] = useState('');

  // Mock data for demonstration
  const mockPolls = [
    {
      id: '1',
      title: 'Which project should win the People\'s Choice Award?',
      description: 'Vote for your favorite project from the second round presentations.',
      category: 'hackathon',
      status: 'open',
      isProtected: false,
      createdAt: '2024-01-15',
      votes: 156
    },
    {
      id: '2',
      title: 'Annual General Meeting Vote',
      description: 'Important decisions about the organization\'s future direction.',
      category: 'governance',
      status: 'open',
      isProtected: true,
      createdAt: '2024-01-14',
      votes: 89
    },
    {
      id: '3',
      title: 'Best Programming Language 2024',
      description: 'What\'s your preferred language for building applications?',
      category: 'technology',
      status: 'closed',
      isProtected: false,
      createdAt: '2024-01-10',
      votes: 234
    }
  ];

  const filteredPolls = mockPolls.filter(poll => {
    const matchesSearch = poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         poll.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         poll.id.includes(searchQuery);
    const matchesCategory = selectedCategory === 'all' || poll.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || poll.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedPolls = [...filteredPolls].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === 'popular') {
      return b.votes - a.votes;
    }
    return 0;
  });

  const handlePollAccess = (pollId: string, isProtected: boolean) => {
    if (isProtected) {
      setSelectedPollId(pollId);
      setShowPasswordModal(true);
    } else {
      // Navigate to poll details
      console.log('Accessing poll:', pollId);
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
            {sortedPolls.length > 0 ? (
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
                        {poll.isProtected && (
                          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded">
                            🔒 Protected
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {poll.status === 'open' ? (
                        <button
                          onClick={() => handlePollAccess(poll.id, poll.isProtected)}
                          className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-300"
                        >
                          {poll.isProtected ? 'Access Poll →' : 'View Details →'}
                        </button>
                      ) : (
                        <div className="px-6 py-3 bg-gray-500/20 rounded-lg text-gray-400">
                          Closed
                        </div>
                      )}
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
