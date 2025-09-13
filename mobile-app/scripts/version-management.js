#!/usr/bin/env node

/**
 * Version Management Script
 * 
 * This script handles version bumping, update mechanisms, and version tracking
 * for both iOS and Android platforms.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VersionManager {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.packageJsonPath = path.join(this.projectRoot, 'package.json');
    this.iosInfoPlistPath = path.join(this.projectRoot, 'ios', 'ProductivityHubMobile', 'Info.plist');
    this.androidBuildGradlePath = path.join(this.projectRoot, 'android', 'app', 'build.gradle');
  }

  getCurrentVersion() {
    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    return packageJson.version;
  }

  bumpVersion(type = 'patch') {
    console.log(`📈 Bumping ${type} version...`);
    
    const currentVersion = this.getCurrentVersion();
    const newVersion = this.calculateNewVersion(currentVersion, type);
    
    console.log(`  Current version: ${currentVersion}`);
    console.log(`  New version: ${newVersion}`);
    
    // Update package.json
    this.updatePackageJson(newVersion);
    
    // Update iOS version
    this.updateIOSVersion(newVersion);
    
    // Update Android version
    this.updateAndroidVersion(newVersion);
    
    // Generate version info file
    this.generateVersionInfo(newVersion);
    
    // Commit version changes
    this.commitVersionChanges(newVersion);
    
    console.log(`✅ Version bumped to ${newVersion}`);
    return newVersion;
  }

  calculateNewVersion(currentVersion, type) {
    const parts = currentVersion.split('.').map(Number);
    
    switch (type) {
      case 'major':
        parts[0]++;
        parts[1] = 0;
        parts[2] = 0;
        break;
      case 'minor':
        parts[1]++;
        parts[2] = 0;
        break;
      case 'patch':
      default:
        parts[2]++;
        break;
    }
    
    return parts.join('.');
  }

  updatePackageJson(newVersion) {
    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log('  ✓ Updated package.json');
  }

  updateIOSVersion(newVersion) {
    if (!fs.existsSync(this.iosInfoPlistPath)) {
      console.log('  ⚠️ iOS Info.plist not found, skipping iOS version update');
      return;
    }

    let plistContent = fs.readFileSync(this.iosInfoPlistPath, 'utf8');
    
    // Update CFBundleShortVersionString (version)
    plistContent = plistContent.replace(
      /(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]*(<\/string>)/,
      `$1${newVersion}$2`
    );
    
    // Update CFBundleVersion (build number) - use timestamp
    const buildNumber = Math.floor(Date.now() / 1000).toString();
    plistContent = plistContent.replace(
      /(<key>CFBundleVersion<\/key>\s*<string>)[^<]*(<\/string>)/,
      `$1${buildNumber}$2`
    );
    
    fs.writeFileSync(this.iosInfoPlistPath, plistContent);
    console.log(`  ✓ Updated iOS version to ${newVersion} (build ${buildNumber})`);
  }

  updateAndroidVersion(newVersion) {
    if (!fs.existsSync(this.androidBuildGradlePath)) {
      console.log('  ⚠️ Android build.gradle not found, skipping Android version update');
      return;
    }

    let buildGradleContent = fs.readFileSync(this.androidBuildGradlePath, 'utf8');
    
    // Update versionName
    buildGradleContent = buildGradleContent.replace(
      /versionName\s+"[^"]*"/,
      `versionName "${newVersion}"`
    );
    
    // Update versionCode (increment by 1)
    const versionCodeMatch = buildGradleContent.match(/versionCode\s+(\d+)/);
    if (versionCodeMatch) {
      const currentVersionCode = parseInt(versionCodeMatch[1]);
      const newVersionCode = currentVersionCode + 1;
      buildGradleContent = buildGradleContent.replace(
        /versionCode\s+\d+/,
        `versionCode ${newVersionCode}`
      );
      console.log(`  ✓ Updated Android version to ${newVersion} (code ${newVersionCode})`);
    } else {
      console.log('  ⚠️ Could not find versionCode in build.gradle');
    }
    
    fs.writeFileSync(this.androidBuildGradlePath, buildGradleContent);
  }

  generateVersionInfo(version) {
    const versionInfo = {
      version: version,
      buildDate: new Date().toISOString(),
      buildNumber: Math.floor(Date.now() / 1000).toString(),
      gitCommit: this.getGitCommit(),
      gitBranch: this.getGitBranch(),
      gitTag: this.getGitTag(),
      changelog: this.generateChangelog(version)
    };
    
    // Write version info for app to use
    const versionPath = path.join(this.projectRoot, 'src', 'version.json');
    fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));
    
    console.log('  ✓ Generated version info file');
  }

  getGitCommit() {
    try {
      return execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  getGitBranch() {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      return 'unknown';
    }
  }

  getGitTag() {
    try {
      return execSync('git describe --tags --exact-match HEAD', { encoding: 'utf8' }).trim();
    } catch (error) {
      return null;
    }
  }

  generateChangelog(version) {
    try {
      // Get commits since last tag
      const lastTag = execSync('git describe --tags --abbrev=0 HEAD^', { encoding: 'utf8' }).trim();
      const commits = execSync(`git log ${lastTag}..HEAD --oneline`, { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(line => line.length > 0);
      
      return commits.map(commit => {
        const [hash, ...messageParts] = commit.split(' ');
        return {
          hash: hash,
          message: messageParts.join(' ')
        };
      });
    } catch (error) {
      return [];
    }
  }

  commitVersionChanges(version) {
    try {
      // Add version files to git
      execSync('git add package.json', { cwd: this.projectRoot });
      
      if (fs.existsSync(this.iosInfoPlistPath)) {
        execSync('git add ios/ProductivityHubMobile/Info.plist', { cwd: this.projectRoot });
      }
      
      if (fs.existsSync(this.androidBuildGradlePath)) {
        execSync('git add android/app/build.gradle', { cwd: this.projectRoot });
      }
      
      execSync('git add src/version.json', { cwd: this.projectRoot });
      
      // Commit changes
      execSync(`git commit -m "chore: bump version to ${version}"`, { cwd: this.projectRoot });
      
      // Create git tag
      execSync(`git tag -a v${version} -m "Release version ${version}"`, { cwd: this.projectRoot });
      
      console.log(`  ✓ Committed version changes and created tag v${version}`);
    } catch (error) {
      console.log('  ⚠️ Could not commit version changes (not in git repository?)');
    }
  }

  setupUpdateMechanism() {
    console.log('🔄 Setting up app update mechanism...');
    
    // Create update service
    const updateServicePath = path.join(this.projectRoot, 'src', 'services', 'UpdateService.ts');
    const updateServiceContent = `import { Alert, Linking } from 'react-native';
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
    const message = \`A new version (\${latestVersion}) is available.\\n\\n\${releaseNotes}\`;
    
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

export const updateService = UpdateService.getInstance();`;

    fs.writeFileSync(updateServicePath, updateServiceContent);
    
    // Create version display component
    const versionComponentPath = path.join(this.projectRoot, 'src', 'components', 'common', 'VersionInfo.tsx');
    const versionComponentContent = `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useTheme } from '@/contexts/ThemeContext';

interface VersionInfoProps {
  showBuildNumber?: boolean;
  style?: any;
}

export const VersionInfo: React.FC<VersionInfoProps> = ({ 
  showBuildNumber = false, 
  style 
}) => {
  const { colors } = useTheme();
  const version = DeviceInfo.getVersion();
  const buildNumber = DeviceInfo.getBuildNumber();

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.versionText, { color: colors.textSecondary }]}>
        Version {version}
        {showBuildNumber && \` (\${buildNumber})\`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '400',
  },
});`;

    fs.writeFileSync(versionComponentPath, versionComponentContent);
    
    console.log('  ✓ Created UpdateService');
    console.log('  ✓ Created VersionInfo component');
    console.log('✅ Update mechanism setup complete');
  }

  generateReleaseNotes(version) {
    console.log(`📝 Generating release notes for v${version}...`);
    
    const changelog = this.generateChangelog(version);
    const releaseDate = new Date().toLocaleDateString();
    
    const releaseNotes = `# Release Notes - Version ${version}

**Release Date:** ${releaseDate}

## What's New

### ✨ New Features
- Feature descriptions will be added based on actual changes
- Improvements and enhancements

### 🐛 Bug Fixes
- Bug fix descriptions will be added based on actual fixes
- Performance improvements

### 🔧 Technical Improvements
- Code optimizations
- Security enhancements
- Performance improvements

## Recent Commits

${changelog.map(commit => `- ${commit.message} (${commit.hash})`).join('\n')}

## Installation

### iOS
Download from the App Store or update through the App Store app.

### Android
Download from Google Play Store or update through the Play Store app.

## Support

If you encounter any issues with this release:
- Email: support@productivityhub.app
- Website: https://productivityhub.app/support

---

Thank you for using ProductivityHub! 🚀`;

    const releaseNotesPath = path.join(this.projectRoot, 'RELEASE_NOTES.md');
    fs.writeFileSync(releaseNotesPath, releaseNotes);
    
    console.log(`  ✓ Release notes generated: ${releaseNotesPath}`);
  }

  listVersions() {
    console.log('📋 Version Information:');
    console.log(`  Current version: ${this.getCurrentVersion()}`);
    
    try {
      const tags = execSync('git tag -l "v*" --sort=-version:refname', { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(tag => tag.length > 0)
        .slice(0, 10); // Show last 10 versions
      
      console.log('  Recent versions:');
      tags.forEach(tag => {
        console.log(`    ${tag}`);
      });
    } catch (error) {
      console.log('  No git tags found');
    }
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const versionManager = new VersionManager();

  switch (command) {
    case 'bump':
      const type = args[1] || 'patch';
      const newVersion = versionManager.bumpVersion(type);
      versionManager.generateReleaseNotes(newVersion);
      break;
    
    case 'setup-updates':
      versionManager.setupUpdateMechanism();
      break;
    
    case 'list':
      versionManager.listVersions();
      break;
    
    case 'current':
      console.log(versionManager.getCurrentVersion());
      break;
    
    default:
      console.log('Usage: node version-management.js <command>');
      console.log('Commands:');
      console.log('  bump [major|minor|patch]  - Bump version (default: patch)');
      console.log('  setup-updates            - Setup update mechanism');
      console.log('  list                     - List recent versions');
      console.log('  current                  - Show current version');
      break;
  }
}

module.exports = VersionManager;