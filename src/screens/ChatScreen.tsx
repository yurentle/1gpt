import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Portal, Modal, List, Divider, Text } from 'react-native-paper';
import { useChatStore } from '../store/chatStore';
import { useSettingsStore } from '../store/settingsStore';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { ImageGenerationDialog } from '../components/chat/ImageGenerationDialog';
import { ErrorSnackbar } from '../components/common/ErrorSnackbar';
import { APIClient } from '../api/client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Chat: { chatId?: string; showModelSelect?: boolean };
  Settings: undefined;
  ModelConfig: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export const ChatScreen = ({ route, navigation }: Props) => {
  const { chatId } = route.params || {};
  const { chats, addMessage, createChat, updateMessage, removeMessage } = useChatStore();
  const { providers, defaultProviderId, defaultModelId, setDefaultModel } = useSettingsStore();
  const chat = chats.find(c => c.id === chatId);
  const [isImageDialogVisible, setIsImageDialogVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModelSelectVisible, setIsModelSelectVisible] = useState(false);

  const currentProvider = providers.find(p => p.id === defaultProviderId);

  useEffect(() => {
    console.log('chat', {chat, defaultProviderId, defaultModelId});
    if (!chat && defaultProviderId && defaultModelId) {
      const newChatId = createChat(defaultProviderId, defaultModelId);
      navigation.setParams({ chatId: newChatId });
    }
  }, [chat, defaultProviderId, defaultModelId, createChat, navigation]);

  useEffect(() => {
    if (route.params?.showModelSelect) {
      setIsModelSelectVisible(true);
      navigation.setParams({ showModelSelect: undefined });
    }
  }, [route.params?.showModelSelect, navigation]);

  const handleSend = useCallback(async (content: string) => {
    if (!chat) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content,
      timestamp: Date.now(),
    };
    addMessage(chat.id, userMessage);

    setIsLoading(true);
    const assistantMessageId = (Date.now() + 1).toString();
    
    try {
      // 创建初始的助手消息
      addMessage(chat.id, {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      });

      // 获取流式响应
      const response = await APIClient.makeStreamCompletion(chat.providerId, {
        messages: [...chat.messages, userMessage].map(({ role, content }) => ({
          role,
          content,
        })),
        model: chat.modelId,
        onUpdate: (content) => {
          // 更新助手消息的内容
          updateMessage(chat.id, assistantMessageId, content);
        },
      });

    } catch (error) {
      setError(error instanceof Error ? error.message : '发送消息失败');
      // 发生错误时删除助手消息
      removeMessage(chat.id, assistantMessageId);
    } finally {
      setIsLoading(false);
    }
  }, [chat, addMessage, updateMessage, removeMessage]);

  const handleImageGeneration = useCallback(async (prompt: string) => {
    if (!chat) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: `生成图片: ${prompt}`,
      timestamp: Date.now(),
    };
    addMessage(chat.id, userMessage);

    setIsLoading(true);
    try {
      const response = await APIClient.makeImageGeneration(chat.providerId, {
        prompt,
        model: chat.modelId,
        n: 1,
      });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `image://${response.data[0].url}`,
        timestamp: Date.now(),
      };
      addMessage(chat.id, assistantMessage);
    } catch (error) {
      setError(error instanceof Error ? error.message : '图片生成失败');
    } finally {
      setIsLoading(false);
    }
  }, [chat, addMessage]);

  const handleModelSelect = (modelId: string) => {
    setDefaultModel(modelId);
    setIsModelSelectVisible(false);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={styles.messageContainer}>
        <MessageList messages={chat?.messages || []} />
      </View>
      <View style={styles.inputContainer}>
        <ChatInput
          onSend={handleSend}
          onImageRequest={() => setIsImageDialogVisible(true)}
          disabled={isLoading || !chat}
        />
      </View>
      <ImageGenerationDialog
        visible={isImageDialogVisible}
        onDismiss={() => setIsImageDialogVisible(false)}
        onGenerate={handleImageGeneration}
      />
      <ErrorSnackbar
        visible={!!error}
        message={error || ''}
        onDismiss={() => setError(null)}
      />

      <Portal>
        <Modal
          visible={isModelSelectVisible}
          onDismiss={() => setIsModelSelectVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <View>
            <Text style={styles.modalTitle}>选择模型</Text>
            <Divider />
            {currentProvider?.supportedModels.map(model => (
              <List.Item
                key={model.id}
                title={model.name}
                description={
                  model.capabilities.chat && model.capabilities.imageGeneration
                    ? '支持聊天和图片生成'
                    : model.capabilities.chat
                    ? '支持聊天'
                    : '支持图片生成'
                }
                onPress={() => handleModelSelect(model.id)}
                right={props => 
                  defaultModelId === model.id ? (
                    <List.Icon {...props} icon="check" />
                  ) : null
                }
              />
            ))}
          </View>
        </Modal>
      </Portal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messageContainer: {
    flex: 1,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 16,
    textAlign: 'center',
  },
}); 