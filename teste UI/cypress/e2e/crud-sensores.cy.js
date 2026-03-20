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

  it('Deve criar um novo Sensor com sucesso (mock)', () => {
    // Mock da lista de Áreas — endpoint real: /api/area (sem 's')
    cy.intercept('GET', '**/api/area*', {
      statusCode: 200,
      body: [
        { id: 1, nome: 'Área Cypress', bioma: 'Amazônia', largura: 100, comprimento: 200 }
      ]
    }).as('getAreas');

    // Mock de criação — endpoint real: /api/sensors (inglês)
    cy.intercept('POST', '**/api/sensors*', {
      statusCode: 201,
      body: { id: 999, serialNumber: 'SN-CYPRESS', tipo: 'Temperatura', status: 'Ativo' }
    }).as('criarSensor');

    cy.contains('button', '+ Novo Sensor').click();

    // Aguarda as áreas carregarem no select
    cy.wait('@getAreas');

    cy.get('input[formControlName="serialNumber"]').type('SN-CYPRESS-001');
    cy.get('input[formControlName="fabricante"]').type('Bosch');
    cy.get('input[formControlName="modelo"]').type('X100');
    cy.get('input[formControlName="tipo"]').type('Temperatura');
    cy.get('select[formControlName="status"]').select('Ativo');
    // Seleciona a primeira área disponível (campo obrigatório)
    cy.get('select[formControlName="areaId"]').find('option').not('[value=""]').first().then(option => {
      cy.get('select[formControlName="areaId"]').select(option.val());
    });
    cy.get('input[formControlName="cicloLeitura"]').type('60');
    cy.get('input[formControlName="dataInstalacao"]').type('2024-01-15');
    cy.get('input[formControlName="latitude"]').type('-23.5505');
    cy.get('input[formControlName="longitude"]').type('-46.6333');
    cy.get('button[type="submit"]').should('not.be.disabled').click();
    cy.wait('@criarSensor');
  });
});
