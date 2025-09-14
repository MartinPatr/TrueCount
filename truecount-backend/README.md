# TrueCount Backend

Blockchain backend for the TrueCount decentralized voting platform. Contains smart contracts, deployment scripts, and utility tools.

## 🏗️ Structure

```
truecount-backend/
├── contracts/           # Solidity smart contracts
│   └── SealedVote.sol  # Main voting contract
├── scripts/            # Deployment and utility scripts
│   ├── deploy.js       # Contract deployment
│   ├── advance-time.js # Time advancement utility
│   ├── check-poll.js   # Poll status checker
│   └── create-demo-poll.js # Demo poll creator
├── artifacts/          # Compiled contract artifacts
├── cache/             # Hardhat cache
└── test/              # Test files
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Compile Contracts
```bash
npm run compile
```

### Start Local Blockchain
```bash
npm run node
```

### Deploy Contracts
```bash
npm run deploy
```

## 📋 Available Scripts

### Core Commands
- `npm run compile` - Compile smart contracts
- `npm run deploy` - Deploy contracts to local network
- `npm run node` - Start local Hardhat network
- `npm run clean` - Clean build artifacts

### Utility Commands
- `npm run advance-time` - Advance blockchain time for testing
- `npm run check-poll <pollId>` - Check poll status and details
- `npm run create-demo` - Create a demo student government poll

## 🏛️ Smart Contract

### SealedVote.sol
The main voting contract implementing commit-reveal voting:

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

## 🔧 Development

### Local Development
1. Start Hardhat node: `npm run node`
2. Deploy contracts: `npm run deploy`
3. Use frontend or scripts to interact

### Testing
```bash
# Create demo poll
npm run create-demo

# Check poll status
npm run check-poll 1

# Advance time for testing
npm run advance-time
```

## 📁 Scripts Overview

### deploy.js
Deploys the SealedVote contract to the local network and saves deployment information.

### advance-time.js
Advances blockchain time by mining blocks. Useful for testing time-based functionality.

### check-poll.js
Checks the status of a specific poll including:
- Poll details (title, description, options)
- Current phase (commit/reveal)
- Vote tallies
- User's voting status

### create-demo-poll.js
Creates a demo student government election poll with:
- 4 candidates
- 1-hour commit phase
- 1 committed vote for demonstration

## 🔗 Network Configuration

The backend is configured to work with:
- **Local Network**: http://127.0.0.1:8545
- **Chain ID**: 31337
- **Gas Limit**: 30,000,000

## 🛡️ Security

### Vote Privacy
- Votes are encrypted using commitment schemes
- No vote information is visible during commit phase
- Salt values prevent vote enumeration

### Vote Integrity
- Cryptographic verification of vote commitments
- Immutable vote storage on blockchain
- Public verification of vote authenticity

## 📄 License

This project is part of TrueCount and is licensed under the MIT License.