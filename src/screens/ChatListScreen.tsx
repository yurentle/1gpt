import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, GestureResponderEvent } from 'react-native';
import {
  List,
  FAB,
  Text,
  Surface,
  useTheme,
  IconButton,
  Portal,
  Dialog,
  TextInput,
  Button,
  Card,
} from 'react-native-paper';
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
  const { chats, createNewChat, setCurrentChatId, deleteChat, updateChatTitle, currentChatId } =
    useChatStore();
  const { defaultProviderId, defaultModelId } = useSettingsStore();
  const theme = useTheme();

  // 状态管理
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleNewChat = async () => {
    if (defaultProviderId && defaultModelId) {
      const chatId = await createNewChat(defaultProviderId, defaultModelId);
      navigation.navigate('ChatStack', {
        screen: 'Chat',
        params: { chatId },
      });
    }
  };

  const handleChatPress = (chatId: string) => {
    setCurrentChatId(chatId);
    navigation.navigate('ChatStack', {
      screen: 'Chat',
      params: { chatId },
    });
  };

  const handleChatLongPress = (chatId: string, event: GestureResponderEvent) => {
    const { pageY, pageX } = event.nativeEvent;
    setMenuPosition({ top: pageY, left: pageX });
    setSelectedChatId(chatId);
    setMenuVisible(true);
  };

  const handleEdit = () => {
    const chat = chats.find(c => c.id === selectedChatId);
    if (chat) {
      setEditTitle(chat.title);
      setEditDialogVisible(true);
    }
    setMenuVisible(false);
  };

  const handleDelete = () => {
    setDeleteDialogVisible(true);
    setMenuVisible(false);
  };

  const handleEditConfirm = () => {
    if (selectedChatId && editTitle.trim()) {
      updateChatTitle(selectedChatId, editTitle.trim());
      setEditDialogVisible(false);
      setSelectedChatId(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedChatId) {
      deleteChat(selectedChatId);
      setDeleteDialogVisible(false);
      setSelectedChatId(null);
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
          <Surface style={[styles.chatItem, item.id === currentChatId && styles.activeChatItem]}>
            <Pressable
              onPress={() => handleChatPress(item.id)}
              onLongPress={event => handleChatLongPress(item.id, event)}
              android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
            >
              <List.Item
                title={item.title || '新对话'}
                titleStyle={[styles.chatTitle, item.id === currentChatId && styles.activeChatTitle]}
                description={formatDate(item.updatedAt)}
                descriptionStyle={[
                  styles.chatDate,
                  item.id === currentChatId && styles.activeChatDate,
                ]}
                style={styles.listItem}
              />
            </Pressable>
          </Surface>
        )}
      />
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="white"
        onPress={handleNewChat}
      />

      {/* 长按菜单 */}
      <Portal>
        {menuVisible && (
          <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
            <Card
              style={[
                styles.menuCard,
                {
                  top: menuPosition.top,
                  left: menuPosition.left,
                },
              ]}
            >
              <Pressable onPress={handleEdit} style={styles.menuItem}>
                <IconButton icon="pencil" size={20} />
                <Text>编辑</Text>
              </Pressable>
              <Pressable onPress={handleDelete} style={styles.menuItem}>
                <IconButton icon="delete" size={20} />
                <Text>删除</Text>
              </Pressable>
            </Card>
          </Pressable>
        )}
      </Portal>

      {/* 编辑对话框 */}
      <Portal>
        <Dialog visible={editDialogVisible} onDismiss={() => setEditDialogVisible(false)}>
          <Dialog.Title>编辑标题</Dialog.Title>
          <Dialog.Content>
            <TextInput value={editTitle} onChangeText={setEditTitle} mode="outlined" autoFocus />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditDialogVisible(false)}>取消</Button>
            <Button onPress={handleEditConfirm}>确定</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* 删除确认对话框 */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>确认删除</Dialog.Title>
          <Dialog.Content>
            <Text>确定要删除这个对话吗？此操作不可撤销。</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>取消</Button>
            <Button onPress={handleDeleteConfirm} textColor={theme.colors.error}>
              删除
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    overflow: 'hidden',
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
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menuCard: {
    position: 'absolute',
    minWidth: 150,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  activeChatItem: {
    borderWidth: 2,
    borderColor: 'rgba(103, 80, 164, 0.1)',
    backgroundColor: 'rgba(103, 80, 164, 0.05)',
  },
  activeChatTitle: {
    color: '#6750A4',
    fontWeight: '700',
  },
  activeChatDate: {
    color: '#6750A4',
  },
});
