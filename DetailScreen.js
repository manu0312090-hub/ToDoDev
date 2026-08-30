import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { tarefas } from '../data/tarefas';

export default function DetailScreen({ navigation, route }) {
  const { id, titulo } = route.params;

  // Busca os dados completos da tarefa pelo id recebido por parâmetro
  const tarefa = tarefas.find((t) => t.id === id);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.titulo}>{tarefa?.titulo ?? titulo}</Text>
        <Text style={styles.status}>Status: {tarefa?.status ?? 'Não informado'}</Text>
        <Text style={styles.descricao}>
          {tarefa?.descricao ?? 'Sem descrição disponível para esta tarefa.'}
        </Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA', padding: 16, justifyContent: 'space-between' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  titulo: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', marginBottom: 12 },
  status: { fontSize: 14, fontWeight: '600', color: '#5B6CF9', marginBottom: 16 },
  descricao: { fontSize: 15, color: '#3A3A3C', lineHeight: 22 },
  backButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  backButtonText: { color: '#5B6CF9', fontSize: 16, fontWeight: '600' },
});
