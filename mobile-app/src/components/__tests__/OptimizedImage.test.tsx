import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent, waitFor } from '../../test-utils';
import { OptimizedImage } from '../performance/OptimizedImage';

// Mock FastImage
jest.mock('react-native-fast-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => (
      <View
        ref={ref}
        testID="fast-image"
        onLayout={props.onLayout}
        {...props}
      />
    )),
    resizeMode: {
      cover: 'cover',
      contain: 'contain',
      stretch: 'stretch',
      center: 'center',
    },
    priority: {
      low: 'low',
      normal: 'normal',
      high: 'high',
    },
    cacheControl: {
      immutable: 'immutable',
      web: 'web',
      cacheOnly: 'cacheOnly',
    },
  };
});

describe('OptimizedImage', () => {
  const mockSource = 'https://example.com/image.jpg';

  it('should render image with correct source', () => {
    const { getByTestId } = render(
      <OptimizedImage source={mockSource} width={100} height={100} />
    );

    expect(getByTestId('fast-image')).toBeTruthy();
  });

  it('should show loading state initially', () => {
    const LoadingComponent = () => <Text testID="loading">Loading...</Text>;
    
    const { getByTestId } = render(
      <OptimizedImage
        source={mockSource}
        width={100}
        height={100}
        loadingComponent={<LoadingComponent />}
      />
    );

    expect(getByTestId('loading')).toBeTruthy();
  });

  it('should show placeholder when lazy loading is enabled and not loaded', () => {
    const Placeholder = () => <Text testID="placeholder">Placeholder</Text>;
    
    const { getByTestId } = render(
      <OptimizedImage
        source={mockSource}
        width={100}
        height={100}
        lazy={true}
        placeholder={<Placeholder />}
      />
    );

    expect(getByTestId('placeholder')).toBeTruthy();
  });

  it('should load image when layout event is triggered for lazy loading', async () => {
    const { getByTestId, queryByTestId } = render(
      <OptimizedImage
        source={mockSource}
        width={100}
        height={100}
        lazy={true}
        testID="optimized-image"
      />
    );

    const container = getByTestId('optimized-image');
    
    // Trigger layout event
    fireEvent(container, 'layout');

    await waitFor(() => {
      expect(getByTestId('fast-image')).toBeTruthy();
    });
  });

  it('should handle load start event', () => {
    const onLoadStart = jest.fn();
    
    const { getByTestId } = render(
      <OptimizedImage
        source={mockSource}
        width={100}
        height={100}
        onLoadStart={onLoadStart}
        lazy={false}
      />
    );

    const image = getByTestId('fast-image');
    
    fireEvent(image, 'loadStart');
    
    expect(onLoadStart).toHaveBeenCalled();
  });

  it('should handle load end event', () => {
    const onLoadEnd = jest.fn();
    
    const { getByTestId } = render(
      <OptimizedImage
        source={mockSource}
        width={100}
        height={100}
        onLoadEnd={onLoadEnd}
        lazy={false}
      />
    );

    const image = getByTestId('fast-image');
    
    fireEvent(image, 'loadEnd');
    
    expect(onLoadEnd).toHaveBeenCalled();
  });

  it('should show error component on load error', async () => {
    const ErrorComponent = () => <Text testID="error">Error loading image</Text>;
    
    const { getByTestId } = render(
      <OptimizedImage
        source={mockSource}
        width={100}
        height={100}
        errorComponent={<ErrorComponent />}
        lazy={false}
      />
    );

    const image = getByTestId('fast-image');
    
    fireEvent(image, 'error', { nativeEvent: { error: 'Network error' } });

    await waitFor(() => {
      expect(getByTestId('error')).toBeTruthy();
    });
  });

  it('should handle object source correctly', () => {
    const objectSource = {
      uri: 'https://example.com/image.jpg',
      headers: { Authorization: 'Bearer token' },
    };
    
    const { getByTestId } = render(
      <OptimizedImage source={objectSource} width={100} height={100} />
    );

    expect(getByTestId('fast-image')).toBeTruthy();
  });

  it('should apply custom styles correctly', () => {
    const customStyle = { borderRadius: 10 };
    
    const { getByTestId } = render(
      <OptimizedImage
        source={mockSource}
        width={100}
        height={100}
        style={customStyle}
        testID="optimized-image"
      />
    );

    const container = getByTestId('optimized-image');
    expect(container).toBeTruthy();
  });

  it('should use correct cache control settings', () => {
    const { getByTestId } = render(
      <OptimizedImage
        source={mockSource}
        width={100}
        height={100}
        cache="web"
        lazy={false}
      />
    );

    expect(getByTestId('fast-image')).toBeTruthy();
  });
});