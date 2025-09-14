#!/bin/bash

# Script to update contract address in environment file
# Usage: ./update-contract.sh <new_contract_address>

if [ $# -eq 0 ]; then
    echo "Usage: ./update-contract.sh <new_contract_address>"
    echo "Example: ./update-contract.sh 0x1234567890abcdef1234567890abcdef12345678"
    exit 1
fi

NEW_ADDRESS=$1

# Update .env.local file
if [ -f .env.local ]; then
    # Update existing file
    sed -i.bak "s/NEXT_PUBLIC_CONTRACT_ADDRESS=.*/NEXT_PUBLIC_CONTRACT_ADDRESS=$NEW_ADDRESS/" .env.local
    echo "✅ Updated contract address in .env.local to: $NEW_ADDRESS"
else
    # Create new file
    cat > .env.local << EOF
# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=$NEW_ADDRESS
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

# WalletConnect Project ID (for RainbowKit)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=7dd6439c7ec6f83b35930d38eb9ea781
EOF
    echo "✅ Created .env.local with contract address: $NEW_ADDRESS"
fi

echo "🔄 Please restart your frontend to pick up the new contract address"
