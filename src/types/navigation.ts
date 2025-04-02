import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';

export type RootStackParamList = {
  Chat: { chatId?: string; showModelSelect?: boolean };
  Settings: undefined;
  ModelConfig: undefined;
};

export type RootDrawerParamList = {
  ChatStack: {
    screen: 'Chat';
    params: RootStackParamList['Chat'];
  };
  SettingsStack: undefined;
};

export type StackScreenProps = NativeStackScreenProps<RootStackParamList>;

export type DrawerScreenProps = CompositeScreenProps<
  DrawerScreenProps<RootDrawerParamList>,
  NativeStackScreenProps<RootStackParamList>
>;
