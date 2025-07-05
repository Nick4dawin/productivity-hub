"use client";

import { SignUp } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export default function SignUpPage() {
  const [backgroundImage, setBackgroundImage] = useState("");

  useEffect(() => {
    async function fetchImage() {
      try {
        const response = await fetch(
          `https://api.unsplash.com/photos/random?query=minimalist-background&orientation=landscape&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}`
        );
        const data = await response.json();
        if (data.urls && data.urls.full) {
          setBackgroundImage(data.urls.full);
        }
      } catch (error) {
        console.error("Failed to fetch image from Unsplash:", error);
        // Fallback image
        setBackgroundImage("https://images.unsplash.com/photo-1508599589922-36cf54751041?q=80&w=2070&auto=format&fit=crop");
      }
    }
    fetchImage();
  }, []);

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-center transition-all duration-500 gap-8 p-4" 
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-black/50" />
      
      <SignUp
        appearance={{
          variables: {
            colorPrimary: "hsl(262.1 83.3% 57.8%)"
          },
          layout: {
            logoImageUrl: '/logo.svg',
            logoPlacement: 'inside',
            socialButtonsVariant: 'iconButton'
          },
          elements: {
            rootBox: 'z-10',
            card: "bg-white/5 backdrop-blur-lg shadow-2xl rounded-t-2xl",
            header: "flex flex-col items-center justify-center text-center gap-4 pt-8",
            logoBox: "w-12 h-12",
            logoImage: "w-full h-full",
            headerTitle: 'text-2xl font-bold text-white',
            headerSubtitle: 'text-white/80',
            socialButtonsBlockButton: "border-white/20 hover:bg-white/10 transition-transform hover:scale-105",
            socialButtonsBlockButtonText: "text-white",
            dividerLine: "bg-white/20",
            dividerText: "text-white/60",
            formFieldLabel: "text-white/90",
            formFieldInput: "bg-white/5 border-white/20 text-white placeholder:text-white/80 focus-visible:ring-primary",
            formButtonPrimary: "hover:bg-primary/90 transition-transform hover:scale-105 active:scale-100",
            footer: "bg-white/90 backdrop-blur-sm rounded-b-2xl",
            footerActionText: "text-gray-600",
            footerActionLink: "text-primary hover:text-primary/90 font-semibold",
          }
        }}
      />
    </div>
  );
} 