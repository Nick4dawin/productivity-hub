// This module handles Google OAuth authentication

// Define the return type for Google Auth
interface GoogleAuthResponse {
  credential?: string;
  clientId?: string;
  select_by?: string;
}

// Load the Google OAuth client and handle authentication
export async function googleAuth(): Promise<GoogleAuthResponse> {
  return new Promise((resolve, reject) => {
    try {
      // Check if Google client is already loaded
      if (window.google && window.google.accounts) {
        initializeGoogleAuth(resolve, reject);
        return;
      }

      // If not loaded, load the Google API script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initializeGoogleAuth(resolve, reject);
      script.onerror = () => reject(new Error('Failed to load Google Auth API'));
      document.head.appendChild(script);

      // Set a timeout in case the script loading hangs
      const timeout = setTimeout(() => {
        reject(new Error('Google Auth API loading timed out'));
      }, 10000); // 10 seconds timeout

      script.onload = () => {
        clearTimeout(timeout);
        initializeGoogleAuth(resolve, reject);
      };
    } catch (error) {
      reject(error);
    }
  });
}

// Initialize Google auth once the API is loaded
function initializeGoogleAuth(
  resolve: (value: GoogleAuthResponse) => void,
  reject: (reason: Error) => void
): void {
  try {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      reject(new Error('Google Client ID is not defined in environment variables'));
      return;
    }
    
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: GoogleAuthResponse) => {
        if (response && response.credential) {
          resolve(response);
        } else {
          reject(new Error('Google authentication failed'));
        }
      },
      cancel_on_tap_outside: false,
      prompt_parent_id: 'google-signin-container', // Container ID for the button
    });

    // Create a container for the Google sign-in button if it doesn't exist
    let container = document.getElementById('google-signin-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'google-signin-container';
      container.style.position = 'absolute';
      container.style.top = '-1000px'; // Hide off-screen
      document.body.appendChild(container);
    }

    // Prompt the user to select an account
    window.google.accounts.id.prompt((notification: { 
      isNotDisplayed: () => boolean; 
      isSkippedMoment: () => boolean; 
      isDismissedMoment: () => boolean;
      getNotDisplayedReason: () => string;
      getSkippedReason: () => string;
      getDismissedReason: () => string;
    }) => {
      if (notification.isNotDisplayed()) {
        const reason = notification.getNotDisplayedReason();
        console.error('Google Sign-In prompt not displayed:', reason);
        reject(new Error(`Google Sign-In prompt not displayed: ${reason}`));
      } else if (notification.isSkippedMoment()) {
        const reason = notification.getSkippedReason();
        console.error('Google Sign-In prompt skipped:', reason);
        reject(new Error(`Google Sign-In prompt skipped: ${reason}`));
      } else if (notification.isDismissedMoment()) {
        const reason = notification.getDismissedReason();
        console.error('Google Sign-In prompt dismissed:', reason);
        reject(new Error(`Google Sign-In prompt dismissed: ${reason}`));
      }
    });
  } catch (error) {
    reject(error instanceof Error ? error : new Error('Unknown error during Google Auth initialization'));
  }
}

// Add TypeScript type definitions for the Google client
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: (callback: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            isDismissedMoment: () => boolean;
            getNotDisplayedReason: () => string;
            getSkippedReason: () => string;
            getDismissedReason: () => string;
          }) => void) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
} 