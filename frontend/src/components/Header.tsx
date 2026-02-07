import { useState } from 'react';
import { Link } from 'react-router-dom';
import { WalletConnect } from './WalletConnect';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

interface HeaderProps {
  showWallet?: boolean;
  showNav?: boolean;
}

export function Header({ showWallet = true, showNav = false }: HeaderProps) {
  const { isAuthenticated } = useGoogleAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center w-full px-4 sm:px-5 py-4 sm:py-5 text-xs sm:text-sm tracking-wide absolute top-0 z-30 bg-[#0a1f1a]/95 backdrop-blur-sm">
        <Link 
          to="/" 
          className="text-gray-300 font-medium hover:text-[#00FFC2] transition-colors text-sm sm:text-base"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <span className="hidden sm:inline">INHUMAN // WORLD ID</span>
          <span className="sm:hidden">INHUMAN</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Desktop Navigation */}
          {showNav && (
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/browse"
                className="text-gray-300 hover:text-[#00FFC2] transition-colors"
              >
                Browse Events
              </Link>
              {isAuthenticated && (
                <Link
                  to="/dashboard"
                  className="text-gray-300 hover:text-[#00FFC2] transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </div>
          )}
          {showWallet && (
            <div className="hidden sm:block">
              <WalletConnect />
            </div>
          )}
          {/* Network Status - Compact on mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="hidden sm:inline text-[#00FFC2] font-medium">NETWORK ACTIVE</span>
            <span className="sm:hidden text-[#00FFC2] font-medium text-xs">ACTIVE</span>
            <div className="w-2 h-2 bg-[#00FFC2] rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,194,0.8)]"></div>
          </div>
          {/* Hamburger Menu Button */}
          {showNav && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-[#00FFC2] transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && showNav && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 h-full w-64 bg-[#0f2a24] border-l border-[#00FFC2]/20 z-50 md:hidden shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full pt-16 px-4">
              <div className="flex flex-col gap-4 mb-6">
                <Link
                  to="/browse"
                  className="text-gray-300 hover:text-[#00FFC2] transition-colors py-2 px-4 rounded-lg hover:bg-[#00FFC2]/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Browse Events
                </Link>
                {isAuthenticated && (
                  <Link
                    to="/dashboard"
                    className="text-gray-300 hover:text-[#00FFC2] transition-colors py-2 px-4 rounded-lg hover:bg-[#00FFC2]/10"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
              </div>
              {showWallet && (
                <div className="mt-auto pb-6">
                  <div className="px-4 mb-2 text-xs text-gray-400 uppercase tracking-wide">Wallet</div>
                  <WalletConnect />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
