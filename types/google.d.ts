// Type definitions for Google Identity Services

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: (callback: (notification: Record<string, unknown>) => void) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
        };
        oauth2: {
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { code: string }) => void;
            error_callback: (error: { message: string }) => void;
          }) => {
            requestCode: () => void;
          };
        };
      };
    };
  }
}

export {}; 