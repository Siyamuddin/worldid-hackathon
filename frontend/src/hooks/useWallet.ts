import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();

  const connectWallet = async () => {
    try {
      // Find injected connector (MetaMask, WalletConnect, etc.)
      const injectedConnector = connectors.find(c => 
        c.id === 'injected' || c.type === 'injected'
      );
      
      if (injectedConnector) {
        await connect({ connector: injectedConnector });
      } else if (connectors.length > 0) {
        // Fallback to first available connector
        await connect({ connector: connectors[0] });
      } else {
        alert('No wallet found. Please install MetaMask or another Web3 wallet.');
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
      if (error?.message?.includes('User rejected')) {
        // User cancelled - don't show error
        return;
      }
      alert(`Failed to connect wallet: ${error?.message || 'Unknown error'}`);
    }
  };

  return {
    address,
    isConnected,
    connectWallet,
    disconnect,
    isConnecting: isPending,
    error: connectError,
  };
}
