import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { adicionarTarefa, atualizarTarefa, buscarTarefa } from '../data/database';
import { STATUS_OPCOES, STATUS_COLORS } from '../data/status';

const SEM_DESCRICAO = 'Sem descrição informada.';

export default function AddTaskScreen({ navigation, route }) {
  const idEdicao = route.params?.id ?? null;
  const editando = idEdicao !== null;

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState(STATUS_OPCOES[0]);
  const [erroTitulo, setErroTitulo] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: editando ? 'Editar Tarefa' : 'Nova Tarefa' });
  }, [navigation, editando]);

  useEffect(() => {
    if (!editando) return;
    let ativo = true;
    (async () => {
      const tarefa = await buscarTarefa(idEdicao);
      if (!ativo || !tarefa) return;
      setTitulo(tarefa.titulo);
      setDescricao(tarefa.descricao === SEM_DESCRICAO ? '' : tarefa.descricao ?? '');
      setStatus(tarefa.status);
    })();
    return () => {
      ativo = false;
    };
  }, [editando, idEdicao]);

  const handleSalvar = async () => {
    const tituloLimpo = titulo.trim();

    if (!tituloLimpo) {
      setErroTitulo('O título é obrigatório.');
      return;
    }

    setErroTitulo('');
    setSalvando(true);

    const dados = {
      titulo: tituloLimpo,
      status,
      descricao: descricao.trim() || SEM_DESCRICAO,
    };

    try {
      if (editando) {
        await atualizarTarefa(idEdicao, dados);
      } else {
        await adicionarTarefa(dados);
      }
      navigation.goBack();
    } catch (erro) {
      console.error('Erro ao salvar tarefa:', erro);
      Alert.alert('Erro', 'Não foi possível salvar a tarefa. Tente novamente.');
      setSalvando(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={[styles.input, erroTitulo ? styles.inputErro : null]}
            placeholder="Ex: Estudar para a prova"
            value={titulo}
            onChangeText={(texto) => {
              setTitulo(texto);
              if (erroTitulo) setErroTitulo('');
            }}
          />
          {erroTitulo ? <Text style={styles.textoErro}>{erroTitulo}</Text> : null}

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Detalhes da tarefa (opcional)"
            value={descricao}
            onChangeText={setDescricao}
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Status</Text>
          <View style={styles.statusRow}>
            {STATUS_OPCOES.map((opcao) => {
              const selecionado = opcao === status;
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
                  onPress={() => setStatus(opcao)}
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
        </ScrollView>

        <TouchableOpacity
          style={[styles.botaoSalvar, salvando && styles.botaoDesabilitado]}
          onPress={handleSalvar}
          disabled={salvando}
        >
          <Text style={styles.botaoSalvarTexto}>
            {salvando ? 'Salvando...' : editando ? 'Salvar alterações' : 'Salvar tarefa'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  content: { padding: 16, paddingBottom: 24 },
  label: { fontSize: 14, fontWeight: '600', color: '#1C1C1E', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1C1C1E',
  },
  inputMultiline: { minHeight: 90, textAlignVertical: 'top' },
  inputErro: { borderColor: '#D32F2F' },
  textoErro: { color: '#D32F2F', fontSize: 13, marginTop: 4 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusOpcao: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  statusOpcaoTexto: { fontSize: 13, fontWeight: '600', color: '#3A3A3C' },
  statusOpcaoTextoSelecionado: { color: '#fff' },
  botaoSalvar: {
    backgroundColor: '#5B6CF9',
    margin: 16,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  botaoDesabilitado: { opacity: 0.6 },
  botaoSalvarTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
