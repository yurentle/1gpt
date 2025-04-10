import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerNavigationProp } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { enableScreens } from 'react-native-screens';
import { ChatScreen } from './src/screens/ChatScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { IconButton, Button } from 'react-native-paper';
import { ModelConfigScreen } from './src/screens/ModelConfigScreen';
import { useSettingsStore } from './src/store/settingsStore';
import { RootStackParamList, RootDrawerParamList } from './src/types/navigation';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useChatStore } from './src/store/chatStore';
import { View } from 'react-native';
import { ChatListScreen } from './src/screens/ChatListScreen';

// 禁用 react-native-screens 以支持热更新
enableScreens(false);

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<RootDrawerParamList>();

type ChatStackNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<RootDrawerParamList, 'ChatStack'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type SettingsStackNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<RootDrawerParamList, 'SettingsStack'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface ChatStackProps {
  navigation: ChatStackNavigationProp;
}

interface SettingsStackProps {
  navigation: SettingsStackNavigationProp;
}

function ChatStack({ navigation }: ChatStackProps) {
  const { providers, defaultProviderId, defaultModelId } = useSettingsStore();
  const { setCurrentChatId } = useChatStore();
  const currentProvider = providers.find(p => p.id === defaultProviderId);
  const currentModel = currentProvider?.supportedModels.find(m => m.id === defaultModelId);

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          headerTitle: () => (
            <Button
              mode="text"
              onPress={() => {
                navigation.navigate('ChatStack', {
                  screen: 'Chat',
                  params: { chatId: route.params?.chatId || null, showModelSelect: true },
                } as const);
              }}
              icon="chevron-down"
              contentStyle={{ flexDirection: 'row-reverse' }}
            >
              {currentModel?.name || '选择模型'}
            </Button>
          ),
          headerLeft: () => <IconButton icon="menu" onPress={() => navigation.openDrawer()} />,
          headerRight: () => (
            <View style={{ flexDirection: 'row' }}>
              <IconButton icon="history" onPress={() => navigation.navigate('ChatListStack')} />
              <IconButton
                icon="plus-circle-outline"
                onPress={() => {
                  setCurrentChatId(null);
                  navigation.navigate('ChatStack', {
                    screen: 'Chat',
                    params: { chatId: null },
                  } as const);
                }}
              />
            </View>
          ),
          headerTitleAlign: 'center',
        })}
      />
      <Stack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: '历史对话记录' }}
      />
    </Stack.Navigator>
  );
}

function SettingsStack({ navigation }: SettingsStackProps) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: '设置',
          headerLeft: () => <IconButton icon="menu" onPress={() => navigation.openDrawer()} />,
        }}
      />
      <Stack.Screen
        name="ModelConfig"
        component={ModelConfigScreen}
        options={{
          title: '配置模型',
        }}
      />
    </Stack.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="ChatStack">
      <Drawer.Screen
        name="ChatStack"
        component={ChatStack}
        options={{
          title: '对话',
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="ChatListStack"
        component={ChatListScreen}
        options={{
          title: '历史对话记录',
        }}
      />
      <Drawer.Screen
        name="SettingsStack"
        component={SettingsStack}
        options={{
          title: '设置',
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <DrawerNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
