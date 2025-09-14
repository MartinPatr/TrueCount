'use client';

import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  direction: number;
  opacity: number;
  color: string;
}

export default function FloatingParticles({ count = 20 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const colors = [
      'rgba(79, 209, 199, 0.8)', // flow-primary
      'rgba(139, 92, 246, 0.6)', // purple-primary
      'rgba(96, 165, 250, 0.7)', // crystal-blue
      'rgba(216, 180, 254, 0.5)', // crystal-purple
      'rgba(249, 168, 212, 0.6)', // crystal-pink
    ];

    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      speed: Math.random() * 2 + 0.5,
      direction: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.8 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    setParticles(newParticles);
  }, [count]);

  useEffect(() => {
    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => {
        let newX = particle.x + Math.cos(particle.direction) * particle.speed * 0.1;
        let newY = particle.y + Math.sin(particle.direction) * particle.speed * 0.1;

        // Wrap around screen edges
        if (newX > 105) newX = -5;
        if (newX < -5) newX = 105;
        if (newY > 105) newY = -5;
        if (newY < -5) newY = 105;

        // Slightly change direction for organic movement
        const newDirection = particle.direction + (Math.random() - 0.5) * 0.1;

        return {
          ...particle,
          x: newX,
          y: newY,
          direction: newDirection,
        };
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-glow transition-all duration-1000 ease-linear"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            opacity: particle.opacity,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            filter: 'blur(0.5px)',
          }}
        />
      ))}
    </div>
  );
}