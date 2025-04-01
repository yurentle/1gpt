import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Chat: { chatId?: string; showModelSelect?: boolean };
  Settings: undefined;
  ModelConfig: undefined;
};

export type RootDrawerParamList = {
  ChatStack: undefined;
  SettingsStack: undefined;
};

export type StackScreenProps = NativeStackScreenProps<RootStackParamList>;
