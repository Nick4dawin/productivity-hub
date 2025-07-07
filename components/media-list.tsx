'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Media, getMedia, deleteMedia, AuthHeaders } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/auth-context';

interface MediaListProps {
  type: 'Movie' | 'TV Show' | 'Book' | 'Game';
  onEdit: (media: Media) => void;
  refreshKey: number;
}

export default function MediaList({ type, onEdit, refreshKey }: MediaListProps) {
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { getAuthHeaders, isAuthenticated } = useAuth();

  const fetchMedia = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const allMedia = await getMedia(headers);
      setMediaItems(allMedia.filter(item => item.type === type));
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      toast({ title: `Failed to load ${type}`, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [type, toast, isAuthenticated, getAuthHeaders]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia, refreshKey]);
  
  const handleDelete = async (id: string) => {
    try {
      const headers = getAuthHeaders();
      await deleteMedia(headers, id);
      toast({ title: 'Media deleted' });
      fetchMedia();
    } catch {
       toast({ title: `Failed to delete media`, variant: 'destructive' });
    }
  };

  const getProgress = (item: Media) => {
    if (item.type === 'TV Show' && item.totalEpisodes) {
      return ((item.episodesWatched || 0) / item.totalEpisodes) * 100;
    }
    if (item.type === 'Book' && item.totalPages) {
      return ((item.pagesRead || 0) / item.totalPages) * 100;
    }
    return 0;
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (mediaItems.length === 0) return <div className="text-center p-4">No {type.toLowerCase()}s found. Add one to get started!</div>;

  return (
    <div className={`grid gap-4 ${type === 'Game' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1 lg:grid-cols-2'}`}>
      {mediaItems.map(item => (
        <Card key={item._id} className="bg-white/5 border-white/10 overflow-hidden pt-4">
          <div className="flex flex-col md:flex-row">
            {item.imageUrl && (
              <div className="p-4 flex-shrink-0 w-full md:w-1/3">
                <div className="relative w-full h-48 md:h-64">
                  <Image
                    src={item.imageUrl}
                    alt={`Cover for ${item.title}`}
                    fill
                    className="rounded-lg object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
              </div>
            )}
            <div className="flex flex-col flex-grow">
              <CardHeader>
                <CardTitle className="truncate">{item.title}</CardTitle>
                <div className="flex flex-wrap gap-1">
                  {item.genre?.split(',').map(g => g.trim()).map(g => (
                    <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-gray-400 mb-4 line-clamp-3">{item.review}</p>
                {item.type !== 'Movie' && item.type !== 'Game' && <Progress value={getProgress(item)} className="mb-2 bg-white/10" />}
                <div className="text-xs text-gray-300">
                  {item.type === 'TV Show' && item.totalEpisodes && `${item.episodesWatched || 0}/${item.totalEpisodes} episodes`}
                  {item.type === 'Book' && item.totalPages && `${item.pagesRead || 0}/${item.totalPages} pages`}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center mt-auto pt-4">
                <Badge>{item.status}</Badge>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(item)} className="bg-white/10 border-white/20">Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item._id)}>Delete</Button>
                </div>
              </CardFooter>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
} 