import React, { useState, useEffect, useRef } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { adicionarTarefa, atualizarTarefa, buscarTarefa } from '../data/database';
import { STATUS_OPCOES, STATUS_COLORS } from '../data/status';
import CampoLembrete from '../components/CampoLembrete';
import { garantirPermissao, agendarLembrete, cancelarLembrete } from '../services/notificacoes';

const SEM_DESCRICAO = 'Sem descrição informada.';

// Serve para criar (sem params) e para editar (route.params.id).
export default function AddTaskScreen({ navigation, route }) {
  const idEdicao = route.params?.id ?? null;
  const editando = idEdicao !== null;

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState(STATUS_OPCOES[0]);
  const [erroTitulo, setErroTitulo] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [lembrete, setLembrete] = useState(null); // Date | null
  const [erroLembrete, setErroLembrete] = useState('');
  const [carregandoEdicao, setCarregandoEdicao] = useState(editando);
  // Valores originais (modo edição), para saber se o lembrete precisa ser reagendado.
  const original = useRef({ titulo: null, lembreteMs: null, notificacaoId: null });

  useEffect(() => {
    navigation.setOptions({ title: editando ? 'Editar Tarefa' : 'Nova Tarefa' });
  }, [navigation, editando]);

  // Modo edição: preenche o formulário com os dados atuais da tarefa.
  useEffect(() => {
    if (!editando) return;
    let ativo = true;
    (async () => {
      try {
        const tarefa = await buscarTarefa(idEdicao);
        if (!ativo) return;
        if (!tarefa) {
          Alert.alert('Tarefa não encontrada', 'Ela pode ter sido excluída.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
          return;
        }
        setTitulo(tarefa.titulo);
        setDescricao(tarefa.descricao === SEM_DESCRICAO ? '' : tarefa.descricao ?? '');
        setStatus(tarefa.status);
        const data = tarefa.lembrete ? new Date(tarefa.lembrete) : null;
        setLembrete(data && !Number.isNaN(data.getTime()) ? data : null);
        original.current = {
          titulo: tarefa.titulo,
          lembreteMs: data && !Number.isNaN(data.getTime()) ? data.getTime() : null,
          notificacaoId: tarefa.notificacao_id ?? null,
        };
      } catch (erro) {
        console.error('Erro ao carregar tarefa:', erro);
        if (ativo) {
          Alert.alert('Erro', 'Não foi possível carregar a tarefa. Tente novamente.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        }
      } finally {
        if (ativo) setCarregandoEdicao(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [editando, idEdicao, navigation]);

  const handleSalvar = async () => {
    const tituloLimpo = titulo.trim();
    const lembreteMs = lembrete ? lembrete.getTime() : null;

    if (!tituloLimpo) {
      setErroTitulo('O título é obrigatório.');
      return;
    }

    // Lembrete no passado só é aceito se já era assim antes (edição sem mexer nele).
    if (lembreteMs && lembreteMs <= Date.now() && lembreteMs !== original.current.lembreteMs) {
      setErroLembrete('Escolha uma data e hora no futuro.');
      return;
    }

    setErroTitulo('');
    setErroLembrete('');
    setSalvando(true);

    let novoNotificacaoId = null;
    let aviso = null;

    try {
      const antigoId = original.current.notificacaoId;
      const mudou =
        lembreteMs !== original.current.lembreteMs || tituloLimpo !== original.current.titulo;

      // Mantém a notificação existente se nada mudou; senão agenda uma nova.
      let notificacaoId = antigoId;
      if (!editando || mudou) {
        notificacaoId = null;
        if (lembrete && lembreteMs > Date.now() && status !== 'Concluída') {
          const permitido = await garantirPermissao();
          if (permitido) {
            novoNotificacaoId = await agendarLembrete(tituloLimpo, lembrete);
            notificacaoId = novoNotificacaoId;
          } else {
            aviso =
              'A tarefa foi salva, mas o lembrete não será disparado porque a permissão de notificações foi negada.';
          }
        }
      }

      const dados = {
        titulo: tituloLimpo,
        status,
        descricao: descricao.trim() || SEM_DESCRICAO,
        lembrete: lembrete ? lembrete.toISOString() : null,
        notificacaoId,
      };

      if (editando) {
        await atualizarTarefa(idEdicao, dados);
      } else {
        await adicionarTarefa(dados);
      }

      // Só cancela a notificação antiga depois que o banco foi atualizado.
      if (editando && antigoId && antigoId !== notificacaoId) {
        await cancelarLembrete(antigoId);
      }

      if (aviso) {
        Alert.alert('Atenção', aviso, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        navigation.goBack();
      }
    } catch (erro) {
      console.error('Erro ao salvar tarefa:', erro);
      // Se o banco falhou, não deixa uma notificação órfã agendada.
      await cancelarLembrete(novoNotificacaoId);
      Alert.alert('Erro', 'Não foi possível salvar a tarefa. Tente novamente.');
      setSalvando(false);
    }
  };

  if (carregandoEdicao) {
    return (
      <SafeAreaView style={[styles.container, styles.centralizado]}>
        <ActivityIndicator size="large" color="#5B6CF9" />
      </SafeAreaView>
    );
  }

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

          <Text style={styles.label}>Lembrete</Text>
          <CampoLembrete
            valor={lembrete}
            onChange={(d) => {
              setLembrete(d);
              if (erroLembrete) setErroLembrete('');
            }}
          />
          {erroLembrete ? <Text style={styles.textoErro}>{erroLembrete}</Text> : null}

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
  centralizado: { justifyContent: 'center', alignItems: 'center' },
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
