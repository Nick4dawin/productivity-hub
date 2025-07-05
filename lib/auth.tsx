"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";

interface AuthStore {
  getToken: (() => Promise<string | null>) | null;
}

export const authStore: AuthStore = {
  getToken: null,
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();

  useEffect(() => {
    authStore.getToken = getToken;
  }, [getToken]);

  return <div>{children}</div>;
}; 