import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';

export interface CameraOptions {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  mediaTypes?: ImagePicker.MediaTypeOptions;
}

export interface PhotoResult {
  uri: string;
  width: number;
  height: number;
  type?: string;
  fileName?: string;
  fileSize?: number;
}

/**
 * Service for managing camera and photo library access
 */
export class CameraService {
  private static instance: CameraService;

  private constructor() {}

  public static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  /**
   * Request camera permissions
   */
  async requestCameraPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request camera permissions:', error);
      return false;
    }
  }

  /**
   * Request media library permissions
   */
  async requestMediaLibraryPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request media library permissions:', error);
      return false;
    }
  }

  /**
   * Check if camera is available
   */
  async isCameraAvailable(): Promise<boolean> {
    try {
      return await ImagePicker.getCameraPermissionsAsync().then(
        ({ status }) => status === 'granted'
      );
    } catch (error) {
      console.error('Failed to check camera availability:', error);
      return false;
    }
  }

  /**
   * Take a photo using the camera
   */
  async takePhoto(options: CameraOptions = {}): Promise<PhotoResult | null> {
    try {
      // Check permissions
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera access in your device settings to take photos.'
        );
        return null;
      }

      const defaultOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        ...options,
      };

      const result = await ImagePicker.launchCameraAsync(defaultOptions);

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type,
        fileName: asset.fileName,
        fileSize: asset.fileSize,
      };
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
      return null;
    }
  }

  /**
   * Pick an image from the photo library
   */
  async pickImage(options: CameraOptions = {}): Promise<PhotoResult | null> {
    try {
      // Check permissions
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Photo Library Permission Required',
          'Please enable photo library access in your device settings to select photos.'
        );
        return null;
      }

      const defaultOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        ...options,
      };

      const result = await ImagePicker.launchImageLibraryAsync(defaultOptions);

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type,
        fileName: asset.fileName,
        fileSize: asset.fileSize,
      };
    } catch (error) {
      console.error('Failed to pick image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
      return null;
    }
  }

  /**
   * Show action sheet to choose between camera and photo library
   */
  async showImagePicker(options: CameraOptions = {}): Promise<PhotoResult | null> {
    return new Promise((resolve) => {
      Alert.alert(
        'Select Photo',
        'Choose how you want to add a photo',
        [
          {
            text: 'Camera',
            onPress: async () => {
              const result = await this.takePhoto(options);
              resolve(result);
            },
          },
          {
            text: 'Photo Library',
            onPress: async () => {
              const result = await this.pickImage(options);
              resolve(result);
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => resolve(null),
          },
        ],
        { cancelable: true, onDismiss: () => resolve(null) }
      );
    });
  }

  /**
   * Pick multiple images from the photo library
   */
  async pickMultipleImages(options: CameraOptions = {}): Promise<PhotoResult[]> {
    try {
      // Check permissions
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Photo Library Permission Required',
          'Please enable photo library access in your device settings to select photos.'
        );
        return [];
      }

      const defaultOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
        ...options,
      };

      const result = await ImagePicker.launchImageLibraryAsync(defaultOptions);

      if (result.canceled || !result.assets) {
        return [];
      }

      return result.assets.map(asset => ({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        type: asset.type,
        fileName: asset.fileName,
        fileSize: asset.fileSize,
      }));
    } catch (error) {
      console.error('Failed to pick multiple images:', error);
      Alert.alert('Error', 'Failed to select images. Please try again.');
      return [];
    }
  }

  /**
   * Save image to device photo library
   */
  async saveToLibrary(uri: string): Promise<boolean> {
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable photo library access to save images.'
        );
        return false;
      }

      await MediaLibrary.saveToLibraryAsync(uri);
      return true;
    } catch (error) {
      console.error('Failed to save image to library:', error);
      Alert.alert('Error', 'Failed to save image to photo library.');
      return false;
    }
  }

  /**
   * Get image dimensions
   */
  async getImageDimensions(uri: string): Promise<{ width: number; height: number } | null> {
    try {
      return new Promise((resolve) => {
        const Image = require('react-native').Image;
        Image.getSize(
          uri,
          (width: number, height: number) => resolve({ width, height }),
          () => resolve(null)
        );
      });
    } catch (error) {
      console.error('Failed to get image dimensions:', error);
      return null;
    }
  }

  /**
   * Compress image
   */
  async compressImage(uri: string, quality: number = 0.7): Promise<string | null> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality,
        base64: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      return result.assets[0].uri;
    } catch (error) {
      console.error('Failed to compress image:', error);
      return null;
    }
  }

  /**
   * Create thumbnail from image
   */
  async createThumbnail(uri: string, size: number = 200): Promise<string | null> {
    try {
      // This would typically use a library like react-native-image-resizer
      // For now, we'll return the original URI
      // In a real implementation, you'd resize the image here
      return uri;
    } catch (error) {
      console.error('Failed to create thumbnail:', error);
      return null;
    }
  }

  /**
   * Validate image file
   */
  validateImage(result: PhotoResult, maxSizeMB: number = 10): { valid: boolean; error?: string } {
    // Check file size
    if (result.fileSize && result.fileSize > maxSizeMB * 1024 * 1024) {
      return {
        valid: false,
        error: `Image size must be less than ${maxSizeMB}MB`,
      };
    }

    // Check dimensions (optional)
    const maxDimension = 4096;
    if (result.width > maxDimension || result.height > maxDimension) {
      return {
        valid: false,
        error: `Image dimensions must be less than ${maxDimension}x${maxDimension}`,
      };
    }

    return { valid: true };
  }

  /**
   * Get camera options for different use cases
   */
  getOptionsForUseCase(useCase: 'profile' | 'journal' | 'receipt' | 'general'): CameraOptions {
    switch (useCase) {
      case 'profile':
        return {
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        };
      case 'journal':
        return {
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
        };
      case 'receipt':
        return {
          allowsEditing: false,
          quality: 0.9,
        };
      case 'general':
      default:
        return {
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        };
    }
  }
}

// Export singleton instance
export const cameraService = CameraService.getInstance();