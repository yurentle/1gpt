import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, FAB, Text, Surface, useTheme, IconButton } from 'react-native-paper';
import { useChatStore } from '../store/chatStore';
import { useSettingsStore } from '../store/settingsStore';
import { CompositeNavigationProp } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, RootDrawerParamList } from '../types/navigation';
import { formatDate } from '../utils/date';

type ChatListScreenNavigationProp = CompositeNavigationProp<
  DrawerNavigationProp<RootDrawerParamList, 'ChatListStack'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = {
  navigation: ChatListScreenNavigationProp;
};

export const ChatListScreen = ({ navigation }: Props) => {
  const { chats, createNewChat } = useChatStore();
  const { defaultProviderId, defaultModelId } = useSettingsStore();
  const theme = useTheme();

  const handleNewChat = async () => {
    if (defaultProviderId && defaultModelId) {
      const chatId = await createNewChat(defaultProviderId, defaultModelId);
      navigation.navigate('ChatStack', {
        screen: 'Chat',
        params: { chatId },
      });
    }
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <IconButton icon="chat-outline" />
      <Text style={styles.emptyText}>还没有聊天记录</Text>
      <Text style={styles.emptySubText}>点击右下角按钮开始新的对话</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        renderItem={({ item }) => (
          <Surface style={styles.chatItem}>
            <List.Item
              title={item.title || '新对话'}
              titleStyle={styles.chatTitle}
              description={formatDate(item.updatedAt)}
              descriptionStyle={styles.chatDate}
              onPress={() =>
                navigation.navigate('ChatStack', {
                  screen: 'Chat',
                  params: { chatId: item.id },
                })
              }
              style={styles.listItem}
            />
          </Surface>
        )}
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={handleNewChat}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    elevation: 4,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  chatItem: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: 'white',
  },
  listItem: {
    padding: 4,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chatDate: {
    fontSize: 12,
    marginTop: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
