'use client';

export default function FlowingBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Primary flowing background shape */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(ellipse 800px 400px at 20% 30%, rgba(79, 209, 199, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse 600px 300px at 80% 70%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse 400px 600px at 60% 20%, rgba(96, 165, 250, 0.15) 0%, transparent 50%)
          `
        }}
      />

      {/* Secondary organic shapes */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        {/* Top flowing shape */}
        <div
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full animate-flow"
          style={{
            background: 'linear-gradient(135deg, rgba(79, 209, 199, 0.4), rgba(29, 209, 161, 0.2))',
            filter: 'blur(40px)',
            transform: 'rotate(-45deg) scale(1.5)',
          }}
        />

        {/* Middle left shape */}
        <div
          className="absolute top-1/2 -left-32 w-80 h-80 rounded-full animate-float"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.1))',
            filter: 'blur(50px)',
            animationDelay: '1s',
          }}
        />

        {/* Right side flowing shape */}
        <div
          className="absolute top-1/4 -right-32 w-96 h-96 rounded-full animate-flow"
          style={{
            background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(79, 209, 199, 0.2))',
            filter: 'blur(60px)',
            animationDelay: '2s',
          }}
        />

        {/* Bottom shape */}
        <div
          className="absolute -bottom-40 left-1/3 w-[500px] h-[300px] rounded-full animate-float"
          style={{
            background: 'linear-gradient(135deg, rgba(216, 180, 254, 0.2), rgba(139, 92, 246, 0.1))',
            filter: 'blur(45px)',
            animationDelay: '0.5s',
          }}
        />
      </div>

      {/* Waterfall-like vertical flows */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute top-0 left-1/4 w-2 h-full animate-flow"
          style={{
            background: 'linear-gradient(to bottom, rgba(79, 209, 199, 0.6) 0%, rgba(79, 209, 199, 0.1) 50%, transparent 100%)',
            filter: 'blur(2px)',
          }}
        />
        <div
          className="absolute top-0 right-1/3 w-1 h-full animate-flow"
          style={{
            background: 'linear-gradient(to bottom, rgba(96, 165, 250, 0.5) 0%, rgba(96, 165, 250, 0.1) 60%, transparent 100%)',
            filter: 'blur(1px)',
            animationDelay: '1.5s',
          }}
        />
        <div
          className="absolute top-0 left-2/3 w-3 h-full animate-flow"
          style={{
            background: 'linear-gradient(to bottom, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0.05) 70%, transparent 100%)',
            filter: 'blur(3px)',
            animationDelay: '0.8s',
          }}
        />
      </div>

      {/* Crystalline formations */}
      <div className="absolute inset-0 opacity-10">
        {/* Top left crystal cluster */}
        <div className="absolute top-20 left-20">
          <div
            className="w-8 h-8 rotate-45 animate-glow"
            style={{
              background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.8), rgba(79, 209, 199, 0.6))',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            }}
          />
          <div
            className="w-6 h-6 rotate-12 mt-2 ml-4 animate-glow"
            style={{
              background: 'linear-gradient(135deg, rgba(216, 180, 254, 0.7), rgba(139, 92, 246, 0.5))',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              animationDelay: '1s',
            }}
          />
        </div>

        {/* Bottom right crystal cluster */}
        <div className="absolute bottom-32 right-32">
          <div
            className="w-10 h-10 -rotate-12 animate-glow"
            style={{
              background: 'linear-gradient(135deg, rgba(249, 168, 212, 0.6), rgba(139, 92, 246, 0.4))',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              animationDelay: '2s',
            }}
          />
          <div
            className="w-5 h-5 rotate-45 mt-1 ml-6 animate-glow"
            style={{
              background: 'linear-gradient(135deg, rgba(253, 186, 116, 0.7), rgba(249, 168, 212, 0.5))',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              animationDelay: '0.5s',
            }}
          />
        </div>

        {/* Center crystal */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div
            className="w-12 h-12 rotate-90 animate-glow"
            style={{
              background: 'linear-gradient(135deg, rgba(79, 209, 199, 0.4), rgba(96, 165, 250, 0.3))',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              animationDelay: '1.5s',
            }}
          />
        </div>
      </div>
    </div>
  );
}