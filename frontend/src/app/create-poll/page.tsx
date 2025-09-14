'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import FloatingParticles from '@/components/FloatingParticles';
import FlowingBackground from '@/components/FlowingBackground';
import { useCreatePoll } from '@/hooks/usePollData';
import { showToast } from '@/components/Toast';

export default function CreatePollPage() {
  const [pollTitle, setPollTitle] = useState('');
  const [pollDescription, setPollDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [password, setPassword] = useState('');
  const [isProtected, setIsProtected] = useState(false);
  const [commitDuration, setCommitDuration] = useState(1); // hours

  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { createPoll, isPending, isSuccess, error } = useCreatePoll();

  const addOption = () => {
    setOptions([...options, '']);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      showToast({
        type: 'success',
        title: 'Poll Created!',
        description: 'Your poll has been successfully created on the blockchain.',
      });
      // Navigate to the poll page
      router.push('/find-poll');
    }
  }, [isSuccess, router]);

  useEffect(() => {
    if (error) {
      showToast({
        type: 'error',
        title: 'Creation Failed',
        description: 'Failed to create the poll. Please try again.',
      });
    }
  }, [error]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      showToast({
        type: 'warning',
        title: 'Wallet Required',
        description: 'Please connect your wallet to create a poll.',
      });
      return;
    }

    // Validate required fields
    if (!pollTitle.trim()) {
      showToast({
        type: 'error',
        title: 'Title Required',
        description: 'Please provide a title for your poll.',
      });
      return;
    }

    if (!pollDescription.trim()) {
      showToast({
        type: 'error',
        title: 'Description Required',
        description: 'Please provide a description for your poll.',
      });
      return;
    }

    const validOptions = options.filter(option => option.trim() !== '');
    if (validOptions.length < 2) {
      showToast({
        type: 'error',
        title: 'Invalid Options',
        description: 'Please provide at least 2 options for your poll.',
      });
      return;
    }

    // Duration is in hours, pass it directly
    createPoll(validOptions.length, commitDuration, pollTitle, pollDescription, validOptions);
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
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
              Create Poll
            </h1>
            <p className="text-xl text-gray-300">
              Launch a new poll and let the community decide
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Poll Title */}
            <div className="glass rounded-xl p-6">
              <label className="block text-white font-semibold mb-3">
                Poll Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={pollTitle}
                onChange={(e) => setPollTitle(e.target.value)}
                placeholder="What question do you want to ask?"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300"
                required
              />
              <p className="text-sm text-gray-400 mt-2">
                Example: "Which team should win the ETHGlobal Sponsor Prize?"
              </p>
            </div>

            {/* Poll Description */}
            <div className="glass rounded-xl p-6">
              <label className="block text-white font-semibold mb-3">
                Poll Description <span className="text-red-400">*</span>
              </label>
              <textarea
                value={pollDescription}
                onChange={(e) => setPollDescription(e.target.value)}
                placeholder="Describe your poll so voters have context."
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300 resize-none"
                required
              />
              <p className="text-sm text-gray-400 mt-2">
                Example: "Give background or explain why this decision matters."
              </p>
            </div>

            {/* Poll Options */}
            <div className="glass rounded-xl p-6">
              <label className="block text-white font-semibold mb-3">
                Poll Options
              </label>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}: ${index === 0 ? 'First choice (e.g. TrueCount)' : index === 1 ? 'Second choice (e.g. Anastasia, Alex, Elyssa, and Martin)' : 'Another option...'}`}
                      className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300"
                      required
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="px-3 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-all duration-300"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addOption}
                className="mt-4 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
              >
                Add another option...
              </button>
            </div>

            {/* Poll Duration */}
            <div className="glass rounded-xl p-6">
              <label className="block text-white font-semibold mb-4">
                Poll Duration
              </label>
              <div>
                <label className="block text-gray-300 mb-2">Commit Phase (hours)</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={commitDuration}
                  onChange={(e) => setCommitDuration(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300"
                />
                <p className="text-sm text-gray-400 mt-1">
                  How long voters can commit their votes (in hours). After this period, voters can reveal their votes forever.
                </p>
              </div>
            </div>

            {/* Password Protection */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="protected"
                  checked={isProtected}
                  onChange={(e) => setIsProtected(e.target.checked)}
                  className="w-4 h-4 text-teal-400 bg-white/5 border-white/20 rounded focus:ring-teal-400 focus:ring-2"
                />
                <label htmlFor="protected" className="text-white font-semibold">
                  Password Protect Poll
                </label>
              </div>
              {isProtected && (
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set a secret code (optional)"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 transition-all duration-300"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Only people with the code will be able to vote.
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isPending || !isConnected}
                className="px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg font-semibold text-white text-lg hover:shadow-2xl hover:shadow-teal-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isPending ? 'Creating Poll...' : !isConnected ? 'Connect Wallet to Create' : 'Launch poll 🚀'}
              </button>
              {!isConnected && (
                <p className="text-sm text-gray-400 mt-2">
                  You need to connect your wallet to create a poll
                </p>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
