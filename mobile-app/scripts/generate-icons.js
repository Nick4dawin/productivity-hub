#!/usr/bin/env node

/**
 * Icon Generation Script
 * 
 * This script generates all required app icons for iOS and Android
 * from a single source image using sharp image processing library.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon configurations for different platforms
const IOS_ICONS = [
  { name: 'icon-20.png', size: 20 },
  { name: 'icon-20@2x.png', size: 40 },
  { name: 'icon-20@3x.png', size: 60 },
  { name: 'icon-29.png', size: 29 },
  { name: 'icon-29@2x.png', size: 58 },
  { name: 'icon-29@3x.png', size: 87 },
  { name: 'icon-40.png', size: 40 },
  { name: 'icon-40@2x.png', size: 80 },
  { name: 'icon-40@3x.png', size: 120 },
  { name: 'icon-60@2x.png', size: 120 },
  { name: 'icon-60@3x.png', size: 180 },
  { name: 'icon-76.png', size: 76 },
  { name: 'icon-76@2x.png', size: 152 },
  { name: 'icon-83.5@2x.png', size: 167 },
  { name: 'icon-1024.png', size: 1024 },
];

const ANDROID_ICONS = [
  { name: 'ic_launcher.png', size: 48, density: 'mdpi' },
  { name: 'ic_launcher.png', size: 72, density: 'hdpi' },
  { name: 'ic_launcher.png', size: 96, density: 'xhdpi' },
  { name: 'ic_launcher.png', size: 144, density: 'xxhdpi' },
  { name: 'ic_launcher.png', size: 192, density: 'xxxhdpi' },
];

const SPLASH_SCREENS = [
  // iOS
  { name: 'splash-1125x2436.png', width: 1125, height: 2436, platform: 'ios' },
  { name: 'splash-828x1792.png', width: 828, height: 1792, platform: 'ios' },
  { name: 'splash-1242x2688.png', width: 1242, height: 2688, platform: 'ios' },
  { name: 'splash-750x1334.png', width: 750, height: 1334, platform: 'ios' },
  { name: 'splash-1242x2208.png', width: 1242, height: 2208, platform: 'ios' },
  
  // Android
  { name: 'splash.png', width: 1080, height: 1920, platform: 'android', density: 'xxhdpi' },
  { name: 'splash.png', width: 720, height: 1280, platform: 'android', density: 'xhdpi' },
  { name: 'splash.png', width: 480, height: 800, platform: 'android', density: 'hdpi' },
  { name: 'splash.png', width: 320, height: 480, platform: 'android', density: 'mdpi' },
];

class IconGenerator {
  constructor(sourceIconPath, sourceSplashPath) {
    this.sourceIconPath = sourceIconPath;
    this.sourceSplashPath = sourceSplashPath;
    this.outputDir = path.join(__dirname, '../assets/generated');
  }

  async generateIcons() {
    console.log('🎨 Generating app icons...');
    
    // Create output directories
    this.ensureDirectoryExists(path.join(this.outputDir, 'ios'));
    this.ensureDirectoryExists(path.join(this.outputDir, 'android'));

    // Generate iOS icons
    await this.generateIOSIcons();
    
    // Generate Android icons
    await this.generateAndroidIcons();
    
    console.log('✅ App icons generated successfully!');
  }

  async generateSplashScreens() {
    console.log('🖼️ Generating splash screens...');
    
    // Create splash screen directories
    this.ensureDirectoryExists(path.join(this.outputDir, 'splash', 'ios'));
    this.ensureDirectoryExists(path.join(this.outputDir, 'splash', 'android'));

    // Generate splash screens
    await this.generateSplashScreensForPlatforms();
    
    console.log('✅ Splash screens generated successfully!');
  }

  async generateIOSIcons() {
    const iosDir = path.join(this.outputDir, 'ios');
    
    for (const icon of IOS_ICONS) {
      const outputPath = path.join(iosDir, icon.name);
      
      await sharp(this.sourceIconPath)
        .resize(icon.size, icon.size, {
          kernel: sharp.kernel.lanczos3,
          fit: 'cover',
          position: 'center',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ quality: 100, compressionLevel: 0 })
        .toFile(outputPath);
      
      console.log(`  ✓ Generated ${icon.name} (${icon.size}x${icon.size})`);
    }
  }

  async generateAndroidIcons() {
    for (const icon of ANDROID_ICONS) {
      const androidDir = path.join(this.outputDir, 'android', `mipmap-${icon.density}`);
      this.ensureDirectoryExists(androidDir);
      
      const outputPath = path.join(androidDir, icon.name);
      
      await sharp(this.sourceIconPath)
        .resize(icon.size, icon.size, {
          kernel: sharp.kernel.lanczos3,
          fit: 'cover',
          position: 'center',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ quality: 100, compressionLevel: 0 })
        .toFile(outputPath);
      
      console.log(`  ✓ Generated ${icon.name} (${icon.size}x${icon.size}) for ${icon.density}`);
    }
  }

  async generateSplashScreensForPlatforms() {
    for (const splash of SPLASH_SCREENS) {
      let outputDir;
      
      if (splash.platform === 'ios') {
        outputDir = path.join(this.outputDir, 'splash', 'ios');
      } else {
        outputDir = path.join(this.outputDir, 'splash', 'android');
        if (splash.density) {
          outputDir = path.join(outputDir, `drawable-${splash.density}`);
          this.ensureDirectoryExists(outputDir);
        }
      }
      
      const outputPath = path.join(outputDir, splash.name);
      
      // Create splash screen with logo centered
      await this.createSplashScreen(outputPath, splash.width, splash.height);
      
      console.log(`  ✓ Generated ${splash.name} (${splash.width}x${splash.height}) for ${splash.platform}`);
    }
  }

  async createSplashScreen(outputPath, width, height) {
    // Create background
    const background = sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 242, g: 242, b: 247, alpha: 1 } // Light gray background
      }
    });

    // If splash source exists, composite it
    if (this.sourceSplashPath && fs.existsSync(this.sourceSplashPath)) {
      const logoSize = Math.min(width, height) * 0.3; // Logo is 30% of screen size
      
      const logo = await sharp(this.sourceSplashPath)
        .resize(Math.round(logoSize), Math.round(logoSize), {
          kernel: sharp.kernel.lanczos3,
          fit: 'inside',
          withoutEnlargement: true
        })
        .png();

      await background
        .composite([{
          input: await logo.toBuffer(),
          gravity: 'center'
        }])
        .png({ quality: 100 })
        .toFile(outputPath);
    } else {
      // Create simple splash with app name
      await background
        .png({ quality: 100 })
        .toFile(outputPath);
    }
  }

  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async generateAppStoreAssets() {
    console.log('🏪 Generating app store assets...');
    
    const storeDir = path.join(this.outputDir, 'store');
    this.ensureDirectoryExists(storeDir);

    // App Store icon (1024x1024)
    await sharp(this.sourceIconPath)
      .resize(1024, 1024, {
        kernel: sharp.kernel.lanczos3,
        fit: 'cover',
        position: 'center'
      })
      .png({ quality: 100 })
      .toFile(path.join(storeDir, 'app-store-icon.png'));

    // Play Store icon (512x512)
    await sharp(this.sourceIconPath)
      .resize(512, 512, {
        kernel: sharp.kernel.lanczos3,
        fit: 'cover',
        position: 'center'
      })
      .png({ quality: 100 })
      .toFile(path.join(storeDir, 'play-store-icon.png'));

    console.log('✅ App store assets generated successfully!');
  }

  async generateAll() {
    try {
      await this.generateIcons();
      await this.generateSplashScreens();
      await this.generateAppStoreAssets();
      
      console.log('\n🎉 All assets generated successfully!');
      console.log(`📁 Output directory: ${this.outputDir}`);
      
      // Generate installation instructions
      this.generateInstallationInstructions();
      
    } catch (error) {
      console.error('❌ Error generating assets:', error);
      process.exit(1);
    }
  }

  generateInstallationInstructions() {
    const instructions = `
# Asset Installation Instructions

## iOS Installation

1. Copy icons from \`assets/generated/ios/\` to \`ios/ProductivityHubMobile/Images.xcassets/AppIcon.appiconset/\`
2. Copy splash screens from \`assets/generated/splash/ios/\` to your iOS project
3. Update \`Contents.json\` in the AppIcon.appiconset folder
4. Configure launch screen in Xcode

## Android Installation

1. Copy icon folders from \`assets/generated/android/\` to \`android/app/src/main/res/\`
2. Copy splash screens from \`assets/generated/splash/android/\` to \`android/app/src/main/res/\`
3. Update \`AndroidManifest.xml\` with icon references
4. Configure splash screen theme

## App Store Assets

- **iOS App Store:** Use \`assets/generated/store/app-store-icon.png\`
- **Google Play Store:** Use \`assets/generated/store/play-store-icon.png\`

## Automated Installation

Run the following commands to automatically install assets:

\`\`\`bash
# Install iOS assets
npm run install-ios-assets

# Install Android assets  
npm run install-android-assets

# Install all assets
npm run install-assets
\`\`\`
`;

    fs.writeFileSync(
      path.join(this.outputDir, 'INSTALLATION.md'),
      instructions.trim()
    );
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: node generate-icons.js <source-icon-path> [source-splash-path]');
    console.log('Example: node generate-icons.js ./assets/icon-source.png ./assets/splash-source.png');
    process.exit(1);
  }

  const sourceIconPath = args[0];
  const sourceSplashPath = args[1];

  if (!fs.existsSync(sourceIconPath)) {
    console.error(`❌ Source icon file not found: ${sourceIconPath}`);
    process.exit(1);
  }

  const generator = new IconGenerator(sourceIconPath, sourceSplashPath);
  generator.generateAll();
}

module.exports = IconGenerator;