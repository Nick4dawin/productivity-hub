"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createApi } from "unsplash-js";
import type { Basic } from "unsplash-js/dist/methods/photos/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || '',
});

// Fallback predefined avatars
const predefinedAvatars = [
  'https://api.dicebear.com/7.x/avataaars/png?seed=1',
  'https://api.dicebear.com/7.x/avataaars/png?seed=2',
  'https://api.dicebear.com/7.x/avataaars/png?seed=3',
  'https://api.dicebear.com/7.x/avataaars/png?seed=4',
  'https://api.dicebear.com/7.x/avataaars/png?seed=5',
  'https://api.dicebear.com/7.x/avataaars/png?seed=6',
  'https://api.dicebear.com/7.x/avataaars/png?seed=7',
  'https://api.dicebear.com/7.x/avataaars/png?seed=8',
  'https://api.dicebear.com/7.x/avataaars/png?seed=9',
  'https://api.dicebear.com/7.x/avataaars/png?seed=10',
  'https://api.dicebear.com/7.x/avataaars/png?seed=11',
  'https://api.dicebear.com/7.x/avataaars/png?seed=12',
];

interface AvatarSelectionProps {
  currentAvatar: string | undefined;
  onAvatarSelect: (url: string) => void;
  onSave: () => void;
  isSaving: boolean;
  saveButtonText?: string;
}

export function AvatarSelection({ currentAvatar, onAvatarSelect, onSave, isSaving, saveButtonText = "Save Avatar" }: AvatarSelectionProps) {
  const [images, setImages] = useState<Basic[]>([]);
  const [avatarUrls, setAvatarUrls] = useState<string[]>(predefinedAvatars);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

  useEffect(() => {
    // Try to fetch from Unsplash if API key is available
    if (process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY) {
      unsplash.photos.getRandom({
          collectionIds: ["_M2g9Zf45fA"], // Collection of simple, colorful gradients
          count: 12,
        })
        .then((result) => {
          if (result.errors) {
            console.error("Error fetching from Unsplash:", result.errors[0]);
            // Use predefined avatars as fallback
            setAvatarUrls(predefinedAvatars);
          } else {
            const fetchedImages = Array.isArray(result.response) ? result.response : [result.response];
            setImages(fetchedImages);
            setAvatarUrls(fetchedImages.map(img => img.urls.thumb));
          }
        })
        .catch((error) => {
          console.error("Failed to fetch from Unsplash:", error);
          // Use predefined avatars as fallback
          setAvatarUrls(predefinedAvatars);
        })
        .finally(() => setIsLoading(false));
    } else {
      // No API key, use predefined avatars
      setAvatarUrls(predefinedAvatars);
      setIsLoading(false);
    }
  }, []);

  const handleSelect = (url: string) => {
    setSelectedAvatar(url);
    onAvatarSelect(url);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white">Choose Your Avatar</h3>
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <LoadingSpinner className="h-10 w-10" />
        </div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
          {avatarUrls.map((url, index) => {
            const image = images.find(img => img.urls.thumb === url);
            return (
              <button
                key={image?.id || `avatar-${index}`}
                onClick={() => handleSelect(url)}
                className={cn(
                  "rounded-full overflow-hidden border-4 transition-all duration-200 aspect-square",
                  selectedAvatar === url
                    ? "border-primary scale-110"
                    : "border-transparent hover:border-white/50"
                )}
              >
                <Image
                  src={url}
                  alt={image?.alt_description || "Avatar"}
                  width={100}
                  height={100}
                  className="object-cover h-full w-full rounded-full"
                />
              </button>
            );
          })}
        </div>
      )}
      <div className="flex justify-end">
        <Button onClick={onSave} disabled={isSaving || selectedAvatar === currentAvatar}>
          {isSaving ? "Saving..." : saveButtonText}
        </Button>
      </div>
    </div>
  );
} 