"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface AuthStore {
  getToken: (() => Promise<string | null>) | null;
  isAuthenticated: boolean;
}

export const authStore: AuthStore = {
  getToken: null,
  isAuthenticated: false
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      // Store whether the user is authenticated
      authStore.isAuthenticated = !!isSignedIn;
      
      // Create a more robust token getter
      authStore.getToken = async () => {
        try {
          if (!isSignedIn) return null;
          const token = await getToken();
          return token;
        } catch (error) {
          console.error("Failed to get auth token:", error);
          return null;
        }
      };
      
      setAuthReady(true);
    }
  }, [getToken, isLoaded, isSignedIn]);

  // Show loading state while auth is initializing
  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-primary">Loading authentication...</div>
    </div>;
  }

  return <>{children}</>;
}; 