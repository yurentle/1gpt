export type RootStackParamList = {
  Chat: {
    chatId: string;
    showModelSelect?: boolean;
  };
  ChatList: undefined;
  Settings: undefined;
  ModelConfig: undefined;
};

export type RootDrawerParamList = {
  ChatStack:
    | {
        screen: 'Chat';
        params: RootStackParamList['Chat'];
      }
    | undefined;
  ChatListStack: undefined;
  SettingsStack: undefined;
};
