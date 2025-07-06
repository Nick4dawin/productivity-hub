"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface AuthStore {
  getToken: (() => Promise<string | null>) | null;
}

export const authStore: AuthStore = {
  getToken: null,
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken, isLoaded } = useAuth();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      authStore.getToken = getToken;
      setAuthReady(true);
    }
  }, [getToken, isLoaded]);

  if (!authReady) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}; 