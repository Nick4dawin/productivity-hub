import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Media } from '@/types';

interface MediaRecommendationsProps {
  media: Media[];
  onRecommendationPress?: (recommendation: RecommendationItem) => void;
}

interface RecommendationItem {
  id: string;
  title: string;
  type: 'Movie' | 'TV Show' | 'Book' | 'Game';
  genre?: string;
  reason: string;
  confidence: number;
  imageUrl?: string;
}

export const MediaRecommendations: React.FC<MediaRecommendationsProps> = ({
  media,
  onRecommendationPress,
}) => {
  const { colors } = useTheme();

  const generateRecommendations = (): RecommendationItem[] => {
    if (media.length === 0) return [];

    const recommendations: RecommendationItem[] = [];
    
    // Analyze user preferences
    const preferences = analyzeUserPreferences(media);
    
    // Generate recommendations based on preferences
    recommendations.push(...generateGenreBasedRecommendations(preferences));
    recommendations.push(...generateTypeBasedRecommendations(preferences));
    recommendations.push(...generateRatingBasedRecommendations(preferences));
    recommendations.push(...generateCompletionBasedRecommendations(preferences));

    // Sort by confidence and return top recommendations
    return recommendations
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  };

  const analyzeUserPreferences = (userMedia: Media[]) => {
    const genreCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    const ratingCounts: Record<number, number> = {};
    const completedGenres: Record<string, number> = {};
    
    let totalRating = 0;
    let ratedCount = 0;

    userMedia.forEach((item) => {
      // Genre preferences
      if (item.genre) {
        genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1;
        
        if (item.status === 'Completed') {
          completedGenres[item.genre] = (completedGenres[item.genre] || 0) + 1;
        }
      }

      // Type preferences
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;

      // Rating analysis
      if (item.rating) {
        ratingCounts[item.rating] = (ratingCounts[item.rating] || 0) + 1;
        totalRating += item.rating;
        ratedCount++;
      }
    });

    return {
      favoriteGenres: Object.entries(genreCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([genre]) => genre),
      favoriteTypes: Object.entries(typeCounts)
        .sort(([,a], [,b]) => b - a)
        .map(([type]) => type),
      averageRating: ratedCount > 0 ? totalRating / ratedCount : 0,
      completedGenres: Object.keys(completedGenres),
      totalMedia: userMedia.length,
      completedMedia: userMedia.filter(item => item.status === 'Completed').length,
    };
  };

  const generateGenreBasedRecommendations = (preferences: any): RecommendationItem[] => {
    const recommendations: RecommendationItem[] = [];
    
    preferences.favoriteGenres.forEach((genre: string, index: number) => {
      const confidence = 0.9 - (index * 0.1);
      
      // Mock recommendations based on genre
      const genreRecommendations = getMockRecommendationsByGenre(genre);
      
      genreRecommendations.forEach((rec, recIndex) => {
        if (recIndex < 2) { // Limit to 2 per genre
          recommendations.push({
            ...rec,
            reason: `Based on your interest in ${genre}`,
            confidence: confidence - (recIndex * 0.05),
          });
        }
      });
    });

    return recommendations;
  };

  const generateTypeBasedRecommendations = (preferences: any): RecommendationItem[] => {
    const recommendations: RecommendationItem[] = [];
    
    // Recommend similar types to what user enjoys
    preferences.favoriteTypes.forEach((type: string, index: number) => {
      if (index < 2) { // Top 2 favorite types
        const confidence = 0.8 - (index * 0.1);
        
        const typeRecommendations = getMockRecommendationsByType(type);
        
        typeRecommendations.forEach((rec, recIndex) => {
          if (recIndex < 1) { // One per type
            recommendations.push({
              ...rec,
              reason: `More ${type.toLowerCase()}s you might enjoy`,
              confidence: confidence,
            });
          }
        });
      }
    });

    return recommendations;
  };

  const generateRatingBasedRecommendations = (preferences: any): RecommendationItem[] => {
    const recommendations: RecommendationItem[] = [];
    
    if (preferences.averageRating >= 4) {
      // User likes high-quality content
      recommendations.push({
        id: 'high-rated-1',
        title: 'Critically Acclaimed Series',
        type: 'TV Show',
        genre: 'Drama',
        reason: 'Highly rated content matching your taste',
        confidence: 0.85,
      });
    }

    return recommendations;
  };

  const generateCompletionBasedRecommendations = (preferences: any): RecommendationItem[] => {
    const recommendations: RecommendationItem[] = [];
    
    const completionRate = preferences.completedMedia / preferences.totalMedia;
    
    if (completionRate > 0.7) {
      // User completes most media, suggest longer content
      recommendations.push({
        id: 'series-1',
        title: 'Epic Fantasy Series',
        type: 'Book',
        genre: 'Fantasy',
        reason: 'Perfect for someone who finishes what they start',
        confidence: 0.75,
      });
    } else if (completionRate < 0.3) {
      // User has trouble completing, suggest shorter content
      recommendations.push({
        id: 'short-1',
        title: 'Quick Adventure Game',
        type: 'Game',
        genre: 'Adventure',
        reason: 'Short and engaging content',
        confidence: 0.7,
      });
    }

    return recommendations;
  };

  const getMockRecommendationsByGenre = (genre: string): Partial<RecommendationItem>[] => {
    const mockData: Record<string, Partial<RecommendationItem>[]> = {
      'Action': [
        { id: 'action-1', title: 'Explosive Thriller', type: 'Movie', genre: 'Action' },
        { id: 'action-2', title: 'Action Hero Chronicles', type: 'TV Show', genre: 'Action' },
      ],
      'Drama': [
        { id: 'drama-1', title: 'Emotional Journey', type: 'Movie', genre: 'Drama' },
        { id: 'drama-2', title: 'Life Stories', type: 'Book', genre: 'Drama' },
      ],
      'Fantasy': [
        { id: 'fantasy-1', title: 'Magical Realms', type: 'Book', genre: 'Fantasy' },
        { id: 'fantasy-2', title: 'Fantasy Quest', type: 'Game', genre: 'Fantasy' },
      ],
      'Sci-Fi': [
        { id: 'scifi-1', title: 'Future Worlds', type: 'Movie', genre: 'Sci-Fi' },
        { id: 'scifi-2', title: 'Space Opera', type: 'TV Show', genre: 'Sci-Fi' },
      ],
    };

    return mockData[genre] || [];
  };

  const getMockRecommendationsByType = (type: string): Partial<RecommendationItem>[] => {
    const mockData: Record<string, Partial<RecommendationItem>[]> = {
      'Movie': [
        { id: 'movie-rec-1', title: 'Trending Cinema', type: 'Movie', genre: 'Thriller' },
      ],
      'TV Show': [
        { id: 'tv-rec-1', title: 'Binge-Worthy Series', type: 'TV Show', genre: 'Mystery' },
      ],
      'Book': [
        { id: 'book-rec-1', title: 'Page Turner Novel', type: 'Book', genre: 'Fiction' },
      ],
      'Game': [
        { id: 'game-rec-1', title: 'Immersive Adventure', type: 'Game', genre: 'RPG' },
      ],
    };

    return mockData[type] || [];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Movie': return '🎬';
      case 'TV Show': return '📺';
      case 'Book': return '📚';
      case 'Game': return '🎮';
      default: return '📄';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return colors.success;
    if (confidence >= 0.6) return colors.warning;
    return colors.info;
  };

  const recommendations = generateRecommendations();

  const renderRecommendationCard = (recommendation: RecommendationItem) => (
    <TouchableOpacity
      key={recommendation.id}
      style={[styles.recommendationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => onRecommendationPress?.(recommendation)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.titleSection}>
          <Text style={styles.typeIcon}>{getTypeIcon(recommendation.type)}</Text>
          <View style={styles.titleInfo}>
            <Text style={[styles.recommendationTitle, { color: colors.text }]} numberOfLines={1}>
              {recommendation.title}
            </Text>
            <Text style={[styles.recommendationType, { color: colors.textSecondary }]}>
              {recommendation.type} {recommendation.genre && `• ${recommendation.genre}`}
            </Text>
          </View>
        </View>
        
        <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(recommendation.confidence) }]}>
          <Text style={[styles.confidenceText, { color: colors.surface }]}>
            {Math.round(recommendation.confidence * 100)}%
          </Text>
        </View>
      </View>

      <Text style={[styles.recommendationReason, { color: colors.textSecondary }]}>
        {recommendation.reason}
      </Text>
    </TouchableOpacity>
  );

  if (media.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
        <Text style={styles.emptyIcon}>🎯</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Recommendations Yet</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Add some media to your library and rate them to get personalized recommendations.
        </Text>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
        <Text style={styles.emptyIcon}>🤔</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Building Recommendations</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Rate more media and mark items as completed to get better recommendations.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommendations for You</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Based on your library and preferences
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {recommendations.map(renderRecommendationCard)}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  recommendationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  titleInfo: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  recommendationType: {
    fontSize: 12,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recommendationReason: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 32,
  },
});