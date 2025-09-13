import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useRoutines } from '../../hooks/useRoutines';
import { useTheme } from '../../contexts/ThemeContext';

import Header from '../../components/common/Header';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

interface RouteParams {
  routineId: string;
}

interface ExecutionStep {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  type: 'task' | 'habit' | 'custom';
  completed: boolean;
}

const RoutineExecutionScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { routineId } = route.params as RouteParams;
  const { theme } = useTheme();

  const { data: routines = [], isLoading } = useRoutines();
  const routine = routines.find(r => r._id === routineId);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timer, setTimer] = useState(0);

  // Initialize steps from routine
  useEffect(() => {
    if (routine) {
      const executionSteps: ExecutionStep[] = [];
      
      // Add tasks
      routine.tasks?.forEach((task, index) => {
        executionSteps.push({
          id: `task-${task._id || index}`,
          title: task.title || `Task ${index + 1}`,
          type: 'task',
          completed: false,
        });
      });

      // Add habits
      routine.habits?.forEach((habit, index) => {
        executionSteps.push({
          id: `habit-${habit._id || index}`,
          title: habit.name || `Habit ${index + 1}`,
          type: 'habit',
          completed: false,
        });
      });

      setSteps(executionSteps);
    }
  }, [routine]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isStarted && !isCompleted) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isStarted, isCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRoutine = () => {
    setIsStarted(true);
    setStartTime(new Date());
    Vibration.vibrate(100);
  };

  const completeCurrentStep = () => {
    const updatedSteps = [...steps];
    updatedSteps[currentStepIndex].completed = true;
    setSteps(updatedSteps);
    
    Vibration.vibrate(50);

    // Move to next step or complete routine
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      completeRoutine();
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const goToNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const completeRoutine = () => {
    setIsCompleted(true);
    Vibration.vibrate([100, 50, 100]);
    
    Alert.alert(
      'Routine Completed! 🎉',
      `Great job! You completed "${routine?.name}" in ${formatTime(timer)}.`,
      [
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const pauseRoutine = () => {
    Alert.alert(
      'Pause Routine',
      'Are you sure you want to pause this routine?',
      [
        { text: 'Continue', style: 'cancel' },
        {
          text: 'Pause',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const getStepIcon = (type: ExecutionStep['type'], completed: boolean) => {
    if (completed) {
      return 'checkmark-circle';
    }
    
    switch (type) {
      case 'task':
        return 'checkmark-circle-outline';
      case 'habit':
        return 'repeat-outline';
      default:
        return 'ellipse-outline';
    }
  };

  const getStepColor = (type: ExecutionStep['type'], completed: boolean) => {
    if (completed) {
      return theme.colors.success;
    }
    
    switch (type) {
      case 'task':
        return theme.colors.primary;
      case 'habit':
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Loading..." />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (!routine) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Routine Not Found" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text }]}>
            Routine not found
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStep = steps[currentStepIndex];
  const completedSteps = steps.filter(s => s.completed).length;
  const progress = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title={routine.name}
        showBackButton
        onBackPress={pauseRoutine}
        rightComponent={
          <TouchableOpacity onPress={pauseRoutine}>
            <Ionicons name="pause" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        {/* Timer and Progress */}
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.timerContainer}>
              <Text style={[styles.timerLabel, { color: theme.colors.textSecondary }]}>
                Time
              </Text>
              <Text style={[styles.timerText, { color: theme.colors.text }]}>
                {formatTime(timer)}
              </Text>
            </View>
            
            <View style={styles.progressContainer}>
              <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>
                Progress
              </Text>
              <Text style={[styles.progressText, { color: theme.colors.text }]}>
                {completedSteps}/{steps.length}
              </Text>
            </View>
          </View>
          
          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.primary,
                  width: `${progress}%`,
                },
              ]}
            />
          </View>
        </Card>

        {!isStarted ? (
          /* Start Screen */
          <View style={styles.startContainer}>
            <Card style={styles.startCard}>
              <Text style={[styles.routineTitle, { color: theme.colors.text }]}>
                {routine.name}
              </Text>
              
              {routine.description && (
                <Text style={[styles.routineDescription, { color: theme.colors.textSecondary }]}>
                  {routine.description}
                </Text>
              )}

              <View style={styles.routineStats}>
                <View style={styles.statItem}>
                  <Ionicons name="list" size={20} color={theme.colors.primary} />
                  <Text style={[styles.statText, { color: theme.colors.text }]}>
                    {steps.length} steps
                  </Text>
                </View>
                
                <View style={styles.statItem}>
                  <Ionicons name="time" size={20} color={theme.colors.primary} />
                  <Text style={[styles.statText, { color: theme.colors.text }]}>
                    ~{Math.ceil(steps.length * 2)} min
                  </Text>
                </View>
              </View>

              <Button
                title="Start Routine"
                onPress={startRoutine}
                style={styles.startButton}
              />
            </Card>
          </View>
        ) : isCompleted ? (
          /* Completion Screen */
          <View style={styles.completionContainer}>
            <Card style={styles.completionCard}>
              <Ionicons name="checkmark-circle" size={80} color={theme.colors.success} />
              <Text style={[styles.completionTitle, { color: theme.colors.text }]}>
                Routine Completed!
              </Text>
              <Text style={[styles.completionTime, { color: theme.colors.textSecondary }]}>
                Finished in {formatTime(timer)}
              </Text>
              <Button
                title="Done"
                onPress={() => navigation.goBack()}
                style={styles.doneButton}
              />
            </Card>
          </View>
        ) : (
          /* Execution Screen */
          <View style={styles.executionContainer}>
            {/* Current Step */}
            <Card style={styles.currentStepCard}>
              <View style={styles.stepHeader}>
                <Text style={[styles.stepNumber, { color: theme.colors.primary }]}>
                  Step {currentStepIndex + 1} of {steps.length}
                </Text>
                <Ionicons
                  name={getStepIcon(currentStep.type, currentStep.completed)}
                  size={32}
                  color={getStepColor(currentStep.type, currentStep.completed)}
                />
              </View>
              
              <Text style={[styles.stepTitle, { color: theme.colors.text }]}>
                {currentStep.title}
              </Text>
              
              {currentStep.description && (
                <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
                  {currentStep.description}
                </Text>
              )}

              {currentStep.duration && (
                <View style={styles.durationContainer}>
                  <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
                  <Text style={[styles.durationText, { color: theme.colors.textSecondary }]}>
                    Suggested duration: {currentStep.duration} minutes
                  </Text>
                </View>
              )}
            </Card>

            {/* Navigation Controls */}
            <View style={styles.controls}>
              <Button
                title="Previous"
                variant="outline"
                onPress={goToPreviousStep}
                disabled={currentStepIndex === 0}
                style={styles.controlButton}
              />
              
              <Button
                title={currentStep.completed ? "Next" : "Complete Step"}
                onPress={currentStep.completed ? goToNextStep : completeCurrentStep}
                style={styles.controlButton}
              />
            </View>

            {/* Step Overview */}
            <Card style={styles.overviewCard}>
              <Text style={[styles.overviewTitle, { color: theme.colors.text }]}>
                All Steps
              </Text>
              
              {steps.map((step, index) => (
                <TouchableOpacity
                  key={step.id}
                  onPress={() => setCurrentStepIndex(index)}
                  style={[
                    styles.overviewStep,
                    index === currentStepIndex && styles.currentOverviewStep,
                  ]}
                >
                  <Ionicons
                    name={getStepIcon(step.type, step.completed)}
                    size={20}
                    color={getStepColor(step.type, step.completed)}
                  />
                  <Text
                    style={[
                      styles.overviewStepText,
                      { color: theme.colors.text },
                      step.completed && styles.completedStepText,
                    ]}
                    numberOfLines={1}
                  >
                    {step.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    marginBottom: 16,
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  startCard: {
    padding: 32,
    alignItems: 'center',
  },
  routineTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  routineDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  routineStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 32,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  startButton: {
    minWidth: 160,
  },
  completionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  completionCard: {
    padding: 32,
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  completionTime: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  doneButton: {
    minWidth: 120,
  },
  executionContainer: {
    flex: 1,
  },
  currentStepCard: {
    marginBottom: 16,
    padding: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    marginLeft: 6,
    fontStyle: 'italic',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  controlButton: {
    flex: 1,
  },
  overviewCard: {
    padding: 16,
  },
  overviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  overviewStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  currentOverviewStep: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  overviewStepText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  completedStepText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500',
  },
});

export default RoutineExecutionScreen;