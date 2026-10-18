import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { buscarTarefa, atualizarStatusTarefa, excluirTarefa } from '../data/database';
import { STATUS_OPCOES, STATUS_COLORS } from '../data/status';

export default function DetailScreen({ navigation, route }) {
  const { id } = route.params;
  const [tarefa, setTarefa] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      (async () => {
        setCarregando(true);
        try {
          const encontrada = await buscarTarefa(id);
          if (ativo) setTarefa(encontrada);
        } catch (erro) {
          console.error('Erro ao buscar tarefa:', erro);
        } finally {
          if (ativo) setCarregando(false);
        }
      })();

      return () => {
        ativo = false;
      };
    }, [id])
  );

  const handleAlterarStatus = async (novoStatus) => {
    if (!tarefa || novoStatus === tarefa.status || atualizando) return;

    setAtualizando(true);
    try {
      await atualizarStatusTarefa(tarefa.id, novoStatus);
      setTarefa((atual) => ({ ...atual, status: novoStatus }));
    } catch (erro) {
      console.error('Erro ao atualizar status:', erro);
      Alert.alert('Erro', 'Não foi possível alterar o status.');
    } finally {
      setAtualizando(false);
    }
  };

  const handleExcluir = () => {
    Alert.alert('Excluir', 'Tem certeza que deseja excluir esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await excluirTarefa(tarefa.id);
            navigation.goBack();
          } catch (erro) {
            console.error('Erro ao excluir tarefa:', erro);
            Alert.alert('Erro', 'Não foi possível excluir a tarefa.');
          }
        },
      },
    ]);
  };

  if (carregando) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#5B6CF9" />
      </SafeAreaView>
    );
  }

  if (!tarefa) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.status}>Tarefa não encontrada.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <View style={styles.card}>
          <Text style={styles.titulo}>{tarefa.titulo}</Text>
          <Text style={[styles.status, { color: STATUS_COLORS[tarefa.status] ?? '#5B6CF9' }]}>
            Status: {tarefa.status}
          </Text>
          <Text style={styles.descricao}>{tarefa.descricao}</Text>
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.secaoTitulo}>Alterar status</Text>
          <View style={styles.statusRow}>
            {STATUS_OPCOES.map((opcao) => {
              const selecionado = opcao === tarefa.status;
              return (
                <TouchableOpacity
                  key={opcao}
                  style={[
                    styles.statusOpcao,
                    selecionado && {
                      backgroundColor: STATUS_COLORS[opcao],
                      borderColor: STATUS_COLORS[opcao],
                    },
                  ]}
                  onPress={() => handleAlterarStatus(opcao)}
                  disabled={atualizando}
                >
                  <Text
                    style={[
                      styles.statusOpcaoTexto,
                      selecionado && styles.statusOpcaoTextoSelecionado,
                    ]}
                  >
                    {opcao}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.acoesRow}>
          <TouchableOpacity
            style={[styles.acaoBotao, styles.editarBotao]}
            onPress={() => navigation.navigate('Adicionar', { id: tarefa.id })}
          >
            <Text style={styles.editarTexto}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.acaoBotao, styles.excluirBotao]}
            onPress={handleExcluir}
          >
            <Text style={styles.excluirTexto}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA', padding: 16, justifyContent: 'space-between' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  titulo: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', marginBottom: 12 },
  status: { fontSize: 14, fontWeight: '600', marginBottom: 16 },
  descricao: { fontSize: 15, color: '#3A3A3C', lineHeight: 22 },
  statusSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
  },
  secaoTitulo: { fontSize: 14, fontWeight: '600', color: '#1C1C1E', marginBottom: 12 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statusOpcao: {
    flexGrow: 1,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statusOpcaoTexto: { fontSize: 13, fontWeight: '600', color: '#3A3A3C' },
  statusOpcaoTextoSelecionado: { color: '#fff' },
  acoesRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  acaoBotao: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 14,
    borderWidth: 1,
  },
  editarBotao: { backgroundColor: '#5B6CF9', borderColor: '#5B6CF9' },
  editarTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
  excluirBotao: { backgroundColor: '#fff', borderColor: '#D32F2F' },
  excluirTexto: { color: '#D32F2F', fontSize: 16, fontWeight: '600' },
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
