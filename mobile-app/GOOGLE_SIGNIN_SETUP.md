# Google Sign-In Setup

This document explains how to configure Google Sign-In for the React Native app.

## Prerequisites

1. Google Cloud Console project
2. OAuth 2.0 credentials configured
3. React Native Google Sign-In package installed (already done)

## Configuration Steps

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 client IDs for:
   - Web application (for the backend)
   - Android application (if building for Android)
   - iOS application (if building for iOS)

### 2. Update Configuration

Edit `src/config/googleSignIn.ts` and replace the placeholder values:

```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_ACTUAL_WEB_CLIENT_ID.apps.googleusercontent.com',
  iosClientId: 'YOUR_ACTUAL_IOS_CLIENT_ID.apps.googleusercontent.com', // Optional
  // ... other config
});
```

### 3. Android Setup

1. Add your SHA-1 fingerprint to the Android app in Google Cloud Console
2. Download the `google-services.json` file
3. Place it in `android/app/google-services.json`

### 4. iOS Setup

1. Download the `GoogleService-Info.plist` file
2. Add it to your iOS project in Xcode
3. Configure URL schemes in `ios/ProductivityHubMobile/Info.plist`

## Testing

The authentication screens include:
- Email/password login and registration
- Google OAuth integration
- Form validation
- Loading states
- Error handling

## Current Status

- ✅ Authentication screens implemented
- ✅ Form validation with react-hook-form
- ✅ Google Sign-In integration (needs configuration)
- ✅ Navigation between login/register
- ✅ Loading states and error handling
- ⚠️ Requires actual Google OAuth credentials for testing

## Next Steps

1. Set up actual Google OAuth credentials
2. Test authentication flow with backend
3. Add biometric authentication (optional)
4. Add forgot password functionality (optional)