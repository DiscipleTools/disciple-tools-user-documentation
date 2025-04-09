// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Custom login command for DT
Cypress.Commands.add('dtLogin', (username, password) => {
  cy.visit('/wp-login.php');
  cy.wait(500); // this is required to ensure the page is loaded
  cy.get('#user_login').type(username);
  cy.get('#user_pass').type(password);
  cy.get('#wp-submit').click();
  
  // Wait for login to complete, but don't assert a specific URL
  // since we may be redirected to different places depending on the environment
  cy.wait(2000);
});

// Hide Cypress UI for better videos
Cypress.Commands.add('hideCommandLog', () => {
  // Add CSS to the page to hide Cypress UI elements
  cy.document().then(doc => {
    const style = doc.createElement('style');
    style.innerHTML = `
      /* Hide Cypress UI elements */
      .reporter {
        display: none !important;
      }
      .command-log-controls {
        display: none !important;
      }
      
      /* Hide Electron browser chrome */
      body {
        margin-top: 0 !important;
      }

      #spec-runner-header {
        display: none !important;
      }
      
      /* Hide WordPress admin elements that shouldn't be in videos */
      #wpadminbar, 
      .elementor-panel,
      #elementor-editor-wrapper,
      #elementor-panel,
      .elementor-editor-active .elementor-edit-area,
      .elementor-navigator-wrapper {
        display: none !important;
      }
      
      /* Fix height with hidden elements */
      html {
        margin-top: 0 !important;
      }
      
      /* Hide any URL bars or browser controls */
      .browser-navbar, 
      .browser-chrome,
      .cypress-header,
      .browser-controls {
        display: none !important;
      }
    `;
    doc.head.appendChild(style);
  });
  
  // Add a small delay to ensure styles are applied
  cy.wait(100);
});

// Utility to move screenshots
Cypress.Commands.add('moveScreenshot', ({ from, to }) => {
  cy.task('moveScreenshot', { from, to });
});

// Utility to move videos
Cypress.Commands.add('moveVideo', ({ from, to }) => {
  cy.task('moveVideo', { from, to });
});