# TrueCount Frontend

Modern React frontend for the TrueCount decentralized voting platform. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Running TrueCount backend

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## ✨ Features

### 🗳️ **Voting Interface**
- Create polls with multiple options
- Real-time phase indicators (commit/reveal)
- Interactive voting interface
- Live results display

### 🎨 **User Experience**
- Modern, responsive design
- Toast notifications for user feedback
- Real-time updates
- Intuitive navigation

### 🔐 **Security**
- Wallet integration with RainbowKit
- Secure vote commitment
- Vote verification
- Phase-based access control

## 🏗️ Architecture

### Components
- **Navigation** - Main navigation bar
- **HeroSection** - Landing page hero
- **CurrentPolls** - Poll listing component
- **FloatingParticles** - Background animation
- **FlowingBackground** - Animated background
- **Toast** - Notification system

### Pages
- **Home** (`/`) - Landing page with poll overview
- **Create Poll** (`/create-poll`) - Poll creation form
- **Find Poll** (`/find-poll`) - Poll search and listing
- **Poll Detail** (`/poll/[id]`) - Individual poll view

### Hooks
- **usePollData** - Poll data management and blockchain interaction
- Custom hooks for contract interactions

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run TypeScript and ESLint checks
- `npm run format` - Format code with Biome

## 🛠️ Technology Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Wagmi** - Ethereum React hooks
- **RainbowKit** - Wallet connection
- **Viem** - Ethereum library
- **Lucide React** - Icons

## 🔗 Backend Integration

The frontend connects to the TrueCount backend via:
- **Contract Address**: `0x5fbdb2315678afecb367f032d93f642f64180aa3`
- **Network**: Local Hardhat network (Chain ID: 31337)
- **RPC URL**: `http://127.0.0.1:8545`

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## 🎨 Styling

- **Tailwind CSS** for utility-first styling
- **Custom animations** for enhanced UX
- **Dark theme** with glassmorphism effects
- **Responsive grid** layouts

## 🔐 Wallet Integration

- **RainbowKit** for wallet connection
- **Wagmi** for Ethereum interactions
- **MetaMask** and other wallet support
- **Account management** and switching

## 📄 License

This project is part of TrueCount and is licensed under the MIT License.
