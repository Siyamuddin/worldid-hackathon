import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';
import { isMiniAppEnvironment, getWalletFromParams } from '../lib/miniapp';

// Demo wallet addresses for testing (valid Ethereum addresses - 42 characters each)
export const DEMO_WALLETS = {
  user1: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  user2: '0x8ba1f109551bD432803012645aac136c22C92900',
  user3: '0x1234567890123456789012345678901234567890',
};

export function useWallet() {
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [mockAddress, setMockAddress] = useState<string | null>(null);
  
  // Check for mock wallet on mount and listen for changes
  useEffect(() => {
    const checkMockWallet = () => {
      const storedMock = localStorage.getItem('demo_wallet_address');
      if (storedMock && storedMock !== mockAddress) {
        console.log('Found stored demo wallet:', storedMock);
        setMockAddress(storedMock);
      }
    };
    
    checkMockWallet();
    
    // Listen for storage changes (when demo wallet is set from another component)
    const handleStorageChange = () => {
      checkMockWallet();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('demo-wallet-connected', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('demo-wallet-connected', handleStorageChange);
    };
  }, [mockAddress]);
  
  // Use mock wallet if available, otherwise use real wallet
  const address = mockAddress || wagmiAddress;
  const isConnected = !!mockAddress || wagmiConnected;

  useEffect(() => {
    // Check if we're in a mini app environment
    const miniApp = isMiniAppEnvironment();
    setIsMiniApp(miniApp);
    
    // Check for wallet address in URL params (deep link from external browser)
    const walletFromParams = getWalletFromParams();
    if (walletFromParams && !isConnected) {
      console.log('Found wallet address in URL params:', walletFromParams);
      // Store it for manual connection
      localStorage.setItem('pending_wallet_address', walletFromParams);
    }
    
    // Check for manually entered wallet address
    const manualAddress = localStorage.getItem('manual_wallet_address');
    if (manualAddress && !isConnected && !address) {
      console.log('Found manually entered wallet address:', manualAddress);
      // Note: This won't actually connect the wallet for signing, but can be used for display
      // The user will still need to connect properly for transactions
    }
    
    // For mini apps: Check if wallet was connected in external browser
    if (miniApp && !isConnected) {
      const checkWalletConnection = async () => {
        try {
          const ethereum = (window as any).ethereum;
          if (ethereum) {
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts && accounts.length > 0) {
              console.log('Wallet found connected:', accounts[0]);
              // Wallet is connected, trigger wagmi to recognize it
              // This will be picked up by useAccount hook
              window.location.reload();
            }
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      };
      
      // Check immediately
      checkWalletConnection();
      
      // Also check periodically (in case user just returned from external browser)
      const interval = setInterval(checkWalletConnection, 3000);
      
      return () => clearInterval(interval);
    }
    
    // Clear error when connection succeeds
    if (isConnected) {
      setConnectionError(null);
      localStorage.removeItem('pending_wallet_address');
    }
  }, [isConnected]);

  const connectWallet = async (specificConnector?: any) => {
    try {
      setConnectionError(null);
      
      // Special handling for mini app environments
      if (isMiniApp) {
        // In mini apps, wallet connection often opens external browser
        // We'll use a workaround: open connection in current window with return URL
        const currentUrl = window.location.href;
        const returnUrl = encodeURIComponent(currentUrl);
        
        // Check if we have a pending wallet address from deep link
        const pendingWallet = localStorage.getItem('pending_wallet_address');
        if (pendingWallet) {
          console.log('Using pending wallet address from deep link');
          // Try to connect with the address we got from deep link
          // Note: This is a workaround - actual connection still needs wallet provider
          localStorage.removeItem('pending_wallet_address');
        }
        
        // Show instructions for mini app users
        const userConfirmed = confirm(
          'Wallet Connection in Mini App\n\n' +
          'To connect your wallet:\n' +
          '1. Click OK to proceed\n' +
          '2. If a new browser opens, approve the connection there\n' +
          '3. Return to this app - your wallet should be connected\n\n' +
          'If connection fails, try opening this app in your main browser instead.'
        );
        
        if (!userConfirmed) {
          return;
        }
      }
      
      // Check if window.ethereum is available
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        if (isMiniApp) {
          const errorMsg = 'Wallet not detected in mini app. Please:\n\n' +
                          '1. Open this app in your main browser, or\n' +
                          '2. Install MetaMask in your device browser';
          setConnectionError(errorMsg);
          alert(errorMsg);
        } else {
          const errorMsg = 'No wallet detected. Please install MetaMask or another Web3 wallet.';
          setConnectionError(errorMsg);
          alert(errorMsg);
        }
        return;
      }

      console.log('Available connectors:', connectors.map(c => ({ id: c.id, name: c.name, type: c.type })));

      // Use specific connector if provided, otherwise find one
      let connectorToUse = specificConnector;
      
      if (!connectorToUse) {
        // Find injected connector (MetaMask, WalletConnect, etc.)
        // Try multiple ways to find the injected connector
        connectorToUse = connectors.find(c => 
          c.id === 'injected' || 
          c.type === 'injected' ||
          c.name?.toLowerCase().includes('injected') ||
          c.name?.toLowerCase().includes('metamask')
        );
        
        // If not found, try the first connector
        if (!connectorToUse && connectors.length > 0) {
          console.log('Using first available connector:', connectors[0].name || connectors[0].id);
          connectorToUse = connectors[0];
        }
      }
      
      if (!connectorToUse) {
        const errorMsg = 'No wallet connector found. Please refresh the page.';
        setConnectionError(errorMsg);
        console.error('No connector found. Available connectors:', connectors);
        alert(errorMsg);
        return;
      }

      console.log('Connecting with connector:', connectorToUse.name || connectorToUse.id);
      
      // Connect using wagmi
      // In wagmi v3, connect() may not return a promise, so we call it directly
      connect({ 
        connector: connectorToUse,
      });
      
      // The connection state will be updated via useAccount hook
      
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      
      // Handle specific error cases
      if (errorMessage.includes('User rejected') || 
          errorMessage.includes('user rejected') ||
          errorMessage.includes('User denied') ||
          errorMessage.includes('user denied')) {
        // User cancelled - don't show error
        setConnectionError(null);
        return;
      }
      
      if (errorMessage.includes('No Ethereum provider') || errorMessage.includes('ethereum provider')) {
        const errorMsg = 'No wallet detected. Please install MetaMask.';
        setConnectionError(errorMsg);
        alert(errorMsg);
      } else {
        setConnectionError(errorMessage);
        console.error('Connection failed:', errorMessage);
        alert(`Failed to connect wallet: ${errorMessage}`);
      }
    }
  };

  const disconnect = () => {
    if (mockAddress) {
      // Disconnect mock wallet
      localStorage.removeItem('demo_wallet_address');
      setMockAddress(null);
    } else {
      // Disconnect real wallet
      wagmiDisconnect();
    }
  };

  const connectMockWallet = (walletKey: keyof typeof DEMO_WALLETS = 'user1') => {
    try {
      const demoAddress = DEMO_WALLETS[walletKey];
      if (!demoAddress) {
        console.error('Invalid wallet key:', walletKey);
        return;
      }
      console.log('Connecting to demo wallet:', demoAddress);
      localStorage.setItem('demo_wallet_address', demoAddress);
      setMockAddress(demoAddress);
      console.log('Demo wallet connected successfully:', demoAddress);
      // Trigger custom event to notify other components
      window.dispatchEvent(new CustomEvent('demo-wallet-connected', { detail: { address: demoAddress } }));
    } catch (error) {
      console.error('Error connecting demo wallet:', error);
      alert('Failed to connect demo wallet. Please try again.');
    }
  };

  return {
    address,
    isConnected,
    connectWallet,
    disconnect,
    connectMockWallet,
    isConnecting: isPending,
    isMockWallet: !!mockAddress,
    error: connectError || (connectionError ? { message: connectionError } : null),
  };
}
