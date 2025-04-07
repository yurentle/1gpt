import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Chat: { chatId?: string; showModelSelect?: boolean };
  Settings: undefined;
  ModelConfig: undefined;
  ChatList: undefined;
};

export type RootDrawerParamList = {
  ChatStack: {
    screen: 'Chat';
    params: RootStackParamList['Chat'];
  };
  ChatListStack: undefined;
  SettingsStack: undefined;
};
