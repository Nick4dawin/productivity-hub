'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { createMedia, updateMedia, Media, searchExternalMedia, AuthHeaders } from '@/lib/api';
import { useCallback, useState, useEffect } from 'react';
import debounce from 'debounce';
import { useAuth } from '@/contexts/auth-context';

const mediaFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.enum(['Movie', 'TV Show', 'Book', 'Game']),
  genre: z.string().optional(),
  status: z.enum(['Completed', 'In Progress', 'Planned']),
  rating: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) || num < 1 || num > 5 ? undefined : num;
  }),
  review: z.string().optional(),
  imageUrl: z.string().optional().refine((val) => !val || val === '' || /^https?:\/\/.+/.test(val), {
    message: 'Image URL must be a valid URL'
  }),
  episodesWatched: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) || num < 0 ? undefined : num;
  }),
  totalEpisodes: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) || num < 0 ? undefined : num;
  }),
  pagesRead: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) || num < 0 ? undefined : num;
  }),
  totalPages: z.union([z.string(), z.number()]).optional().transform((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const num = Number(val);
    return isNaN(num) || num < 0 ? undefined : num;
  }),
});

interface SearchResult {
    id: string | number;
    title: string;
    genre?: string;
    rating?: number;
    year?: string;
    imageUrl?: string;
}

const mediaSubmitSchema = mediaFormSchema;

type MediaFormData = z.infer<typeof mediaFormSchema>;

interface MediaFormProps {
  isOpen: boolean;
  media: Partial<Media> | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MediaForm({ isOpen, media, onClose, onSuccess }: MediaFormProps) {
  const { toast } = useToast();
  const { getAuthHeaders } = useAuth();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  console.log('🎭 MediaForm rendered with props:', { isOpen, media: !!media, onClose: !!onClose, onSuccess: !!onSuccess });

  const {
    control,
    handleSubmit,
    register,
    watch,
    setValue,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<MediaFormData>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: {
      title: media?.title || '',
      type: media?.type || 'Movie',
      genre: media?.genre || '',
      status: media?.status || 'Planned',
      rating: media?.rating ?? undefined,
      review: media?.review || '',
      imageUrl: media?.imageUrl || '',
      episodesWatched: media?.episodesWatched ?? undefined,
      totalEpisodes: media?.totalEpisodes ?? undefined,
      pagesRead: media?.pagesRead ?? undefined,
      totalPages: media?.totalPages ?? undefined,
    },
  });
  
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (media) {
      // If we're editing, populate the form with media data
      reset({
        title: media.title || '',
        type: media.type || 'Movie',
        genre: media.genre || '',
        status: media.status || 'Planned',
        rating: media.rating ?? undefined,
        review: media.review || '',
        imageUrl: media.imageUrl || '',
        episodesWatched: media.episodesWatched ?? undefined,
        totalEpisodes: media.totalEpisodes ?? undefined,
        pagesRead: media.pagesRead ?? undefined,
        totalPages: media.totalPages ?? undefined,
      });
    } else {
      // If we're adding a new item, ensure the form is cleared
      reset({
        title: '',
        type: 'Movie',
        genre: '',
        status: 'Planned',
        rating: undefined,
        review: '',
        imageUrl: '',
        episodesWatched: undefined,
        totalEpisodes: undefined,
        pagesRead: undefined,
        totalPages: undefined,
      });
    }
  }, [isOpen, media]);

  const mediaType = watch('type');

  const handleSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const headers = getAuthHeaders();
        const results = await searchExternalMedia(mediaType, query, headers);
        setSearchResults(results);
      } catch (error) {
        console.error('Failed to search media:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500),
    [mediaType, getAuthHeaders]
  );

  const handleSelectSearchResult = (result: SearchResult) => {
    setValue('title', result.title);
    setValue('genre', result.genre || '');
    setValue('rating', result.rating);
    if (result.imageUrl) {
        setValue('imageUrl', result.imageUrl);
    }
    setSearchResults([]);
  };

  const onSubmit = async (data: MediaFormData) => {
    console.log('💾 onSubmit called with data:', data);
    console.log('📝 Media being edited:', media);
    
    try {
      const validatedData = mediaSubmitSchema.parse(data);
      console.log('✅ Validated data:', validatedData);
      console.log('🎯 Rating value:', validatedData.rating, 'Type:', typeof validatedData.rating);
      
      const headers = getAuthHeaders();
      console.log('🔑 Headers obtained:', !!headers);
      
      if (media?._id) {
        console.log('🔄 Updating media with ID:', media._id);
        await updateMedia(media._id, validatedData, headers);
        toast({ title: 'Media updated' });
      } else {
        console.log('➕ Creating new media');
        await createMedia(validatedData, headers);
        toast({ title: 'Media created' });
      }
      
      console.log('✅ Media saved successfully');
      onSuccess();
    } catch (error) {
      console.error('❌ Error saving media:', error);
      toast({ title: 'Failed to save media', variant: 'destructive' });
    }
  };

  const handleFormSubmit = (data: MediaFormData) => {
    console.log('🎯 handleFormSubmit called!');
    console.log('📋 Form data:', data);
    console.log('🔍 Form errors:', errors);
    console.log('✅ Form is valid:', Object.keys(errors).length === 0);
    onSubmit(data);
  };

  console.log('🎨 Rendering MediaForm dialog');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/80 border-white/10 text-white rounded-lg">
        <DialogHeader>
          <DialogTitle>{media?._id ? 'Edit Media' : 'Add Media'}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {media?._id ? 'Edit the details of your media item.' : 'Add a new movie, TV show, book, or game to your collection.'}
          </DialogDescription>
        </DialogHeader>
                 <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <Controller name="type" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent className="bg-black/80 border-white/10 text-white">
                        <SelectItem value="Movie">Movie</SelectItem>
                        <SelectItem value="TV Show">TV Show</SelectItem>
                        <SelectItem value="Book">Book</SelectItem>
                        <SelectItem value="Game">Game</SelectItem>
                    </SelectContent>
                </Select>
            )}/>
            <div className="relative">
              <Input
                {...register('title')}
                placeholder="Title"
                className="bg-white/5 border-white/10"
                onChange={(e) => {
                  register('title').onChange(e);
                  handleSearch(e.target.value);
                }}
              />
              {isSearching && <div className="absolute right-2 top-2 text-xs">Searching...</div>}
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full bg-black/90 border border-white/20 rounded-md mt-1 max-h-60 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-2 hover:bg-white/10 cursor-pointer"
                      onClick={() => handleSelectSearchResult(result)}
                    >
                      {result.title} ({result.year})
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
            
            <Input {...register('genre')} placeholder="Genre" className="bg-white/5 border-white/10" />

            {mediaType === 'TV Show' && (
              <div className="flex gap-4">
                <Input {...register('episodesWatched')} type="number" placeholder="Episodes Watched" className="bg-white/5 border-white/10" />
                <Input {...register('totalEpisodes')} type="number" placeholder="Total Episodes" className="bg-white/5 border-white/10" />
              </div>
            )}

            {mediaType === 'Book' && (
              <div className="flex gap-4">
                <Input {...register('pagesRead')} type="number" placeholder="Pages Read" className="bg-white/5 border-white/10" />
                <Input {...register('totalPages')} type="number" placeholder="Total Pages" className="bg-white/5 border-white/10" />
              </div>
            )}
            
            <Controller name="status" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent className="bg-black/80 border-white/10 text-white">
                        <SelectItem value="Planned">Planned</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
            )}/>

            <Input {...register('rating')} type="number" min="1" max="5" step="0.1" placeholder="Rating (1-5)" className="bg-white/5 border-white/10" />
            <Textarea {...register('review')} placeholder="Review" className="bg-white/5 border-white/10" />
            
            <DialogFooter className="flex justify-end gap-2 pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="bg-white/10 border-white/20">Cancel</Button>
              </DialogClose>
              <Button 
                type="submit" 
                variant="gradient" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 