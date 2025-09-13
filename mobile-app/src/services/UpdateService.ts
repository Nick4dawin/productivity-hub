import { Alert, Linking } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { apiService } from './ApiService';

export interface UpdateInfo {
  hasUpdate: boolean;
  latestVersion: string;
  currentVersion: string;
  isForced: boolean;
  releaseNotes: string;
  downloadUrl: {
    ios: string;
    android: string;
  };
}

export class UpdateService {
  private static instance: UpdateService;
  
  static getInstance(): UpdateService {
    if (!UpdateService.instance) {
      UpdateService.instance = new UpdateService();
    }
    return UpdateService.instance;
  }

  /**
   * Check for app updates
   */
  async checkForUpdates(): Promise<UpdateInfo | null> {
    try {
      const currentVersion = DeviceInfo.getVersion();
      const buildNumber = DeviceInfo.getBuildNumber();
      
      const response = await apiService.request({
        method: 'GET',
        url: '/api/app/version-check',
        params: {
          version: currentVersion,
          build: buildNumber,
          platform: DeviceInfo.getSystemName().toLowerCase()
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return null;
    }
  }

  /**
   * Show update dialog to user
   */
  async showUpdateDialog(updateInfo: UpdateInfo): Promise<void> {
    const { hasUpdate, latestVersion, isForced, releaseNotes } = updateInfo;
    
    if (!hasUpdate) return;

    const title = isForced ? 'Update Required' : 'Update Available';
    const message = `A new version (${latestVersion}) is available.\n\n${releaseNotes}`;
    
    const buttons = [
      {
        text: 'Update Now',
        onPress: () => this.openAppStore(updateInfo)
      }
    ];
    
    if (!isForced) {
      buttons.unshift({
        text: 'Later',
        style: 'cancel' as const
      });
    }
    
    Alert.alert(title, message, buttons, { cancelable: !isForced });
  }

  /**
   * Open app store for update
   */
  private async openAppStore(updateInfo: UpdateInfo): Promise<void> {
    const platform = DeviceInfo.getSystemName().toLowerCase();
    const url = platform === 'ios' ? updateInfo.downloadUrl.ios : updateInfo.downloadUrl.android;
    
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Failed to open app store:', error);
    }
  }

  /**
   * Check and handle updates automatically
   */
  async checkAndHandleUpdates(): Promise<void> {
    const updateInfo = await this.checkForUpdates();
    
    if (updateInfo?.hasUpdate) {
      await this.showUpdateDialog(updateInfo);
    }
  }

  /**
   * Get current app version info
   */
  async getVersionInfo() {
    return {
      version: DeviceInfo.getVersion(),
      buildNumber: DeviceInfo.getBuildNumber(),
      bundleId: DeviceInfo.getBundleId(),
      systemName: DeviceInfo.getSystemName(),
      systemVersion: DeviceInfo.getSystemVersion()
    };
  }
}

export const updateService = UpdateService.getInstance();