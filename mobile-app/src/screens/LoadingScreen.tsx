import React from 'react';
import { Container, LoadingSpinner } from '@/components';

export const LoadingScreen: React.FC = () => {
  return (
    <Container safe={false} padding="none">
      <LoadingSpinner text="Loading..." />
    </Container>
  );
};