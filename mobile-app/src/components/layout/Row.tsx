import React from 'react';
import { View, ViewStyle } from 'react-native';

export interface RowProps {
  children: React.ReactNode;
  justify?: ViewStyle['justifyContent'];
  align?: ViewStyle['alignItems'];
  wrap?: boolean;
  gap?: number;
  style?: ViewStyle;
  testID?: string;
}

export const Row: React.FC<RowProps> = ({
  children,
  justify = 'flex-start',
  align = 'center',
  wrap = false,
  gap = 0,
  style,
  testID,
}) => {
  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: justify,
    alignItems: align,
    flexWrap: wrap ? 'wrap' : 'nowrap',
    gap,
  };

  return (
    <View style={[rowStyle, style]} testID={testID}>
      {children}
    </View>
  );
};