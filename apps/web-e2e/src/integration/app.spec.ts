describe('web', () => {
  beforeEach(() => cy.visit('/'));

  it('should redirect me to the sign-in page', () => {
    cy.url().should('contain', 'auth/sign-in?intended=/');
  });
});
