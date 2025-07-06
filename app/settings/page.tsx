"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { GlassCard } from "@/components/GlassCard";
import { AvatarSelection } from "@/components/avatar-selection";
import { useToast } from "@/components/ui/use-toast";

export default function SettingsPage() {
  const { user, getAuthHeaders, setUser, apiUrl } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(user?.profilePicture);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSaveAvatar = async () => {
    if (!selectedAvatar || selectedAvatar === user?.profilePicture) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${apiUrl}/user/avatar`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ avatarUrl: selectedAvatar }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'Failed to update avatar');
      }

      // Update user context with new avatar
      if (user) {
        const updatedUser = { ...user, profilePicture: data.profilePicture };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      toast({
        title: "Success!",
        description: "Your avatar has been updated.",
      });
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
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-white">Account Settings</h1>
      <GlassCard>
        <div className="p-8">
          {user && (
            <AvatarSelection 
              currentAvatar={user.profilePicture}
              onAvatarSelect={setSelectedAvatar}
              onSave={handleSaveAvatar}
              isSaving={isSaving}
            />
          )}
        </div>
      </GlassCard>
    </div>
  );
} 