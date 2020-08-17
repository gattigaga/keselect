describe('Keselect', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080')
  })

  it('should open the dropdown and select an option', () => {
    cy.get('.keselect__selected').contains('Select Language').click()
    cy.get('.keselect__option').contains('Bahasa').click()
    cy.get('.keselect__selected').should('contain', 'Bahasa Indonesia')
  })

  it('should filter the option list and select an option that found', () => {
    cy.get('.keselect__selected').contains('Select Language').click()
    cy.get('.keselect__search').type('Arabic')
    cy.get('.keselect__option').contains('Arabic').click()
    cy.get('.keselect__selected').should('contain', 'Arabic')
  })

  it('should filter the option list and not found an option', () => {
    cy.get('.keselect__selected').contains('Select Language').click()
    cy.get('.keselect__search').type('French')
    cy.get('.keselect__message-wrapper').should('be.visible')
  })

  it('should open the dropdown and close by pressing esc key', () => {
    cy.get('.keselect__selected').contains('Select Language').click()
    cy.document().trigger('keyup', {keyCode: 27})
    cy.get('.keselect__dropdown').should('not.visible')
  })

  it('should open the dropdown and close by clicking outside', () => {
    cy.get('.keselect__selected').contains('Select Language').click()
    cy.document().trigger('click')
    cy.get('.keselect__dropdown').should('not.visible')
  })
})
