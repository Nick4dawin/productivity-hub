import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isWifiEnabled?: boolean;
}

type NetworkListener = (state: NetworkState) => void;

export class NetworkManager {
  private static instance: NetworkManager;
  private listeners: Set<NetworkListener> = new Set();
  private currentState: NetworkState = {
    isConnected: false,
    isInternetReachable: null,
    type: null,
  };
  private unsubscribe?: () => void;

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Get initial network state
    NetInfo.fetch().then(this.handleNetworkChange);

    // Subscribe to network state changes
    this.unsubscribe = NetInfo.addEventListener(this.handleNetworkChange);
  }

  private handleNetworkChange = (state: NetInfoState) => {
    const networkState: NetworkState = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isWifiEnabled: state.type === 'wifi' && state.isConnected,
    };

    const wasConnected = this.currentState.isConnected;
    const isNowConnected = networkState.isConnected;

    this.currentState = networkState;

    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(networkState);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });

    // Log connection changes
    if (wasConnected !== isNowConnected) {
      console.log(`Network ${isNowConnected ? 'connected' : 'disconnected'}`);
    }
  };

  /**
   * Get current network state
   */
  getCurrentState(): NetworkState {
    return { ...this.currentState };
  }

  /**
   * Check if device is currently online
   */
  isOnline(): boolean {
    return this.currentState.isConnected && this.currentState.isInternetReachable !== false;
  }

  /**
   * Check if device is currently offline
   */
  isOffline(): boolean {
    return !this.isOnline();
  }

  /**
   * Add network state listener
   */
  addListener(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    
    // Immediately call listener with current state
    listener(this.currentState);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Remove network state listener
   */
  removeListener(listener: NetworkListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.listeners.clear();
  }

  /**
   * Get network type description
   */
  getNetworkTypeDescription(): string {
    const { type, isConnected } = this.currentState;
    
    if (!isConnected) {
      return 'Offline';
    }

    switch (type) {
      case 'wifi':
        return 'Wi-Fi';
      case 'cellular':
        return 'Cellular';
      case 'ethernet':
        return 'Ethernet';
      case 'bluetooth':
        return 'Bluetooth';
      case 'wimax':
        return 'WiMAX';
      case 'vpn':
        return 'VPN';
      case 'other':
        return 'Other';
      case 'unknown':
        return 'Unknown';
      default:
        return 'Connected';
    }
  }

  /**
   * Check if connection is metered (cellular)
   */
  isMeteredConnection(): boolean {
    return this.currentState.type === 'cellular';
  }

  /**
   * Check if connection is fast (WiFi or Ethernet)
   */
  isFastConnection(): boolean {
    return ['wifi', 'ethernet'].includes(this.currentState.type || '');
  }

  /**
   * Wait for network connection
   */
  async waitForConnection(timeout: number = 30000): Promise<boolean> {
    if (this.isOnline()) {
      return true;
    }

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, timeout);

      const unsubscribe = this.addListener((state) => {
        if (state.isConnected && state.isInternetReachable !== false) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }

  /**
   * Refresh network state
   */
  async refresh(): Promise<NetworkState> {
    const state = await NetInfo.refresh();
    this.handleNetworkChange(state);
    return this.currentState;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
    this.removeAllListeners();
  }
}

export const networkManager = NetworkManager.getInstance();