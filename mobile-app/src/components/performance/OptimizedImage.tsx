import React, { memo, useState, useCallback } from 'react';
import {
  View,
  ViewStyle,
  ActivityIndicator,
  Text,
  StyleSheet,
} from 'react-native';
import FastImage, {
  FastImageProps,
  ResizeMode,
  Priority,
  Source,
} from 'react-native-fast-image';

interface OptimizedImageProps extends Omit<FastImageProps, 'source'> {
  source: string | Source;
  placeholder?: React.ReactNode;
  errorComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  width?: number;
  height?: number;
  borderRadius?: number;
  resizeMode?: ResizeMode;
  priority?: Priority;
  cache?: 'immutable' | 'web' | 'cacheOnly';
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
  lazy?: boolean;
}

const OptimizedImageComponent: React.FC<OptimizedImageProps> = ({
  source,
  placeholder,
  errorComponent,
  loadingComponent,
  width,
  height,
  borderRadius,
  resizeMode = FastImage.resizeMode.cover,
  priority = FastImage.priority.normal,
  cache = 'immutable',
  onLoadStart,
  onLoadEnd,
  onError,
  lazy = true,
  style,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(!lazy);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    setError(false);
    onLoadStart?.();
  }, [onLoadStart]);

  const handleLoadEnd = useCallback(() => {
    setLoading(false);
    onLoadEnd?.();
  }, [onLoadEnd]);

  const handleError = useCallback((err: any) => {
    setLoading(false);
    setError(true);
    onError?.(err);
  }, [onError]);

  const handleLayout = useCallback(() => {
    if (lazy && !loaded) {
      setLoaded(true);
    }
  }, [lazy, loaded]);

  // Prepare source object
  const imageSource = typeof source === 'string' 
    ? {
        uri: source,
        priority,
        cache: FastImage.cacheControl[cache],
      }
    : {
        ...source,
        priority,
        cache: FastImage.cacheControl[cache],
      };

  // Container style
  const containerStyle: ViewStyle = {
    width,
    height,
    borderRadius,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  };

  // Image style
  const imageStyle = [
    {
      width: width || '100%',
      height: height || '100%',
    },
    style,
  ];

  return (
    <View style={[containerStyle, style]} onLayout={handleLayout}>
      {loaded && (
        <FastImage
          source={imageSource}
          style={imageStyle}
          resizeMode={resizeMode}
          onLoadStart={handleLoadStart}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          {...props}
        />
      )}
      
      {/* Loading state */}
      {loading && loaded && (
        <View style={styles.overlay}>
          {loadingComponent || (
            <ActivityIndicator size="small" color="#007AFF" />
          )}
        </View>
      )}
      
      {/* Error state */}
      {error && (
        <View style={styles.overlay}>
          {errorComponent || (
            <Text style={styles.errorText}>Failed to load image</Text>
          )}
        </View>
      )}
      
      {/* Placeholder for lazy loading */}
      {!loaded && placeholder && (
        <View style={styles.overlay}>
          {placeholder}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
  },
  errorText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export const OptimizedImage = memo(OptimizedImageComponent);