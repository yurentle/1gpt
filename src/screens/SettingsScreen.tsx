import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List } from 'react-native-paper';
import { useSettingsStore } from '../store/settingsStore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen = ({ navigation }: Props) => {
  const { providers, defaultProviderId, defaultModelId } = useSettingsStore();

  const currentProvider = providers.find(p => p.id === defaultProviderId);
  const currentModel = currentProvider?.supportedModels.find(m => m.id === defaultModelId);

  return (
    <View style={styles.container}>
      <ScrollView>
        <List.Section>
          <List.Item
            title="当前模型"
            description={
              currentModel ? `${currentProvider?.name} - ${currentModel.name}` : '未配置模型'
            }
            left={props => <List.Icon {...props} icon="robot" />}
            onPress={() => navigation.navigate('ModelConfig')}
          />
        </List.Section>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
