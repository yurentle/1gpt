import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import { Message } from '../../types/chat';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const { colors } = useTheme();

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <Surface style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {isUser ? (
          <Text style={styles.userText}>{message.content}</Text>
        ) : (
          <Markdown
            style={{
              body: {
                color: '#000000',
                fontSize: 14,
              },
              code_block: {
                backgroundColor: '#f0f0f0',
                padding: 8,
                borderRadius: 4,
                fontFamily: 'monospace',
              },
              code_inline: {
                backgroundColor: '#f0f0f0',
                padding: 2,
                borderRadius: 2,
                fontFamily: 'monospace',
              },
              link: {
                color: colors.primary,
              },
              list_item: {
                marginTop: 4,
                marginBottom: 4,
              },
              paragraph: {
                marginTop: 4,
                marginBottom: 4,
              },
              blockquote: {
                borderLeftWidth: 4,
                borderLeftColor: '#cccccc',
                paddingLeft: 8,
                marginLeft: 0,
                marginTop: 4,
                marginBottom: 4,
              },
            }}
          >
            {message.content}
          </Markdown>
        )}
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
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#007AFF',
  },
  assistantBubble: {
    backgroundColor: '#E9E9EB',
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
});
