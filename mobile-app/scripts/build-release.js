#!/usr/bin/env node

/**
 * Release Build Script
 * 
 * This script handles building release versions of the React Native app
 * for both iOS and Android with proper signing and configuration.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ReleaseBuildManager {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.buildDir = path.join(this.projectRoot, 'build');
    this.configDir = path.join(this.projectRoot, 'config');
  }

  async buildAll() {
    console.log('🚀 Starting release build process...');
    
    try {
      // Prepare build environment
      await this.prepareBuildEnvironment();
      
      // Build Android
      await this.buildAndroid();
      
      // Build iOS (if on macOS)
      if (process.platform === 'darwin') {
        await this.buildIOS();
      } else {
        console.log('⚠️ iOS build skipped (not on macOS)');
      }
      
      // Generate build report
      this.generateBuildReport();
      
      console.log('✅ Release build completed successfully!');
      
    } catch (error) {
      console.error('❌ Release build failed:', error);
      process.exit(1);
    }
  }

  async prepareBuildEnvironment() {
    console.log('📋 Preparing build environment...');
    
    // Ensure build directory exists
    if (!fs.existsSync(this.buildDir)) {
      fs.mkdirSync(this.buildDir, { recursive: true });
    }

    // Clean previous builds
    this.cleanPreviousBuilds();
    
    // Install dependencies
    console.log('📦 Installing dependencies...');
    execSync('npm ci', { cwd: this.projectRoot, stdio: 'inherit' });
    
    // Generate version info
    this.generateVersionInfo();
    
    console.log('✅ Build environment prepared');
  }

  cleanPreviousBuilds() {
    console.log('🧹 Cleaning previous builds...');
    
    const androidBuildDir = path.join(this.projectRoot, 'android', 'app', 'build');
    const iosBuildDir = path.join(this.projectRoot, 'ios', 'build');
    
    if (fs.existsSync(androidBuildDir)) {
      execSync(`rm -rf "${androidBuildDir}"`, { stdio: 'inherit' });
    }
    
    if (fs.existsSync(iosBuildDir)) {
      execSync(`rm -rf "${iosBuildDir}"`, { stdio: 'inherit' });
    }
  }

  generateVersionInfo() {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
    );
    
    const versionInfo = {
      version: packageJson.version,
      buildNumber: this.getBuildNumber(),
      buildDate: new Date().toISOString(),
      gitCommit: this.getGitCommit(),
      gitBranch: this.getGitBranch(),
    };
    
    // Write version info for app to use
    const versionPath = path.join(this.projectRoot, 'src', 'version.json');
    fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2));
    
    console.log(`📝 Version info generated: ${versionInfo.version} (${versionInfo.buildNumber})`);
  }

  getBuildNumber() {
    try {
      // Use timestamp as build number for simplicity
      return Math.floor(Date.now() / 1000).toString();
    } catch (error) {
      return '1';
    }
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

  async buildAndroid() {
    console.log('🤖 Building Android release...');
    
    const androidDir = path.join(this.projectRoot, 'android');
    
    try {
      // Clean Android build
      console.log('  🧹 Cleaning Android build...');
      execSync('./gradlew clean', { cwd: androidDir, stdio: 'inherit' });
      
      // Build release APK
      console.log('  📦 Building release APK...');
      execSync('./gradlew assembleRelease', { cwd: androidDir, stdio: 'inherit' });
      
      // Build release AAB (Android App Bundle)
      console.log('  📦 Building release AAB...');
      execSync('./gradlew bundleRelease', { cwd: androidDir, stdio: 'inherit' });
      
      // Copy builds to output directory
      this.copyAndroidBuilds();
      
      console.log('✅ Android build completed');
      
    } catch (error) {
      console.error('❌ Android build failed:', error);
      throw error;
    }
  }

  copyAndroidBuilds() {
    const androidBuildDir = path.join(this.projectRoot, 'android', 'app', 'build', 'outputs');
    const outputDir = path.join(this.buildDir, 'android');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Copy APK
    const apkSource = path.join(androidBuildDir, 'apk', 'release', 'app-release.apk');
    const apkDest = path.join(outputDir, 'ProductivityHub.apk');
    
    if (fs.existsSync(apkSource)) {
      fs.copyFileSync(apkSource, apkDest);
      console.log(`  ✓ APK copied to: ${apkDest}`);
    }
    
    // Copy AAB
    const aabSource = path.join(androidBuildDir, 'bundle', 'release', 'app-release.aab');
    const aabDest = path.join(outputDir, 'ProductivityHub.aab');
    
    if (fs.existsSync(aabSource)) {
      fs.copyFileSync(aabSource, aabDest);
      console.log(`  ✓ AAB copied to: ${aabDest}`);
    }
  }

  async buildIOS() {
    console.log('🍎 Building iOS release...');
    
    const iosDir = path.join(this.projectRoot, 'ios');
    
    try {
      // Install CocoaPods dependencies
      console.log('  📦 Installing CocoaPods dependencies...');
      execSync('pod install', { cwd: iosDir, stdio: 'inherit' });
      
      // Build iOS archive
      console.log('  📦 Building iOS archive...');
      const archiveCommand = [
        'xcodebuild',
        '-workspace ProductivityHubMobile.xcworkspace',
        '-scheme ProductivityHubMobile',
        '-configuration Release',
        '-archivePath build/ProductivityHubMobile.xcarchive',
        'archive'
      ].join(' ');
      
      execSync(archiveCommand, { cwd: iosDir, stdio: 'inherit' });
      
      // Export IPA
      console.log('  📦 Exporting IPA...');
      await this.exportIOSIPA();
      
      console.log('✅ iOS build completed');
      
    } catch (error) {
      console.error('❌ iOS build failed:', error);
      throw error;
    }
  }

  async exportIOSIPA() {
    const iosDir = path.join(this.projectRoot, 'ios');
    const exportOptionsPath = path.join(this.configDir, 'ExportOptions.plist');
    
    // Create export options if it doesn't exist
    if (!fs.existsSync(exportOptionsPath)) {
      this.createExportOptions(exportOptionsPath);
    }
    
    const exportCommand = [
      'xcodebuild',
      '-exportArchive',
      '-archivePath build/ProductivityHubMobile.xcarchive',
      '-exportPath build/ipa',
      `-exportOptionsPlist "${exportOptionsPath}"`
    ].join(' ');
    
    execSync(exportCommand, { cwd: iosDir, stdio: 'inherit' });
    
    // Copy IPA to output directory
    const outputDir = path.join(this.buildDir, 'ios');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const ipaSource = path.join(iosDir, 'build', 'ipa', 'ProductivityHubMobile.ipa');
    const ipaDest = path.join(outputDir, 'ProductivityHub.ipa');
    
    if (fs.existsSync(ipaSource)) {
      fs.copyFileSync(ipaSource, ipaDest);
      console.log(`  ✓ IPA copied to: ${ipaDest}`);
    }
  }

  createExportOptions(exportOptionsPath) {
    const exportOptions = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
</dict>
</plist>`;

    // Ensure config directory exists
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
    
    fs.writeFileSync(exportOptionsPath, exportOptions);
    console.log(`  ✓ Created export options: ${exportOptionsPath}`);
    console.log('  ⚠️ Please update YOUR_TEAM_ID in ExportOptions.plist');
  }

  generateBuildReport() {
    const buildInfo = {
      timestamp: new Date().toISOString(),
      platform: process.platform,
      nodeVersion: process.version,
      builds: []
    };

    // Check Android builds
    const androidDir = path.join(this.buildDir, 'android');
    if (fs.existsSync(androidDir)) {
      const apkPath = path.join(androidDir, 'ProductivityHub.apk');
      const aabPath = path.join(androidDir, 'ProductivityHub.aab');
      
      if (fs.existsSync(apkPath)) {
        const stats = fs.statSync(apkPath);
        buildInfo.builds.push({
          platform: 'android',
          type: 'apk',
          path: apkPath,
          size: stats.size,
          sizeFormatted: this.formatFileSize(stats.size)
        });
      }
      
      if (fs.existsSync(aabPath)) {
        const stats = fs.statSync(aabPath);
        buildInfo.builds.push({
          platform: 'android',
          type: 'aab',
          path: aabPath,
          size: stats.size,
          sizeFormatted: this.formatFileSize(stats.size)
        });
      }
    }

    // Check iOS builds
    const iosDir = path.join(this.buildDir, 'ios');
    if (fs.existsSync(iosDir)) {
      const ipaPath = path.join(iosDir, 'ProductivityHub.ipa');
      
      if (fs.existsSync(ipaPath)) {
        const stats = fs.statSync(ipaPath);
        buildInfo.builds.push({
          platform: 'ios',
          type: 'ipa',
          path: ipaPath,
          size: stats.size,
          sizeFormatted: this.formatFileSize(stats.size)
        });
      }
    }

    // Write build report
    const reportPath = path.join(this.buildDir, 'build-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(buildInfo, null, 2));
    
    // Generate human-readable report
    this.generateHumanReadableReport(buildInfo);
    
    console.log(`📊 Build report generated: ${reportPath}`);
  }

  generateHumanReadableReport(buildInfo) {
    let report = `# Build Report

**Build Date:** ${buildInfo.timestamp}
**Platform:** ${buildInfo.platform}
**Node Version:** ${buildInfo.nodeVersion}

## Generated Builds

`;

    buildInfo.builds.forEach(build => {
      report += `### ${build.platform.toUpperCase()} - ${build.type.toUpperCase()}
- **File:** ${path.basename(build.path)}
- **Size:** ${build.sizeFormatted}
- **Path:** ${build.path}

`;
    });

    report += `## Installation Instructions

### Android
1. Install APK directly on device for testing
2. Upload AAB to Google Play Console for store distribution

### iOS
1. Install IPA using Xcode or TestFlight for testing
2. Upload IPA to App Store Connect for store distribution

## Next Steps

1. Test builds on physical devices
2. Submit to app stores for review
3. Monitor crash reports and user feedback
4. Prepare release notes and marketing materials
`;

    const reportPath = path.join(this.buildDir, 'BUILD_REPORT.md');
    fs.writeFileSync(reportPath, report);
  }

  formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
}

// CLI usage
if (require.main === module) {
  const buildManager = new ReleaseBuildManager();
  buildManager.buildAll();
}

module.exports = ReleaseBuildManager;