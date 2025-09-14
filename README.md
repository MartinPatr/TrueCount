# TrueCount – Transparent, Tamper-Proof Voting

**TrueCount** is a decentralized **commit–reveal voting system** built for communities that need fairness, transparency, and verifiable results. No moderators. No tampering. Every vote is private until revealed, and then it is permanently auditable on-chain.

![Voting Process](https://img.shields.io/badge/Voting-Commit--Reveal-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Build Status](https://img.shields.io/badge/build-passing-brightgreen)

## 🎯 Inspiration

One of our teammates experienced a moment in student body government where a candidate's votes were reduced by half because a moderator believed she violated a subjective rule. The issue wasn't just the penalty — it was how easily one person's judgment could undermine trust in the entire process.

**TrueCount was born to fix this.** By moving voting on-chain, we eliminate human bias and create a system where **trust is placed in code, not moderators**.

## ✨ Features

- **🔐 Wallet Integration** - Seamless connection with RainbowKit and wagmi
- **📊 Poll Creation** - Customizable options with flexible time windows
- **🤝 Commit Phase** - Voters submit hashed commitments (votes remain hidden)
- **🔍 Reveal Phase** - Voters reveal their vote + salt, verified against commitment
- **✅ Finalize Phase** - Results locked on-chain, transparent forever
- **🎨 Enhanced UX** - Countdown timers, phase-aware UI, toast notifications, and comprehensive error handling

## 🛠 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Smart Contracts** | Solidity, Hardhat, Ignition |
| **Frontend** | React, TypeScript, wagmi, RainbowKit, viem |
| **UI/UX** | TailwindCSS, react-hot-toast, react-countdown |
| **Development** | Hardhat node for local blockchain simulation |

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MetaMask or compatible wallet

### Installation

1. **Clone & Install Dependencies**
   ```bash
   git clone https://github.com/your-username/TrueCount.git
   cd TrueCount
   npm install
   ```

2. **Start Local Blockchain**
   ```bash
   npx hardhat node
   ```
   > Keep this terminal running - it will be your local blockchain!

3. **Deploy Smart Contracts**
   
   In a new terminal:
   ```bash
   npx hardhat compile
   npx hardhat ignition deploy ignition/modules/SealedVote.ts --network localhost
   ```
   
   📋 **Important**: Copy the deployed contract address from the output!

4. **Launch Frontend**
   
   In another terminal:
   ```bash
   npm run dev
   ```
   
   🌐 Open [http://localhost:3000](http://localhost:3000) and connect your wallet
   
   > 💡 **Tip**: Import a Hardhat test account if using the local node

## 🗳 Voting Lifecycle

### Phase 1: Create Poll
```solidity
createPoll(numOptions, commitSecs, revealSecs)
```

### Phase 2: Commit Vote
- 🎲 Generate random 32-byte salt client-side
- 🔒 Compute `commitment = keccak256(encodePacked(option, salt, voter, pollId))`
- 📤 Call `commit(pollId, commitment)`

### Phase 3: Reveal Vote
- 📱 Retrieve `{option, salt}` from localStorage
- 🔓 Call `reveal(pollId, option, salt)`
- ✅ Smart contract verifies commitment matches

### Phase 4: Finalize Results
- 🔐 Call `finalize(pollId)` to lock results permanently
- 📊 Results become immutable and publicly auditable

## 🎯 Example Use Cases

| Scenario | Benefits |
|----------|----------|
| **Student Body Elections** | Eliminate moderator bias, ensure fair counting |
| **Club Decision Making** | Transparent process, tamper-proof results |
| **DAO Governance** | Decentralized voting with cryptographic guarantees |
| **Community Polls** | Build trust through verifiable, on-chain results |

## 🛣 Roadmap

### Near Term
- [ ] Deploy to Layer 2 networks (Optimism, Arbitrum, Base) for reduced gas costs
- [ ] Enhanced salt management with export/backup functionality
- [ ] Mobile-responsive design improvements

### Medium Term
- [ ] **Weighted Voting** - Token-based or stake-weighted systems
- [ ] **Quadratic Voting** - Prevent vote buying and encourage genuine preferences
- [ ] **Multi-signature Poll Creation** - Require multiple signatures for high-stakes polls

### Long Term
- [ ] **Zero-Knowledge Proofs** - Enhanced privacy without sacrificing verifiability
- [ ] **Cross-chain Compatibility** - Vote on one chain, verify on another
- [ ] **Governance Framework** - Full DAO tooling integration

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: [Wiki](https://github.com/your-username/TrueCount/wiki)
- **Issues**: [Bug Reports & Feature Requests](https://github.com/your-username/TrueCount/issues)
- **Discussions**: [Community Forum](https://github.com/your-username/TrueCount/discussions)

## ⭐ Support the Project

If you find TrueCount useful, please consider:
- ⭐ **Starring** this repository
- 🐛 **Reporting bugs** or suggesting features
- 💡 **Contributing** code or documentation
- 📢 **Sharing** with your community

---

**Built with ❤️ by TrueCount for transparent democracy**

> *"Democracy is not just about voting; it's about trust. TrueCount ensures both."*
