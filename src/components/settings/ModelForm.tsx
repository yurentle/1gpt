import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Switch, Button } from 'react-native-paper';
import { Model } from '../../types/provider';

interface ModelFormProps {
  initialValues?: Partial<Model>;
  providerId: string;
  onSubmit: (values: Model) => void;
  onCancel: () => void;
}

export const ModelForm = ({
  initialValues,
  providerId,
  onSubmit,
  onCancel,
}: ModelFormProps) => {
  const [values, setValues] = useState<Partial<Model>>({
    id: initialValues?.id || '',
    name: initialValues?.name || '',
    provider: providerId,
    capabilities: {
      chat: initialValues?.capabilities?.chat || true,
      imageGeneration: initialValues?.capabilities?.imageGeneration || false,
    },
    maxTokens: initialValues?.maxTokens,
    temperature: initialValues?.temperature,
    contextLength: initialValues?.contextLength,
  });

  const handleSubmit = () => {
    if (values.id && values.name) {
      onSubmit(values as Model);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="模型ID"
        value={values.id}
        onChangeText={(text) => setValues({ ...values, id: text })}
        style={styles.input}
        disabled={!!initialValues?.id}
      />
      <TextInput
        label="模型名称"
        value={values.name}
        onChangeText={(text) => setValues({ ...values, name: text })}
        style={styles.input}
      />
      <View style={styles.switchContainer}>
        <Switch
          value={values.capabilities?.chat}
          onValueChange={(value) =>
            setValues({
              ...values,
              capabilities: { ...values.capabilities, chat: value },
            })
          }
        />
        <TextInput
          label="支持聊天"
          value={values.capabilities?.chat ? '是' : '否'}
          disabled
          style={styles.switchLabel}
        />
      </View>
      <View style={styles.switchContainer}>
        <Switch
          value={values.capabilities?.imageGeneration}
          onValueChange={(value) =>
            setValues({
              ...values,
              capabilities: { ...values.capabilities, imageGeneration: value },
            })
          }
        />
        <TextInput
          label="支持图片生成"
          value={values.capabilities?.imageGeneration ? '是' : '否'}
          disabled
          style={styles.switchLabel}
        />
      </View>
      <TextInput
        label="最大Token数"
        value={values.maxTokens?.toString() || ''}
        onChangeText={(text) =>
          setValues({ ...values, maxTokens: parseInt(text) || undefined })
        }
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="温度 (0-2)"
        value={values.temperature?.toString() || ''}
        onChangeText={(text) =>
          setValues({ ...values, temperature: parseFloat(text) || undefined })
        }
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        label="上下文长度"
        value={values.contextLength?.toString() || ''}
        onChangeText={(text) =>
          setValues({ ...values, contextLength: parseInt(text) || undefined })
        }
        keyboardType="numeric"
        style={styles.input}
      />
      <View style={styles.buttons}>
        <Button mode="outlined" onPress={onCancel} style={styles.button}>
          取消
        </Button>
        <Button mode="contained" onPress={handleSubmit} style={styles.button}>
          保存
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    flex: 1,
    marginLeft: 8,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  button: {
    marginLeft: 8,
  },
}); 