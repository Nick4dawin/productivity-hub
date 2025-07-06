"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createApi } from "unsplash-js";
import type { Basic } from "unsplash-js/dist/methods/photos/types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const unsplash = createApi({
  accessKey: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY!,
});

interface AvatarSelectionProps {
  currentAvatar: string | undefined;
  onAvatarSelect: (url: string) => void;
  onSave: () => void;
  isSaving: boolean;
  saveButtonText?: string;
}

export function AvatarSelection({ currentAvatar, onAvatarSelect, onSave, isSaving, saveButtonText = "Save Avatar" }: AvatarSelectionProps) {
  const [images, setImages] = useState<Basic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

  useEffect(() => {
    unsplash.photos.getRandom({
        collectionIds: ["_M2g9Zf45fA"], // Collection of simple, colorful gradients
        count: 12,
      })
      .then((result) => {
        if (result.errors) {
          console.error("Error fetching from Unsplash:", result.errors[0]);
        } else {
          setImages(Array.isArray(result.response) ? result.response : [result.response]);
        }
      })
      .finally(() => setIsLoading(false));
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
          {images.map((image) => (
            <button
              key={image.id}
              onClick={() => handleSelect(image.urls.thumb)}
              className={cn(
                "rounded-full overflow-hidden border-4 transition-all duration-200",
                selectedAvatar === image.urls.thumb
                  ? "border-primary scale-110"
                  : "border-transparent hover:border-white/50"
              )}
            >
              <Image
                src={image.urls.thumb}
                alt={image.alt_description || "Avatar"}
                width={100}
                height={100}
                className="object-cover h-full w-full"
              />
            </button>
          ))}
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