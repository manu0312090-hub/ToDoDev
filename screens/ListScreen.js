import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { carregarTarefas } from '../data/storage';
import { STATUS_COLORS } from '../data/status';

export default function ListScreen({ navigation }) {
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Recarrega as tarefas do AsyncStorage sempre que a tela ganha foco
  // (ex.: ao voltar da tela de Adicionar ou de Detalhe, após uma mudança).
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      (async () => {
        setCarregando(true);
        const dados = await carregarTarefas();
        if (ativo) {
          setTarefas(dados);
          setCarregando(false);
        }
      })();

      return () => {
        ativo = false;
      };
    }, [])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Detalhe', { id: item.id })}
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
      {carregando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B6CF9" />
        </View>
      ) : (
        <FlatList
          data={tarefas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma tarefa ainda.</Text>
              <Text style={styles.emptySubtext}>
                Toque no botão + para adicionar a primeira.
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Adicionar')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, flexGrow: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginBottom: 4 },
  emptySubtext: { fontSize: 14, color: '#8E8E93' },
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
