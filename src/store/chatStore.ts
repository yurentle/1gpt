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
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      chats: [],
      currentChatId: null,

      createChat: (providerId: string, modelId: string) => {
        const chatId = Date.now().toString();
        set((state) => ({
          chats: [
            ...state.chats,
            {
              id: chatId,
              title: '新对话',
              messages: [],
              providerId,
              modelId,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        }));
        return chatId;
      },

      addMessage: (chatId, message) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [...chat.messages, message],
                  updatedAt: Date.now(),
                }
              : chat
          ),
        })),

      setCurrentChat: (chatId) =>
        set({ currentChatId: chatId }),

      deleteChat: (chatId) =>
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== chatId),
          currentChatId:
            state.currentChatId === chatId ? null : state.currentChatId,
        })),

      updateMessage: (chatId, messageId, content) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg.id === messageId
                      ? { ...msg, content }
                      : msg
                  ),
                }
              : chat
          ),
        })),

      removeMessage: (chatId, messageId) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.filter((msg) => msg.id !== messageId),
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