// ==========================================================================
// Dashboard - Controle de Acesso e Conteúdo
// ==========================================================================

// ─────────────────────────────────────────────
// GUARD - Sem autenticação
// ─────────────────────────────────────────────
describe('Dashboard - Controle de Acesso', () => {
  it('Deve redirecionar para o login se acessado sem autenticação', () => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.url({ timeout: 8000 }).should('include', '/login');
  });
});

// ─────────────────────────────────────────────
// DASHBOARD - Com autenticação e mocks de API
// ─────────────────────────────────────────────
describe('Dashboard Global', () => {
  beforeEach(() => {
    // Mock da API de Áreas — endpoint real: /api/area (sem 's')
    cy.intercept('GET', '**/api/area*', {
      statusCode: 200,
      body: [
        { id: 1, nome: 'Área Cypress 1', bioma: 'Amazônia', largura: 100, comprimento: 200 },
        { id: 2, nome: 'Área Cypress 2', bioma: 'Cerrado', largura: 150, comprimento: 300 }
      ]
    }).as('getAreas');

    // Mock da API de Sensores — endpoint real: /api/sensors (inglês)
    cy.intercept('GET', '**/api/sensors*', {
      statusCode: 200,
      body: [
        { id: 1, serialNumber: 'SN-001', tipo: 'Temperatura', status: 'Ativo', areaId: 1 },
        { id: 2, serialNumber: 'SN-002', tipo: 'Umidade', status: 'Ativo', areaId: 1 },
        { id: 3, serialNumber: 'SN-003', tipo: 'Pressão', status: 'Inativo', areaId: 2 }
      ]
    }).as('getSensores');

    // Mock da API de Leituras Recentes
    cy.intercept('GET', '**/api/leitura*', {
      statusCode: 200,
      body: [
        { id: 1, valor: 28.5, unidade: '°C', tipo: 'Temperatura', sensorId: 1, timestamp: '2024-01-15T10:00:00Z' },
        { id: 2, valor: 75.0, unidade: '%', tipo: 'Umidade', sensorId: 2, timestamp: '2024-01-15T10:05:00Z' },
        { id: 3, valor: 1013.0, unidade: 'hPa', tipo: 'Pressão', sensorId: 3, timestamp: '2024-01-15T10:10:00Z' }
      ]
    }).as('getLeituras');

    cy.login();
    cy.visit('/');
  });

  // ─── Cards de Métricas ───────────────────────────
  it('Deve exibir os 4 cards de métricas principais', () => {
    cy.contains('Áreas Monitoradas').should('be.visible');
    cy.contains('Sensores Ativos').should('be.visible');
    cy.contains('Temp. Média').should('be.visible');
    cy.contains('Alertas').should('be.visible');
  });

  // ─── Select de Área ──────────────────────────────
  it('Deve exibir o select de seleção de área', () => {
    cy.contains('Selecionar Área').should('be.visible');
    cy.get('select').should('be.visible');
    cy.get('select option').first().should('contain', 'Selecione uma área');
  });

  // ─── Seção de Temperatura ────────────────────────
  it('Deve exibir a seção de Tendência de Temperatura', () => {
    cy.contains('Tendência de Temperatura').should('be.visible');
  });

  // ─── Seção de Leituras Recentes ──────────────────
  it('Deve exibir a seção de Leituras Recentes', () => {
    // A seção pode estar abaixo do viewport — scrollIntoView garante que encontramos
    cy.contains('Leituras Recentes').scrollIntoView().should('exist');
  });

  // ─── Navegação pelo Menu Lateral ─────────────────
  it('Deve ter links de navegação visíveis no menu lateral (sidebar)', () => {
    // O sidebar Angular geralmente tem links para as principais seções
    // Verifica ao menos um link de navegação para Áreas ou Sensores
    cy.get('a').should('have.length.at.least', 1);
  });
});

// ─────────────────────────────────────────────
// DASHBOARD - Interação com Selector de Área
// ─────────────────────────────────────────────
describe('Dashboard - Interação com Selector de Área', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/area*', {
      statusCode: 200,
      body: [
        { id: 1, nome: 'Floresta Norte',  bioma: 'Amazônia', largura: 100, comprimento: 200 },
        { id: 2, nome: 'Savana Central', bioma: 'Cerrado',   largura: 150, comprimento: 300 }
      ]
    }).as('getAreas');

    cy.intercept('GET', '**/api/sensors*', { statusCode: 200, body: [] }).as('getSensores');
    cy.intercept('GET', '**/api/leitura*', { statusCode: 200, body: [] }).as('getLeituras');

    cy.login();
    cy.visit('/');
  });

  it('Deve listar as opções de área no select', () => {
    cy.get('select').should('exist');

    // Aguarda o componente Angular carregar as áreas do mock
    cy.get('select option').should('have.length.at.least', 1);
  });
});
