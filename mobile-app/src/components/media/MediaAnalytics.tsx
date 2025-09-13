import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { VictoryChart, VictoryBar, VictoryPie, VictoryArea, VictoryAxis, VictoryTheme } from 'victory-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Media } from '@/types';

interface MediaAnalyticsProps {
  media: Media[];
}

interface MediaStats {
  totalMedia: number;
  completedMedia: number;
  inProgressMedia: number;
  plannedMedia: number;
  averageRating: number;
  totalHoursWatched: number;
  totalPagesRead: number;
  typeDistribution: { type: string; count: number }[];
  genreDistribution: { genre: string; count: number }[];
  monthlyCompletion: { month: string; count: number }[];
  ratingDistribution: { rating: number; count: number }[];
}

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32;

export const MediaAnalytics: React.FC<MediaAnalyticsProps> = ({ media }) => {
  const { colors } = useTheme();

  const calculateStats = (): MediaStats => {
    const stats: MediaStats = {
      totalMedia: media.length,
      completedMedia: 0,
      inProgressMedia: 0,
      plannedMedia: 0,
      averageRating: 0,
      totalHoursWatched: 0,
      totalPagesRead: 0,
      typeDistribution: [],
      genreDistribution: [],
      monthlyCompletion: [],
      ratingDistribution: [],
    };

    if (media.length === 0) return stats;

    // Count by status
    const statusCounts = { Completed: 0, 'In Progress': 0, Planned: 0 };
    const typeCounts: Record<string, number> = {};
    const genreCounts: Record<string, number> = {};
    const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const monthCounts: Record<string, number> = {};

    let totalRating = 0;
    let ratedCount = 0;

    media.forEach((item) => {
      // Status counts
      if (item.status) {
        statusCounts[item.status as keyof typeof statusCounts]++;
      }

      // Type distribution
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;

      // Genre distribution
      if (item.genre) {
        genreCounts[item.genre] = (genreCounts[item.genre] || 0) + 1;
      }

      // Rating statistics
      if (item.rating) {
        totalRating += item.rating;
        ratedCount++;
        ratingCounts[item.rating] = (ratingCounts[item.rating] || 0) + 1;
      }

      // Progress tracking
      if (item.type === 'Book' && item.pagesRead) {
        stats.totalPagesRead += item.pagesRead;
      }

      // Monthly completion (for completed items)
      if (item.status === 'Completed' && item.updatedAt) {
        const month = new Date(item.updatedAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      }
    });

    stats.completedMedia = statusCounts.Completed;
    stats.inProgressMedia = statusCounts['In Progress'];
    stats.plannedMedia = statusCounts.Planned;
    stats.averageRating = ratedCount > 0 ? totalRating / ratedCount : 0;

    // Convert to arrays for charts
    stats.typeDistribution = Object.entries(typeCounts).map(([type, count]) => ({ type, count }));
    stats.genreDistribution = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 genres

    stats.ratingDistribution = Object.entries(ratingCounts)
      .map(([rating, count]) => ({ rating: parseInt(rating), count }))
      .filter(item => item.count > 0);

    stats.monthlyCompletion = Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-6); // Last 6 months

    return stats;
  };

  const stats = calculateStats();

  const renderOverviewStats = () => (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Overview</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.totalMedia}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Media</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{stats.completedMedia}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>{stats.inProgressMedia}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>In Progress</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.info }]}>{stats.plannedMedia}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Planned</Text>
        </View>
      </View>

      <View style={styles.additionalStats}>
        <View style={styles.statRow}>
          <Text style={[styles.statText, { color: colors.text }]}>Average Rating:</Text>
          <Text style={[styles.statValue, { color: colors.warning }]}>
            {stats.averageRating > 0 ? `${stats.averageRating.toFixed(1)} ★` : 'No ratings'}
          </Text>
        </View>
        
        {stats.totalPagesRead > 0 && (
          <View style={styles.statRow}>
            <Text style={[styles.statText, { color: colors.text }]}>Pages Read:</Text>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {stats.totalPagesRead.toLocaleString()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderTypeDistribution = () => {
    if (stats.typeDistribution.length === 0) return null;

    return (
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Media Types</Text>
        
        <VictoryPie
          data={stats.typeDistribution}
          x="type"
          y="count"
          width={chartWidth}
          height={200}
          colorScale={[colors.primary, colors.secondary, colors.success, colors.warning]}
          labelStyle={{ fontSize: 12, fill: colors.text }}
          innerRadius={50}
        />
      </View>
    );
  };

  const renderGenreDistribution = () => {
    if (stats.genreDistribution.length === 0) return null;

    return (
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Genres</Text>
        
        <VictoryChart
          width={chartWidth}
          height={250}
          domainPadding={{ x: 20 }}
          theme={VictoryTheme.material}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(x) => `${x}`}
            style={{
              tickLabels: { fontSize: 10, fill: colors.textSecondary },
              grid: { stroke: colors.border },
            }}
          />
          <VictoryAxis
            tickFormat={(x) => x.length > 8 ? `${x.slice(0, 8)}...` : x}
            style={{
              tickLabels: { fontSize: 10, fill: colors.textSecondary, angle: -45 },
            }}
          />
          <VictoryBar
            data={stats.genreDistribution}
            x="genre"
            y="count"
            style={{
              data: { fill: colors.primary },
            }}
          />
        </VictoryChart>
      </View>
    );
  };

  const renderMonthlyCompletion = () => {
    if (stats.monthlyCompletion.length === 0) return null;

    return (
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Completion Trend</Text>
        
        <VictoryChart
          width={chartWidth}
          height={200}
          theme={VictoryTheme.material}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(x) => `${x}`}
            style={{
              tickLabels: { fontSize: 10, fill: colors.textSecondary },
              grid: { stroke: colors.border },
            }}
          />
          <VictoryAxis
            style={{
              tickLabels: { fontSize: 10, fill: colors.textSecondary },
            }}
          />
          <VictoryArea
            data={stats.monthlyCompletion}
            x="month"
            y="count"
            style={{
              data: { fill: colors.success, fillOpacity: 0.3, stroke: colors.success, strokeWidth: 2 },
            }}
          />
        </VictoryChart>
      </View>
    );
  };

  const renderRatingDistribution = () => {
    if (stats.ratingDistribution.length === 0) return null;

    return (
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Rating Distribution</Text>
        
        <VictoryChart
          width={chartWidth}
          height={200}
          domainPadding={{ x: 40 }}
          theme={VictoryTheme.material}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(x) => `${x}`}
            style={{
              tickLabels: { fontSize: 10, fill: colors.textSecondary },
              grid: { stroke: colors.border },
            }}
          />
          <VictoryAxis
            tickFormat={(x) => `${x} ★`}
            style={{
              tickLabels: { fontSize: 10, fill: colors.textSecondary },
            }}
          />
          <VictoryBar
            data={stats.ratingDistribution}
            x="rating"
            y="count"
            style={{
              data: { fill: colors.warning },
            }}
          />
        </VictoryChart>
      </View>
    );
  };

  if (media.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.surface }]}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Analytics Yet</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Add some media to your library to see analytics and insights.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderOverviewStats()}
      {renderTypeDistribution()}
      {renderGenreDistribution()}
      {renderMonthlyCompletion()}
      {renderRatingDistribution()}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  additionalStats: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statText: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
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