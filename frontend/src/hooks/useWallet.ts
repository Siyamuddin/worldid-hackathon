import { useAccount, useConnect, useDisconnect } from 'wagmi';

export function useWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const connectWallet = () => {
    // Find MetaMask or injected connector
    const injectedConnector = connectors.find(c => 
      c.id === 'injected' || c.name === 'MetaMask'
    );
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    } else if (connectors.length > 0) {
      // Fallback to first available connector
      connect({ connector: connectors[0] });
    }
  };

  return {
    address,
    isConnected,
    connectWallet,
    disconnect,
    isConnecting: isPending,
  };
}
