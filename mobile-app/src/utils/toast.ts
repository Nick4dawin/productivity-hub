import { Alert, Platform, ToastAndroid } from 'react-native';

/**
 * Show a toast message on Android or Alert on iOS
 */
export const showToast = (message: string, duration: 'short' | 'long' = 'short') => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(
      message,
      duration === 'short' ? ToastAndroid.SHORT : ToastAndroid.LONG
    );
  } else {
    Alert.alert('', message);
  }
};

/**
 * Show a confirmation dialog
 */
export const showConfirmDialog = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Confirm',
        style: 'destructive',
        onPress: onConfirm,
      },
    ]
  );
};