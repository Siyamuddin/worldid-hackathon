import { useWallet } from '../hooks/useWallet';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    ethereum?: any;
    web3?: any;
  }
}


export function WalletConnect() {
  const { address, isConnected, connectWallet, disconnect, isConnecting, error } = useWallet();
  const [hasWallet, setHasWallet] = useState(false);

  useEffect(() => {
    // Check if wallet is available
    if (typeof window !== 'undefined') {
      setHasWallet(
        typeof window.ethereum !== 'undefined' ||
        typeof (window as any).web3 !== 'undefined'
      );
    }
  }, []);

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (!hasWallet) {
    return (
      <div className="flex flex-col gap-2">
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-center text-sm"
        >
          Install MetaMask
        </a>
        <p className="text-xs text-gray-500 text-center">
          Wallet required to claim rewards
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && (
        <p className="text-xs text-red-600 text-center">
          {error.message || 'Connection failed'}
        </p>
      )}
    </div>
  );
}
