# App Store Preparation Guide

This guide covers all the steps needed to prepare the ProductivityHub mobile app for submission to both the iOS App Store and Google Play Store.

## Prerequisites

### Development Environment
- ✅ React Native development environment set up
- ✅ Xcode (for iOS builds) - macOS only
- ✅ Android Studio (for Android builds)
- ✅ Valid Apple Developer Account ($99/year)
- ✅ Google Play Console Account ($25 one-time fee)

### Code Signing
- [ ] iOS Distribution Certificate
- [ ] iOS Provisioning Profiles
- [ ] Android Keystore for signing

## Generated Assets

### App Store Metadata ✅
All metadata has been generated in `store-metadata/`:

#### iOS App Store
- `ios/description.txt` - Full app description (4000 chars)
- `ios/keywords.txt` - App Store Optimization keywords
- `ios/release-notes.txt` - What's new in this version
- `ios/app-store-metadata.json` - Complete metadata structure

#### Google Play Store
- `android/short-description.txt` - Brief description (80 chars)
- `android/full-description.txt` - Complete description (4000 chars)
- `android/whats-new.txt` - Release notes (500 chars)
- `android/play-store-metadata.json` - Complete metadata structure

#### Common Assets
- `privacy-policy.md` - Privacy policy document
- `terms-of-service.md` - Terms of service
- `support-documentation.md` - User support guide

### App Icons & Screenshots
Icons can be generated using: `npm run generate:icons`

**Required Assets:**
- [ ] App icon source file (1024x1024px minimum)
- [ ] Splash screen source file
- [ ] Screenshots for all device sizes
- [ ] App Store/Play Store feature graphic

### Version Management ✅
Version management system has been set up:
- Automatic version bumping across platforms
- Git tagging and changelog generation
- In-app update mechanism
- Build number management

## iOS App Store Submission

### 1. Code Signing Setup
```bash
# Generate certificates in Apple Developer Portal
# Download and install certificates in Keychain
# Create App ID and Provisioning Profiles
```

### 2. Build Configuration
```bash
# Update team ID in ios/ProductivityHubMobile.xcodeproj
# Configure signing in Xcode
# Set release configuration
```

### 3. Build Release
```bash
npm run build:ios
# Or use Xcode to archive and export
```

### 4. App Store Connect Setup
1. Create new app in App Store Connect
2. Fill in app information:
   - Name: ProductivityHub
   - Bundle ID: com.productivityhub.mobile
   - SKU: productivity-hub-mobile
   - Category: Productivity

3. Upload metadata from `store-metadata/ios/`
4. Upload screenshots and app preview videos
5. Set pricing and availability
6. Configure App Store Review Information

### 5. Upload Build
```bash
# Using Xcode Organizer
# Or using Application Loader
# Or using Transporter app
```

### 6. Submit for Review
- Complete all required fields
- Add review notes if needed
- Submit for App Store Review

## Google Play Store Submission

### 1. Keystore Setup
```bash
# Generate release keystore
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Configure in android/gradle.properties
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=*****
MYAPP_RELEASE_KEY_PASSWORD=*****
```

### 2. Build Configuration
```bash
# Update android/app/build.gradle with signing config
# Set release build type
```

### 3. Build Release
```bash
npm run build:android
# Generates both APK and AAB files
```

### 4. Google Play Console Setup
1. Create new app in Google Play Console
2. Fill in app details:
   - App name: ProductivityHub
   - Package name: com.productivityhub.mobile
   - Category: Productivity

3. Upload metadata from `store-metadata/android/`
4. Upload screenshots and feature graphics
5. Set content rating and target audience
6. Configure store listing

### 5. Upload Build
```bash
# Upload AAB file (recommended)
# Or upload APK file
# Configure release tracks (internal, alpha, beta, production)
```

### 6. Submit for Review
- Complete all required sections
- Add release notes
- Submit for Google Play Review

## Release Checklist

### Pre-Submission
- [ ] All features tested on physical devices
- [ ] Performance testing completed
- [ ] Security audit passed
- [ ] Privacy policy and terms updated
- [ ] App store metadata reviewed
- [ ] Screenshots captured for all device sizes
- [ ] App icons generated and validated
- [ ] Version numbers updated
- [ ] Code signing certificates valid

### iOS Specific
- [ ] App Store Connect app created
- [ ] Metadata uploaded
- [ ] Screenshots uploaded (iPhone, iPad)
- [ ] App preview videos (optional)
- [ ] Pricing and availability set
- [ ] Age rating completed
- [ ] Review information provided
- [ ] Build uploaded and processed
- [ ] Submitted for review

### Android Specific
- [ ] Google Play Console app created
- [ ] Store listing completed
- [ ] Content rating completed
- [ ] Target audience set
- [ ] Screenshots uploaded (phone, tablet, TV)
- [ ] Feature graphic uploaded
- [ ] AAB/APK uploaded
- [ ] Release notes added
- [ ] Submitted for review

### Post-Submission
- [ ] Monitor review status
- [ ] Respond to reviewer feedback if needed
- [ ] Prepare marketing materials
- [ ] Set up analytics and crash reporting
- [ ] Plan post-launch updates
- [ ] Monitor user reviews and ratings

## Automated Scripts

### Build and Prepare
```bash
# Generate all store assets
npm run prepare:store

# Build release versions
npm run build:release

# Bump version
npm run version:bump [patch|minor|major]

# Generate app icons
npm run generate:icons path/to/source-icon.png

# Generate metadata
npm run generate:metadata
```

### Version Management
```bash
# Check current version
npm run version:current

# List recent versions
npm run version:list

# Bump patch version (1.0.0 -> 1.0.1)
npm run version:bump

# Bump minor version (1.0.0 -> 1.1.0)
npm run version:bump:minor

# Bump major version (1.0.0 -> 2.0.0)
npm run version:bump:major
```

## Review Guidelines

### iOS App Store Review
- Follow Apple's App Store Review Guidelines
- Ensure app works without network connection
- Provide demo account if login required
- Include clear app description and screenshots
- Respond to rejection feedback promptly

### Google Play Review
- Follow Google Play Developer Policy
- Ensure app targets recent Android API level
- Provide accurate app description
- Include proper content rating
- Test on various Android devices

## Marketing Assets

### Required Graphics
- [ ] App icon (various sizes)
- [ ] Feature graphic (1024x500px)
- [ ] Screenshots (multiple device sizes)
- [ ] App preview video (optional but recommended)
- [ ] Promotional graphics for marketing

### App Store Optimization (ASO)
- [ ] Keyword research completed
- [ ] App title optimized
- [ ] Description includes relevant keywords
- [ ] Screenshots highlight key features
- [ ] Regular updates with new features

## Support and Maintenance

### Post-Launch
1. Monitor app performance and crashes
2. Respond to user reviews
3. Release regular updates
4. Track key metrics (downloads, retention, ratings)
5. Gather user feedback for improvements

### Update Process
1. Develop new features/fixes
2. Test thoroughly
3. Update version numbers
4. Generate new metadata if needed
5. Build and submit update
6. Monitor rollout and user feedback

## Troubleshooting

### Common iOS Issues
- Code signing errors: Check certificates and provisioning profiles
- Build failures: Ensure Xcode and dependencies are up to date
- Rejection for missing features: Review App Store guidelines

### Common Android Issues
- Keystore problems: Ensure keystore is properly configured
- Upload failures: Check AAB file size and format
- Policy violations: Review Google Play policies

## Resources

### Documentation
- [iOS App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Developer Policy](https://play.google.com/about/developer-content-policy/)
- [React Native Release Builds](https://reactnative.dev/docs/signed-apk-android)

### Tools
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console/)
- [Xcode](https://developer.apple.com/xcode/)
- [Android Studio](https://developer.android.com/studio)

---

**Next Steps:**
1. Complete code signing setup for both platforms
2. Generate app icons and screenshots
3. Create app store listings
4. Build and test release versions
5. Submit for review

For questions or issues, contact the development team or refer to the platform-specific documentation.