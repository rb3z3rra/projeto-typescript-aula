describe('CRUD de Pesquisadores', () => {
  beforeEach(() => {
    // Mock da listagem de pesquisadores (garante que a tabela tenha dados)
    cy.intercept('GET', '**/api/pesquisador*', {
      statusCode: 200,
      body: [
        {
          id: '1',
          nome: 'Pesquisador de Teste',
          matricula: 'MAT-123',
          titulacao: 'Doutorado',
          especialidade: 'Bioinformática',
          linhaPesquisa: 'Genética'
        }
      ]
    }).as('getPesquisadores');

    // Intercepta DELETE para evitar exclusão real (safeguard)
    cy.intercept('DELETE', '**/api/pesquisador/**', {
      statusCode: 200,
      body: { message: 'Pesquisador removido (mocked)' }
    }).as('excluirPesquisador');

    cy.login();
    cy.visit('/pesquisadores');
    cy.wait('@getPesquisadores');
  });

  it('Deve exibir o título da página de Pesquisadores', () => {
    cy.get('h1').contains('Pesquisadores').should('be.visible');
  });

  it('Deve exibir a tabela com as colunas corretas', () => {
    cy.get('table thead th').eq(0).should('contain', 'Nome');
    cy.get('table thead th').eq(1).should('contain', 'Matrícula');
    cy.get('table thead th').eq(2).should('contain', 'Titulação');
    cy.get('table thead th').eq(3).should('contain', 'Especialidade');
    cy.get('table thead th').eq(4).should('contain', 'Ações');
  });

  it('Deve listar pesquisadores cadastrados', () => {
    cy.get('table tbody').should('exist');
    cy.get('table tbody tr').should('have.length.at.least', 1);
  });

  it('Deve exibir botões de Editar e Excluir para cada pesquisador', () => {
    cy.get('table tbody tr').first().within(() => {
      cy.contains('button', 'Editar').should('be.visible');
      cy.contains('button', 'Excluir').should('be.visible');
    });
  });

  it('Deve abrir formulário de edição ao clicar em Editar', () => {
    cy.contains('h2', 'Editar Pesquisador').should('not.exist');
    cy.get('table tbody tr').first().scrollIntoView();
    cy.get('table tbody tr').first().contains('button', 'Editar').click();
    cy.contains('Editar Pesquisador').scrollIntoView().should('exist');
    cy.get('input[formControlName="nome"]').should('exist').and('not.have.value', '');
    cy.get('select[formControlName="titulacao"]').should('exist');
    cy.get('input[formControlName="especialidade"]').should('exist');
  });

  it('Deve fechar o formulário de edição ao clicar em Cancelar', () => {
    cy.get('table tbody tr').first().scrollIntoView();
    cy.get('table tbody tr').first().contains('button', 'Editar').click();
    cy.contains('Editar Pesquisador').should('exist');
    cy.contains('button', 'Cancelar').click();
    cy.contains('Editar Pesquisador').should('not.exist');
  });

  it('Deve excluir um pesquisador com sucesso (mock)', () => {
    cy.on('window:confirm', () => true);
    // O intercept já está configurado no beforeEach
    cy.get('table tbody tr').first().scrollIntoView();
    cy.get('table tbody tr').first().contains('button', 'Excluir').click();
    cy.wait('@excluirPesquisador');
  });

  it('Deve editar um pesquisador com sucesso (mock)', () => {
    cy.intercept('PUT', /pesquisador/, {
      statusCode: 200,
      body: { message: 'Pesquisador atualizado com sucesso' }
    }).as('editarPesquisador');

    cy.get('table tbody tr').first().scrollIntoView();
    cy.get('table tbody tr').first().contains('button', 'Editar').click();

    // Limpa o campo especialidade e digita um novo valor
    cy.get('input[formControlName="especialidade"]')
      .scrollIntoView()
      .clear()
      .type('Bioinformática Avançada');

    // Salva (No template Angular o botão se chama 'Atualizar' na edição)
    cy.contains('button', 'Atualizar').click();
    cy.wait('@editarPesquisador');
  });
});
