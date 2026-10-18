import * as SQLite from 'expo-sqlite';
import { tarefas as tarefasIniciais } from './tarefas';
import { STATUS_OPCOES } from './status';

const NOME_BANCO = 'to-do-dev.db';

// Guarda a Promise (e não só o banco) para que chamadas simultâneas
// (ex.: Lista e Detalhe montando juntas) não abram/criem o banco duas vezes.
let bancoPromise = null;

// Abre o banco uma única vez, cria a tabela se não existir e,
// na primeira execução, popula com os dados iniciais da Fase 1.
export function abrirBanco() {
  if (!bancoPromise) {
    bancoPromise = iniciarBanco().catch((erro) => {
      bancoPromise = null; // permite tentar de novo se falhar
      throw erro;
    });
  }
  return bancoPromise;
}

async function iniciarBanco() {
  const db = await SQLite.openDatabaseAsync(NOME_BANCO);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tarefas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT,
      status TEXT NOT NULL DEFAULT 'Pendente'
    );
  `);

  // user_version = 0 só na primeira vez: assim o seed roda uma única vez
  // e não volta a popular se o usuário apagar todas as tarefas.
  const { user_version: versao } = await db.getFirstAsync('PRAGMA user_version');
  if (versao === 0) {
    for (const t of tarefasIniciais) {
      await db.runAsync(
        'INSERT INTO tarefas (titulo, descricao, status) VALUES (?, ?, ?)',
        t.titulo,
        t.descricao,
        t.status
      );
    }
    await db.execAsync('PRAGMA user_version = 1');
  }

  return db;
}

// READ — lista (opcionalmente filtrada por status). Sem filtro = todas.
export async function carregarTarefas(status = null) {
  const db = await abrirBanco();
  if (status && STATUS_OPCOES.includes(status)) {
    return db.getAllAsync(
      'SELECT * FROM tarefas WHERE status = ? ORDER BY id DESC',
      status
    );
  }
  return db.getAllAsync('SELECT * FROM tarefas ORDER BY id DESC');
}

// READ — uma tarefa pelo id (ou null se não existir).
export async function buscarTarefa(id) {
  const db = await abrirBanco();
  return (await db.getFirstAsync('SELECT * FROM tarefas WHERE id = ?', id)) ?? null;
}

// CREATE
export async function adicionarTarefa({ titulo, descricao, status }) {
  const db = await abrirBanco();
  const resultado = await db.runAsync(
    'INSERT INTO tarefas (titulo, descricao, status) VALUES (?, ?, ?)',
    titulo,
    descricao,
    status
  );
  return resultado.lastInsertRowId;
}

// UPDATE — edita título, descrição e status.
export async function atualizarTarefa(id, { titulo, descricao, status }) {
  const db = await abrirBanco();
  await db.runAsync(
    'UPDATE tarefas SET titulo = ?, descricao = ?, status = ? WHERE id = ?',
    titulo,
    descricao,
    status,
    id
  );
}

// UPDATE — altera só o status (usado na tela de Detalhe).
export async function atualizarStatusTarefa(id, novoStatus) {
  const db = await abrirBanco();
  await db.runAsync('UPDATE tarefas SET status = ? WHERE id = ?', novoStatus, id);
}

// DELETE — a confirmação (Alert) fica na tela, antes de chamar esta função.
export async function excluirTarefa(id) {
  const db = await abrirBanco();
  await db.runAsync('DELETE FROM tarefas WHERE id = ?', id);
}
