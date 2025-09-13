import { GoogleSignin } from '@react-native-google-signin/google-signin';

/**
 * Configure Google Sign-In
 * This should be called early in the app lifecycle, preferably in App.tsx or index.js
 */
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    // Web client ID from Google Cloud Console
    // This should be replaced with your actual web client ID
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
    
    // Enable offline access to get refresh token
    offlineAccess: true,
    
    // Request user's basic profile info
    scopes: ['profile', 'email'],
    
    // iOS specific configuration
    iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', // Optional, if you have iOS client ID
    
    // Force account selection on sign in
    forceCodeForRefreshToken: true,
  });
};

/**
 * Check if Google Play Services are available
 */
export const checkGooglePlayServices = async (): Promise<boolean> => {
  try {
    await GoogleSignin.hasPlayServices();
    return true;
  } catch (error) {
    console.warn('Google Play Services not available:', error);
    return false;
  }
};

/**
 * Sign out from Google (useful for logout)
 */
export const signOutFromGoogle = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.warn('Error signing out from Google:', error);
  }
};