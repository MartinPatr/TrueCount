import Navigation from '@/components/Navigation';
import FloatingParticles from '@/components/FloatingParticles';
import FlowingBackground from '@/components/FlowingBackground';
import HeroSection from '@/components/HeroSection';

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">

      {/* Background Effects */}
      <FlowingBackground />
      <FloatingParticles count={25} />

      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section id="home">
        <HeroSection />
      </section>

      {/* Future of Polling Section */}
      <section id="about" className="relative py-32 px-6 overflow-hidden min-h-screen">
        {/* Purple background with gradients - extended coverage */}
        <div className="absolute -top-32 -bottom-32 left-0 right-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(135deg, #1e1b4b 0%, #3730a3 25%, #6366f1 50%, #8b5cf6 75%, #a855f7 100%),
                radial-gradient(ellipse at top left, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
                radial-gradient(ellipse at bottom right, rgba(168, 85, 247, 0.3) 0%, transparent 50%)
              `
            }}
          />

          {/* Crystal decorations */}
          <div className="absolute top-10 left-10 opacity-20">
            <div
              className="w-16 h-16 rotate-45 animate-glow"
              style={{
                background: 'linear-gradient(135deg, rgba(216, 180, 254, 0.8), rgba(139, 92, 246, 0.6))',
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              }}
            />
          </div>

          <div className="absolute top-1/4 right-20 opacity-15">
            <div
              className="w-12 h-12 -rotate-12 animate-glow"
              style={{
                background: 'linear-gradient(135deg, rgba(249, 168, 212, 0.7), rgba(168, 85, 247, 0.5))',
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                animationDelay: '1s',
              }}
            />
          </div>

          <div className="absolute bottom-20 left-1/4 opacity-25">
            <div
              className="w-20 h-20 rotate-90 animate-glow"
              style={{
                background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.6), rgba(139, 92, 246, 0.4))',
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                animationDelay: '2s',
              }}
            />
          </div>

          <div className="absolute bottom-32 right-32 opacity-20">
            <div
              className="w-14 h-14 -rotate-45 animate-glow"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.6), rgba(249, 168, 212, 0.4))',
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                animationDelay: '0.5s',
              }}
            />
          </div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8" style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 20%, #e0f2fe 40%, #7dd3fc 60%, #38bdf8 80%, #0ea5e9 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 30px rgba(255, 255, 255, 0.3)'
          }}>
            The Future of Polling
          </h2>
          <p className="text-xl text-gray-300 mb-12 leading-relaxed">
            Experience secure, transparent, and tamper-proof voting like never before.
            Every vote is permanently recorded on a public ledger, ensuring complete
            transparency and verifiable results for all participants.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="glass rounded-xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 mx-auto mb-4 flex items-center justify-center">
                <div className="w-6 h-6 rounded-sm bg-white/90"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Secure</h3>
              <p className="text-white">
              Every vote is permanently recorded, tamper-proof, and protected from manipulation.
              </p>
            </div>

            <div className="glass rounded-xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 mx-auto mb-4 flex items-center justify-center">
                <div className="w-6 h-6 rounded-sm bg-white/90"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Decentralized</h3>
              <p className="text-white">
              No single organization controls the results, ensuring fairness for all participants.
              </p>
            </div>

            <div className="glass rounded-xl p-8 hover:bg-white/10 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-red-500 mx-auto mb-4 flex items-center justify-center">
                <div className="w-6 h-6 rounded-sm bg-white/90"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Anonymous</h3>
              <p className="text-white">
              Voting is verified through wallets, keeping individual identities private.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative py-20 px-6 z-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold gradient-text text-center mb-16">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                question: "What is this platform used for?",
                answer: "This platform enables the creation and participation in secure, tamper-proof polls. Votes are permanently recorded on a public ledger, ensuring results remain transparent, verifiable, and resistant to manipulation."
              },
              {
                question: "How do I create a poll?",
                answer: "Click \"Create a Poll\" on the homepage, enter your question, add voting options, and set an optional access code if you want the poll to be private. Once published, the poll is immediately available for others to join."
              },
              {
                question: "Can anyone participate in a poll?",
                answer: "Yes. Public polls are open to all users with a connected wallet. For private polls, participants will need the access code provided by the poll creator."
              },
              {
                question: "How is voting secured?",
                answer: "Each vote is linked to a unique wallet address. This ensures that every participant can only vote once per poll. All votes are recorded permanently and cannot be altered or deleted."
              },
              {
                question: "Do I need a digital wallet to vote?",
                answer: "Yes. A digital wallet (such as MetaMask or WalletConnect) is required to verify identity and ensure the integrity of the voting process."
              },
              {
                question: "Can results be changed after the poll ends?",
                answer: "No. Once votes are cast, they are permanently stored on the ledger. This guarantees that results are final, verifiable, and immune to tampering."
              },
              {
                question: "What types of polls can I create?",
                answer: "You can create polls for community governance, organizational decision-making, academic elections, competitions, and more. Both public and password-protected polls are supported."
              },
              {
                question: "What happens if I forget my poll's access code?",
                answer: "The access code is chosen and managed by the poll creator. For security reasons, it cannot be recovered by the platform. Poll creators are responsible for distributing and safeguarding the code."
              },
              {
                question: "Are results visible before I vote?",
                answer: "Poll creators can choose whether results are visible in real time or only after a participant has voted. This helps maintain fairness and prevent bias during ongoing polls."
              },
              {
                question: "Does it cost anything to vote?",
                answer: "Voting requires a transaction on the ledger. Depending on the network used, a minimal transaction fee may apply."
              },
            ].map((faq, index) => (
              <div key={index} className="glass rounded-lg p-6 hover:bg-white/10 transition-all duration-300">
                <h3 className="text-xl font-bold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 z-10 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-purple-500 flex items-center justify-center mr-3">
              <div className="w-4 h-4 rounded-sm bg-white/90"></div>
            </div>
            <span className="text-xl font-bold gradient-text">
              TrueCount - Hack the North 2025
            </span>
          </div>

          <p className="text-gray-400 mb-4">
            Made with ❤️ by Alex, Anastasia, Elyssa, and Martin
          </p>

        </div>
      </footer>
    </main>
  );
}