import { useState } from 'react';

export function PrivacyNotice() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <span className="text-blue-600">🔒</span>
            Your Privacy is Protected
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
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
          className="text-blue-600 hover:text-blue-800 text-sm ml-4"
        >
          {isExpanded ? 'Less' : 'More'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-blue-700">
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
