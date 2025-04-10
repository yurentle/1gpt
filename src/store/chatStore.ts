import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat, Message } from '../types/chat';
import { generateUUID } from '../utils/uuid';

interface ChatStore {
  chats: Chat[];
  currentChatId: string | null;
  createNewChat: (providerId: string, modelId: string) => Promise<string>;
  setCurrentChatId: (chatId: string | null) => void;
  addMessage: (chatId: string, message: Message) => Promise<Message[]>;
  updateMessage: (chatId: string, messageId: string, content: string) => void;
  removeMessage: (chatId: string, messageId: string) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  deleteChat: (chatId: string) => void;
  shouldUpdateTitle: (chatId: string) => boolean;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,

      createNewChat: async (providerId: string, modelId: string) => {
        const chatId = generateUUID();
        const newChat: Chat = {
          id: chatId,
          title: '新对话',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set(state => ({
          chats: [newChat, ...state.chats],
          currentChatId: chatId,
        }));

        return chatId;
      },

      setCurrentChatId: (chatId: string | null) => {
        set({ currentChatId: chatId });
      },

      addMessage: async (chatId: string, message: Message) => {
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
        }));

        const chat = get().chats.find(c => c.id === chatId);
        return chat?.messages || [];
      },

      updateMessage: (chatId: string, messageId: string, content: string) => {
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
        }));
      },

      removeMessage: (chatId: string, messageId: string) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.filter(msg => msg.id !== messageId),
                }
              : chat
          ),
        }));
      },

      updateChatTitle: (chatId: string, title: string) => {
        set(state => ({
          chats: state.chats.map(chat => (chat.id === chatId ? { ...chat, title } : chat)),
        }));
      },

      deleteChat: (chatId: string) => {
        set(state => ({
          chats: state.chats.filter(chat => chat.id !== chatId),
          currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
        }));
      },

      shouldUpdateTitle: (chatId: string) => {
        const chat = get().chats.find(c => c.id === chatId);
        return chat?.messages.filter(msg => msg.role === 'user').length === 1;
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      onRehydrateStorage: () => {
        return state => {
          if (state?.chats && state.chats.length > 50) {
            // state.clearChats();
          }
        };
      },
    }
  )
);
