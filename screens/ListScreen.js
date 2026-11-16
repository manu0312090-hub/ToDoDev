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
import { Ionicons } from '@expo/vector-icons';
import { carregarTarefas } from '../data/database';
import { formatarLembrete } from '../utils/formatarData';
import { STATUS_OPCOES, STATUS_COLORS } from '../data/status';

// null = sem filtro ("Todas")
const FILTROS = [{ rotulo: 'Todas', valor: null }, ...STATUS_OPCOES.map((s) => ({ rotulo: s, valor: s }))];

export default function ListScreen({ navigation }) {
  const [tarefas, setTarefas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState(null);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  // Reconsulta o banco sempre que a tela ganha foco (ao voltar de Adicionar/Detalhe)
  // e também quando o filtro muda.
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      (async () => {
        setCarregando(true);
        setErro(false);
        try {
          const dados = await carregarTarefas(filtro);
          if (ativo) setTarefas(dados);
        } catch (e) {
          console.error('Erro ao carregar tarefas:', e);
          if (ativo) setErro(true);
        } finally {
          if (ativo) setCarregando(false);
        }
      })();

      return () => {
        ativo = false;
      };
    }, [filtro, tentativa])
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('Detalhe', { id: item.id })}
    >
      <Text style={styles.titulo}>{item.titulo}</Text>
      {item.lembrete ? (
        <View style={styles.lembreteLinha}>
          <Ionicons name="alarm-outline" size={14} color="#8E8E93" />
          <Text style={styles.lembreteTexto}>{formatarLembrete(item.lembrete)}</Text>
        </View>
      ) : null}
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
      <View style={styles.filtros}>
        {FILTROS.map(({ rotulo, valor }) => {
          const ativo = valor === filtro;
          return (
            <TouchableOpacity
              key={rotulo}
              style={[
                styles.chip,
                ativo && {
                  backgroundColor: valor ? STATUS_COLORS[valor] : '#1C1C1E',
                  borderColor: valor ? STATUS_COLORS[valor] : '#1C1C1E',
                },
              ]}
              onPress={() => setFiltro(valor)}
            >
              <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{rotulo}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {carregando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5B6CF9" />
        </View>
      ) : erro ? (
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={56} color="#D32F2F" />
          <Text style={styles.emptyText}>Não foi possível carregar as tarefas</Text>
          <Text style={styles.emptySubtext}>Verifique e tente novamente.</Text>
          <TouchableOpacity style={styles.tentarBotao} onPress={() => setTentativa((n) => n + 1)}>
            <Text style={styles.tentarTexto}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={tarefas}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard-outline" size={64} color="#C7C7CC" />
              <Text style={styles.emptyText}>
                {filtro ? `Nenhuma tarefa "${filtro}".` : 'Nenhuma tarefa ainda.'}
              </Text>
              <Text style={styles.emptySubtext}>
                {filtro
                  ? 'Troque o filtro para ver as outras.'
                  : 'Toque no botão + para adicionar a primeira.'}
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
  filtros: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 8 },
  chip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  chipTexto: { fontSize: 13, fontWeight: '600', color: '#3A3A3C' },
  chipTextoAtivo: { color: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, flexGrow: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginTop: 12, marginBottom: 4 },
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
  lembreteLinha: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  lembreteTexto: { marginLeft: 4, fontSize: 12, color: '#8E8E93' },
  tentarBotao: {
    backgroundColor: '#5B6CF9',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  tentarTexto: { color: '#fff', fontSize: 15, fontWeight: '600' },
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
