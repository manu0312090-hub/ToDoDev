import AsyncStorage from '@react-native-async-storage/async-storage';
import { tarefas as tarefasIniciais } from './tarefas';

const STORAGE_KEY = '@to-do-dev:tarefas';

// Carrega as tarefas do AsyncStorage.
// Na primeira execução (chave ainda não existe), popula o storage
// com os dados iniciais mockados (Fase 1) para não abrir o app vazio.
export async function carregarTarefas() {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json !== null) {
      return JSON.parse(json);
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tarefasIniciais));
    return tarefasIniciais;
  } catch (erro) {
    console.error('Erro ao carregar tarefas do AsyncStorage:', erro);
    return tarefasIniciais;
  }
}

// Sobrescreve a lista completa de tarefas no AsyncStorage.
export async function salvarTarefas(tarefas) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
  } catch (erro) {
    console.error('Erro ao salvar tarefas no AsyncStorage:', erro);
  }
}

// Adiciona uma nova tarefa à lista persistida e retorna a lista atualizada.
export async function adicionarTarefa(novaTarefa) {
  const tarefas = await carregarTarefas();
  const atualizadas = [...tarefas, novaTarefa];
  await salvarTarefas(atualizadas);
  return atualizadas;
}

// Atualiza o status de uma tarefa específica (pelo id) e persiste a mudança.
export async function atualizarStatusTarefa(id, novoStatus) {
  const tarefas = await carregarTarefas();
  const atualizadas = tarefas.map((tarefa) =>
    tarefa.id === id ? { ...tarefa, status: novoStatus } : tarefa
  );
  await salvarTarefas(atualizadas);
  return atualizadas;
}
