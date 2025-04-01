import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Portal, Modal, List } from 'react-native-paper';
import { ProviderConfig, Model } from '../../types/provider';
import { ModelForm } from './ModelForm';
import { ModelList } from './ModelList';

interface ProviderFormProps {
  initialValues?: Partial<ProviderConfig>;
  onSubmit: (values: ProviderConfig) => void;
  onCancel: () => void;
}

export const ProviderForm = ({ initialValues, onSubmit, onCancel }: ProviderFormProps) => {
  const [values, setValues] = useState({
    id: initialValues?.id || '',
    name: initialValues?.name || '',
    apiKey: initialValues?.apiKey || '',
    apiBase: initialValues?.apiBase || '',
    supportedModels: initialValues?.supportedModels || [],
    defaultModel: initialValues?.defaultModel || '',
  });

  const [isModelFormVisible, setIsModelFormVisible] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  const handleAddModel = () => {
    setSelectedModel(null);
    setIsModelFormVisible(true);
  };

  const handleEditModel = (model: Model) => {
    setSelectedModel(model);
    setIsModelFormVisible(true);
  };

  const handleDeleteModel = (modelId: string) => {
    setValues({
      ...values,
      supportedModels: values.supportedModels.filter((m) => m.id !== modelId),
      defaultModel: values.defaultModel === modelId ? '' : values.defaultModel,
    });
  };

  const handleModelSubmit = (model: Model) => {
    const updatedModels = selectedModel
      ? values.supportedModels.map((m) => (m.id === model.id ? model : m))
      : [...values.supportedModels, model];

    setValues({
      ...values,
      supportedModels: updatedModels,
    });
    setIsModelFormVisible(false);
  };

  return (
    <ScrollView style={styles.container}>
      <TextInput
        label="供应商ID"
        value={values.id}
        onChangeText={(text) => setValues({ ...values, id: text })}
        style={styles.input}
        disabled={!!initialValues?.id}
      />
      <TextInput
        label="供应商名称"
        value={values.name}
        onChangeText={(text) => setValues({ ...values, name: text })}
        style={styles.input}
      />
      <TextInput
        label="API Key"
        value={values.apiKey}
        onChangeText={(text) => setValues({ ...values, apiKey: text })}
        style={styles.input}
        secureTextEntry
      />
      <TextInput
        label="API Base URL (可选)"
        value={values.apiBase}
        onChangeText={(text) => setValues({ ...values, apiBase: text })}
        style={styles.input}
      />

      <List.Section>
        <List.Subheader>支持的模型</List.Subheader>
        <ModelList
          models={values.supportedModels}
          onEdit={handleEditModel}
          onDelete={handleDeleteModel}
        />
        <Button
          mode="outlined"
          onPress={handleAddModel}
          style={styles.addButton}
        >
          添加模型
        </Button>
      </List.Section>

      <View style={styles.buttons}>
        <Button mode="outlined" onPress={onCancel} style={styles.button}>
          取消
        </Button>
        <Button
          mode="contained"
          onPress={() => onSubmit(values as ProviderConfig)}
          style={styles.button}
        >
          保存
        </Button>
      </View>

      <Portal>
        <Modal
          visible={isModelFormVisible}
          onDismiss={() => setIsModelFormVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <ModelForm
            initialValues={selectedModel || undefined}
            providerId={values.id}
            onSubmit={handleModelSubmit}
            onCancel={() => setIsModelFormVisible(false)}
          />
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
  },
  addButton: {
    marginTop: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    marginBottom: 16,
  },
  button: {
    marginLeft: 8,
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
  },
}); 