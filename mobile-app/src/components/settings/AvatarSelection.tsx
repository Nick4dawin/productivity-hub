import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '@/contexts/ThemeContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

interface AvatarSelectionProps {
  visible: boolean;
  onClose: () => void;
  onAvatarSelected: (avatarUri: string) => void;
  currentAvatar?: string;
}

const predefinedAvatars = [
  'https://api.dicebear.com/7.x/avataaars/png?seed=1',
  'https://api.dicebear.com/7.x/avataaars/png?seed=2',
  'https://api.dicebear.com/7.x/avataaars/png?seed=3',
  'https://api.dicebear.com/7.x/avataaars/png?seed=4',
  'https://api.dicebear.com/7.x/avataaars/png?seed=5',
  'https://api.dicebear.com/7.x/avataaars/png?seed=6',
  'https://api.dicebear.com/7.x/avataaars/png?seed=7',
  'https://api.dicebear.com/7.x/avataaars/png?seed=8',
  'https://api.dicebear.com/7.x/avataaars/png?seed=9',
  'https://api.dicebear.com/7.x/avataaars/png?seed=10',
  'https://api.dicebear.com/7.x/avataaars/png?seed=11',
  'https://api.dicebear.com/7.x/avataaars/png?seed=12',
];

export const AvatarSelection: React.FC<AvatarSelectionProps> = ({
  visible,
  onClose,
  onAvatarSelected,
  currentAvatar,
}) => {
  const { colors } = useTheme();
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar || null);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant permission to access your photo library to upload a custom avatar.'
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera permission to take a photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleChooseFromLibrary = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleSave = () => {
    if (selectedAvatar) {
      onAvatarSelected(selectedAvatar);
    }
    onClose();
  };

  const renderAvatarOption = (avatarUri: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.avatarOption,
        selectedAvatar === avatarUri && {
          borderColor: colors.primary,
          borderWidth: 3,
        },
      ]}
      onPress={() => setSelectedAvatar(avatarUri)}
    >
      <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
      {selectedAvatar === avatarUri && (
        <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]}>
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={[styles.cancelText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Choose Avatar
          </Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={!selectedAvatar}
          >
            <Text
              style={[
                styles.saveText,
                {
                  color: selectedAvatar ? colors.primary : colors.textSecondary,
                },
              ]}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Custom Photo Options */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Custom Photo
            </Text>
            
            <View style={styles.customOptions}>
              <TouchableOpacity
                style={[styles.customOption, { borderColor: colors.border }]}
                onPress={handleTakePhoto}
              >
                <Ionicons name="camera" size={24} color={colors.primary} />
                <Text style={[styles.customOptionText, { color: colors.text }]}>
                  Take Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.customOption, { borderColor: colors.border }]}
                onPress={handleChooseFromLibrary}
              >
                <Ionicons name="image" size={24} color={colors.primary} />
                <Text style={[styles.customOptionText, { color: colors.text }]}>
                  Choose from Library
                </Text>
              </TouchableOpacity>
            </View>
          </Card>

          {/* Predefined Avatars */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Predefined Avatars
            </Text>
            
            <View style={styles.avatarGrid}>
              {predefinedAvatars.map(renderAvatarOption)}
            </View>
          </Card>

          {/* Current Selection Preview */}
          {selectedAvatar && (
            <Card style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Preview
              </Text>
              
              <View style={styles.previewContainer}>
                <Image source={{ uri: selectedAvatar }} style={styles.previewImage} />
                <Text style={[styles.previewText, { color: colors.textSecondary }]}>
                  This will be your new profile picture
                </Text>
              </View>
            </Card>
          )}
        </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 8,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  customOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  customOption: {
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 8,
  },
  customOptionText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  avatarOption: {
    width: '22%',
    aspectRatio: 1,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    alignItems: 'center',
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  previewText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default AvatarSelection;