import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';
import { useState, useEffect } from 'react';
import { isMiniAppEnvironment } from '../lib/miniapp';

interface WorldIDVerificationProps {
  onSuccess: (proof: any) => void;
  signal?: string;
  disabled?: boolean;
  showPrivacyInfo?: boolean;
}

export function WorldIDVerification({ onSuccess, signal, disabled, showPrivacyInfo = true }: WorldIDVerificationProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionTimeout, setConnectionTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleVerify = (proof: any) => {
    console.log('WorldID verification successful:', proof);
    // Clear any timeout
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      setConnectionTimeout(null);
    }
    setIsConnecting(false);
    setIsVerified(true);
    onSuccess(proof);
  };

  useEffect(() => {
    // Check if we're in a mini app environment
    setIsMiniApp(isMiniAppEnvironment());
    
    // Check for proof in URL parameters (for mini app redirects)
    // WorldID IDKit may pass the proof via URL after redirect
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    
    // Check for proof in URL (common pattern for mobile redirects)
    const proofParam = urlParams.get('proof') || hashParams.get('proof');
    if (proofParam) {
      try {
        const proof = JSON.parse(decodeURIComponent(proofParam));
        if (proof && proof.merkle_root) {
          console.log('Found WorldID proof in URL, processing...');
          handleVerify(proof);
          // Clean up URL
          const cleanUrl = window.location.pathname + window.location.hash.split('?')[0];
          window.history.replaceState({}, document.title, cleanUrl);
        }
      } catch (error) {
        console.error('Error parsing proof from URL:', error);
      }
    }
    
    // Also check for WorldID callback parameters
    // The IDKit widget may use different parameter names
    const checkWorldIDCallback = () => {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Check for common WorldID callback patterns
      const merkleRoot = params.get('merkle_root') || hashParams.get('merkle_root');
      const nullifierHash = params.get('nullifier_hash') || hashParams.get('nullifier_hash');
      const proofParam = params.get('proof') || hashParams.get('proof');
      
      if (merkleRoot && nullifierHash) {
        try {
          const proof = {
            merkle_root: merkleRoot,
            nullifier_hash: nullifierHash,
            proof: proofParam ? JSON.parse(decodeURIComponent(proofParam)) : undefined,
          };
          console.log('Found WorldID proof in callback URL, processing...');
          handleVerify(proof);
          // Clean up URL
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch (error) {
          console.error('Error processing WorldID callback:', error);
        }
      }
    };
    
    checkWorldIDCallback();
  }, []);


  const handleError = (error: any) => {
    // Clear timeout
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      setConnectionTimeout(null);
    }
    setIsConnecting(false);
    
    // Silently handle verification rejection (user cancelled)
    // This is expected behavior, not an error
    if (error?.code === 'verification_rejected' || error?.code === 'user_rejected') {
      console.log('User cancelled WorldID verification');
      return;
    }
    
    // Log other errors for debugging
    console.error('WorldID verification error:', error);
    
    // Check for common error patterns
    const errorMessage = error?.message || error?.detail || '';
    const errorCode = error?.code || '';
    
    // For "something is wrong" errors from World App
    if (errorMessage.toLowerCase().includes('something is wrong') || 
        errorMessage.toLowerCase().includes('request not found') ||
        errorCode === 'request_not_found') {
      alert(
        '⚠️ WorldID Verification Failed\n\n' +
        'The action "worldid-reward-claim" might not exist in your WorldID Developer Portal.\n\n' +
        'Please check:\n' +
        '1. Go to https://developer.worldcoin.org/\n' +
        '2. Open your app (ID: app_2c1d85cd742db32847cb795c3fffaa9f)\n' +
        '3. Create action: "worldid-reward-claim"\n' +
        '4. Set verification level to "Device"\n' +
        '5. Save and try again'
      );
      return;
    }
    
    // For mini apps, provide more helpful error messages
    if (isMiniApp) {
      if (errorMessage.includes('request') || errorCode === 'request_not_found') {
        alert(
          'WorldID verification failed. This might be because:\n\n' +
          '1. The action "worldid-reward-claim" doesn\'t exist in your WorldID Developer Portal\n' +
          '2. The verification was opened in an external browser\n\n' +
          'Please ensure the action is created in the WorldID Developer Portal.'
        );
        return;
      }
    }
    
    // Show user-friendly error message
    if (errorMessage) {
      alert(`WorldID Error: ${errorMessage}`);
    } else if (errorCode) {
      alert(`WorldID Error: ${errorCode}`);
    } else {
      alert('WorldID verification failed. Please try again or check your WorldID configuration.');
    }
  };

  const handleCancel = () => {
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      setConnectionTimeout(null);
    }
    setIsConnecting(false);
    // Force a page reload to reset the WorldID widget state
    window.location.reload();
  };

  if (isVerified) {
    return (
      <div className="space-y-2">
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-green-500/20 border border-green-500/40 text-green-400 rounded-lg flex items-center gap-2">
          <span className="text-lg sm:text-xl">✓</span>
          <span className="font-medium text-sm sm:text-base">WorldID Verified</span>
        </div>
        {showPrivacyInfo && (
          <p className="text-xs text-gray-300">
            Your privacy is protected - we only verify uniqueness, not identity
          </p>
        )}
      </div>
    );
  }

  // Get the current URL for redirect callback (important for mini apps)
  const getCallbackUrl = () => {
    if (typeof window !== 'undefined') {
      // Use current URL as callback, removing any existing proof parameters
      const url = new URL(window.location.href);
      url.searchParams.delete('proof');
      url.hash = '';
      return url.toString();
    }
    return window.location.href;
  };

  // Check if action is configured
  const appId = import.meta.env.VITE_WORLDID_APP_ID || 'app_staging_123';
  const action = import.meta.env.VITE_WORLDID_ACTION || 'worldid-reward-claim';
  const isActionConfigured = appId !== 'app_staging_123' && action !== 'worldid-reward-claim';

  return (
    <div className="space-y-2">
      {!isActionConfigured && (
        <div className="mb-2 p-2 bg-red-500/20 border border-red-500/40 rounded-lg">
          <p className="text-xs text-red-300 text-center">
            ⚠️ Warning: Using default action. Make sure "worldid-reward-claim" exists in your WorldID Developer Portal.
          </p>
        </div>
      )}
      {isMiniApp && (
        <div className="mb-2 p-2 bg-yellow-500/20 border border-yellow-500/40 rounded-lg">
          <p className="text-xs text-yellow-300 text-center">
            ⚠️ Mini App Mode: Verification may open in external browser. Return here after completing verification.
          </p>
        </div>
      )}
      <IDKitWidget
        app_id={appId}
        action={action}
        signal={signal || undefined} // Use signal if provided (wallet address for reward claiming)
        verification_level={VerificationLevel.Device}
        onSuccess={handleVerify}
        onError={handleError}
        enableTelemetry={false}
      >
        {({ open }) => (
          <div className="space-y-2">
            {isConnecting ? (
              <>
                <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500/20 border border-blue-500/40 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
                    <span className="text-blue-400 font-medium text-sm sm:text-base">Connecting to World App...</span>
                  </div>
                  <p className="text-xs text-blue-300 text-center mt-2">
                    Scan the QR code with your World App. If it says "something is wrong", the action might not exist in the Developer Portal.
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="w-full px-4 sm:px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors text-sm sm:text-base"
                >
                  Cancel Verification
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  const appId = import.meta.env.VITE_WORLDID_APP_ID || 'app_staging_123';
                  const action = import.meta.env.VITE_WORLDID_ACTION || 'worldid-reward-claim';
                  
                  console.log('Opening WorldID verification...', {
                    isMiniApp,
                    appId,
                    action,
                    signal: signal ? signal.substring(0, 20) + '...' : undefined,
                    verificationLevel: 'Device',
                  });
                  
                  // Show alert if action might not exist
                  if (action === 'worldid-reward-claim' && appId === 'app_2c1d85cd742db32847cb795c3fffaa9f') {
                    console.warn('⚠️ Make sure the action "worldid-reward-claim" exists in your WorldID Developer Portal!');
                    console.warn('App ID:', appId);
                    console.warn('Action:', action);
                    console.warn('If you see "couldn\'t find the request" error, the action doesn\'t exist.');
                  }
                  
                  setIsConnecting(true);
                  
                  // Set a timeout to detect if verification is stuck
                  const timeout = setTimeout(() => {
                    console.warn('WorldID verification timeout - no response after 2 minutes');
                    setIsConnecting(false);
                    alert(
                      'Verification is taking too long. This might mean:\n\n' +
                      '1. The action "worldid-reward-claim" doesn\'t exist in your WorldID Developer Portal\n' +
                      '2. There was an error scanning the QR code\n\n' +
                      'Please check the Developer Portal and try again.'
                    );
                  }, 120000); // 2 minutes timeout
                  
                  setConnectionTimeout(timeout);
                  
                  try {
                    open();
                  } catch (error) {
                    console.error('Error opening WorldID:', error);
                    handleError(error);
                  }
                }}
                disabled={disabled || isConnecting}
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-[#00FFC2] text-black rounded-lg hover:bg-[#00e6b8] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors text-sm sm:text-base"
              >
                Verify with WorldID
              </button>
            )}
          </div>
        )}
      </IDKitWidget>
      {showPrivacyInfo && (
        <p className="text-xs text-gray-300">
          🔒 Privacy: WorldID verifies you're human without revealing your identity. Prevents duplicate claims.
        </p>
      )}
      {isMiniApp && (
        <p className="text-xs text-yellow-300 text-center mt-2">
          💡 Tip: If verification opens in another browser, complete it there and return to this app.
        </p>
      )}
    </div>
  );
}
