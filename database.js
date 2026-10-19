import * as SQLite from 'expo-sqlite';
import { tarefas as tarefasIniciais } from './tarefas';
import { STATUS_OPCOES } from './status';

const NOME_BANCO = 'to-do-dev.db';
let bancoPromise = null;

export function abrirBanco() {
  if (!bancoPromise) {
    bancoPromise = iniciarBanco().catch((erro) => {
      bancoPromise = null; 
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

export async function buscarTarefa(id) {
  const db = await abrirBanco();
  return (await db.getFirstAsync('SELECT * FROM tarefas WHERE id = ?', id)) ?? null;
}

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

export async function atualizarStatusTarefa(id, novoStatus) {
  const db = await abrirBanco();
  await db.runAsync('UPDATE tarefas SET status = ? WHERE id = ?', novoStatus, id);
}

export async function excluirTarefa(id) {
  const db = await abrirBanco();
  await db.runAsync('DELETE FROM tarefas WHERE id = ?', id);
}
