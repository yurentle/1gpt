import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        value={message}
        onChangeText={setMessage}
        placeholder="输入消息..."
        style={styles.input}
        multiline
        disabled={disabled}
        right={<TextInput.Icon icon="send" onPress={handleSend} disabled={disabled} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
  },
  imageButton: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    maxHeight: 100,
  },
});
