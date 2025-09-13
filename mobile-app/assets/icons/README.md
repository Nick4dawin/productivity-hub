# App Icons and Assets

This directory contains all the app icons and assets needed for iOS and Android app store deployment.

## Icon Requirements

### iOS Icons
- **App Store Icon:** 1024x1024px (app-store-icon.png)
- **iPhone Icons:**
  - 180x180px (icon-60@3x.png) - iPhone 6 Plus, 6s Plus, 7 Plus, 8 Plus, X, XS, XS Max, XR, 11, 11 Pro, 11 Pro Max, 12, 12 mini, 12 Pro, 12 Pro Max
  - 120x120px (icon-60@2x.png) - iPhone 6, 6s, 7, 8, SE (2nd generation)
  - 87x87px (icon-29@3x.png) - Settings on iPhone with @3x display
  - 58x58px (icon-29@2x.png) - Settings on iPhone with @2x display
  - 80x80px (icon-40@2x.png) - Spotlight on iPhone with @2x display
  - 120x120px (icon-40@3x.png) - Spotlight on iPhone with @3x display

### Android Icons
- **Play Store Icon:** 512x512px (play-store-icon.png)
- **Launcher Icons:**
  - 192x192px (ic_launcher.png) - xxxhdpi
  - 144x144px (ic_launcher.png) - xxhdpi
  - 96x96px (ic_launcher.png) - xhdpi
  - 72x72px (ic_launcher.png) - hdpi
  - 48x48px (ic_launcher.png) - mdpi

## Splash Screen Requirements

### iOS Splash Screens
- **iPhone X/XS/11 Pro:** 1125x2436px
- **iPhone XR/11:** 828x1792px
- **iPhone XS Max/11 Pro Max:** 1242x2688px
- **iPhone 6/7/8:** 750x1334px
- **iPhone 6 Plus/7 Plus/8 Plus:** 1242x2208px

### Android Splash Screens
- **xxxhdpi:** 1440x2560px
- **xxhdpi:** 1080x1920px
- **xhdpi:** 720x1280px
- **hdpi:** 480x800px
- **mdpi:** 320x480px

## Design Guidelines

### Brand Colors
- **Primary:** #007AFF (iOS Blue)
- **Secondary:** #5856D6 (Purple)
- **Success:** #34C759 (Green)
- **Background:** #F2F2F7 (Light Gray)

### Icon Design Principles
1. **Simple and Clean:** Use minimal design elements
2. **Recognizable:** Should be identifiable at small sizes
3. **Consistent:** Follow platform design guidelines
4. **Scalable:** Vector-based design that scales well
5. **Brand Aligned:** Reflects the productivity hub theme

### Splash Screen Design
1. **Minimal Loading:** Show app logo and name
2. **Brand Consistent:** Use brand colors and typography
3. **Fast Loading:** Optimize for quick display
4. **Platform Native:** Follow iOS and Android guidelines

## Asset Generation Tools

### Recommended Tools
1. **Figma/Sketch:** For design creation
2. **App Icon Generator:** Online tools for multiple sizes
3. **React Native Asset Generator:** CLI tools for asset generation
4. **ImageOptim:** For file size optimization

### Automated Generation
Use tools like `react-native-make` or `@bam.tech/react-native-make` to generate all required sizes from a single source image.

## Implementation Notes

### iOS Implementation
- Add icons to `ios/ProductivityHubMobile/Images.xcassets/AppIcon.appiconset/`
- Configure splash screen in `ios/ProductivityHubMobile/Images.xcassets/LaunchImage.launchimage/`
- Update `Info.plist` with icon references

### Android Implementation
- Add icons to `android/app/src/main/res/mipmap-*/`
- Configure splash screen in `android/app/src/main/res/drawable/`
- Update `AndroidManifest.xml` with icon references

### React Native Configuration
- Update `app.json` with icon and splash screen paths
- Configure `react-native-splash-screen` for custom splash screens
- Set up `react-native-bootsplash` for advanced splash screen management