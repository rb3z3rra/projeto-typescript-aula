describe('Reserva-IoT Home Page', () => {
  it('should load the home page correctly', () => {
    cy.visit('/');
    cy.document().its('readyState').should('eq', 'complete');
    // Assuming there is some basic element like an app-root or a title to check
    cy.get('app-root').should('exist');
  });
});
