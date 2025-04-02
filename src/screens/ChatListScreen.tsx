import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, FAB } from 'react-native-paper';
import { useChatStore } from '../store/chatStore';
import { useSettingsStore } from '../store/settingsStore';

export const ChatListScreen = ({ navigation }) => {
  const { chats, createChat } = useChatStore();
  const { defaultProviderId, defaultModelId } = useSettingsStore();

  const handleNewChat = () => {
    if (defaultProviderId && defaultModelId) {
      createChat(defaultProviderId, defaultModelId);
      navigation.navigate('ChatStack', {
        screen: 'Chat',
        params: { chatId: null },
      });
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            description={new Date(item.updatedAt).toLocaleString()}
            onPress={() =>
              navigation.navigate('ChatStack', {
                screen: 'Chat',
                params: { chatId: item.id },
              })
            }
          />
        )}
      />
      <FAB icon="plus" style={styles.fab} onPress={handleNewChat} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
