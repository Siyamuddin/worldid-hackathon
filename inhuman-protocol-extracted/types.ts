
export enum AppState {
  LOCKED = 'LOCKED',
  SCANNING = 'SCANNING',
  VERIFYING = 'VERIFYING',
  GRANTED = 'GRANTED',
  DENIED = 'DENIED'
}

export interface Dialogue {
  role: 'system' | 'user' | 'ai';
  text: string;
}
