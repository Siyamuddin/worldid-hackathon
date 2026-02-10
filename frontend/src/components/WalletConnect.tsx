import { useWallet, DEMO_WALLETS } from '../hooks/useWallet';
import { useEffect, useState } from 'react';
import { isMiniAppEnvironment } from '../lib/miniapp';
import { useConnect } from 'wagmi';

export function WalletConnect() {
  const { address, isConnected, connectWallet, disconnect, connectMockWallet, isConnecting, error, isMockWallet } = useWallet();
  const { connectors } = useConnect();
  const [hasWallet, setHasWallet] = useState(false);
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [showWalletOptions, setShowWalletOptions] = useState(false);
  const [showDemoWallets, setShowDemoWallets] = useState(false);

  // Debug: Log state changes (must be before any conditional returns)
  useEffect(() => {
    console.log('WalletConnect state:', { showDemoWallets, isConnected, hasWallet, address });
  }, [showDemoWallets, isConnected, hasWallet, address]);

  useEffect(() => {
    // Check if we're in a mini app
    setIsMiniApp(isMiniAppEnvironment());
    
    // Check if wallet is available
    if (typeof window !== 'undefined') {
      const checkWallet = () => {
        setHasWallet(
          typeof window.ethereum !== 'undefined' ||
          typeof (window as any).web3 !== 'undefined'
        );
      };
      
      checkWallet();
      
      // Listen for wallet connection events
      const ethereum = (window as any).ethereum;
      if (ethereum) {
        ethereum.on('accountsChanged', checkWallet);
        ethereum.on('chainChanged', () => {
          // Reload on chain change
          window.location.reload();
        });
        
        return () => {
          if (ethereum.removeListener) {
            ethereum.removeListener('accountsChanged', checkWallet);
            ethereum.removeListener('chainChanged', () => {});
          }
        };
      }
      
      // Check for wallet connection on page load (for mini app deep linking)
      if (isMiniApp && !isConnected) {
        // Poll for connection state changes
        const checkInterval = setInterval(() => {
          if ((window as any).ethereum) {
            (window as any).ethereum.request({ method: 'eth_accounts' })
              .then((accounts: string[]) => {
                if (accounts.length > 0 && !isConnected) {
                  // Wallet connected, trigger re-render
                  window.location.reload();
                }
              })
              .catch(() => {
                // Ignore errors
              });
          }
        }, 2000);
        
        return () => clearInterval(checkInterval);
      }
    }
  }, [isConnected, isMiniApp]);

  // If demo wallets modal is open, show it regardless of wallet status (must be checked first)
  if (showDemoWallets) {
    return (
      <div className="flex flex-col gap-2 w-full sm:w-auto" style={{ position: 'relative', zIndex: 10 }}>
        {isMiniApp && (
          <div className="mb-2 p-2 bg-yellow-500/20 border border-yellow-500/40 rounded-lg">
            <p className="text-xs text-yellow-300 text-center">
              ⚠️ Mini App Mode: Wallet connection may open external browser
            </p>
          </div>
        )}
        <div className="space-y-2" style={{ position: 'relative', zIndex: 100 }}>
          <div className="p-3 bg-[#0f2a24] border border-[#00FFC2]/20 rounded-lg">
            <p className="text-xs sm:text-sm text-white font-semibold mb-2">🎭 Demo Wallets (For Testing)</p>
            <p className="text-xs text-gray-400 mb-3">
              Use these demo wallets to test the application without connecting a real wallet.
            </p>
            <div className="space-y-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Connecting demo user 1');
                  connectMockWallet('user1');
                  setShowDemoWallets(false);
                }}
                type="button"
                className="w-full px-4 py-2.5 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] text-xs sm:text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>👤 Demo User 1</span>
                <span className="text-[10px] font-mono">{DEMO_WALLETS.user1.slice(0, 8)}...</span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Connecting demo user 2');
                  connectMockWallet('user2');
                  setShowDemoWallets(false);
                }}
                type="button"
                className="w-full px-4 py-2.5 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] text-xs sm:text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>👤 Demo User 2</span>
                <span className="text-[10px] font-mono">{DEMO_WALLETS.user2.slice(0, 8)}...</span>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Connecting demo user 3');
                  connectMockWallet('user3');
                  setShowDemoWallets(false);
                }}
                type="button"
                className="w-full px-4 py-2.5 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] text-xs sm:text-sm font-semibold transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>👤 Demo User 3</span>
                <span className="text-[10px] font-mono">{DEMO_WALLETS.user3.slice(0, 8)}...</span>
              </button>
            </div>
            <button
              onClick={() => setShowDemoWallets(false)}
              className="mt-2 w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-xs sm:text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
          <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-300 text-center">
              ⚠️ Demo wallets work for testing UI and flow, but transactions require real wallet connection
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
        <div className="px-3 sm:px-4 py-2 bg-green-500/20 border border-green-500/40 text-green-400 rounded-lg text-xs sm:text-sm font-mono text-center sm:text-left break-all sm:break-normal">
          {address.slice(0, 6)}...{address.slice(-4)}
          {isMockWallet && (
            <span className="ml-2 px-1.5 py-0.5 bg-yellow-500/30 text-yellow-300 text-[10px] rounded">DEMO</span>
          )}
        </div>
        <button
          onClick={() => disconnect()}
          className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-xs sm:text-sm transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (!hasWallet) {
    // In mini app, show instructions instead of just linking to MetaMask website
    if (isMiniApp) {
      return (
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          <div className="p-3 bg-[#0f2a24] border border-[#00FFC2]/20 rounded-lg">
            <p className="text-xs sm:text-sm text-white font-semibold mb-2">📱 Install Wallet for Mini App</p>
            <div className="text-xs text-gray-300 space-y-2">
              <p><strong>Option 1: Install MetaMask Mobile App</strong></p>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href="https://metamask.app.link/dapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] text-center text-xs font-semibold transition-colors"
                >
                  Install MetaMask Mobile
                </a>
                <a
                  href="https://apps.apple.com/app/metamask/id1438144202"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-center text-xs font-semibold transition-colors"
                >
                  iOS App Store
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=io.metamask"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-center text-xs font-semibold transition-colors"
                >
                  Google Play
                </a>
              </div>
              <p className="mt-2"><strong>Option 2: Open in Main Browser</strong></p>
              <p className="text-xs text-gray-400">
                Open this app in your device's main browser (Chrome, Safari) where you can install MetaMask extension.
              </p>
              <button
                onClick={() => {
                  const currentUrl = window.location.href;
                  if (navigator.share) {
                    navigator.share({
                      title: 'Open in Browser',
                      text: 'Open this app in your browser to install MetaMask',
                      url: currentUrl
                    }).catch(() => {
                      // Fallback: copy to clipboard
                      navigator.clipboard.writeText(currentUrl);
                      alert('URL copied to clipboard! Paste it in your main browser.');
                    });
                  } else {
                    // Fallback: copy to clipboard
                    navigator.clipboard.writeText(currentUrl);
                    alert('URL copied to clipboard! Paste it in your main browser to install MetaMask.');
                  }
                }}
                className="w-full px-3 py-2 bg-[#00FFC2]/20 border border-[#00FFC2]/40 text-[#00FFC2] rounded-lg hover:bg-[#00FFC2]/30 text-center text-xs font-semibold transition-colors"
              >
                Copy URL to Open in Browser
              </button>
              <p className="mt-2"><strong>Option 3: Use Demo Wallet</strong></p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Demo wallet button clicked (mini app)');
                  setShowDemoWallets(true);
                }}
                type="button"
                className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center text-xs font-semibold transition-colors cursor-pointer relative z-10"
              >
                🎭 Use Demo Wallet (For Testing)
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">
            After installing, return here and connect your wallet, or use demo wallet for testing
          </p>
        </div>
      );
    }
    
    // Regular browser - show standard MetaMask install link + demo wallet option
    return (
      <div className="flex flex-col gap-2 w-full sm:w-auto">
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 sm:px-6 py-2.5 sm:py-2 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] text-center text-xs sm:text-sm font-semibold transition-colors"
        >
          Install MetaMask
        </a>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Demo wallet button clicked (no wallet)');
            setShowDemoWallets(true);
          }}
          type="button"
          className="px-4 sm:px-6 py-2.5 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-center text-xs sm:text-sm font-semibold transition-colors cursor-pointer relative z-10"
        >
          🎭 Use Demo Wallet (For Testing)
        </button>
        <p className="text-xs text-gray-400 text-center">
          Wallet required to claim rewards, or use demo wallet for testing
        </p>
      </div>
    );
  }

  // Get available wallet connectors
  const injectedConnector = connectors.find(c => c.id === 'injected' || c.type === 'injected');

  const handleConnect = () => {
    connectWallet();
  };

  const handleManualAddress = () => {
    const address = prompt('Enter your wallet address manually:');
    if (address && /^0x[a-fA-F0-9]{40}$/.test(address)) {
      // Store manually entered address
      localStorage.setItem('manual_wallet_address', address);
      // Reload to pick up the address
      window.location.reload();
    } else if (address) {
      alert('Invalid wallet address format. Please enter a valid Ethereum address (0x...).');
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full sm:w-auto" style={{ position: 'relative', zIndex: 10 }}>
      {isMiniApp && (
        <div className="mb-2 p-2 bg-yellow-500/20 border border-yellow-500/40 rounded-lg">
          <p className="text-xs text-yellow-300 text-center">
            ⚠️ Mini App Mode: Wallet connection may open external browser
          </p>
        </div>
      )}

      {showWalletOptions ? (
        <div className="space-y-2">
          <div className="p-3 bg-[#0f2a24] border border-[#00FFC2]/20 rounded-lg">
            <p className="text-xs sm:text-sm text-white font-semibold mb-3">Alternative Connection Methods</p>
            <div className="space-y-2">
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full px-4 py-2.5 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>🦊</span>
                <span>Try Browser Wallet Again</span>
              </button>
              <button
                onClick={() => {
                  setShowWalletOptions(false);
                  setShowDemoWallets(true);
                }}
                className="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>🎭</span>
                <span>Use Demo Wallet</span>
              </button>
              {isMiniApp && (
                <button
                  onClick={handleManualAddress}
                  className="w-full px-4 py-2.5 bg-[#3b99fc] text-white rounded-lg hover:bg-[#2a7dd4] text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <span>✍️</span>
                  <span>Enter Address Manually</span>
                </button>
              )}
            </div>
            <button
              onClick={() => setShowWalletOptions(false)}
              className="mt-2 w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-xs sm:text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-gray-400 text-center">
            {isMiniApp 
              ? 'If browser connection fails, you can use demo wallet or manually enter address'
              : 'Alternative connection methods'}
          </p>
        </div>
      ) : (
        <>
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="px-4 sm:px-6 py-2.5 sm:py-2 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-semibold transition-colors"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
          <div className="flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Demo wallet button clicked - setting showDemoWallets to true');
                try {
                  setShowDemoWallets(true);
                  console.log('State updated, showDemoWallets should be true now');
                } catch (error) {
                  console.error('Error setting demo wallets:', error);
                  alert('Error opening demo wallets. Please refresh the page.');
                }
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              type="button"
              className="px-4 sm:px-6 py-2.5 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 text-xs sm:text-sm font-semibold transition-colors cursor-pointer relative z-50 pointer-events-auto"
              style={{ pointerEvents: 'auto', zIndex: 50 }}
            >
              🎭 Use Demo Wallet
            </button>
            {/* Quick connect option - directly connect to user1 */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Quick connect to demo user 1');
                try {
                  connectMockWallet('user1');
                  alert('Demo wallet connected! Address: ' + DEMO_WALLETS.user1);
                } catch (error) {
                  console.error('Error connecting demo wallet:', error);
                  alert('Error connecting demo wallet. Please try again.');
                }
              }}
              type="button"
              className="px-4 sm:px-6 py-2 bg-purple-500/80 text-white rounded-lg hover:bg-purple-600 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              ⚡ Quick Connect (Demo User 1)
            </button>
          </div>
          {isMiniApp && !isConnecting && (
            <button
              onClick={() => setShowWalletOptions(true)}
              className="px-4 sm:px-6 py-2 text-[#00FFC2] border border-[#00FFC2]/40 rounded-lg hover:bg-[#00FFC2]/10 text-xs sm:text-sm font-semibold transition-colors"
            >
              Other Options
            </button>
          )}
          <p className="text-xs text-gray-400 text-center max-w-xs mx-auto sm:mx-0">
            {isConnecting 
              ? isMiniApp
                ? 'If a browser opened, approve the connection there, then return here'
                : 'MetaMask will ask for your wallet password to unlock it'
              : isMiniApp
                ? 'Click to connect. If a browser opens, approve there and return.'
                : 'Click to connect. MetaMask will prompt for your wallet password.'}
          </p>
          {error && (
            <div className="space-y-2">
              <p className="text-xs text-red-400 text-center">
                {error.message || 'Connection failed'}
              </p>
              {isMiniApp && (
                <button
                  onClick={() => setShowWalletOptions(true)}
                  className="w-full px-3 py-1.5 text-xs text-[#00FFC2] border border-[#00FFC2]/40 rounded hover:bg-[#00FFC2]/10 transition-colors"
                >
                  Try Alternative Method
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
