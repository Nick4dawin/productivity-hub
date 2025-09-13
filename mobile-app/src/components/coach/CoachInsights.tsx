import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useCoachInsights } from '@/hooks/useCoach';

interface InsightCardProps {
  insight: {
    type: 'success' | 'warning' | 'tip' | 'support';
    title: string;
    message: string;
  };
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const { colors } = useTheme();

  const getInsightColor = () => {
    switch (insight.type) {
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'tip':
        return colors.primary;
      case 'support':
        return colors.secondary;
      default:
        return colors.textSecondary;
    }
  };

  const getInsightIcon = () => {
    switch (insight.type) {
      case 'success':
        return '🎉';
      case 'warning':
        return '⚠️';
      case 'tip':
        return '💡';
      case 'support':
        return '🤗';
      default:
        return 'ℹ️';
    }
  };

  return (
    <Card style={[styles.insightCard, { borderLeftColor: getInsightColor() }]}>
      <View style={styles.insightHeader}>
        <Text style={styles.insightIcon}>{getInsightIcon()}</Text>
        <Text style={[styles.insightTitle, { color: colors.text }]}>
          {insight.title}
        </Text>
      </View>
      <Text style={[styles.insightMessage, { color: colors.textSecondary }]}>
        {insight.message}
      </Text>
    </Card>
  );
};

interface RecommendationCardProps {
  recommendation: {
    type: 'suggestion';
    title: string;
    message: string;
    action?: string;
  };
  onActionPress?: () => void;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation, 
  onActionPress 
}) => {
  const { colors } = useTheme();

  return (
    <Card style={styles.recommendationCard}>
      <View style={styles.recommendationHeader}>
        <Text style={styles.recommendationIcon}>💭</Text>
        <Text style={[styles.recommendationTitle, { color: colors.text }]}>
          {recommendation.title}
        </Text>
      </View>
      
      <Text style={[styles.recommendationMessage, { color: colors.textSecondary }]}>
        {recommendation.message}
      </Text>
      
      {recommendation.action && onActionPress && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={onActionPress}
        >
          <Text style={styles.actionButtonText}>
            {recommendation.action}
          </Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

export const CoachInsights: React.FC = () => {
  const { colors } = useTheme();
  const { 
    isLoading, 
    getProductivityInsights, 
    getGoalRecommendations 
  } = useCoachInsights();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Analyzing your data...
        </Text>
      </View>
    );
  }

  const insights = getProductivityInsights();
  const recommendations = getGoalRecommendations();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Productivity Insights */}
      {insights.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📊 Productivity Insights
          </Text>
          {insights.map((insight, index) => (
            <InsightCard key={index} insight={insight} />
          ))}
        </View>
      )}

      {/* Goal Recommendations */}
      {recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            🎯 Recommendations
          </Text>
          {recommendations.map((recommendation, index) => (
            <RecommendationCard
              key={index}
              recommendation={recommendation}
              onActionPress={() => {
                // Navigate to goal creation or other actions
                console.log('Action pressed:', recommendation.action);
              }}
            />
          ))}
        </View>
      )}

      {/* Motivational Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          ✨ Daily Motivation
        </Text>
        <Card style={styles.motivationCard}>
          <Text style={[styles.motivationText, { color: colors.text }]}>
            "The secret of getting ahead is getting started. You're already on the right path by tracking your progress!"
          </Text>
        </Card>
      </View>

      {/* Quick Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          📈 Quick Stats
        </Text>
        <Card style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>
                7
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Day Streak
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.success }]}>
                85%
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Completion Rate
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.warning }]}>
                12
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Active Goals
              </Text>
            </View>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  insightCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  insightMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  recommendationCard: {
    marginBottom: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  recommendationMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  motivationCard: {
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  motivationText: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsCard: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});