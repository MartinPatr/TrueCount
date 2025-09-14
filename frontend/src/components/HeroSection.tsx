'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-20 z-10">
      <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>

        {/* Main heading with gradient text */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          <span className="gradient-text">Every Vote,</span>
          <br />
          <span className="text-white">Counted Fairly.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
        Run polls you can trust. Secure, tamper-proof, and fully transparent, with every vote permanently recorded on an open ledger for verifiable results.
        </p>

        {/* Event details */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-12 text-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-glow"></div>
            <span className="text-teal-300">Secure</span>
          </div>
          <div className="hidden md:block w-1 h-1 rounded-full bg-gray-500"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-glow"></div>
            <span className="text-purple-300">Decentralized</span>
          </div>
          <div className="hidden md:block w-1 h-1 rounded-full bg-gray-500"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-glow"></div>
            <span className="text-blue-300">Anonymous</span>
          </div>
        </div>

        {/* Call to action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link href="/create-poll" className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-500 rounded-lg font-semibold text-white text-lg hover:shadow-2xl hover:shadow-teal-500/25 transition-all duration-300 transform hover:scale-105">
            <span className="relative z-10">Create Poll</span>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-blue-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>

          <Link href="/find-poll" className="px-8 py-4 glass rounded-lg font-semibold text-white text-lg hover:bg-white/10 transition-all duration-300 border border-white/20">
            Find Poll
          </Link>
        </div>

        {/* Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/10">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">1000+</div>
            <div className="text-gray-400">Participants</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">36</div>
            <div className="text-gray-400">Hours of Building</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">$50K+</div>
            <div className="text-gray-400">In Prizes</div>
          </div>
        </div> */}
      </div>

      {/* Floating elements */}
      <div className="absolute top-1/4 left-10 animate-float">
        <div className="w-4 h-4 rounded-full bg-teal-400/60 animate-glow"></div>
      </div>
      <div className="absolute top-1/3 right-16 animate-float" style={{ animationDelay: '1s' }}>
        <div className="w-3 h-3 rounded-full bg-purple-400/60 animate-glow"></div>
      </div>
      <div className="absolute bottom-1/4 left-1/4 animate-float" style={{ animationDelay: '2s' }}>
        <div className="w-5 h-5 rounded-full bg-blue-400/60 animate-glow"></div>
      </div>
      <div className="absolute bottom-1/3 right-1/4 animate-float" style={{ animationDelay: '0.5s' }}>
        <div className="w-2 h-2 rounded-full bg-pink-400/60 animate-glow"></div>
      </div>
    </section>
  );
}