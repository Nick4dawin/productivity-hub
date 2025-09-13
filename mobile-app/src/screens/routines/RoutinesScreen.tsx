import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useRoutines, useDeleteRoutine } from '../../hooks/useRoutines';
import { useTheme } from '../../contexts/ThemeContext';
import { Routine } from '../../types';

import Header from '../../components/common/Header';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import RoutineItem from '../../components/routines/RoutineItem';
import RoutineTemplates from '../../components/routines/RoutineTemplates';

const RoutinesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const { data: routines = [], isLoading, refetch } = useRoutines();
  const deleteRoutineMutation = useDeleteRoutine();

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAddRoutine = () => {
    navigation.navigate('AddRoutine' as never);
  };

  const handleEditRoutine = (routine: Routine) => {
    navigation.navigate('EditRoutine' as never, { routineId: routine._id } as never);
  };

  const handleDeleteRoutine = (routine: Routine) => {
    Alert.alert(
      'Delete Routine',
      `Are you sure you want to delete "${routine.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteRoutineMutation.mutate(routine._id),
        },
      ]
    );
  };

  const handleViewRoutine = (routine: Routine) => {
    navigation.navigate('RoutineDetail' as never, { routineId: routine._id } as never);
  };

  const handleExecuteRoutine = (routine: Routine) => {
    navigation.navigate('RoutineExecution' as never, { routineId: routine._id } as never);
  };

  const handleUseTemplate = (template: any) => {
    navigation.navigate('AddRoutine' as never, { template } as never);
    setShowTemplates(false);
  };

  const renderRoutineItem = ({ item }: { item: Routine }) => (
    <RoutineItem
      routine={item}
      onPress={() => handleViewRoutine(item)}
      onEdit={() => handleEditRoutine(item)}
      onDelete={() => handleDeleteRoutine(item)}
      onExecute={() => handleExecuteRoutine(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={styles.headerActions}>
        <Button
          title="Browse Templates"
          variant="outline"
          onPress={() => setShowTemplates(true)}
          style={styles.templateButton}
        />
        <Button
          title="Create Custom"
          onPress={handleAddRoutine}
          style={styles.createButton}
        />
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <Card style={styles.emptyState}>
      <Ionicons 
        name="repeat-outline" 
        size={64} 
        color={theme.colors.textSecondary} 
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
        No Routines Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.textSecondary }]}>
        Create your first routine to build consistent daily habits
      </Text>
      <View style={styles.emptyActions}>
        <Button
          title="Browse Templates"
          variant="outline"
          onPress={() => setShowTemplates(true)}
          style={styles.emptyButton}
        />
        <Button
          title="Create Routine"
          onPress={handleAddRoutine}
          style={styles.emptyButton}
        />
      </View>
    </Card>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Header title="Routines" />
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header 
        title="Routines" 
        rightComponent={
          <TouchableOpacity onPress={handleAddRoutine}>
            <Ionicons name="add" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        }
      />
      
      <FlatList
        data={routines}
        renderItem={renderRoutineItem}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={routines.length > 0 ? renderHeader : undefined}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Templates Modal */}
      <RoutineTemplates
        visible={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleUseTemplate}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  headerContent: {
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  templateButton: {
    flex: 1,
  },
  createButton: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 64,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  emptyButton: {
    minWidth: 120,
  },
});

export default RoutinesScreen;