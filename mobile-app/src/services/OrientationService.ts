import { Dimensions, ScaledSize } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

export type OrientationType = 'portrait' | 'landscape';

export interface OrientationInfo {
  orientation: OrientationType;
  width: number;
  height: number;
  isLandscape: boolean;
  isPortrait: boolean;
}

/**
 * Service for managing device orientation
 */
export class OrientationService {
  private static instance: OrientationService;
  private listeners: ((info: OrientationInfo) => void)[] = [];
  private currentOrientation: OrientationType = 'portrait';

  private constructor() {
    this.initialize();
  }

  public static getInstance(): OrientationService {
    if (!OrientationService.instance) {
      OrientationService.instance = new OrientationService();
    }
    return OrientationService.instance;
  }

  /**
   * Initialize orientation tracking
   */
  private initialize(): void {
    // Set initial orientation
    this.updateOrientation(Dimensions.get('window'));

    // Listen for orientation changes
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      this.updateOrientation(window);
    });

    // Store subscription for cleanup if needed
    // In a real app, you might want to manage this subscription lifecycle
  }

  /**
   * Update current orientation and notify listeners
   */
  private updateOrientation(dimensions: ScaledSize): void {
    const { width, height } = dimensions;
    const newOrientation: OrientationType = width > height ? 'landscape' : 'portrait';

    if (newOrientation !== this.currentOrientation) {
      this.currentOrientation = newOrientation;
      
      const orientationInfo: OrientationInfo = {
        orientation: newOrientation,
        width,
        height,
        isLandscape: newOrientation === 'landscape',
        isPortrait: newOrientation === 'portrait',
      };

      this.notifyListeners(orientationInfo);
    }
  }

  /**
   * Notify all listeners of orientation change
   */
  private notifyListeners(info: OrientationInfo): void {
    this.listeners.forEach(listener => {
      try {
        listener(info);
      } catch (error) {
        console.error('Error in orientation listener:', error);
      }
    });
  }

  /**
   * Get current orientation info
   */
  getCurrentOrientation(): OrientationInfo {
    const { width, height } = Dimensions.get('window');
    return {
      orientation: this.currentOrientation,
      width,
      height,
      isLandscape: this.currentOrientation === 'landscape',
      isPortrait: this.currentOrientation === 'portrait',
    };
  }

  /**
   * Add orientation change listener
   */
  addListener(listener: (info: OrientationInfo) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Remove orientation change listener
   */
  removeListener(listener: (info: OrientationInfo) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Lock orientation to portrait
   */
  async lockToPortrait(): Promise<void> {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } catch (error) {
      console.error('Failed to lock orientation to portrait:', error);
    }
  }

  /**
   * Lock orientation to landscape
   */
  async lockToLandscape(): Promise<void> {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } catch (error) {
      console.error('Failed to lock orientation to landscape:', error);
    }
  }

  /**
   * Unlock orientation (allow rotation)
   */
  async unlockOrientation(): Promise<void> {
    try {
      await ScreenOrientation.unlockAsync();
    } catch (error) {
      console.error('Failed to unlock orientation:', error);
    }
  }

  /**
   * Get supported orientations
   */
  async getSupportedOrientations(): Promise<ScreenOrientation.Orientation[]> {
    try {
      return await ScreenOrientation.getSupportedOrientationsAsync();
    } catch (error) {
      console.error('Failed to get supported orientations:', error);
      return [];
    }
  }

  /**
   * Check if device supports orientation
   */
  async supportsOrientation(orientation: ScreenOrientation.Orientation): Promise<boolean> {
    try {
      const supported = await this.getSupportedOrientations();
      return supported.includes(orientation);
    } catch (error) {
      console.error('Failed to check orientation support:', error);
      return false;
    }
  }

  /**
   * Get responsive dimensions based on orientation
   */
  getResponsiveDimensions(): {
    width: number;
    height: number;
    shortDimension: number;
    longDimension: number;
  } {
    const { width, height } = Dimensions.get('window');
    const shortDimension = Math.min(width, height);
    const longDimension = Math.max(width, height);

    return {
      width,
      height,
      shortDimension,
      longDimension,
    };
  }

  /**
   * Get layout styles based on orientation
   */
  getOrientationStyles(): {
    container: any;
    content: any;
    sidebar?: any;
  } {
    const { isLandscape } = this.getCurrentOrientation();

    if (isLandscape) {
      return {
        container: {
          flexDirection: 'row' as const,
        },
        content: {
          flex: 1,
        },
        sidebar: {
          width: 300,
        },
      };
    }

    return {
      container: {
        flexDirection: 'column' as const,
      },
      content: {
        flex: 1,
      },
    };
  }

  /**
   * Calculate responsive font size
   */
  getResponsiveFontSize(baseSize: number): number {
    const { shortDimension } = this.getResponsiveDimensions();
    const scale = shortDimension / 375; // Base on iPhone X width
    return Math.round(baseSize * scale);
  }

  /**
   * Calculate responsive spacing
   */
  getResponsiveSpacing(baseSpacing: number): number {
    const { shortDimension } = this.getResponsiveDimensions();
    const scale = shortDimension / 375;
    return Math.round(baseSpacing * scale);
  }

  /**
   * Get grid columns based on orientation and screen size
   */
  getGridColumns(baseColumns: number = 2): number {
    const { isLandscape, width } = this.getCurrentOrientation();
    
    if (isLandscape) {
      return Math.min(baseColumns + 1, 4); // Add one column in landscape
    }

    // Adjust based on screen width
    if (width > 400) {
      return baseColumns + 1;
    }

    return baseColumns;
  }

  /**
   * Check if screen is considered large (tablet-like)
   */
  isLargeScreen(): boolean {
    const { shortDimension } = this.getResponsiveDimensions();
    return shortDimension >= 768; // iPad-like dimensions
  }

  /**
   * Get safe area adjustments for orientation
   */
  getSafeAreaAdjustments(): {
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
  } {
    const { isLandscape } = this.getCurrentOrientation();

    if (isLandscape) {
      return {
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 44, // Account for notch in landscape
        paddingRight: 44,
      };
    }

    return {
      paddingTop: 44, // Status bar
      paddingBottom: 34, // Home indicator
      paddingLeft: 0,
      paddingRight: 0,
    };
  }
}

// Export singleton instance
export const orientationService = OrientationService.getInstance();