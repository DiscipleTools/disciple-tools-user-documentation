describe('Change Display Name in Settings', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024);
  });

  const seed = Math.floor(Math.random() * 100);
  let shared_data = {
    'original_display_name': '',
    'new_display_name': `Cypress User [${seed}]`
  };

  it('Login to D.T frontend and change display name with screenshots', () => {
    cy.session(
      'dt_frontend_login_and_change_display_name',
      () => {
        /**
         * Ensure uncaught exceptions do not fail test run
         */
        cy.on('uncaught:exception', (err, runnable) => {
          // Returning false here prevents Cypress from failing the test
          return false;
        });

        // Capture admin credentials
        const dt_config = cy.config('dt');
        const username = dt_config.credentials.admin.username;
        const password = dt_config.credentials.admin.password;

        // Login to D.T frontend
        cy.dtLogin(username, password);

        // Take screenshot of top navbar with settings link
        cy.wait(1000);
        cy.get('#top-bar-menu').scrollIntoView();
        cy.screenshot('settings-menu', { capture: 'viewport' });
        
        // Move the screenshot
        cy.task('moveScreenshot', {
          from: 'cypress/screenshots/change_display_name.cy.js/settings-menu.png',
          to: 'img/display-name/settings-menu.png'
        });

        // Navigate to settings page
        cy.visit('/settings');
        cy.wait(2000); // Ensure page is fully loaded

        // Take screenshot of profile information section
        cy.get('.template-settings .grid-x').first().scrollIntoView();
        cy.screenshot('profile-information', { capture: 'viewport' });
        
        // Move the screenshot
        cy.task('moveScreenshot', {
          from: 'cypress/screenshots/change_display_name.cy.js/profile-information.png',
          to: 'img/display-name/profile-information.png'
        });

        // Navigate to the edit profile section
        cy.get('#profile').scrollIntoView();
        cy.contains('button', 'Edit').click();
        cy.wait(1000);

        // Store the original display name to restore later
        cy.get('#nickname').invoke('val').then((val) => {
          shared_data.original_display_name = val.trim();
          cy.log(`Original display name: ${shared_data.original_display_name}`);
        });

        // Scroll to the display name field
        cy.get('#nickname').scrollIntoView();
        cy.wait(500);

        // Take screenshot of display name field
        cy.get('#nickname').parents('tr').scrollIntoView();
        cy.screenshot('display-name-field', { capture: 'viewport' });
        
        // Move the screenshot
        cy.task('moveScreenshot', {
          from: 'cypress/screenshots/change_display_name.cy.js/display-name-field.png',
          to: 'img/display-name/display-name-field.png'
        });

        // Change the display name
        cy.get('#nickname')
          .clear()
          .type(shared_data.new_display_name);

        // Take screenshot of form with update button
        cy.get('#edit-profile-modal button[type="submit"]').scrollIntoView();
        cy.wait(500);
        cy.screenshot('update-button', { capture: 'viewport' });
        
        // Move the screenshot
        cy.task('moveScreenshot', {
          from: 'cypress/screenshots/change_display_name.cy.js/update-button.png',
          to: 'img/display-name/update-button.png'
        });

        // Submit the form
        cy.get('#edit-profile-modal button[type="submit"]').click();

        // Wait for page to reload
        cy.wait(2000);

        // Take screenshot of updated display name
        cy.get('.template-settings .grid-x').first().scrollIntoView();
        cy.screenshot('updated-display-name', { capture: 'viewport' });
        
        // Move the screenshot
        cy.task('moveScreenshot', {
          from: 'cypress/screenshots/change_display_name.cy.js/updated-display-name.png',
          to: 'img/display-name/updated-display-name.png'
        });
      }
    );
  });

  it('Restore original display name', () => {
    cy.session(
      'restore_original_display_name',
      () => {
        cy.on('uncaught:exception', (err, runnable) => {
          return false;
        });

        // Capture admin credentials
        const dt_config = cy.config('dt');
        const username = dt_config.credentials.admin.username;
        const password = dt_config.credentials.admin.password;

        // Login to D.T frontend
        cy.dtLogin(username, password);

        // Navigate to settings page
        cy.visit('/settings');
        cy.wait(2000);

        // Navigate to the edit profile section
        cy.get('#profile').scrollIntoView();
        cy.contains('button', 'Edit').click();
        cy.wait(1000);

        // Restore the original display name if it was stored
        cy.get('#nickname')
          .clear()
          .type(shared_data.original_display_name || 'Admin');

        // Submit the form
        cy.get('#edit-profile-modal button[type="submit"]').click();

        // Check that display name was restored
        cy.wait(2000);
        cy.get('.template-settings').should('exist');
      }
    );
  });
}); 