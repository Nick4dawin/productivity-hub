import React from 'react';
import { View, ViewStyle } from 'react-native';

export interface ColumnProps {
  children: React.ReactNode;
  justify?: ViewStyle['justifyContent'];
  align?: ViewStyle['alignItems'];
  gap?: number;
  style?: ViewStyle;
  testID?: string;
}

export const Column: React.FC<ColumnProps> = ({
  children,
  justify = 'flex-start',
  align = 'stretch',
  gap = 0,
  style,
  testID,
}) => {
  const columnStyle: ViewStyle = {
    flexDirection: 'column',
    justifyContent: justify,
    alignItems: align,
    gap,
  };

  return (
    <View style={[columnStyle, style]} testID={testID}>
      {children}
    </View>
  );
};