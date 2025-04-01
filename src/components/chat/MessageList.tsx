import React, { useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Message as MessageType } from '../../types/chat';
import { MessageBubble } from './MessageBubble';

interface Props {
  messages: MessageType[];
}

export const MessageList = ({ messages }: Props) => {
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      onContentSizeChange={() => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }}
      ref={scrollViewRef}
    >
      {messages.map(message => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
}); 