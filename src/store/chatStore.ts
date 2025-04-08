import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat, Message } from '../types/chat';

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  getOrCreateChat: (providerId: string, modelId: string) => string;
  createNewChat: (providerId: string, modelId: string) => string;
  addMessage: (chatId: string, message: Message) => Message[];
  setCurrentChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  updateMessage: (chatId: string, messageId: string, content: string) => void;
  removeMessage: (chatId: string, messageId: string) => void;
  clearChats: () => void;
  setCurrentChatId: (chatId: string | null) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  shouldUpdateTitle: (chatId: string) => boolean;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,

      clearChats: () => set({ chats: [], currentChatId: null }),

      createNewChat: (providerId: string, modelId: string) => {
        const chatId = Date.now().toString();
        const newChat: Chat = {
          id: chatId,
          title: '新对话',
          messages: [
            {
              id: 'welcome',
              role: 'assistant',
              content:
                '你好！我是你的 AI 助手。我可以帮你：\n• 回答问题\n• 编写代码\n• 分析数据\n\n让我们开始对话吧！',
              timestamp: Date.now(),
              providerId,
              modelId,
            },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set(state => ({
          chats: [...state.chats, newChat],
          currentChatId: chatId,
        }));

        return chatId;
      },

      getOrCreateChat: (providerId: string, modelId: string) => {
        const { chats, currentChatId, createNewChat } = get();

        // 如果有当前会话，直接返回
        if (currentChatId) {
          const currentChat = chats.find(c => c.id === currentChatId);
          if (currentChat) {
            return currentChatId;
          }
        }

        // 如果没有当前会话，创建新的
        return createNewChat(providerId, modelId);
      },

      addMessage: (chatId, message) => {
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
        return get().chats.find(c => c.id === chatId)?.messages || [];
      },

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

      setCurrentChatId: (chatId: string | null) => {
        set({ currentChatId: chatId });
      },

      updateChatTitle: (chatId: string, title: string) => {
        set(state => ({
          chats: state.chats.map(chat =>
            chat.id === chatId
              ? {
                  ...chat,
                  title: title,
                }
              : chat
          ),
        }));
      },

      shouldUpdateTitle: (chatId: string) => {
        const chat = get().chats.find(c => c.id === chatId);
        if (!chat) return false;

        // 如果标题还是默认的"新对话"，并且用户消息数量为1，则需要更新标题
        const userMessages = chat.messages.filter(m => m.role === 'user');
        return chat.title === '新对话' && userMessages.length === 1;
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
