// Gera um email único a cada execução para não conflitar com usuários já cadastrados
const uniqueEmail = `teste_cypress_${Date.now()}@email.com`;

describe('Fluxo de Cadastro - Register', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/register');
  });

  it('Deve carregar a página de cadastro com todos os campos visíveis', () => {
    cy.get('h1').contains('Criar conta').should('be.visible');
    cy.get('input[formControlName="nome"]').should('be.visible');
    cy.get('input[formControlName="email"]').should('be.visible');
    cy.get('input[formControlName="matricula"]').should('be.visible');
    cy.get('input[formControlName="especialidade"]').should('be.visible');
    cy.get('select[formControlName="titulacao"]').should('be.visible');
    cy.get('input[formControlName="dataNascimento"]').should('be.visible');
    cy.get('input[formControlName="senha"]').should('be.visible');
    cy.get('button[type="submit"]').contains('Finalizar Cadastro').should('be.visible');
  });

  it('Não deve permitir submissão com campos obrigatórios vazios (Validação frontend)', () => {
    // O botão deve estar desabilitado quando o formulário é inválido (registerForm.invalid)
    cy.get('button[type="submit"]').should('be.disabled');

    // Preenche apenas o nome — ainda inválido pois faltam email, senha, etc.
    cy.get('input[formControlName="nome"]').type('João Silva');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('Deve validar o campo de titulação com as opções corretas', () => {
    cy.get('select[formControlName="titulacao"]').within(() => {
      cy.get('option').should('have.length', 4);
      cy.get('option').eq(0).should('have.value', 'Graduação');
      cy.get('option').eq(1).should('have.value', 'Especialização');
      cy.get('option').eq(2).should('have.value', 'Mestrado');
      cy.get('option').eq(3).should('have.value', 'Doutorado');
    });
  });

  it('Deve ter um link "Fazer login" que navega para a tela de login', () => {
    // O Angular usa routerLink (sem href) — então validamos clicando e verificando a URL
    cy.contains('a', 'Fazer login').should('be.visible').click();
    cy.url({ timeout: 8000 }).should('include', '/login');
  });

  it('Deve realizar o cadastro com sucesso e redirecionar para o Login (Caminho Feliz)', () => {
    // Mock da resposta da API - evita dependência de banco de dados em testes de UI
    cy.intercept('POST', '**/register*', {
      statusCode: 201,
      body: { message: 'Cadastro realizado com sucesso' }
    }).as('registerRequest');

    // Captura o alert nativo que aparece após o sucesso
    cy.on('window:alert', (text) => {
      expect(text).to.contain('Cadastro realizado');
    });

    // Preenche todos os campos obrigatórios com dados válidos
    cy.get('input[formControlName="nome"]').type('Pesquisador Cypress');
    cy.get('input[formControlName="email"]').type('cypress@mock.com');
    cy.get('input[formControlName="matricula"]').type('MAT-CYPRESS-001');
    cy.get('input[formControlName="especialidade"]').type('Automacao de Testes');
    cy.get('select[formControlName="titulacao"]').select('Mestrado');
    cy.get('input[formControlName="dataNascimento"]').type('1990-05-15');
    cy.get('input[formControlName="senha"]').type('senha12345');

    // Verifica que o botão ficou habilitado
    cy.get('button[type="submit"]').should('not.be.disabled');

    // Submete o formulário
    cy.get('button[type="submit"]').click();

    // Espera requisição ser interceptada
    cy.wait('@registerRequest');

    // Após o alert ser aceito, deve redirecionar para /login
    cy.url({ timeout: 10000 }).should('include', '/login');
  });
});
