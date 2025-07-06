'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/GlassCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from 'lucide-react';
import MediaList from '@/components/media-list';
import MediaForm from '@/components/media-form';
import { Media } from '@/lib/api';

export default function MediaPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Partial<Media> | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEdit = (media: Media) => {
    setSelectedMedia(media);
    setIsFormOpen(true);
  };
  
  const handleOpenForm = () => {
    setSelectedMedia(null);
    setIsFormOpen(true);
  };
  
  const handleSuccess = () => {
    setIsFormOpen(false);
    setSelectedMedia(null);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <GlassCard>
      <div className="container mx-auto p-4 text-white">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Media Tracker</h1>
            <Button onClick={handleOpenForm} variant="gradient">
                <Plus className="mr-2 h-4 w-4" />
                Add Media
            </Button>
        </div>

        <Tabs defaultValue="movies" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10">
                <TabsTrigger value="movies">Movies</TabsTrigger>
                <TabsTrigger value="tv_shows">TV Shows</TabsTrigger>
                <TabsTrigger value="books">Books</TabsTrigger>
                <TabsTrigger value="games">Games</TabsTrigger>
            </TabsList>
            <TabsContent value="movies">
                <MediaList type="Movie" onEdit={handleEdit} refreshKey={refreshKey} />
            </TabsContent>
            <TabsContent value="tv_shows">
                <MediaList type="TV Show" onEdit={handleEdit} refreshKey={refreshKey} />
            </TabsContent>
            <TabsContent value="books">
                <MediaList type="Book" onEdit={handleEdit} refreshKey={refreshKey} />
            </TabsContent>
            <TabsContent value="games">
                <MediaList type="Game" onEdit={handleEdit} refreshKey={refreshKey} />
            </TabsContent>
        </Tabs>

        <MediaForm
          isOpen={isFormOpen}
          media={selectedMedia}
          onClose={() => setIsFormOpen(false)}
          onSuccess={handleSuccess}
        />
      </div>
    </GlassCard>
  );
} 