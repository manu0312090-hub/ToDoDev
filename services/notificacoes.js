import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const CANAL_ANDROID = 'lembretes';

// Como a notificação aparece com o app aberto.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Canal obrigatório no Android para exibir notificações.
export async function configurarCanal() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL_ANDROID, {
      name: 'Lembretes de tarefas',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

// Pede permissão (só pergunta se ainda não foi decidido). Retorna true/false.
export async function garantirPermissao() {
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  if (!atual.canAskAgain) return false;
  const nova = await Notifications.requestPermissionsAsync();
  return nova.granted;
}

// Agenda uma notificação local para a data do lembrete. Retorna o id agendado.
export async function agendarLembrete(titulo, data) {
  await configurarCanal();
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Lembrete de tarefa',
      body: titulo,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: data,
      channelId: CANAL_ANDROID,
    },
  });
}

export async function cancelarLembrete(notificacaoId) {
  if (!notificacaoId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificacaoId);
  } catch (erro) {
    console.warn('Não foi possível cancelar a notificação:', erro);
  }
}
