import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProviderConfig } from '../types/provider';

interface SettingsState {
  providers: ProviderConfig[];
  defaultProviderId: string | null;
  defaultModelId: string | null;
  addProvider: (provider: ProviderConfig) => void;
  updateProvider: (providerId: string, updates: Partial<ProviderConfig>) => void;
  removeProvider: (providerId: string) => void;
  setDefaultProvider: (providerId: string) => void;
  setDefaultModel: (modelId: string) => void;
  selectModel: (modelId: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      providers: [],
      defaultProviderId: null,
      defaultModelId: null,

      addProvider: (provider) =>
        set((state) => {
          const providers = [...state.providers, provider];
          if (providers.length === 1) {
            return {
              providers,
              defaultProviderId: provider.id,
              defaultModelId: provider.supportedModels[0]?.id || null,
            };
          }
          return { providers };
        }),

      updateProvider: (providerId, updates) =>
        set((state) => ({
          providers: state.providers.map((p) =>
            p.id === providerId ? { ...p, ...updates } : p
          ),
        })),

      removeProvider: (providerId) =>
        set((state) => {
          const newState: Partial<SettingsState> = {
            providers: state.providers.filter((p) => p.id !== providerId),
          };

          if (state.defaultProviderId === providerId) {
            newState.defaultProviderId = null;
            newState.defaultModelId = null;
          }

          return newState as SettingsState;
        }),

      setDefaultProvider: (providerId) =>
        set((state) => {
          const provider = state.providers.find(p => p.id === providerId);
          return {
            defaultProviderId: providerId,
            defaultModelId: provider?.supportedModels[0]?.id || null,
          };
        }),

      setDefaultModel: (modelId) =>
        set({ defaultModelId: modelId }),

      selectModel: (modelId) =>
        set((state) => {
          const provider = state.providers.find(p =>
            p.supportedModels.some(m => m.id === modelId)
          );
          if (!provider) return state;

          return {
            defaultProviderId: provider.id,
            defaultModelId: modelId,
          };
        }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);