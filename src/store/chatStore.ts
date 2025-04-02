import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat, Message } from '../types/chat';

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  createChat: (providerId: string, modelId: string) => string;
  addMessage: (chatId: string, message: Message) => void;
  setCurrentChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  updateMessage: (chatId: string, messageId: string, content: string) => void;
  removeMessage: (chatId: string, messageId: string) => void;
  getOrCreateChat: (providerId: string, modelId: string) => string;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,

      createChat: (providerId, modelId) => {
        const chatId = Date.now().toString();
        const newChat: Chat = {
          id: chatId,
          title: '新对话',
          messages: [],
          providerId,
          modelId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set(state => ({
          chats: [...state.chats, newChat],
          currentChatId: chatId,
        }));

        return chatId;
      },

      getOrCreateChat: (providerId, modelId) => {
        const { chats, currentChatId, createChat } = get();

        // 如果有当前聊天，直接返回
        if (currentChatId && chats.find(c => c.id === currentChatId)) {
          return currentChatId;
        }

        // 查找最近的聊天
        const recentChat = chats
          .filter(c => c.providerId === providerId && c.modelId === modelId)
          .sort((a, b) => b.updatedAt - a.updatedAt)[0];

        if (recentChat) {
          set({ currentChatId: recentChat.id });
          return recentChat.id;
        }

        // 如果没有找到合适的聊天，创建新的
        return createChat(providerId, modelId);
      },

      addMessage: (chatId, message) =>
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, message],
                  updatedAt: Date.now(),
                }
              : chat
          ),
        })),

      setCurrentChat: chatId => set({ currentChatId: chatId }),

      deleteChat: chatId =>
        set(state => ({
          chats: state.chats.filter(chat => chat.id !== chatId),
          currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
        })),

      updateMessage: (chatId, messageId, content) =>
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map(msg =>
                    msg.id === messageId ? { ...msg, content } : msg
                  ),
                }
              : chat
          ),
        })),

      removeMessage: (chatId, messageId) =>
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.filter(msg => msg.id !== messageId),
                }
              : chat
          ),
        })),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
