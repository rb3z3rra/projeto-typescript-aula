// ==========================================================================
// CRUD - Áreas, Sensores e Pesquisadores
// Todos os testes CRUD num único arquivo para evitar problemas de
// estado de sessão entre specs múltiplos no Cypress headless.
// ==========================================================================

// ─────────────────────────────────────────────
// ÁREAS
// ─────────────────────────────────────────────
describe('CRUD de Áreas', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/areas');
  });

  it('Deve exibir o título e o botão de Nova Área', () => {
    cy.get('h1').contains('Áreas').should('be.visible');
    cy.contains('button', '+ Nova Área').should('be.visible');
  });

  it('Deve exibir a tabela com as colunas corretas', () => {
    cy.get('table thead th').eq(0).should('contain', 'Nome');
    cy.get('table thead th').eq(1).should('contain', 'Bioma');
    cy.get('table thead th').eq(2).should('contain', 'Dimensões');
    cy.get('table thead th').eq(3).should('contain', 'Ações');
  });

  it('Deve exibir o formulário ao clicar em Nova Área', () => {
    cy.get('input[formControlName="nome"]').should('not.exist');
    cy.contains('button', '+ Nova Área').click();
    cy.get('input[formControlName="nome"]').should('be.visible');
    cy.get('select[formControlName="bioma"]').should('be.visible');
    cy.get('input[formControlName="latitude"]').should('be.visible');
    cy.get('input[formControlName="longitude"]').should('be.visible');
    cy.get('input[formControlName="largura"]').should('be.visible');
    cy.get('input[formControlName="comprimento"]').should('be.visible');
    cy.get('textarea[formControlName="descricao"]').should('be.visible');
    cy.contains('h2', 'Cadastrar Área').should('be.visible');
  });

  it('Deve fechar o formulário ao clicar em Cancelar', () => {
    cy.contains('button', '+ Nova Área').click();
    cy.get('input[formControlName="nome"]').should('be.visible');
    cy.contains('button', 'Cancelar').click();
    cy.get('input[formControlName="nome"]').should('not.exist');
  });

  it('Deve desabilitar o botão Salvar com formulário incompleto', () => {
    // Garante que form vazio não pode ser submetido (validação Angular)
    cy.contains('button', '+ Nova Área').click();
    cy.get('button[type="submit"]').should('be.disabled');
  });
});

// ─────────────────────────────────────────────
// SENSORES
// ─────────────────────────────────────────────
describe('CRUD de Sensores', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/sensors');
  });

  it('Deve exibir o título e o botão de Novo Sensor', () => {
    cy.get('h1').contains('Sensores').should('be.visible');
    cy.contains('button', '+ Novo Sensor').should('be.visible');
  });

  it('Deve exibir a tabela com as colunas corretas', () => {
    cy.get('table thead th').eq(0).should('contain', 'Serial');
    cy.get('table thead th').eq(1).should('contain', 'Tipo');
    cy.get('table thead th').eq(2).should('contain', 'Status');
    cy.get('table thead th').eq(3).should('contain', 'Área');
    cy.get('table thead th').eq(4).should('contain', 'Ações');
  });

  it('Deve exibir o formulário ao clicar em Novo Sensor', () => {
    cy.get('input[formControlName="serialNumber"]').should('not.exist');
    cy.contains('button', '+ Novo Sensor').click();
    cy.get('input[formControlName="serialNumber"]').should('be.visible');
    cy.get('input[formControlName="fabricante"]').should('be.visible');
    cy.get('input[formControlName="modelo"]').should('be.visible');
    cy.get('input[formControlName="tipo"]').should('be.visible');
    cy.get('select[formControlName="status"]').should('be.visible');
    cy.get('select[formControlName="areaId"]').should('be.visible');
    cy.get('input[formControlName="cicloLeitura"]').should('be.visible');
    cy.get('input[formControlName="dataInstalacao"]').should('be.visible');
    cy.contains('h2', 'Cadastrar Sensor').should('be.visible');
  });

  it('Deve fechar o formulário ao clicar em Cancelar', () => {
    cy.contains('button', '+ Novo Sensor').click();
    cy.get('input[formControlName="serialNumber"]').should('be.visible');
    cy.contains('button', 'Cancelar').click();
    cy.get('input[formControlName="serialNumber"]').should('not.exist');
  });

  it('Deve desabilitar o botão Salvar com formulário incompleto', () => {
    // Garante que form vazio não pode ser submetido (validação Angular)
    cy.contains('button', '+ Novo Sensor').click();
    cy.get('button[type="submit"]').should('be.disabled');
  });
});

// Nota: Os testes de CRUD de Pesquisadores estão no arquivo dedicado:
// cypress/e2e/crud-pesquisadores.cy.js
