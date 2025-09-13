import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useCamera } from '../../hooks/useDeviceIntegration';
import { hapticService } from '../../services/HapticService';

interface PhotoAttachmentProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export const PhotoAttachment: React.FC<PhotoAttachmentProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 5,
}) => {
  const { colors } = useTheme();
  const { showImagePicker: showCameraPicker, isLoading } = useCamera();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleAddPhoto = async () => {
    if (photos.length >= maxPhotos) {
      hapticService.warning();
      Alert.alert('Limit Reached', `You can only attach up to ${maxPhotos} photos.`);
      return;
    }
    
    hapticService.light();
    
    try {
      const result = await showCameraPicker({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result) {
        hapticService.success();
        const newPhotos = [...photos, result.uri];
        onPhotosChange(newPhotos);
      }
    } catch (error) {
      hapticService.error();
      console.error('Failed to add photo:', error);
      Alert.alert('Error', 'Failed to add photo. Please try again.');
    }
  };

  const handleRemovePhoto = (index: number) => {
    hapticService.warning();
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            hapticService.success();
            const newPhotos = photos.filter((_, i) => i !== index);
            onPhotosChange(newPhotos);
          },
        },
      ]
    );
  };

  const handleImagePress = (uri: string) => {
    hapticService.light();
    setSelectedImage(uri);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Photos ({photos.length}/{maxPhotos})
        </Text>
        {photos.length < maxPhotos && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddPhoto}
            disabled={isLoading}
          >
            <Ionicons name="camera" size={16} color="white" />
            <Text style={styles.addButtonText}>
              {isLoading ? 'Adding...' : 'Add Photo'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.photoList}
          contentContainerStyle={styles.photoListContent}
        >
          {photos.map((uri, index) => (
            <View key={index} style={styles.photoContainer}>
              <TouchableOpacity
                style={styles.photoWrapper}
                onPress={() => handleImagePress(uri)}
              >
                <Image source={{ uri }} style={styles.photo} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemovePhoto(index)}
              >
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}



      {/* Image Preview Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={styles.previewClose}
            onPress={() => setSelectedImage(null)}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  photoList: {
    marginTop: 8,
  },
  photoListContent: {
    paddingRight: 16,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 12,
  },
  photoWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  photo: {
    width: 80,
    height: 80,
  },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  modalOptionText: {
    fontSize: 16,
  },
  modalCancel: {
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalCancelText: {
    fontSize: 16,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    padding: 8,
  },
  previewImage: {
    width: '90%',
    height: '80%',
  },
});