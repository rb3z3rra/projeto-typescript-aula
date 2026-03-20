describe('Fluxo de Autenticação - Login', () => {
  beforeEach(() => {
    // Limpa sessões anteriores e acessa a página de login antes de cada teste
    cy.clearLocalStorage();
    cy.visit('/login');
  });

  it('Deve carregar a página de login corretamente', () => {
    // Verifica elementos base da tela
    cy.get('h1').contains('BioMonitor').should('be.visible');
    cy.get('input[formControlName="email"]').should('be.visible');
    cy.get('input[formControlName="senha"]').should('be.visible');
    cy.get('button[type="submit"]').contains('Entrar').should('be.visible');
  });

  it('Não deve submeter o formulário com campos inválidos (Validação frontend)', () => {
    // Tenta submeter vazio — o Angular bloqueia pois ambos são required
    cy.get('button[type="submit"]').click();

    // Digita email inválido (sem @) e senha muito curta (menos de 6 chars)
    cy.get('input[formControlName="email"]').type('emailinvalido');
    cy.get('input[formControlName="senha"]').type('123');
    cy.get('button[type="submit"]').click();

    // O formulário Angular não envia — nenhuma mensagem de erro DO BACKEND deve aparecer
    cy.get('.bg-red-100').should('not.exist');
  });

  it('Deve exibir erro ao tentar logar com credenciais inválidas (Caminho Triste)', () => {
    // Preenche credenciais erradas
    cy.get('input[formControlName="email"]').type('usuario_inexistente@teste.com');
    cy.get('input[formControlName="senha"]').type('senhaerrada123');

    // Submete
    cy.get('button[type="submit"]').click();

    // Aguarda e verifica a mensagem de erro do backend
    cy.get('.bg-red-100', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Credenciais inválidas ou erro no servidor.');

    // Verifica se o botão voltou ao normal
    cy.get('button[type="submit"]').contains('Entrar').should('be.visible');
  });

  it('Deve realizar o login com sucesso e redirecionar para o Dashboard (Caminho Feliz)', () => {
    // Preenche com credenciais REAIS
    cy.get('input[formControlName="email"]').type('joao@email.com');
    cy.get('input[formControlName="senha"]').type('minimo8chars');

    cy.get('button[type="submit"]').click();
    
    // Verifica se o token foi salvo no localStorage (prova que o login funcionou)
    cy.window({ timeout: 15000 }).should((win) => {
      const token = win.localStorage.getItem('access_token');
      expect(token).to.not.be.null;
      expect(token.length).to.be.greaterThan(20);
    });

    // Verifica se a URL mudou para a raiz / (Dashboard)
    cy.url({ timeout: 10000 }).should('eq', Cypress.config().baseUrl + '/');
  });
});
