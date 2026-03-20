// cypress/support/e2e.js
// Arquivo de suporte do Cypress — carregado automaticamente antes de cada spec

// Comando customizado: cy.login()
// Navega para a página de login e autentica via UI
Cypress.Commands.add('login', (email = 'joao@email.com', password = 'minimo8chars') => {
  // cy.session salva o estado (localStorage, cookies, etc.) para acelerar outros testes
  cy.session([email, password], () => {
    cy.clearLocalStorage();
    cy.visit('/login');
    
    // Intercepta a chamada de login para garantir que esperamos a resposta
    cy.intercept('POST', '**/api/login').as('loginReq');

    cy.get('input[formControlName="email"]').type(email);
    cy.get('input[formControlName="senha"]').type(password);
    cy.get('button[type="submit"]').click();

    // Aguarda o sucesso da requisição no backend
    cy.wait('@loginReq').its('response.statusCode').should('eq', 200);

    // Aguarda o token ser persistido no localStorage (com retry do Cypress)
    cy.window({ timeout: 15000 }).should((win) => {
      const token = win.localStorage.getItem('access_token');
      expect(token).to.not.be.null;
      expect(token.length).to.be.greaterThan(20);
    });
  }, {
    cacheAcrossSpecs: true // Compartilha sessão entre arquivos de teste (.spec.js)
  });
});
