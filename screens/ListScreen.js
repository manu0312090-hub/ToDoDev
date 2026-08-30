import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { tarefas } from '../data/tarefas';

const STATUS_COLORS = {
  Pendente: '#FFB020',
  'Em andamento': '#5B6CF9',
  Concluída: '#2E7D32',
};

export default function ListScreen({ navigation }) {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('Detalhe', { id: item.id, titulo: item.titulo })
      }
    >
      <Text style={styles.titulo}>{item.titulo}</Text>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: STATUS_COLORS[item.status] ?? '#8E8E93' },
        ]}
      >
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={tarefas}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          Alert.alert('Em breve', 'A funcionalidade de adicionar tarefas chega na próxima fase!')
        }
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  titulo: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginBottom: 10 },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5B6CF9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  fabText: { color: '#fff', fontSize: 30, lineHeight: 32 },
});
