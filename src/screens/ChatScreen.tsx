import React, { useCallback, useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { Portal, Modal, List, Divider, Text } from 'react-native-paper';
import { useChatStore } from '../store/chatStore';
import { useSettingsStore } from '../store/settingsStore';
import { MessageList } from '../components/chat/MessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { ErrorSnackbar } from '../components/common/ErrorSnackbar';
import { APIClient } from '../api/client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Message } from '@/types/chat';
import { RootStackParamList } from '../types/navigation';
import { isIOS } from '../utils/platform';
type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export const ChatScreen = ({ route, navigation }: Props) => {
  const { chatId } = route.params || {};
  const {
    chats,
    addMessage,
    updateMessage,
    removeMessage,
    getOrCreateChat,
    shouldUpdateTitle,
    updateChatTitle,
  } = useChatStore();
  const { providers, defaultProviderId, defaultModelId, setDefaultModel } = useSettingsStore();
  const chat = chats.find(c => c.id === chatId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModelSelectVisible, setIsModelSelectVisible] = useState(false);

  const currentProvider = providers.find(p => p.id === defaultProviderId);

  useEffect(() => {
    if (!defaultProviderId || !defaultModelId) return;

    // 如果没有 chatId 或找不到对应的会话，创建新会话
    if (!chatId || !chats.find(c => c.id === chatId)) {
      const newChatId = getOrCreateChat(defaultProviderId, defaultModelId);
      if (newChatId !== chatId) {
        navigation.setParams({ chatId: newChatId });
      }
    }
  }, [chatId, chats, defaultProviderId, defaultModelId, getOrCreateChat, navigation]);

  useEffect(() => {
    if (route.params?.showModelSelect) {
      setIsModelSelectVisible(true);
      navigation.setParams({ showModelSelect: undefined });
    }
  }, [route.params?.showModelSelect, navigation]);

  const generateTitle = useCallback(
    async (userMessage: string) => {
      if (!chat || !defaultProviderId || !defaultModelId) return;

      try {
        let title = '';
        const prompt = `请用不超过15个字对以下用户问题进行总结，直接返回总结的内容，不要加任何额外的话：\n${userMessage}`;

        await APIClient.makeStreamCompletion(defaultProviderId, {
          messages: [
            {
              role: 'system',
              content: '你是一个帮助总结对话主题的助手，请简明扼要地总结用户的问题。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          model: defaultModelId,
          onUpdate: content => {
            title = content;
          },
        });

        // 等待流式响应完成后，使用最终的标题更新
        if (title) {
          updateChatTitle(chat.id, title.trim());
        }
      } catch (error) {
        console.error('生成标题失败:', error);
        // 如果生成标题失败，使用用户消息的前15个字作为标题
        const fallbackTitle = userMessage.slice(0, 15) + (userMessage.length > 15 ? '...' : '');
        updateChatTitle(chat.id, fallbackTitle);
      }
    },
    [chat, defaultProviderId, defaultModelId, updateChatTitle]
  );

  const handleSend = useCallback(
    async (content: string) => {
      if (!chat) return;

      // 获取当前选择的模型信息
      const { defaultProviderId, defaultModelId } = useSettingsStore.getState();
      if (!defaultProviderId || !defaultModelId) return;

      const userMessage = {
        id: Date.now().toString(),
        role: 'user' as const,
        content,
        timestamp: Date.now(),
        providerId: defaultProviderId,
        modelId: defaultModelId,
      };
      const messages = await addMessage(chat.id, userMessage);

      setIsLoading(true);
      const assistantMessageId = (Date.now() + 1).toString();

      try {
        // 创建初始的助手消息
        const assistantMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          providerId: defaultProviderId,
          modelId: defaultModelId,
        };
        addMessage(chat.id, assistantMessage as Message);

        // 获取流式响应
        await APIClient.makeStreamCompletion(defaultProviderId, {
          messages: messages.map(({ role, content }) => ({
            role,
            content,
          })),
          model: defaultModelId,
          onUpdate: content => {
            updateMessage(chat.id, assistantMessageId, content);
          },
        });

        // 检查是否需要更新标题（第一条用户消息）
        if (shouldUpdateTitle(chat.id)) {
          await generateTitle(content);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : '发送消息失败');
        removeMessage(chat.id, assistantMessageId);
      } finally {
        setIsLoading(false);
      }
    },
    [chat, addMessage, updateMessage, removeMessage, shouldUpdateTitle, generateTitle]
  );

  const handleModelSelect = (modelId: string) => {
    setDefaultModel(modelId);
    setIsModelSelectVisible(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={isIOS ? 'padding' : 'height'}
      keyboardVerticalOffset={isIOS ? 88 : 0}
    >
      <View style={styles.messageContainer}>
        <MessageList messages={chat?.messages || []} />
      </View>
      <View style={styles.inputContainer}>
        <ChatInput onSend={handleSend} disabled={isLoading || !chat} />
      </View>
      <ErrorSnackbar visible={!!error} message={error || ''} onDismiss={() => setError(null)} />

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
                onPress={() => handleModelSelect(model.id)}
                right={props =>
                  defaultModelId === model.id ? <List.Icon {...props} icon="check" /> : null
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
