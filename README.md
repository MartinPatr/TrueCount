# TrueCount – Transparent, Tamper-Proof Voting

**TrueCount** is a decentralized **commit–reveal voting system** built for communities that need fairness, transparency, and verifiable results. No moderators. No tampering. Every vote is private until revealed, and then it is permanently auditable on-chain.

![Voting Process](https://img.shields.io/badge/Voting-Commit--Reveal-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Build Status](https://img.shields.io/badge/build-passing-brightgreen)

## 🎯 Inspiration

One of our teammates experienced a moment in student body government where a candidate's votes were reduced by half because a moderator believed she violated a subjective rule. The issue wasn't just the penalty — it was how easily one person's judgment could undermine trust in the entire process.

**TrueCount was born to fix this.** By moving voting on-chain, we eliminate human bias and create a system where **trust is placed in code, not moderators**.

## 🏗️ Architecture

```
TrueCount/
├── frontend/                 # Next.js React frontend application
├── truecount-backend/        # Hardhat blockchain backend
│   ├── contracts/           # Smart contracts (Solidity)
│   ├── scripts/             # Deployment and utility scripts
│   └── artifacts/           # Compiled contract artifacts
└── README.md
```

## ✨ Features

### 🔐 **Commit-Reveal Voting Scheme**
- **Commit Phase**: Voters submit hashed commitments (votes remain hidden)
- **Reveal Phase**: Voters reveal their vote + salt, verified against commitment
- **Privacy**: Votes remain secret during the commit phase
- **Transparency**: All votes are publicly verifiable after reveal

### 🗳️ **Voting Features**
- **🔐 Wallet Integration** - Seamless connection with RainbowKit and wagmi
- **📊 Poll Creation** - Customizable options with flexible time windows
- **🤝 Commit Phase** - Voters submit hashed commitments (votes remain hidden)
- **🔍 Reveal Phase** - Voters reveal their vote + salt, verified against commitment
- **✅ Finalize Phase** - Results locked on-chain, transparent forever
- **🎨 Enhanced UX** - Countdown timers, phase-aware UI, toast notifications, and comprehensive error handling

### 🎨 **User Interface**
- Modern, responsive design
- Real-time phase indicators
- Interactive voting interface
- Live results display
- Toast notifications for user feedback

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


1. **Backend Setup (Blockchain)**
   ```bash
   cd ../truecount-backend
   npm install
   npm run compile
   npm run node  # Start local blockchain
   ```
   > Keep this terminal running - it will be your local blockchain!

2. **Deploy Smart Contracts**
   
   In a new terminal:
   ```bash
   npm run deploy  # Deploy smart contracts
   ```
   
   📋 **Important**: Copy the deployed contract address from the output and add to NEXT_PUBLIC_CONTRACT_ADDRESS in env

3. **Launch Frontend**
   
   In another terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   
   🌐 Open [http://localhost:3000](http://localhost:3000) and connect your wallet *We recommend using Metamask
   (Both web application and blockchain are locally hosted)
   
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

## 🏛️ Smart Contract

### SealedVote.sol
The core smart contract implementing the commit-reveal voting scheme:

```solidity
contract SealedVote {
    struct Poll {
        uint64 commitEnd;           // Commit phase end timestamp
        uint8 numOptions;           // Number of voting options
        address creator;            // Poll creator
        string title;               // Poll title
        string description;         // Poll description
        string[] options;           // Voting options
        mapping(address => bytes32) commitment;  // Voter commitments
        mapping(address => bool) revealed;       // Reveal status
        uint32[] tally;             // Vote counts per option
    }
}
```

### Key Functions
- `createPoll()` - Create a new voting poll
- `commit()` - Submit vote commitment
- `reveal()` - Reveal committed vote
- `getTally()` - Get current vote counts
- `getCommitEnd()` - Get commit phase end time

## 🛡️ Security Features

### Vote Privacy
- Votes are encrypted using commitment schemes
- No vote information is visible during commit phase
- Salt values prevent vote enumeration

### Vote Integrity
- Cryptographic verification of vote commitments
- Immutable vote storage on blockchain
- Public verification of vote authenticity

### Access Control
- Only poll creators can create polls
- One vote per address per poll
- Time-based phase enforcement

## 🔧 Backend Scripts

### Essential Commands
```bash
# Deploy contracts
npm run deploy

# Advance blockchain time (for testing)
npm run advance-time

# Check poll status
npm run check-poll <pollId>

# Create demo poll
npm run create-demo

# Start local blockchain
npm run node
```

### Utility Scripts
- `deploy.js` - Deploy smart contracts
- `advance-time.js` - Advance blockchain time for testing
- `check-poll.js` - Check poll status and details
- `create-demo-poll.js` - Create a demo student government poll

## 🧪 Testing

### Demo Poll Creation
```bash
cd truecount-backend
npm run create-demo
```

This creates a student government election poll with:
- 4 candidates
- 1-hour commit phase
- 1 committed vote for demonstration

### Time Advancement
```bash
cd truecount-backend
npm run advance-time
```

Advances blockchain time to test phase transitions.

## 📁 Project Structure

### Frontend (`/frontend`)
- **Components**: Reusable UI components
- **Hooks**: Custom React hooks for blockchain interaction
- **Pages**: Next.js application pages
- **Lib**: Utility functions and configurations

### Backend (`/truecount-backend`)
- **Contracts**: Solidity smart contracts
- **Scripts**: Deployment and utility scripts
- **Artifacts**: Compiled contract bytecode and ABIs

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
