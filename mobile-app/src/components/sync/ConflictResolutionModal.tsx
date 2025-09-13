import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { SyncConflict, ConflictResolution } from '@/services/SyncManager';

interface ConflictResolutionModalProps {
  visible: boolean;
  conflicts: SyncConflict[];
  onResolve: (conflictId: string, resolution: ConflictResolution) => void;
  onClose: () => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  visible,
  conflicts,
  onResolve,
  onClose,
}) => {
  const { colors } = useTheme();
  const [currentConflictIndex, setCurrentConflictIndex] = useState(0);
  const [selectedResolution, setSelectedResolution] = useState<'client-wins' | 'server-wins' | 'merge' | null>(null);

  const currentConflict = conflicts[currentConflictIndex];

  if (!currentConflict) {
    return null;
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const renderDataComparison = () => {
    const { localData, serverData } = currentConflict;
    
    return (
      <View style={styles.comparisonContainer}>
        <View style={styles.dataColumn}>
          <Text style={[styles.dataTitle, { color: colors.primary }]}>
            Your Changes
          </Text>
          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
            Modified: {formatTimestamp(currentConflict.lastModified.local)}
          </Text>
          <ScrollView style={styles.dataContent}>
            <Text style={[styles.dataText, { color: colors.text }]}>
              {JSON.stringify(localData, null, 2)}
            </Text>
          </ScrollView>
        </View>

        <View style={styles.divider} />

        <View style={styles.dataColumn}>
          <Text style={[styles.dataTitle, { color: colors.secondary }]}>
            Server Version
          </Text>
          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
            Modified: {currentConflict.lastModified.server ? 
              formatTimestamp(currentConflict.lastModified.server) : 'Unknown'}
          </Text>
          <ScrollView style={styles.dataContent}>
            <Text style={[styles.dataText, { color: colors.text }]}>
              {serverData ? JSON.stringify(serverData, null, 2) : 'Deleted on server'}
            </Text>
          </ScrollView>
        </View>
      </View>
    );
  };

  const renderResolutionOptions = () => {
    const options = [
      {
        key: 'client-wins' as const,
        title: 'Keep Your Changes',
        description: 'Use your local changes and overwrite the server version',
        color: colors.primary,
      },
      {
        key: 'server-wins' as const,
        title: 'Use Server Version',
        description: 'Discard your changes and use the server version',
        color: colors.secondary,
      },
    ];

    // Add merge option if both versions exist
    if (currentConflict.serverData && currentConflict.type !== 'deleted-on-server') {
      options.push({
        key: 'merge' as const,
        title: 'Merge Changes',
        description: 'Attempt to combine both versions automatically',
        color: colors.success,
      });
    }

    return (
      <View style={styles.optionsContainer}>
        <Text style={[styles.optionsTitle, { color: colors.text }]}>
          How would you like to resolve this conflict?
        </Text>
        
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.optionButton,
              { 
                borderColor: colors.border,
                backgroundColor: selectedResolution === option.key ? option.color : colors.surface,
              },
            ]}
            onPress={() => setSelectedResolution(option.key)}
          >
            <Text
              style={[
                styles.optionTitle,
                { color: selectedResolution === option.key ? '#fff' : colors.text },
              ]}
            >
              {option.title}
            </Text>
            <Text
              style={[
                styles.optionDescription,
                { color: selectedResolution === option.key ? 'rgba(255,255,255,0.8)' : colors.textSecondary },
              ]}
            >
              {option.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const handleResolve = () => {
    if (!selectedResolution) {
      Alert.alert('Error', 'Please select a resolution option');
      return;
    }

    const resolution: ConflictResolution = {
      strategy: selectedResolution,
      resolvedData: selectedResolution === 'client-wins' ? currentConflict.localData : 
                   selectedResolution === 'server-wins' ? currentConflict.serverData :
                   undefined, // For merge, let the system handle it
    };

    onResolve(currentConflict.id, resolution);

    // Move to next conflict or close modal
    if (currentConflictIndex < conflicts.length - 1) {
      setCurrentConflictIndex(prev => prev + 1);
      setSelectedResolution(null);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    if (currentConflictIndex < conflicts.length - 1) {
      setCurrentConflictIndex(prev => prev + 1);
      setSelectedResolution(null);
    } else {
      onClose();
    }
  };

  const getConflictTypeDescription = () => {
    switch (currentConflict.type) {
      case 'concurrent-edit':
        return 'This item was modified both locally and on the server at the same time.';
      case 'version-mismatch':
        return 'The server version of this item has changed since your last sync.';
      case 'deleted-on-server':
        return 'This item was deleted on the server but you have local changes.';
      default:
        return 'A sync conflict has occurred.';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>
            Sync Conflict
          </Text>
          <Text style={[styles.progress, { color: colors.textSecondary }]}>
            {currentConflictIndex + 1} of {conflicts.length}
          </Text>
        </View>

        <ScrollView style={styles.content}>
          <Card style={styles.conflictCard}>
            <Text style={[styles.conflictType, { color: colors.warning }]}>
              {currentConflict.type.replace('-', ' ').toUpperCase()}
            </Text>
            <Text style={[styles.conflictDescription, { color: colors.text }]}>
              {getConflictTypeDescription()}
            </Text>
          </Card>

          {renderDataComparison()}
          {renderResolutionOptions()}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Button
            title="Skip"
            onPress={handleSkip}
            variant="outline"
            style={styles.footerButton}
          />
          <Button
            title="Resolve"
            onPress={handleResolve}
            disabled={!selectedResolution}
            style={styles.footerButton}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  progress: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  conflictCard: {
    marginBottom: 16,
  },
  conflictType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  conflictDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  comparisonContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    minHeight: 200,
  },
  dataColumn: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 16,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    marginBottom: 12,
  },
  dataContent: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 12,
  },
  dataText: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  optionButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});