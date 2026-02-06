import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';
import { useState } from 'react';

interface WorldIDVerificationProps {
  onSuccess: (proof: any) => void;
  signal?: string;
  disabled?: boolean;
}

export function WorldIDVerification({ onSuccess, signal, disabled }: WorldIDVerificationProps) {
  const [isVerified, setIsVerified] = useState(false);

  const handleVerify = (proof: any) => {
    setIsVerified(true);
    onSuccess(proof);
  };

  if (isVerified) {
    return (
      <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg">
        ✓ WorldID Verified
      </div>
    );
  }

  return (
    <IDKitWidget
      app_id={import.meta.env.VITE_WORLDID_APP_ID || 'app_staging_123'}
      action={import.meta.env.VITE_WORLDID_ACTION || 'worldid-reward-claim'}
      signal={signal}
      verification_level={VerificationLevel.Orb}
      onSuccess={handleVerify}
      disabled={disabled}
    >
      {({ open }) => (
        <button
          onClick={open}
          disabled={disabled}
          className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
        >
          Verify with WorldID
        </button>
      )}
    </IDKitWidget>
  );
}
