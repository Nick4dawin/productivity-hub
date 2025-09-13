import { useState, useEffect, useCallback } from 'react';
import { cameraService, PhotoResult, CameraOptions } from '../services/CameraService';
import { orientationService, OrientationInfo } from '../services/OrientationService';
import { appStateService, AppStateInfo, AppStateListener } from '../services/AppStateService';
import { biometricService, BiometricResult, BiometricOptions } from '../services/BiometricService';

/**
 * Hook for camera functionality
 */
export const useCamera = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const cameraAvailable = await cameraService.isCameraAvailable();
    setHasPermission(cameraAvailable);
  };

  const takePhoto = useCallback(async (options?: CameraOptions): Promise<PhotoResult | null> => {
    setIsLoading(true);
    try {
      const result = await cameraService.takePhoto(options);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pickImage = useCallback(async (options?: CameraOptions): Promise<PhotoResult | null> => {
    setIsLoading(true);
    try {
      const result = await cameraService.pickImage(options);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const showImagePicker = useCallback(async (options?: CameraOptions): Promise<PhotoResult | null> => {
    setIsLoading(true);
    try {
      const result = await cameraService.showImagePicker(options);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pickMultipleImages = useCallback(async (options?: CameraOptions): Promise<PhotoResult[]> => {
    setIsLoading(true);
    try {
      const results = await cameraService.pickMultipleImages(options);
      return results;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    const cameraGranted = await cameraService.requestCameraPermissions();
    const libraryGranted = await cameraService.requestMediaLibraryPermissions();
    const granted = cameraGranted && libraryGranted;
    setHasPermission(granted);
    return granted;
  }, []);

  return {
    isLoading,
    hasPermission,
    takePhoto,
    pickImage,
    showImagePicker,
    pickMultipleImages,
    requestPermissions,
    checkPermissions,
  };
};

/**
 * Hook for device orientation
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<OrientationInfo>(
    orientationService.getCurrentOrientation()
  );

  useEffect(() => {
    const unsubscribe = orientationService.addListener(setOrientation);
    return unsubscribe;
  }, []);

  const lockToPortrait = useCallback(async () => {
    await orientationService.lockToPortrait();
  }, []);

  const lockToLandscape = useCallback(async () => {
    await orientationService.lockToLandscape();
  }, []);

  const unlockOrientation = useCallback(async () => {
    await orientationService.unlockOrientation();
  }, []);

  const getResponsiveDimensions = useCallback(() => {
    return orientationService.getResponsiveDimensions();
  }, []);

  const getOrientationStyles = useCallback(() => {
    return orientationService.getOrientationStyles();
  }, []);

  const getGridColumns = useCallback((baseColumns?: number) => {
    return orientationService.getGridColumns(baseColumns);
  }, []);

  return {
    orientation,
    isLandscape: orientation.isLandscape,
    isPortrait: orientation.isPortrait,
    width: orientation.width,
    height: orientation.height,
    lockToPortrait,
    lockToLandscape,
    unlockOrientation,
    getResponsiveDimensions,
    getOrientationStyles,
    getGridColumns,
    isLargeScreen: orientationService.isLargeScreen(),
  };
};

/**
 * Hook for app state management
 */
export const useAppState = (listener?: AppStateListener) => {
  const [appState, setAppState] = useState<AppStateInfo>(
    appStateService.getCurrentState()
  );

  useEffect(() => {
    const unsubscribe = appStateService.addListener({
      onForeground: (info) => {
        setAppState(info);
        listener?.onForeground?.(info);
      },
      onBackground: (info) => {
        setAppState(info);
        listener?.onBackground?.(info);
      },
      onInactive: (info) => {
        setAppState(info);
        listener?.onInactive?.(info);
      },
    });

    return unsubscribe;
  }, [listener]);

  const resetSession = useCallback(() => {
    appStateService.resetSession();
    setAppState(appStateService.getCurrentState());
  }, []);

  const getUsageStats = useCallback(async () => {
    return await appStateService.getUsageStats();
  }, []);

  return {
    appState,
    isActive: appStateService.isActive(),
    isBackground: appStateService.isBackground(),
    isInactive: appStateService.isInactive(),
    sessionDuration: appStateService.getSessionDuration(),
    backgroundDuration: appStateService.getBackgroundDuration(),
    foregroundDuration: appStateService.getForegroundDuration(),
    resetSession,
    getUsageStats,
  };
};

/**
 * Hook for biometric authentication
 */
export const useBiometric = () => {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);

  useEffect(() => {
    checkAvailability();
    setIsEnabled(biometricService.isBiometricEnabled());
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await biometricService.isAvailable();
      const types = await biometricService.getBiometricTypeNames();
      setIsAvailable(available);
      setBiometricTypes(types);
    } catch (error) {
      console.error('Failed to check biometric availability:', error);
      setIsAvailable(false);
    }
  };

  const enableBiometric = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const enabled = await biometricService.enableBiometric();
      setIsEnabled(enabled);
      return enabled;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disableBiometric = useCallback(async () => {
    await biometricService.disableBiometric();
    setIsEnabled(false);
  }, []);

  const authenticate = useCallback(async (options?: BiometricOptions): Promise<BiometricResult> => {
    setIsLoading(true);
    try {
      return await biometricService.authenticate(options);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const authenticateForAppUnlock = useCallback(async (): Promise<BiometricResult> => {
    setIsLoading(true);
    try {
      return await biometricService.authenticateForAppUnlock();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const authenticateForSensitiveOperation = useCallback(async (operation: string): Promise<BiometricResult> => {
    setIsLoading(true);
    try {
      return await biometricService.authenticateForSensitiveOperation(operation);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const showSetupPrompt = useCallback(async (): Promise<boolean> => {
    return await biometricService.showSetupPrompt();
  }, []);

  const shouldPromptForSetup = useCallback(async (): Promise<boolean> => {
    return await biometricService.shouldPromptForSetup();
  }, []);

  return {
    isAvailable,
    isEnabled,
    isLoading,
    biometricTypes,
    enableBiometric,
    disableBiometric,
    authenticate,
    authenticateForAppUnlock,
    authenticateForSensitiveOperation,
    showSetupPrompt,
    shouldPromptForSetup,
    checkAvailability,
    platformName: biometricService.getPlatformBiometricName(),
  };
};

/**
 * Hook for comprehensive device integration
 */
export const useDeviceIntegration = () => {
  const camera = useCamera();
  const orientation = useOrientation();
  const appState = useAppState();
  const biometric = useBiometric();

  return {
    camera,
    orientation,
    appState,
    biometric,
  };
};