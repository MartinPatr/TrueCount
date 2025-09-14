// Reset wallet and blockchain state
// Run this in your browser console when connected to MetaMask

async function resetWalletState() {
  console.log('🔄 Resetting wallet state...');
  
  try {
    // Request account access to reset nonce
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    console.log('✅ Account access granted:', accounts[0]);
    
    // Get current chain ID
    const chainId = await window.ethereum.request({ 
      method: 'eth_chainId' 
    });
    console.log('🔗 Current chain ID:', chainId);
    
    // Switch to localhost if not already
    if (chainId !== '0x7a69') {
      console.log('🔄 Switching to localhost...');
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7a69' }],
      });
    }
    
    // Add localhost network if not exists
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x7a69',
          chainName: 'Localhost',
          rpcUrls: ['http://127.0.0.1:8545'],
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
          }
        }]
      });
    } catch (error) {
      if (error.code === 4902) {
        console.log('✅ Localhost network already added');
      } else {
        console.log('⚠️  Could not add localhost network:', error.message);
      }
    }
    
    // Mine a few blocks to ensure we have enough
    console.log('⛏️  Mining blocks...');
    for (let i = 0; i < 5; i++) {
      try {
        await fetch('http://localhost:8545', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'evm_mine',
            params: [],
            id: 1
          })
        });
      } catch (err) {
        console.log('⚠️  Could not mine block:', err.message);
      }
    }
    
    console.log('✅ Wallet state reset complete!');
    console.log('📝 You can now try creating a poll again');
    
  } catch (error) {
    console.error('❌ Error resetting wallet:', error);
  }
}

// Run the reset function
resetWalletState();
