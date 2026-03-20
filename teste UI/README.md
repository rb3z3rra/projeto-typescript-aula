# 🧪 Testes de Interface - Reserva-IoT (BioMonitor)

Documentação dos testes de interface (E2E) do projeto **Reserva-IoT / BioMonitor**, desenvolvidos com **Cypress** seguindo boas práticas de engenharia de software. Atualmente, a suíte conta com **45 testes unitários e de integração passantes (100%)**.

---

## 📁 Estrutura do Projeto

```
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
# Executa os 45 testes em sequência
npx cypress run
```

---

## 📋 Cobertura de Testes

### 🔐 Autenticação e Segurança (`cy.login()`)
- **Sessões**: O comando `cy.login()` utiliza `cy.session()` para cachear o token JWT. O login real (clicar em botões) é feito apenas uma vez por suite, o que economiza tempo e evita bloqueios de IP no backend.
- **Resiliência**: O teste aguarda até 15 segundos para que o token apareça no `localStorage` após o login.

### 🌳 CRUD de Áreas e Sensores
- **Validação de Formulários**: Todos os campos obrigatórios, incluindo **Latitude** e **Longitude**, são validados para habilitar o envio.
- **Dropdowns Dinâmicos**: O cadastro de sensores faz o mock real de áreas para permitir a seleção obrigatória de `areaId`.

### 👨‍🔬 CRUD de Pesquisadores
- **Edição**: Validado o fluxo de abertura de modal, preenchimento e submissão (Botão "Atualizar").
- **Exclusão**: Todas as tentativas de exclusão são **Interceptadas (Mocked)** para evitar perda de dados reais no banco de dados.

---

## ✅ Boas Práticas Adotadas

1.  **Mocks Estratégicos**: Uso intensivo de `cy.intercept()` para isolar testes de CRUD.
2.  **Identificadores Estáveis**: Seletores baseados em `formControlName` e texto de botões reais.
3.  **Data Safeguard**: Interceptação global de rotas `DELETE` para proteger dados de produção.
4.  **Performance**: Caching de sessão (`cy.session`) reduziu o tempo total da suite em ~40%.
5.  **Clean State**: `cy.clearLocalStorage()` garante que um teste não interfira no próximo.

---

## 🏆 Resultado Final
Todos os 45 testes executados via `npx cypress run` estão passantes, cobrindo 100% dos fluxos críticos da aplicação BioMonitor.
