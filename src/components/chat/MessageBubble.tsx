import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface, useTheme } from 'react-native-paper';
import Markdown from 'react-native-markdown-display';
import { Message } from '../../types/chat';
import { getWebTextStyles } from '../../utils/platform';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const { colors } = useTheme();
  const webTextStyles = getWebTextStyles();

  const markdownStyles = {
    body: {
      color: '#000000',
      fontSize: 14,
      flexWrap: 'wrap',
      ...webTextStyles,
    },
    paragraph: {
      marginTop: 4,
      marginBottom: 4,
      flexWrap: 'wrap',
      flexShrink: 1,
      ...webTextStyles,
    },
    text: {
      color: '#000000',
      flexWrap: 'wrap',
      flexShrink: 1,
      ...webTextStyles,
    },
    code_block: {
      backgroundColor: '#f0f0f0',
      padding: 8,
      borderRadius: 4,
      fontFamily: 'monospace',
      marginVertical: 8,
      flexWrap: 'wrap',
      flexShrink: 1,
      ...webTextStyles,
    },
    code_inline: {
      backgroundColor: '#f0f0f0',
      padding: 2,
      borderRadius: 2,
      fontFamily: 'monospace',
      flexWrap: 'wrap',
      flexShrink: 1,
      ...webTextStyles,
    },
    fence: {
      marginVertical: 8,
      padding: 8,
      backgroundColor: '#f0f0f0',
      borderRadius: 4,
      flexWrap: 'wrap',
      flexShrink: 1,
      ...webTextStyles,
    },
    link: {
      color: colors.primary,
      textDecorationLine: 'underline',
      flexWrap: 'wrap',
      flexShrink: 1,
      ...webTextStyles,
    },
    list_item: {
      marginTop: 4,
      marginBottom: 4,
      flexDirection: 'row',
      flexWrap: 'wrap',
      flexShrink: 1,
      ...webTextStyles,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: '#cccccc',
      paddingLeft: 8,
      marginLeft: 0,
      marginTop: 4,
      marginBottom: 4,
      opacity: 0.8,
    },
    table: {
      borderWidth: 1,
      borderColor: '#cccccc',
      borderRadius: 4,
      marginVertical: 8,
    },
    tr: {
      borderBottomWidth: 1,
      borderColor: '#cccccc',
      flexDirection: 'row',
    },
    td: {
      padding: 8,
      borderRightWidth: 1,
      borderColor: '#cccccc',
      flex: 1,
    },
    th: {
      padding: 8,
      borderRightWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#cccccc',
      backgroundColor: '#f5f5f5',
      flex: 1,
      fontWeight: 'bold',
    },
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <Surface style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {isUser ? (
          <Text style={[styles.userText]} numberOfLines={0}>
            {message.content}
          </Text>
        ) : (
          <Markdown style={markdownStyles}>{message.content}</Markdown>
        )}
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    maxWidth: '85%',
    flexShrink: 1,
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
    flexShrink: 1,
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
    flexWrap: 'wrap',
    flexShrink: 1,
    ...getWebTextStyles(),
  },
});
