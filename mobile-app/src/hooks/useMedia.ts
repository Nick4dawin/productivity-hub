import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/ApiService';
import { Media, CreateMediaData } from '@/types';

export const useMedia = () => {
  return useQuery({
    queryKey: ['media'],
    queryFn: () => apiService.getMedia(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (mediaData: CreateMediaData) => apiService.createMedia(mediaData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

export const useUpdateMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMediaData> }) => 
      apiService.updateMedia(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

export const useSearchExternalMedia = (query: string, type: 'Movie' | 'TV Show' | 'Book' | 'Game') => {
  return useQuery({
    queryKey: ['media-search', query, type],
    queryFn: () => apiService.searchExternalMedia(query, type),
    enabled: query.length > 2, // Only search when query is meaningful
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Helper functions for media filtering and sorting
export const filterMediaByType = (media: Media[], type?: string) => {
  if (!type || type === 'All') return media;
  return media.filter(item => item.type === type);
};

export const filterMediaByStatus = (media: Media[], status?: string) => {
  if (!status || status === 'All') return media;
  return media.filter(item => item.status === status);
};

export const filterMediaByRating = (media: Media[], minRating?: number) => {
  if (!minRating) return media;
  return media.filter(item => item.rating && item.rating >= minRating);
};

export const sortMediaBy = (media: Media[], sortBy: 'title' | 'rating' | 'createdAt' | 'updatedAt', order: 'asc' | 'desc' = 'desc') => {
  return [...media].sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];
    
    if (sortBy === 'title') {
      aValue = aValue?.toLowerCase() || '';
      bValue = bValue?.toLowerCase() || '';
    }
    
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aValue = new Date(aValue || 0).getTime();
      bValue = new Date(bValue || 0).getTime();
    }
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const getMediaProgress = (media: Media): number => {
  if (media.type === 'TV Show' && media.totalEpisodes && media.episodesWatched) {
    return (media.episodesWatched / media.totalEpisodes) * 100;
  }
  
  if (media.type === 'Book' && media.totalPages && media.pagesRead) {
    return (media.pagesRead / media.totalPages) * 100;
  }
  
  if (media.status === 'Completed') return 100;
  if (media.status === 'In Progress') return 50;
  return 0;
};

// Analytics helper functions
export const getMediaStats = (media: Media[]) => {
  const stats = {
    total: media.length,
    completed: media.filter(item => item.status === 'Completed').length,
    inProgress: media.filter(item => item.status === 'In Progress').length,
    planned: media.filter(item => item.status === 'Planned').length,
    averageRating: 0,
    totalPagesRead: 0,
    totalEpisodesWatched: 0,
  };

  const ratedMedia = media.filter(item => item.rating);
  if (ratedMedia.length > 0) {
    stats.averageRating = ratedMedia.reduce((sum, item) => sum + (item.rating || 0), 0) / ratedMedia.length;
  }

  stats.totalPagesRead = media.reduce((sum, item) => sum + (item.pagesRead || 0), 0);
  stats.totalEpisodesWatched = media.reduce((sum, item) => sum + (item.episodesWatched || 0), 0);

  return stats;
};

export const getMediaByType = (media: Media[]) => {
  return media.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

export const getMediaByGenre = (media: Media[]) => {
  return media.reduce((acc, item) => {
    if (item.genre) {
      acc[item.genre] = (acc[item.genre] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
};

export const getCompletionTrend = (media: Media[]) => {
  const completedMedia = media.filter(item => item.status === 'Completed' && item.updatedAt);
  
  return completedMedia.reduce((acc, item) => {
    const month = new Date(item.updatedAt!).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};