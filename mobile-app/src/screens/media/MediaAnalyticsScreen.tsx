import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { useMedia } from '@/hooks/useMedia';
import { Header } from '@/components/common/Header';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { MediaAnalytics } from '@/components/media/MediaAnalytics';
import { MediaRecommendations } from '@/components/media/MediaRecommendations';

type TabType = 'analytics' | 'recommendations';

export const MediaAnalyticsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { data: media = [], isLoading } = useMedia();
  const [activeTab, setActiveTab] = useState<TabType>('analytics');

  const handleRecommendationPress = (recommendation: any) => {
    // In a real app, this could navigate to external search or add the recommendation
    console.log('Recommendation pressed:', recommendation);
  };

  const renderTabButton = (tab: TabType, label: string) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        {
          backgroundColor: activeTab === tab ? colors.primary : colors.surface,
          borderColor: activeTab === tab ? colors.primary : colors.border,
        },
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text
        style={[
          styles.tabButtonText,
          {
            color: activeTab === tab ? colors.surface : colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header
          title="Media Analytics"
          leftElement={
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
            </TouchableOpacity>
          }
        />
        <View style={styles.loadingContainer}>
          <LoadingSpinner />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Media Analytics"
        leftElement={
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: colors.primary }]}>Back</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.tabContainer}>
        {renderTabButton('analytics', 'Analytics')}
        {renderTabButton('recommendations', 'Recommendations')}
      </View>

      <View style={styles.content}>
        {activeTab === 'analytics' ? (
          <MediaAnalytics media={media} />
        ) : (
          <MediaRecommendations 
            media={media} 
            onRecommendationPress={handleRecommendationPress}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});