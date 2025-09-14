#!/bin/bash

# Script to mine blocks on local blockchain
# Usage: ./mine-blocks.sh [number_of_blocks]

BLOCKS=${1:-1000
}
RPC_URL="http://localhost:8545"

echo "⛏️  Mining $BLOCKS blocks..."

for i in $(seq 1 $BLOCKS); do
  curl -X POST -H "Content-Type: application/json" \
    --data '{"jsonrpc":"2.0","method":"evm_mine","params":[],"id":1}' \
    $RPC_URL > /dev/null 2>&1
  
  if [ $((i % 10)) -eq 0 ]; then
    echo "✅ Mined $i blocks..."
  fi
done

echo "✅ Successfully mined $BLOCKS blocks!"

# Get current block number
CURRENT_BLOCK=$(curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $RPC_URL 2>/dev/null | grep -o '"result":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$CURRENT_BLOCK" ]; then
  BLOCK_NUM=$((16#${CURRENT_BLOCK#0x}))
  echo "📊 Current block number: $BLOCK_NUM"
fi
