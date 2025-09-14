#!/bin/bash

echo "🔄 Resetting local blockchain..."

# Navigate to hardhat project
cd ../hardhat-example/hardhat-project

# Stop any running hardhat processes
echo "⏹️  Stopping any running Hardhat processes..."
pkill -f "hardhat node" || true
pkill -f "npx hardhat node" || true

# Wait a moment
sleep 2

# Clean up any existing artifacts and cache
echo "🧹 Cleaning up artifacts and cache..."
rm -rf artifacts/
rm -rf cache/
rm -rf ignition/deployments/

# Recompile contracts
echo "🔨 Recompiling contracts..."
npx hardhat compile

# Deploy contracts
echo "🚀 Deploying contracts..."
npx hardhat ignition deploy ./ignition/modules/SealedVote.ts --network localhost

# Start hardhat node in background
echo "🌐 Starting Hardhat node..."
npx hardhat node --hostname 0.0.0.0 --port 8545 &

# Wait for node to start
echo "⏳ Waiting for node to start..."
sleep 5

# Mine some blocks to ensure we have enough
echo "⛏️  Mining initial blocks..."
for i in {1..10}; do
  curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"evm_mine","params":[],"id":1}' http://localhost:8545
done

echo "✅ Blockchain reset complete!"
echo "🌐 RPC URL: http://localhost:8545"
echo "🔗 Chain ID: 31337"
echo ""
echo "Now you can run your frontend with: npm run dev"
