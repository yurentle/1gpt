import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, IconButton } from 'react-native-paper';
import { Model } from '../../types/provider';

interface ModelListProps {
  models: Model[];
  onEdit?: (model: Model) => void;
  onDelete?: (modelId: string) => void;
}

export const ModelList = ({ models, onEdit, onDelete }: ModelListProps) => {
  return (
    <View style={styles.container}>
      {models.map((model) => (
        <List.Item
          key={model.id}
          title={model.name}
          description={`支持: ${Object.entries(model.capabilities)
            .filter(([_, value]) => value)
            .map(([key]) => key)
            .join(', ')}`}
          right={() => (
            <View style={styles.actions}>
              {onEdit && (
                <IconButton icon="pencil" onPress={() => onEdit(model)} />
              )}
              {onDelete && (
                <IconButton icon="delete" onPress={() => onDelete(model.id)} />
              )}
            </View>
          )}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 