"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { GlassCard } from "@/components/GlassCard";
import { AvatarSelection } from "@/components/avatar-selection";
import { useToast } from "@/components/ui/use-toast";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

export default function SetupAvatarPage() {
  const router = useRouter();
  const { user, getAuthHeaders, setUser } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  if (!user) {
    // This page should only be accessible to logged-in users.
    // Redirect to login if no user is found in context.
    if (typeof window !== "undefined") {
      router.push("/login");
    }
    return <LoadingOverlay text="Redirecting..." />;
  }

  const handleSaveAndContinue = async () => {
    if (!selectedAvatar) {
      toast({
        title: "No Avatar Selected",
        description: "Please choose an avatar to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/avatar', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ avatarUrl: selectedAvatar }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to save avatar');
      }

      // Update user context and local storage
      const updatedUser = { ...user, profilePicture: data.profilePicture };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast({
        title: "Welcome!",
        description: "Your avatar has been saved.",
      });

      router.push("/"); // Redirect to homepage
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-center transition-all duration-500 gap-8 p-4" 
         style={{ backgroundImage: `url('/minimalist-background.jpg')` }}>
      {isSaving && <LoadingOverlay text="Saving your choice..." />}
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="z-10 max-w-2xl w-full px-4">
        <GlassCard>
          <div className="p-8 space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white">Welcome, {user.name}!</h1>
              <p className="text-white/80">One last step: choose an avatar to personalize your account.</p>
            </div>
            <AvatarSelection 
              currentAvatar={undefined} // No current avatar for new user
              onAvatarSelect={setSelectedAvatar}
              onSave={handleSaveAndContinue}
              isSaving={isSaving}
              saveButtonText="Save and Continue"
            />
          </div>
        </GlassCard>
      </div>
    </div>
  );
} 