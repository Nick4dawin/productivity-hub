import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/contexts/ThemeContext';
import { Header } from '@/components/common/Header';
import { ChatInterface } from '@/components/coach/ChatInterface';
import { CoachInsights } from '@/components/coach/CoachInsights';
import { CoachSummary } from '@/components/coach/CoachSummary';
import { ProactiveCoaching } from '@/components/coach/ProactiveCoaching';
import { CoachingCheckIns } from '@/components/coach/CoachingCheckIns';
import { useCoachChat, useProactiveCoaching } from '@/hooks/useCoach';

type TabType = 'chat' | 'insights' | 'summary' | 'prompts' | 'checkin';

export const CoachScreen: React.FC = () => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const { messages, isTyping, sendMessage, isSending, addSystemMessage } = useCoachChat();
  const { generateDailyCheckIn } = useProactiveCoaching();

  // Add welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = "Hi! I'm your AI productivity coach. I'm here to help you stay motivated, track your progress, and achieve your goals. " + generateDailyCheckIn();
      addSystemMessage(welcomeMessage);
    }
  }, [messages.length, addSystemMessage, generateDailyCheckIn]);

  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(message);
    } catch (error) {
      addSystemMessage("Sorry, I'm having trouble connecting right now. Please try again in a moment.");
    }
  };

  const tabs = [
    { key: 'chat', label: 'Chat', icon: '💬' },
    { key: 'insights', label: 'Insights', icon: '📊' },
    { key: 'summary', label: 'Summary', icon: '📋' },
    { key: 'prompts', label: 'Prompts', icon: '🔔' },
    { key: 'checkin', label: 'Check-in', icon: '✅' },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            isSending={isSending}
          />
        );
      case 'insights':
        return <CoachInsights />;
      case 'summary':
        return <CoachSummary />;
      case 'prompts':
        return <ProactiveCoaching />;
      case 'checkin':
        return <CoachingCheckIns />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="AI Coach" />
      
      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && { borderBottomColor: colors.primary },
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: activeTab === tab.key ? colors.primary : colors.textSecondary,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});