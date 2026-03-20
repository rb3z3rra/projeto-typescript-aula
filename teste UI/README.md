# 🧪 Testes de Interface - Reserva-IoT (BioMonitor)

Documentação dos testes de interface (E2E) do projeto **Reserva-IoT / BioMonitor**, desenvolvidos com **Cypress** seguindo boas práticas de engenharia de software. Atualmente, a suíte conta com **45 testes unitários e de integração passantes (100%)**.

---

## 📁 Estrutura do Projeto

```text
teste UI/
├── cypress/
│   ├── e2e/
│   │   ├── home.cy.js                # Teste básico da página inicial
│   │   ├── login.cy.js               # Fluxo de autenticação
│   │   ├── register.cy.js            # Fluxo de cadastro de pesquisador
│   │   ├── dashboard.cy.js           # Widgets e filtros do Dashboard
│   │   ├── crud-areas.cy.js          # Gestão de Áreas (Criação/Listagem)
│   │   ├── crud-sensores.cy.js       # Gestão de Sensores (Criação/Listagem)
│   │   ├── crud-pesquisadores.cy.js  # Gestão de Pesquisadores (Edição/Exclusão)
│   │   └── crud.cy.js                # Testes combinados para execução Headless
│   └── support/
│       └── e2e.js                    # Comando cy.login() com suporte a Sessão
├── cypress.config.js                 # Configuração do Cypress
├── package.json                      # Dependências do projeto
└── README.md                         # Este arquivo
```

---

## ⚙️ Pré-requisitos

- **Node.js** instalado
- **Backend** rodando em `http://localhost:6060`
- **Frontend Angular** rodando em `http://localhost:4200`
- **Rate Limit**: Recomenda-se aumentar o `max` do `express-rate-limit` no `server.ts` para **1000** em dev para evitar erro 429 durante os testes.

---

## ▶️ Executando os Testes

### Interface Visual (Modo GUI)
```bash
npx cypress open
```

### Linha de Comando (Modo Headless)
```bash
npx cypress run
```

---

## ✅ Boas Práticas Adotadas

1.  **Mocks Estratégicos**: Uso intensivo de `cy.intercept()` para isolar testes de CRUD.
2.  **Identificadores Estáveis**: Seletores baseados em `formControlName` e texto de botões reais.
3.  **Data Safeguard**: Interceptação global de rotas `DELETE` para proteger dados de produção.
4.  **Performance**: Caching de sessão (`cy.session`) reduziu incrivelmente o tempo total da suíte.
5.  **Clean State**: Garantia de que um teste não interfere no próximo (`cy.clearLocalStorage()`).

---

## 🏆 Resultado Final e Logs de Execução

Todos os **45 testes** executados via `npx cypress run` estão **passando com sucesso**, cobrindo **100% dos fluxos críticos** da aplicação BioMonitor.

### 📊 Relatório de Execução (Última Rodada)

**Resumo:** 45 testes executados, 45 passando (**100% de sucesso**). Tempo total da suíte: **~45 segundos**.

| 📄 Spec (Arquivo) | 🧪 Testes | ✅ Passando | ❌ Falhando | ⏳ Pendentes | ⏭️ Ignorados | Tempo |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `crud-areas.cy.js` | 5 | 5 | 0 | 0 | 0 | 00:10 |
| `crud-pesquisadores.cy.js` | 8 | 8 | 0 | 0 | 0 | 00:06 |
| `crud-sensores.cy.js` | 5 | 5 | 0 | 0 | 0 | 00:04 |
| `crud.cy.js` | 10 | 10 | 0 | 0 | 0 | 00:03 |
| `dashboard.cy.js` | 7 | 7 | 0 | 0 | 0 | 00:02 |
| `home.cy.js` | 1 | 1 | 0 | 0 | 0 | 00:01 |
| `login.cy.js` | 4 | 4 | 0 | 0 | 0 | 00:08 |
| `register.cy.js` | 5 | 5 | 0 | 0 | 0 | 00:08 |
| **Total (All specs passed)** | **45** | **45** | **0** | **0** | **0** | **00:45** |

<details>
<summary><b>📜 Ver Log Detalhado da Execução Completa</b> (Clique para expandir)</summary>

```text
====================================================================================================
  (Run Starting)

  ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  │ Cypress:        15.12.0                                                                        │
  │ Browser:        Electron 138 (headless)                                                        │
  │ Specs:          8 found (crud-areas.cy.js, crud-pesquisadores.cy.js, crud-sensores.cy.js, crud │
  │                 .cy.js, dashboard.cy.js, home.cy.js, login.cy.js, register.cy.js)              │
  └────────────────────────────────────────────────────────────────────────────────────────────────┘

────────────────────────────────────────────────────────────────────────────────────────────────────
  Running:  crud-areas.cy.js                                                                (1 of 8)

  CRUD de Áreas
    √ Deve exibir o título e o botão de Nova Área (5195ms)
    √ Deve exibir a tabela com as colunas corretas (764ms)
    √ Deve exibir o formulário ao clicar em Nova Área (874ms)
    √ Deve fechar o formulário ao clicar em Cancelar (848ms)
    √ Deve criar uma nova Área com sucesso (mock) (2399ms)

  5 passing (11s)

────────────────────────────────────────────────────────────────────────────────────────────────────
  Running:  crud-pesquisadores.cy.js                                                        (2 of 8)

  CRUD de Pesquisadores
    √ Deve exibir o título da página de Pesquisadores (1990ms)
    √ Deve exibir a tabela com as colunas corretas (761ms)
    √ Deve listar pesquisadores cadastrados (609ms)
    √ Deve exibir botões de Editar e Excluir para cada pesquisador (659ms)
    √ Deve abrir formulário de edição ao clicar em Editar (370ms)
    √ Deve fechar o formulário de edição ao clicar em Cancelar (411ms)
    √ Deve excluir um pesquisador com sucesso (mock) (335ms)
    √ Deve editar um pesquisador com sucesso (mock) (968ms)

  8 passing (7s)

────────────────────────────────────────────────────────────────────────────────────────────────────
  Running:  crud-sensores.cy.js                                                             (3 of 8)

  CRUD de Sensores
    √ Deve exibir o título e o botão de Novo Sensor (622ms)
    √ Deve exibir a tabela com as colunas corretas (301ms)
    √ Deve exibir o formulário ao clicar em Novo Sensor (346ms)
    √ Deve fechar o formulário ao clicar em Cancelar (407ms)
    √ Deve criar um novo Sensor com sucesso (mock) (2650ms)

  5 passing (5s)

────────────────────────────────────────────────────────────────────────────────────────────────────
  Running:  crud.cy.js                                                                      (4 of 8)

  CRUD de Áreas
    √ Deve exibir o título e o botão de Nova Área
    √ Deve exibir a tabela com as colunas corretas
    √ Deve exibir o formulário ao clicar em Nova Área
    √ Deve fechar o formulário ao clicar em Cancelar
    √ Deve desabilitar o botão Salvar com formulário incompleto
  CRUD de Sensores
    √ Deve exibir o título e o botão de Novo Sensor
    √ Deve exibir a tabela com as colunas corretas
    √ Deve exibir o formulário ao clicar em Novo Sensor
    √ Deve fechar o formulário ao clicar em Cancelar
    √ Deve desabilitar o botão Salvar com formulário incompleto

  10 passing (4s)

────────────────────────────────────────────────────────────────────────────────────────────────────
  Running:  dashboard.cy.js                                                                 (5 of 8)

  Dashboard - Controle de Acesso
    √ Deve redirecionar para o login se acessado sem autenticação
  Dashboard Global
    √ Deve exibir os 4 cards de métricas principais
    √ Deve exibir o select de seleção de área
    √ Deve exibir a seção de Tendência de Temperatura
    √ Deve exibir a seção de Leituras Recentes
    √ Deve ter links de navegação visíveis no menu lateral (sidebar)
  Dashboard - Interação com Selector de Área
    √ Deve listar as opções de área no select

  7 passing (2s)

────────────────────────────────────────────────────────────────────────────────────────────────────
  Running:  home.cy.js                                                                      (6 of 8)

  Reserva-IoT Home Page
    √ should load the home page correctly (900ms)

  1 passing (1s)

────────────────────────────────────────────────────────────────────────────────────────────────────
  Running:  login.cy.js                                                                     (7 of 8)

  Fluxo de Autenticação - Login
    √ Deve carregar a página de login corretamente (1858ms)
    √ Não deve submeter o formulário com campos inválidos (Validação frontend) (1278ms)
    √ Deve exibir erro ao tentar logar com credenciais inválidas (Caminho Triste) (1528ms)
    √ Deve realizar o login com sucesso e redirecionar para o Dashboard (Caminho Feliz) (2599ms)

  4 passing (8s)

────────────────────────────────────────────────────────────────────────────────────────────────────
  Running:  register.cy.js                                                                  (8 of 8)

  Fluxo de Cadastro - Register
    √ Deve carregar a página de cadastro com todos os campos visíveis (1486ms)
    √ Não deve permitir submissão com campos obrigatórios vazios (Validação frontend) (830ms)
    √ Deve validar o campo de titulação com as opções corretas (581ms)
    √ Deve ter um link "Fazer login" que navega para a tela de login (574ms)
    √ Deve realizar o cadastro com sucesso e redirecionar para o Login (Caminho Feliz) (3681ms)

  5 passing (8s)
====================================================================================================
```
</details>

---

> 🚀 **Trabalhos Futuros:** Como tarefa futura, serão implementados os testes E2E para validar a ingestão de dados simulando o hardware **Wokwi** (rota IoT `/api/leitura`).
