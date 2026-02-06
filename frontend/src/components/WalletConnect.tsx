import { useWallet } from '../hooks/useWallet';

export function WalletConnect() {
  const { address, isConnected, connectWallet, disconnect, isConnecting } = useWallet();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg">
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <button
          onClick={disconnect}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
