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
import { Message, Chat } from '@/types/chat';
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
    createNewChat,
    shouldUpdateTitle,
    updateChatTitle,
  } = useChatStore();
  const { providers, defaultProviderId, defaultModelId, setDefaultModel } = useSettingsStore();
  const chat = chatId ? chats.find(c => c.id === chatId) : null;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModelSelectVisible, setIsModelSelectVisible] = useState(false);

  const currentProvider = providers.find(p => p.id === defaultProviderId);

  // 创建一个虚拟的新对话用于显示
  const virtualNewChat: Chat = {
    id: 'virtual',
    title: '新对话',
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        content:
          '你好！我是你的 AI 助手。我可以帮你：\n• 回答问题\n• 编写代码\n• 分析数据\n\n让我们开始对话吧！',
        timestamp: Date.now(),
        providerId: defaultProviderId || '',
        modelId: defaultModelId || '',
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  useEffect(() => {
    if (route.params?.showModelSelect) {
      setIsModelSelectVisible(true);
      navigation.setParams({ showModelSelect: undefined });
    }
  }, [route.params?.showModelSelect, navigation]);

  const generateTitle = useCallback(
    async (userMessage: string, targetChatId: string) => {
      if (!defaultProviderId || !defaultModelId) return;

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
          updateChatTitle(targetChatId, title.trim());
        }
      } catch (error) {
        console.error('生成标题失败:', error);
        // 如果生成标题失败，使用用户消息的前15个字作为标题
        const fallbackTitle = userMessage.slice(0, 15) + (userMessage.length > 15 ? '...' : '');
        updateChatTitle(targetChatId, fallbackTitle);
      }
    },
    [defaultProviderId, defaultModelId, updateChatTitle]
  );

  const handleSend = useCallback(
    async (content: string) => {
      // 获取当前选择的模型信息
      const { defaultProviderId, defaultModelId } = useSettingsStore.getState();
      if (!defaultProviderId || !defaultModelId) return;

      let targetChatId = chatId;

      // 如果是虚拟对话，创建新的实际对话
      if (!targetChatId) {
        targetChatId = await createNewChat(defaultProviderId, defaultModelId);
        navigation.setParams({ chatId: targetChatId });
      }

      const userMessage = {
        id: Date.now().toString(),
        role: 'user' as const,
        content,
        timestamp: Date.now(),
        providerId: defaultProviderId,
        modelId: defaultModelId,
      };
      const messages = await addMessage(targetChatId, userMessage);

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
        addMessage(targetChatId, assistantMessage as Message);

        // 获取流式响应
        await APIClient.makeStreamCompletion(defaultProviderId, {
          messages: messages.map(({ role, content }) => ({
            role,
            content,
          })),
          model: defaultModelId,
          onUpdate: content => {
            updateMessage(targetChatId, assistantMessageId, content);
          },
        });

        // 检查是否需要更新标题（第一条用户消息）
        if (shouldUpdateTitle(targetChatId)) {
          await generateTitle(content, targetChatId);
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : '发送消息失败');
        removeMessage(targetChatId, assistantMessageId);
      } finally {
        setIsLoading(false);
      }
    },
    [
      chatId,
      createNewChat,
      navigation,
      addMessage,
      updateMessage,
      removeMessage,
      shouldUpdateTitle,
      generateTitle,
    ]
  );

  const handleModelSelect = (modelId: string) => {
    setDefaultModel(modelId);
    setIsModelSelectVisible(false);
  };

  // 使用实际的对话或虚拟对话
  const currentChat = chat || virtualNewChat;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={isIOS ? 'padding' : 'height'}
      keyboardVerticalOffset={isIOS ? 88 : 0}
    >
      <View style={styles.messageContainer}>
        <MessageList messages={currentChat.messages} />
      </View>
      <View style={styles.inputContainer}>
        <ChatInput onSend={handleSend} disabled={isLoading} />
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
