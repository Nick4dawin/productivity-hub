import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useTheme } from '@/contexts/ThemeContext';
import { Habit } from '@/types';

interface HabitCalendarProps {
  habit: Habit;
  onDatePress?: (date: string) => void;
}

export const HabitCalendar: React.FC<HabitCalendarProps> = ({
  habit,
  onDatePress,
}) => {
  const { colors } = useTheme();

  // Create marked dates object for the calendar
  const getMarkedDates = () => {
    const markedDates: { [key: string]: any } = {};
    
    habit.completedDates.forEach((date) => {
      markedDates[date] = {
        selected: true,
        selectedColor: habit.color || colors.success,
        selectedTextColor: colors.surface,
      };
    });

    // Mark today with a different style if not completed
    const today = new Date().toISOString().split('T')[0];
    if (!habit.completedDates.includes(today)) {
      markedDates[today] = {
        ...markedDates[today],
        marked: true,
        dotColor: colors.primary,
      };
    }

    return markedDates;
  };

  const handleDayPress = (day: DateData) => {
    if (onDatePress) {
      onDatePress(day.dateString);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {habit.name} History
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Tap dates to toggle completion
        </Text>
      </View>
      
      <Calendar
        onDayPress={handleDayPress}
        markedDates={getMarkedDates()}
        theme={{
          backgroundColor: colors.surface,
          calendarBackground: colors.surface,
          textSectionTitleColor: colors.textSecondary,
          selectedDayBackgroundColor: habit.color || colors.success,
          selectedDayTextColor: colors.surface,
          todayTextColor: colors.primary,
          dayTextColor: colors.text,
          textDisabledColor: colors.textSecondary,
          dotColor: colors.primary,
          selectedDotColor: colors.surface,
          arrowColor: colors.primary,
          monthTextColor: colors.text,
          indicatorColor: colors.primary,
          textDayFontFamily: 'System',
          textMonthFontFamily: 'System',
          textDayHeaderFontFamily: 'System',
          textDayFontWeight: '400',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 14,
        }}
        style={styles.calendar}
      />
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: habit.color || colors.success },
            ]}
          />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Completed
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: colors.primary },
            ]}
          />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>
            Today
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  calendar: {
    borderRadius: 8,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
  },
});