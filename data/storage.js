import AsyncStorage from '@react-native-async-storage/async-storage';
import { tarefas as tarefasIniciais } from './tarefas';

const STORAGE_KEY = '@to-do-dev:tarefas';

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

export async function salvarTarefas(tarefas) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
  } catch (erro) {
    console.error('Erro ao salvar tarefas no AsyncStorage:', erro);
  }
}

export async function adicionarTarefa(novaTarefa) {
  const tarefas = await carregarTarefas();
  const atualizadas = [...tarefas, novaTarefa];
  await salvarTarefas(atualizadas);
  return atualizadas;
}

export async function atualizarStatusTarefa(id, novoStatus) {
  const tarefas = await carregarTarefas();
  const atualizadas = tarefas.map((tarefa) =>
    tarefa.id === id ? { ...tarefa, status: novoStatus } : tarefa
  );
  await salvarTarefas(atualizadas);
  return atualizadas;
}
