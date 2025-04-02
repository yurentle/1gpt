import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { List, Button, Portal, Modal, TextInput, HelperText, Divider } from 'react-native-paper';
import { useSettingsStore } from '../store/settingsStore';
import { PRESET_PROVIDERS } from '../constants/providers';
import { Provider } from '../types/provider';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Settings: undefined;
  ModelConfig: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'ModelConfig'>;

export const ModelConfigScreen = ({ navigation }: Props) => {
  const {
    providers,
    addProvider,
    removeProvider,
    setDefaultProvider,
    setDefaultModel,
    defaultProviderId,
  } = useSettingsStore();

  const currentProvider = providers.find(p => p.id === defaultProviderId);

  const [formData, setFormData] = useState({
    provider: null as Provider | null,
    apiKey: '',
    apiBase: '',
    temperature: '0.7',
    contextLength: '',
    selectedModelId: '',
  });

  const [showProviderSelect, setShowProviderSelect] = useState(false);
  const [showModelSelect, setShowModelSelect] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (currentProvider) {
      const provider = PRESET_PROVIDERS.find(p => p.id === currentProvider.id);
      if (provider) {
        setFormData({
          provider,
          apiKey: currentProvider.apiKey,
          apiBase: currentProvider.apiBase || '',
          temperature: currentProvider.supportedModels[0]?.temperature?.toString() || '0.7',
          contextLength: currentProvider.supportedModels[0]?.contextLength?.toString() || '',
          selectedModelId: currentProvider.supportedModels[0]?.id || '',
        });
      }
    }
  }, [currentProvider]);

  const handleProviderSelect = (provider: Provider) => {
    setFormData({
      ...formData,
      provider,
      selectedModelId: provider.supportedModels[0]?.id || '',
      contextLength: provider.supportedModels[0]?.contextLength?.toString() || '',
    });
    setShowProviderSelect(false);
  };

  const handleModelSelect = (modelId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedModelId: modelId,
    }));
    setShowModelSelect(false);
  };

  const handleSubmit = () => {
    if (!formData.provider || !formData.apiKey.trim() || !formData.selectedModelId) return;

    const temperature = parseFloat(formData.temperature);
    const contextLength = parseInt(formData.contextLength) || undefined;

    const configuredModels = formData.provider.supportedModels.map(model => ({
      ...model,
      temperature,
      contextLength: contextLength || model.contextLength,
    }));

    if (currentProvider) {
      removeProvider(currentProvider.id);
    }

    const newProvider = {
      ...formData.provider,
      apiKey: formData.apiKey.trim(),
      apiBase: formData.apiBase.trim() || undefined,
      supportedModels: configuredModels,
    };

    addProvider(newProvider);
    setDefaultProvider(newProvider.id);
    setDefaultModel(formData.selectedModelId);

    navigation.goBack();
  };

  const isValid =
    formData.provider &&
    formData.apiKey.trim() &&
    formData.selectedModelId &&
    parseFloat(formData.temperature) >= 0 &&
    parseFloat(formData.temperature) <= 2;

  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader>基本配置</List.Subheader>

        <List.Item
          title="模型提供方"
          description={formData.provider?.name || '请选择'}
          onPress={() => setShowProviderSelect(true)}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />

        <TextInput
          label="API 秘钥"
          value={formData.apiKey}
          onChangeText={text => setFormData({ ...formData, apiKey: text })}
          style={styles.input}
          secureTextEntry
        />

        <TextInput
          label="API 域名（可选）"
          value={formData.apiBase}
          onChangeText={text => setFormData({ ...formData, apiBase: text })}
          style={styles.input}
          placeholder={formData.provider?.defaultApiBase || '使用默认域名'}
        />

        <List.Item
          title="选择模型"
          description={
            formData.provider?.supportedModels.find(m => m.id === formData.selectedModelId)?.name ||
            '请选择'
          }
          onPress={() => setShowModelSelect(true)}
          right={props => <List.Icon {...props} icon="chevron-right" />}
        />
        <Divider />
      </List.Section>

      <List.Section>
        <List.Subheader>高级配置</List.Subheader>

        <TextInput
          label="温度 (0-2)"
          value={formData.temperature}
          onChangeText={text => setFormData({ ...formData, temperature: text })}
          keyboardType="numeric"
          style={styles.input}
        />
        <HelperText type="info">
          较低的值使输出更加集中和确定性，较高的值使输出更加多样化和创造性
        </HelperText>

        <TextInput
          label="上下文长度"
          value={formData.contextLength}
          onChangeText={text => setFormData({ ...formData, contextLength: text })}
          keyboardType="numeric"
          style={styles.input}
        />
        <HelperText type="info">影响模型可以记住的对话历史长度</HelperText>
      </List.Section>

      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={handleSubmit} disabled={!isValid} style={styles.button}>
          保存
        </Button>
      </View>

      {/* 模型提供方选择对话框 */}
      <Portal>
        <Modal
          visible={showProviderSelect}
          onDismiss={() => setShowProviderSelect(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            {PRESET_PROVIDERS.map(provider => (
              <List.Item
                key={provider.id}
                title={provider.name}
                description={`${provider.supportedModels.length} 个可用模型`}
                onPress={() => handleProviderSelect(provider)}
              />
            ))}
          </ScrollView>
        </Modal>
      </Portal>

      {/* 模型选择对话框 */}
      <Portal>
        <Modal
          visible={showModelSelect}
          onDismiss={() => setShowModelSelect(false)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <List.Subheader>选择模型</List.Subheader>
            {formData.provider?.supportedModels.map(model => (
              <List.Item
                key={model.id}
                title={model.name}
                description={`${model.capabilities.chat ? '聊天' : ''}${
                  model.capabilities.imageGeneration ? ' 图片生成' : ''
                }`}
                onPress={() => handleModelSelect(model.id)}
                right={props =>
                  formData.selectedModelId === model.id ? (
                    <List.Icon {...props} icon="check" />
                  ) : null
                }
              />
            ))}
          </ScrollView>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  input: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  button: {
    marginTop: 16,
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    padding: 16,
    maxHeight: '80%',
  },
  modalButton: {
    marginTop: 16,
  },
});
