# To Do Dev — Fase 3

App de lista de tarefas para estudantes e universitários, em React Native + Expo.

<!-- PAM-CI-NOTA-INICIO -->
### Nota atual (automática) — TODO DEV (lista de tarefas)

[![CI](https://github.com/manu0312090-hub/ToDoDev-/actions/workflows/pam-ci.yml/badge.svg)](https://github.com/manu0312090-hub/ToDoDev-/actions/workflows/pam-ci.yml) [![Nota](https://img.shields.io/badge/Nota%20PAM%20I-R-orange)](https://github.com/manu0312090-hub/ToDoDev-/actions/workflows/pam-ci.yml)

**R** — Regular · **40%** (22/55 pontos) · atualizado em 2026-10-05 23:21

| Fase | Pontos |
|------|--------|
| Fase 1 — Estrutura | 8/10 |
| Fase 2 — AsyncStorage | 12/15 |
| Fase 3 — SQLite | 2/30 |

Checklist item a item em [NOTA.md](NOTA.md) · [ver a rodada mais recente no Actions](https://github.com/manu0312090-hub/ToDoDev-/actions/workflows/pam-ci.yml)
<!-- PAM-CI-NOTA-FIM -->

## Escopo desta entrega (Fase 3 — SQLite)

- **Banco SQLite** (`expo-sqlite`): o arquivo `to-do-dev.db` e a tabela `tarefas` são criados automaticamente ao abrir o app. Na primeira execução a tabela é populada com as 3 tarefas iniciais da Fase 1 (uma única vez, controlado por `PRAGMA user_version`).
- **CRUD completo**: criar (tela Adicionar), listar (tela Lista), editar (botão Editar no Detalhe, reaproveitando o formulário) e excluir (botão Excluir, **com confirmação** via `Alert.alert`).
- **Filtros por status** na lista: Todas / Pendente / Em andamento / Concluída (`WHERE status = ?`).
- A tela Detalhe continua permitindo alterar só o status rapidamente.

## Banco de dados

Toda a lógica está em `data/database.js` (substitui o antigo `data/storage.js` e o AsyncStorage):

| Função | Operação |
|---|---|
| `carregarTarefas(status?)` | READ (lista, com filtro opcional) |
| `buscarTarefa(id)` | READ (uma tarefa) |
| `adicionarTarefa(dados)` | CREATE |
| `atualizarTarefa(id, dados)` | UPDATE (título, descrição, status) |
| `atualizarStatusTarefa(id, status)` | UPDATE (só status) |
| `excluirTarefa(id)` | DELETE |

Tabela: `tarefas(id INTEGER PK AUTOINCREMENT, titulo TEXT NOT NULL, descricao TEXT, status TEXT NOT NULL DEFAULT 'Pendente')`.

## Como rodar no Expo Go

1. Instale as dependências:
   ```bash
   npm install
   npx expo install expo-sqlite
   ```

2. Inicie o servidor:
   ```bash
   npx expo start
   ```

3. Abra o **Expo Go** no celular e escaneie o QR code (celular e computador na mesma rede Wi-Fi).

## Estrutura

```
to-do-dev/
├── App.js                    # Navegação (stack: Lista ↔ Detalhe ↔ Adicionar)
├── app.json
├── data/
│   ├── tarefas.js             # Dados iniciais (seed) usados na primeira execução
│   ├── status.js              # Opções e cores de status compartilhadas
│   └── database.js            # SQLite: abertura do banco, tabela e CRUD
├── screens/
│   ├── ListScreen.js          # Lista + filtros por status + botão "Adicionar"
│   ├── DetailScreen.js        # Detalhe + alterar status + Editar + Excluir (com confirmação)
│   └── AddTaskScreen.js       # Formulário de criar/editar tarefa
└── package.json
```
