import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Surface } from 'react-native-paper';

interface ImageMessageProps {
  url: string;
  isUser: boolean;
}

const { width } = Dimensions.get('window');
const IMAGE_WIDTH = width * 0.6;

export const ImageMessage = ({ url, isUser }: ImageMessageProps) => {
  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <Surface style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Image source={{ uri: url }} style={styles.image} resizeMode="contain" />
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  assistantBubble: {
    backgroundColor: '#E9E9EB',
  },
  image: {
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH,
  },
});
