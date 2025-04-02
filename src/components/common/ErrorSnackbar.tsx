import React from 'react';
import { Snackbar } from 'react-native-paper';

interface ErrorSnackbarProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}

export const ErrorSnackbar = ({ visible, message, onDismiss }: ErrorSnackbarProps) => {
  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      action={{
        label: '关闭',
        onPress: onDismiss,
      }}
      duration={3000}
    >
      {message}
    </Snackbar>
  );
};
