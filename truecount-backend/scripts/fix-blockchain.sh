#!/bin/bash

# Script to fix blockchain synchronization issues
# This script mines blocks and ensures the blockchain is ready

RPC_URL="http://localhost:8545"

echo "🔧 Fixing blockchain synchronization..."

# Check if RPC is responding
echo "🔍 Checking RPC connection..."
if ! curl -s -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $RPC_URL > /dev/null; then
  echo "❌ RPC not responding. Make sure Hardhat is running!"
  exit 1
fi

# Get current block number
CURRENT_BLOCK=$(curl -s -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $RPC_URL | grep -o '"result":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$CURRENT_BLOCK" ]; then
  BLOCK_NUM=$((16#${CURRENT_BLOCK#0x}))
  echo "📊 Current block number: $BLOCK_NUM"
  
  # Mine more blocks if we have less than 50
  if [ $BLOCK_NUM -lt 50 ]; then
    NEEDED=$((50 - $BLOCK_NUM))
    echo "⛏️  Mining $NEEDED more blocks to ensure stability..."
    ./mine-blocks.sh $NEEDED
  else
    echo "✅ Blockchain has enough blocks ($BLOCK_NUM)"
  fi
else
  echo "❌ Could not get block number"
  exit 1
fi

# Test contract interaction
echo "🧪 Testing contract interaction..."
CONTRACT_ADDRESS=$(grep "NEXT_PUBLIC_CONTRACT_ADDRESS" .env.local | cut -d'=' -f2)

if [ ! -z "$CONTRACT_ADDRESS" ]; then
  # Test a simple contract call
  RESULT=$(curl -s -X POST -H "Content-Type: application/json" \
    --data "{\"jsonrpc\":\"2.0\",\"method\":\"eth_call\",\"params\":[{\"to\":\"$CONTRACT_ADDRESS\",\"data\":\"0x9207891d\"},\"latest\"],\"id\":1}" \
    $RPC_URL)
  
  if echo "$RESULT" | grep -q "error"; then
    echo "❌ Contract call failed. Contract may not be deployed at $CONTRACT_ADDRESS"
    echo "💡 Try running: ./update-contract.sh <new_address>"
  else
    echo "✅ Contract is responding correctly"
  fi
else
  echo "⚠️  No contract address found in .env.local"
fi

echo "🎉 Blockchain synchronization complete!"
echo "💡 If you still get block errors, try refreshing your browser"
