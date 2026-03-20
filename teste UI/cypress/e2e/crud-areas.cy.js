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

  it('Deve criar uma nova Área com sucesso (mock)', () => {
    // Endpoint real: /api/area (sem 's')
    cy.intercept('POST', '**/api/area*', {
      statusCode: 201,
      body: { id: 999, nome: 'Area Cypress', bioma: 'Floresta', largura: 100, comprimento: 200 }
    }).as('criarArea');

    cy.contains('button', '+ Nova Área').click();
    cy.get('input[formControlName="nome"]').type('Area Cypress');
    cy.get('select[formControlName="bioma"]').select('Floresta');
    cy.get('input[formControlName="largura"]').type('100');
    cy.get('input[formControlName="comprimento"]').type('200');
    cy.get('input[formControlName="latitude"]').type('-23.5505');
    cy.get('input[formControlName="longitude"]').type('-46.6333');
    cy.get('button[type="submit"]').should('not.be.disabled').click();
    cy.wait('@criarArea');
  });
});
