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
import { Ionicons } from '@expo/vector-icons';
import {
  buscarTarefa,
  atualizarStatusTarefa,
  excluirTarefa,
  limparLembrete,
} from '../data/database';
import { cancelarLembrete } from '../services/notificacoes';
import { formatarLembrete } from '../utils/formatarData';
import { STATUS_OPCOES, STATUS_COLORS } from '../data/status';

export default function DetailScreen({ navigation, route }) {
  const { id } = route.params;
  const [tarefa, setTarefa] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  // Busca os dados atualizados toda vez que a tela ganha foco
  // (inclusive ao voltar da edição).
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      (async () => {
        setCarregando(true);
        setErro(false);
        try {
          const encontrada = await buscarTarefa(id);
          if (ativo) setTarefa(encontrada);
        } catch (e) {
          console.error('Erro ao buscar tarefa:', e);
          if (ativo) setErro(true);
        } finally {
          if (ativo) setCarregando(false);
        }
      })();

      return () => {
        ativo = false;
      };
    }, [id, tentativa])
  );

  const handleAlterarStatus = async (novoStatus) => {
    if (!tarefa || novoStatus === tarefa.status || atualizando) return;

    setAtualizando(true);
    try {
      await atualizarStatusTarefa(tarefa.id, novoStatus);
      let extra = {};
      // Tarefa concluída não precisa mais de lembrete.
      if (novoStatus === 'Concluída' && tarefa.notificacao_id) {
        await cancelarLembrete(tarefa.notificacao_id);
        await limparLembrete(tarefa.id);
        extra = { lembrete: null, notificacao_id: null };
      }
      setTarefa((atual) => ({ ...atual, status: novoStatus, ...extra }));
    } catch (erro) {
      console.error('Erro ao atualizar status:', erro);
      Alert.alert('Erro', 'Não foi possível alterar o status.');
    } finally {
      setAtualizando(false);
    }
  };

  // Exclusão sempre com confirmação.
  const handleExcluir = () => {
    Alert.alert('Excluir', 'Tem certeza que deseja excluir esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await excluirTarefa(tarefa.id);
            await cancelarLembrete(tarefa.notificacao_id);
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

  if (erro) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={56} color="#D32F2F" />
        <Text style={styles.msgTitulo}>Não foi possível carregar a tarefa</Text>
        <Text style={styles.msgSub}>Verifique e tente novamente.</Text>
        <TouchableOpacity style={styles.tentarBotao} onPress={() => setTentativa((n) => n + 1)}>
          <Text style={styles.tentarTexto}>Tentar novamente</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
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
          {tarefa.lembrete ? (
            <View style={styles.lembreteLinha}>
              <Ionicons name="alarm-outline" size={18} color="#5B6CF9" />
              <Text style={styles.lembreteTexto}>{formatarLembrete(tarefa.lembrete)}</Text>
            </View>
          ) : null}
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
  lembreteLinha: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  lembreteTexto: { marginLeft: 6, fontSize: 14, color: '#5B6CF9', fontWeight: '600' },
  msgTitulo: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginTop: 12 },
  msgSub: { fontSize: 14, color: '#8E8E93', marginTop: 4, marginBottom: 20 },
  tentarBotao: {
    backgroundColor: '#5B6CF9',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  tentarTexto: { color: '#fff', fontSize: 15, fontWeight: '600' },
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
