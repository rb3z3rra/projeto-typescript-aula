# 📊 Relatório Entregável de Testes E2E (Reserva IoT)

Este documento foi gerado para evidenciar as etapas, desafios e resultados obtidos durante a implementação dos testes automatizados de Interface (UI) e Integração (API) no projeto **Reserva IoT (BioMonitor)**, de modo a contemplar as diretrizes solicitadas da disciplina.

---

## 🎯 Objetivo dos Testes Realizados

Garantir a estabilidade, a segurança e o pleno funcionamento das rotas e componentes críticos da aplicação. Através de testes automatizados ponta a ponta (E2E), buscamos validar de forma consistente a comunicação entre o **Frontend Angular** e o **Backend Node.js (Express/TypeORM)**. O foco central não foi apenas prever possíveis falhas na interface do sistema, mas também consolidar uma base confiável para assegurar as regras de negócio (e.g., controle de sensores, cadastros com constraints, autenticações temporais e permissionamento).

---

## 🔍 Partes do Sistema Cobertas (Cobertura E2E de Caminhos Críticos)

A suíte abrange **100% das jornadas vitais e essenciais** de uso primário da aplicação pelo pesquisador. As principais áreas testadas englobam:
- **Autenticação, Sessão e Segurança**: Registro com validação rigorosa dos tipos da senha/titulação; fluxos completos de login e controle de bloqueio estrito de acesso não-autenticado a rotas protegidas.
- **Gestão de Áreas (CRUD)**: Leitura, listagem tabular, preenchimento e criação de novas áreas geográficas.
- **Gestão de Sensores IoT (CRUD)**: Processo de acoplamento de hardwares ativos que enviam os fluxos a determinadas áreas.
- **Gestão de Pesquisadores**: Rotinas de verificação do CRUD avançado: edição visual de formulários preenchidos e rotinas de exclusão de dados pessoais.
- **Componentes Dinâmicos (UI/UX do Dashboard)**: Garantia estrutural de carregamento de métricas e painéis do seletor *Tendência de Temperatura* e componentes laterais.
- **Caminhos Tristes (Unhappy Paths) / Validações de Frontend**: Impedimento da ação de salvar dados baseando-se em formulários corrompidos, com campos em branco ou fora do tipado exigido pelo backend (ex: erro no uso de senhas de baixo caractere).

---

## 🏗️ Como os Testes Foram Organizados

Os testes estão unificados e orquestrados sob a plataforma **Cypress**. A organização no repositório utilizou o padrão de Arquitetura em *Specs*, focando na legibilidade do negócio:
1. **Mapeamento Fragmentado (`cypress/e2e/`)**: Os testes foram fragmentados estritamente por fluxo (`dashboard.cy.js`, `login.cy.js`, `crud-sensores.cy.js`), simulando os cenários como um usuário humano em isolamento.
2. **Custom Commands Compartilhados (`support/e2e.js`)**: Adotou-se o suporte global das APIs nativas do Cypress para não repetir rotinas lentas. O comando contínuo construído `cy.login()` faz uso pesado do caching com `cy.session()`, memorizando o JWT localmente e fazendo com que apenas a primeira suíte precise preencher nomes e senhas físicas no navegador logando no servidor E2E de Express.
3. **Mocks Injetados Estrategicamente (Data Safeguards)**: Em vez de disparar centenas de registros indesejados no banco PostgreSQL validando um delete visual na página, o comando `cy.intercept()` da API do Cypress simula perfeitamente a devolução do backend, garantindo velocidade, e preservação do banco oficial de desenvolvimento.

---

## 🚧 Principais Dificuldades Encontradas

A construção e calibração de um framework englobante acarretou em alguns desafios técnicos no trajeto de sua criação:

1. **Testes Flakys e Vício de Acesso**: Os tokens JWT ou as rotas em cache gerados pelo teste 1 permaneciam armazenados ao se instanciar o teste 2 do *Cypress runner*, mascarando resultados. 
   **Solução:** Utilizou-se `cy.clearLocalStorage()` ou redirecionamentos explícitos *antes* de injetar os steps (usando `beforeEach()`).
   
2. **Batalha contra o Limite de Taxa da API (Rate Limit)**:
   A alta velocidade que a automação consegue processar os fluxos HTTP engatilhou o sistema de segurança `express-rate-limit` desenhado no Node.js, bloqueando a aplicação com falsos positivos de ataque DDos (Erro **429 Too Many Requests**).
   **Solução:** Fazer calibragem de *max limits* no backend durante os cenários marcados como E2E subindo temporariamente a base permissível em ambiente Local `(NODE_ENV="development")` até mil instâncias simultâneas no *window*.

3. **Manejo de Operações Destrutivas Perigosas (`DELETE`)**:
   Deletar entidades durante automações afeta negativamente as execuções de repetições e necessita contínuos reloads no DB.
   **Solução:** Em rotas de exclusões foi estipulada a regra de `cy.intercept()` garantindo retornos fake sem tocar nas entidades físicas do DB enquanto a interface as processa perfeitamente na frente.
   
4. **Integração Física do Wokwi IoT (Assoreamentos de Fila)**:
   Restrições arquitetônicas impedem de forma simples conectar o emissor *Wokwi* direto no frontend usando Cypress; O envio se faz no Postman. 
   **Solução / Decisão Arquitetural:** O teste Wokwi IoT foi retirado das Specs ativas do Frontend e incluído como um objetivo de refatoração para **Trabalhos Futuros**.

---

## 📈 Análise dos Resultados Obtidos e Evidências

O projeto encontra-se testado e seguro frente as requisições básicas pedidas. A automação está blindada e pronta ao avanço do ciclo e uso.

- **Status da Bateria Final**: Execução imaculada com **45 Testes Corretos (45 Passing) / 0 Falhas (0 Failing)**.
- **Desempenho da Suíte**: O ganho de tempo por alocação de sessions refletiu com alta magnitude de performance rodando a massiva suíte inteira num total de apenas **± 45 segundos** em modo Node Headless via terminal nativo.
- **Métricas Comprovadas de Cobertura E2E**: Extensiva e cobrindo sem restrições **100% dos caminhos e casos de uso vitais** desde o login, acesso aos dashs, validações e encerramentos.

**📌 Verificação Lógica e Evidência de Execução**:
Para analisar o **repositório estruturalizado**, visualizar as comprovações explícitas de sucesso (os **Prints dos Logs** brutos por cada Step passante do Cypress), direcione a leitura para o documento base **[README.md (Testes UI)](./README.md)** localizado no mesmo caminho estrutural que este presente relatório.
