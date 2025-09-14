# Environment Configuration

This document explains how to configure the TrueCount application using environment variables.

## Environment File

The application uses `.env.local` for local development configuration. This file contains:

```bash
# Contract Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

# WalletConnect Project ID (for RainbowKit)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=7dd6439c7ec6f83b35930d38eb9ea781
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed SealedVote contract address | `0x9fe46736679d2d9a65f0992f2272de9f3c7fa6e0` | Yes |
| `NEXT_PUBLIC_CHAIN_ID` | Blockchain chain ID (31337 for localhost) | `31337` | Yes |
| `NEXT_PUBLIC_RPC_URL` | RPC endpoint URL | `http://127.0.0.1:8545` | Yes |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID for RainbowKit | `7dd6439c7ec6f83b35930d38eb9ea781` | Yes |

## Updating Contract Address

### Method 1: Using the update script
```bash
./update-contract.sh 0x1234567890abcdef1234567890abcdef12345678
```

### Method 2: Manual update
Edit `.env.local` and update the `NEXT_PUBLIC_CONTRACT_ADDRESS` value.

### Method 3: Environment variable override
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678 npm run dev
```

## Deployment Workflow

1. **Deploy contract**: Run the deployment script in the hardhat project
2. **Update address**: Use `./update-contract.sh <new_address>` to update the environment
3. **Restart frontend**: Restart your development server to pick up the new address

## Production Deployment

For production, set these environment variables in your deployment platform:

- Vercel: Add to Environment Variables in project settings
- Netlify: Add to Environment Variables in site settings
- Other platforms: Set as environment variables in your deployment configuration

## Security Notes

- Never commit `.env.local` to version control
- Use different contract addresses for different environments
- Keep your WalletConnect Project ID secure
