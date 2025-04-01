import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, TextInput, Button } from 'react-native-paper';

interface ImageGenerationDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onGenerate: (prompt: string) => void;
}

export const ImageGenerationDialog = ({
  visible,
  onDismiss,
  onGenerate,
}: ImageGenerationDialogProps) => {
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt.trim());
      setPrompt('');
      onDismiss();
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
        <TextInput
          label="图片描述"
          value={prompt}
          onChangeText={setPrompt}
          multiline
          style={styles.input}
        />
        <View style={styles.buttons}>
          <Button mode="outlined" onPress={onDismiss} style={styles.button}>
            取消
          </Button>
          <Button mode="contained" onPress={handleGenerate} style={styles.button}>
            生成
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  input: {
    marginBottom: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    marginLeft: 8,
  },
}); 