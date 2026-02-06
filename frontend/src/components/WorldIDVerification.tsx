import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';
import { useState } from 'react';

interface WorldIDVerificationProps {
  onSuccess: (proof: any) => void;
  signal?: string;
  disabled?: boolean;
  showPrivacyInfo?: boolean;
}

export function WorldIDVerification({ onSuccess, signal, disabled, showPrivacyInfo = true }: WorldIDVerificationProps) {
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = (proof: any) => {
    setIsVerified(true);
    onSuccess(proof);
  };

  const handleError = (error: any) => {
    // Silently handle verification rejection (user cancelled)
    // This is expected behavior, not an error
    if (error?.code === 'verification_rejected') {
      return;
    }
    // Log other errors for debugging
    console.warn('WorldID verification error:', error);
  };

  if (isVerified) {
    return (
      <div className="space-y-2">
        <div className="px-4 py-3 bg-green-100 border border-green-300 text-green-800 rounded-lg flex items-center gap-2">
          <span className="text-xl">✓</span>
          <span className="font-medium">WorldID Verified</span>
        </div>
        {showPrivacyInfo && (
          <p className="text-xs text-gray-600">
            Your privacy is protected - we only verify uniqueness, not identity
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <IDKitWidget
        app_id={import.meta.env.VITE_WORLDID_APP_ID || 'app_staging_123'}
        action={import.meta.env.VITE_WORLDID_ACTION || 'worldid-reward-claim'}
        signal={signal}
        verification_level={VerificationLevel.Device}
        onSuccess={handleVerify}
        onError={handleError}
      >
        {({ open }) => (
          <button
            onClick={open}
            disabled={disabled}
            className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            Verify with WorldID
          </button>
        )}
      </IDKitWidget>
      {showPrivacyInfo && (
        <p className="text-xs text-gray-600">
          🔒 Privacy: WorldID verifies you're human without revealing your identity
        </p>
      )}
    </div>
  );
}
