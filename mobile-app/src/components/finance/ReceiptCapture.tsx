import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

interface ReceiptCaptureProps {
  onImageSelected?: (imageUri: string) => void;
  onImageRemoved?: () => void;
  initialImageUri?: string;
}

export const ReceiptCapture: React.FC<ReceiptCaptureProps> = ({
  onImageSelected,
  onImageRemoved,
  initialImageUri,
}) => {
  const { colors } = useTheme();
  const [imageUri, setImageUri] = useState<string | null>(initialImageUri || null);

  const showImagePicker = () => {
    Alert.alert(
      'Select Receipt Photo',
      'Choose how you want to add a receipt photo',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Photo Library', onPress: openImageLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchCamera(options, handleImageResponse);
  };

  const openImageLibrary = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchImageLibrary(options, handleImageResponse);
  };

  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel || response.errorMessage) {
      return;
    }

    if (response.assets && response.assets[0]) {
      const asset = response.assets[0];
      if (asset.uri) {
        setImageUri(asset.uri);
        onImageSelected?.(asset.uri);
      }
    }
  };

  const removeImage = () => {
    Alert.alert(
      'Remove Receipt',
      'Are you sure you want to remove this receipt photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setImageUri(null);
            onImageRemoved?.();
          },
        },
      ]
    );
  };

  return (
    <Card style={styles.card}>
      <Text style={[styles.title, { color: colors.text }]}>Receipt Photo</Text>
      
      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.receiptImage} />
          <View style={styles.imageActions}>
            <Button
              title="Change Photo"
              onPress={showImagePicker}
              variant="outline"
              style={styles.actionButton}
            />
            <Button
              title="Remove"
              onPress={removeImage}
              variant="outline"
              style={[styles.actionButton, { borderColor: colors.error }]}
              titleStyle={{ color: colors.error }}
            />
          </View>
        </View>
      ) : (
        <View style={styles.placeholderContainer}>
          <TouchableOpacity
            style={[styles.placeholder, { borderColor: colors.border }]}
            onPress={showImagePicker}
          >
            <Text style={[styles.placeholderIcon, { color: colors.textSecondary }]}>
              📷
            </Text>
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              Tap to add receipt photo
            </Text>
            <Text style={[styles.placeholderSubtext, { color: colors.textSecondary }]}>
              Optional - helps with expense tracking
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  imageContainer: {
    alignItems: 'center',
  },
  receiptImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  imageActions: {
    flexDirection: 'row',
    width: '100%',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  placeholderContainer: {
    alignItems: 'center',
  },
  placeholder: {
    width: '100%',
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  placeholderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});