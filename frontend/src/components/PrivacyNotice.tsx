import { useState } from 'react';

export function PrivacyNotice() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[#00FFC2]/10 border border-[#00FFC2]/30 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm font-semibold text-[#00FFC2] mb-2 flex items-center gap-1.5 sm:gap-2">
            <span className="flex-shrink-0">🔒</span>
            <span>Your Privacy is Protected</span>
          </h3>
          <div className="text-xs sm:text-sm text-gray-300 space-y-1">
            <p className="font-medium">✅ We collect:</p>
            <ul className="list-disc list-inside ml-2 text-xs">
              <li>Nullifier hash (anonymous identifier)</li>
              <li>Wallet address (public blockchain data)</li>
            </ul>
            <p className="font-medium mt-2">❌ We DON'T collect:</p>
            <ul className="list-disc list-inside ml-2 text-xs">
              <li>Your name or personal information</li>
              <li>Your email or phone number</li>
              <li>Your identity or biometric data</li>
            </ul>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#00FFC2] hover:text-[#00e6b8] text-xs sm:text-sm ml-2 sm:ml-4 transition-colors flex-shrink-0"
        >
          {isExpanded ? 'Less' : 'More'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[#00FFC2]/30 text-xs text-gray-300">
          <p className="mb-2">
            <strong>How it works:</strong> WorldID uses Zero-Knowledge Proofs to verify you're a unique human 
            without revealing your identity. We only store an anonymous hash that prevents duplicate claims.
          </p>
          <p>
            <strong>Your data:</strong> We use data minimization - only collecting what's necessary for 
            reward distribution. Your privacy is protected by design.
          </p>
        </div>
      )}
    </div>
  );
}
