import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

interface CheckInQuestion {
  id: string;
  question: string;
  type: 'rating' | 'text' | 'multiple-choice';
  options?: string[];
}

interface CheckInResponse {
  questionId: string;
  answer: string | number;
}

export const CoachingCheckIns: React.FC = () => {
  const { colors } = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<CheckInResponse[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const checkInQuestions: CheckInQuestion[] = [
    {
      id: 'energy-level',
      question: 'How would you rate your energy level today?',
      type: 'rating',
    },
    {
      id: 'productivity-feeling',
      question: 'How productive did you feel today?',
      type: 'rating',
    },
    {
      id: 'biggest-challenge',
      question: 'What was your biggest challenge today?',
      type: 'text',
    },
    {
      id: 'accomplishment',
      question: 'What are you most proud of accomplishing today?',
      type: 'text',
    },
    {
      id: 'tomorrow-focus',
      question: 'What do you want to focus on tomorrow?',
      type: 'multiple-choice',
      options: [
        'Complete pending tasks',
        'Start a new project',
        'Focus on habits',
        'Work on goals',
        'Take a break/rest',
      ],
    },
  ];

  const currentQuestion = checkInQuestions[currentQuestionIndex];

  const handleRatingResponse = (rating: number) => {
    const response: CheckInResponse = {
      questionId: currentQuestion.id,
      answer: rating,
    };
    
    setResponses(prev => [...prev.filter(r => r.questionId !== currentQuestion.id), response]);
  };

  const handleTextResponse = (text: string) => {
    const response: CheckInResponse = {
      questionId: currentQuestion.id,
      answer: text,
    };
    
    setResponses(prev => [...prev.filter(r => r.questionId !== currentQuestion.id), response]);
  };

  const handleMultipleChoiceResponse = (option: string) => {
    const response: CheckInResponse = {
      questionId: currentQuestion.id,
      answer: option,
    };
    
    setResponses(prev => [...prev.filter(r => r.questionId !== currentQuestion.id), response]);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < checkInQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      completeCheckIn();
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const completeCheckIn = () => {
    setIsCompleted(true);
    // Here you would typically save the responses to the backend
    console.log('Check-in responses:', responses);
  };

  const getCurrentResponse = () => {
    return responses.find(r => r.questionId === currentQuestion.id);
  };

  const renderRatingInput = () => {
    const currentResponse = getCurrentResponse();
    const selectedRating = currentResponse ? Number(currentResponse.answer) : 0;

    return (
      <View style={styles.ratingContainer}>
        <View style={styles.ratingScale}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                {
                  backgroundColor: selectedRating === rating ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => handleRatingResponse(rating)}
            >
              <Text
                style={[
                  styles.ratingText,
                  { color: selectedRating === rating ? '#fff' : colors.text },
                ]}
              >
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.ratingLabels}>
          <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>
            Low
          </Text>
          <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>
            High
          </Text>
        </View>
      </View>
    );
  };

  const renderTextInput = () => {
    const currentResponse = getCurrentResponse();
    const currentText = currentResponse ? String(currentResponse.answer) : '';

    return (
      <Input
        placeholder="Share your thoughts..."
        value={currentText}
        onChangeText={handleTextResponse}
        multiline
        numberOfLines={4}
        style={styles.textInput}
      />
    );
  };

  const renderMultipleChoice = () => {
    const currentResponse = getCurrentResponse();
    const selectedOption = currentResponse ? String(currentResponse.answer) : '';

    return (
      <View style={styles.optionsContainer}>
        {currentQuestion.options?.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              {
                backgroundColor: selectedOption === option ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => handleMultipleChoiceResponse(option)}
          >
            <Text
              style={[
                styles.optionText,
                { color: selectedOption === option ? '#fff' : colors.text },
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case 'rating':
        return renderRatingInput();
      case 'text':
        return renderTextInput();
      case 'multiple-choice':
        return renderMultipleChoice();
      default:
        return null;
    }
  };

  if (isCompleted) {
    return (
      <Card style={styles.completedCard}>
        <Text style={styles.completedIcon}>🎉</Text>
        <Text style={[styles.completedTitle, { color: colors.text }]}>
          Check-in Complete!
        </Text>
        <Text style={[styles.completedMessage, { color: colors.textSecondary }]}>
          Thank you for sharing your thoughts. Your responses help me provide better coaching and support.
        </Text>
        <Button
          title="View Insights"
          onPress={() => {
            // Navigate to insights or reset check-in
            setIsCompleted(false);
            setCurrentQuestionIndex(0);
            setResponses([]);
          }}
          style={styles.insightsButton}
        />
      </Card>
    );
  }

  const hasResponse = getCurrentResponse() !== undefined;
  const progress = ((currentQuestionIndex + 1) / checkInQuestions.length) * 100;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.checkInCard}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: `${progress}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            {currentQuestionIndex + 1} of {checkInQuestions.length}
          </Text>
        </View>

        {/* Question */}
        <Text style={[styles.questionText, { color: colors.text }]}>
          {currentQuestion.question}
        </Text>

        {/* Input */}
        {renderQuestionInput()}

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <Button
            title="Previous"
            onPress={goToPreviousQuestion}
            variant="outline"
            disabled={currentQuestionIndex === 0}
            style={styles.navButton}
          />
          
          <Button
            title={currentQuestionIndex === checkInQuestions.length - 1 ? 'Complete' : 'Next'}
            onPress={goToNextQuestion}
            disabled={!hasResponse}
            style={styles.navButton}
          />
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  checkInCard: {
    padding: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 26,
  },
  ratingContainer: {
    marginBottom: 32,
  },
  ratingScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
  },
  ratingLabel: {
    fontSize: 14,
  },
  textInput: {
    marginBottom: 32,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flex: 0.45,
  },
  completedCard: {
    padding: 32,
    alignItems: 'center',
  },
  completedIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  completedMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  insightsButton: {
    minWidth: 150,
  },
});