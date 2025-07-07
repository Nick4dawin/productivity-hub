"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/GlassCard";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { GoogleSignInButton } from '@/components/google-signin-button';
import { LoadingOverlay } from "@/components/ui/loading-overlay";

type FormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const [backgroundImage, setBackgroundImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
    
    // Set a default background image
    setBackgroundImage("https://images.unsplash.com/photo-1508599589922-36cf54751041?q=80&w=2070&auto=format&fit=crop");
    
    // Try to fetch a background image from Unsplash if key is available
    async function fetchImage() {
      try {
        if (process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY) {
          const response = await fetch(
            `https://api.unsplash.com/photos/random?query=minimalist-background&orientation=landscape&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
          );
          const data = await response.json();
          if (data.urls && data.urls.full) {
            setBackgroundImage(data.urls.full);
          }
        }
      } catch (error) {
        console.error("Failed to fetch image from Unsplash:", error);
      }
    }
    fetchImage();
  }, [isAuthenticated, router]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError("");
      await login(data.email, data.password);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-center transition-all duration-500 gap-8 p-4" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {isLoading && <LoadingOverlay text="Signing you in..." />}
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="z-10 max-w-md w-full px-4">
        <GlassCard className="w-full flex flex-col items-center space-y-6">
          <div className="flex flex-col items-center justify-center text-center gap-4 pt-4">
            <div className="bg-white/10 rounded-full p-3 flex items-center justify-center">
              <Image 
                src="/logo.svg" 
                alt="Produktiv Logo" 
                width={48}
                height={48}
                className="object-contain" 
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Sign In</h1>
              <p className="text-white/80">Welcome back to Produktiv</p>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-white rounded-lg p-3 w-full">
              {error}
            </div>
          )}
          
          <GoogleSignInButton onError={setError} />
          
          <div className="flex items-center w-full">
            <div className="h-px flex-1 bg-white/20" />
            <span className="px-3 text-white/60 text-sm">OR</span>
            <div className="h-px flex-1 bg-white/20" />
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/80 focus-visible:ring-primary"
                {...register("email", { required: "Email is required" })}
              />
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-white/5 border-white/20 text-white placeholder:text-white/80 focus-visible:ring-primary"
                {...register("password", { required: "Password is required" })}
              />
              {errors.password && (
                <p className="text-red-400 text-sm">{errors.password.message}</p>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 transition-transform hover:scale-105 active:scale-100"
              disabled={isLoading}
            >
              Sign In
            </Button>
          </form>
          
          <div className="w-full p-4 mt-6 -mb-6 text-center border-t border-white/10">
            <p className="text-white/80">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:text-primary/90 font-semibold">
                Sign Up
              </Link>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
} 