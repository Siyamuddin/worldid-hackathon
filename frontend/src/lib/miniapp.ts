/**
 * World Mini-App utilities
 * Handles mini-app detection and environment configuration
 */

export interface MiniAppConfig {
  isMiniApp: boolean;
  platform?: 'ios' | 'android' | 'web';
  version?: string;
}

/**
 * Detect if running in World App mini-app context
 */
export function detectMiniApp(): MiniAppConfig {
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  
  // Check for World App user agent or specific mini-app indicators
  const isWorldApp = userAgent.includes('worldapp') || 
                     userAgent.includes('world') ||
                     window.location.search.includes('miniapp=true') ||
                     localStorage.getItem('miniapp_mode') === 'true';
  
  return {
    isMiniApp: isWorldApp,
    platform: isIOS ? 'ios' : isAndroid ? 'android' : 'web',
  };
}

/**
 * Initialize mini-app mode
 */
export function initMiniApp(): void {
  const config = detectMiniApp();
  
  if (config.isMiniApp) {
    // Set viewport meta tag for mobile optimization
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      document.head.appendChild(viewport);
    }
    
    // Add mini-app class to body for styling
    document.body.classList.add('miniapp-mode');
    
    // Store mini-app state
    localStorage.setItem('miniapp_mode', 'true');
  }
}

/**
 * Get deep link URL for sharing
 */
export function getDeepLink(path: string = '/'): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}${path}`;
}

/**
 * Handle QR code scanning - extract parameters from URL
 */
export function handleQRCodeParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  
  params.forEach((value, key) => {
    result[key] = value;
  });
  
  return result;
}
