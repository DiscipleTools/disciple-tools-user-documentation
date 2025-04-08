describe('Create New Contact', () => {
  beforeEach(() => {
    cy.viewport(1280, 1024);
  });
  

  const seed = Math.floor(Math.random() * 100);
  let shared_data = {
    'contact_name': `Cypress Contact [${seed}]`
  };

  it('Login to D.T frontend and create new contact with screenshots.', () => {
    cy.session(
      'dt_frontend_login_and_create_new_contact',
      () => {

        /**
         * Ensure uncaught exceptions do not fail test run; however, any thrown
         * exceptions must not be ignored and a ticket must be raised, in order
         * to resolve identified exception.
         *
         * TODO:
         *  - Resolve any identified exceptions.
         */

        cy.on('uncaught:exception', (err, runnable) => {
          // Returning false here prevents Cypress from failing the test
          return false;
        });

        // Capture admin credentials.
        const dt_config = cy.config('dt');
        const username = dt_config.credentials.admin.username;
        const password = dt_config.credentials.admin.password;

        // Login to D.T frontend.
        cy.dtLogin(username, password);

        // Navigate to contacts list view.
        cy.visit('/contacts');
        cy.wait(2000); // Ensure page is fully loaded
        cy.screenshot('new-contact-button', { capture: 'viewport' });
        
        // Move the screenshot to the docs directory
        cy.task('moveScreenshot', {
          from: 'cypress/screenshots/create_new_contact.cy.js/new-contact-button.png',
          to: 'img/contacts/new-contact-button.png'
        });
        
        // Take screenshot of contacts menu - using a more general selector
        cy.get('#top-bar-menu').screenshot('contacts-menu', { capture: 'viewport' });
        
        // Move the screenshot
        cy.task('moveScreenshot', {
          from: 'cypress/screenshots/create_new_contact.cy.js/contacts-menu.png',
          to: 'img/contacts/contacts-menu.png'
        });
        
        // Take screenshot of contacts list with filters
        cy.screenshot('contact-filters', { capture: 'viewport' });
        
        // Move the screenshot
        cy.task('moveScreenshot', {
          from: 'cypress/screenshots/create_new_contact.cy.js/contact-filters.png',
          to: 'img/contacts/contact-filters.png'
        });
        
        cy.get('a.create-post-desktop').click({ force: true });

        // Take screenshot of create contact form
        cy.wait(1000);
        cy.screenshot('create-contact-form', { capture: 'viewport' });
        
        // Move the screenshot
        cy.task('moveScreenshot', {
          from: 'cypress/screenshots/create_new_contact.cy.js/create-contact-form.png',
          to: 'img/contacts/create-contact-form.png'
        });
        
        // First get the shadow root, then use within to scope commands
        cy.get('#name')
          .shadow()
          .within(() => {
            // Execute commands within the shadow DOM context
            cy.get('input')
              .invoke('removeAttr', 'disabled')  // Remove disabled attribute
              .invoke('val', shared_data.contact_name)  // Set value 
              .trigger('input')  // Trigger input event
              .trigger('change');  // Trigger change event
          });
        
        // Submit new contact record creation request.
        cy.get('button.js-create-post-button').click({
          force: true
        });
        
        // Take screenshot of contact details page
        cy.wait(1000);
        cy.screenshot('contact-details', { capture: 'viewport' });
        
        // Move the screenshot
        cy.task('moveScreenshot', {
          from: 'cypress/screenshots/create_new_contact.cy.js/contact-details.png',
          to: 'img/contacts/contact-details.png'
        });
        
        // Take screenshots at different scroll positions
        cy.window().scrollTo('top');
        cy.screenshot('contact-tiles', { capture: 'viewport' });
        
        // Move the screenshot
        cy.task('moveScreenshot', {
          from: 'cypress/screenshots/create_new_contact.cy.js/contact-tiles.png',
          to: 'img/contacts/contact-tiles.png'
        });
        
        // Scroll down to capture more content
        cy.window().scrollTo(0, 300);
        cy.screenshot('contact-communication', { capture: 'viewport' });
        
        // Move the screenshot
        cy.task('moveScreenshot', {
          from: 'cypress/screenshots/create_new_contact.cy.js/contact-communication.png',
          to: 'img/contacts/contact-communication.png'
        });
        
        // Scroll down further
        cy.window().scrollTo(0, 600);
        cy.screenshot('contact-connections', { capture: 'viewport' });
        
        // Move the screenshot
        cy.task('moveScreenshot', {
          from: 'cypress/screenshots/create_new_contact.cy.js/contact-connections.png',
          to: 'img/contacts/contact-connections.png'
        });

        // Confirm new contact record has been successfully created.
        cy.visit('/contacts');
        cy.contains(shared_data.contact_name);
        cy.log(shared_data.contact_name);

      }
    );
  });

  it('Delete recently created contact record.', () => {
    cy.session(
      'delete_recently_created_contact_record',
      () => {

        /**
         * Ensure uncaught exceptions do not fail test run; however, any thrown
         * exceptions must not be ignored and a ticket must be raised, in order
         * to resolve identified exception.
         *
         * TODO:
         *  - Resolve any identified exceptions.
         */

        cy.on('uncaught:exception', (err, runnable) => {
          // Returning false here prevents Cypress from failing the test
          return false;
        });

        // Capture admin credentials.
        const dt_config = cy.config('dt');
        const username = dt_config.credentials.admin.username;
        const password = dt_config.credentials.admin.password;

        // Login to D.T frontend.
        cy.dtLogin(username, password);

        // Navigate to contacts list view.
        cy.visit('/contacts');

        // Obtain handle onto recently created contact record and navigate to record details.
        cy.contains(shared_data.contact_name).click();

        // Open delete model and confirm deletion request.
        cy.get('a[data-open="delete-record-modal"]').click({
          force: true
        });

        cy.get('#delete-record').click({
          force: true
        });

        // Finally, confirm record has been removed.
        cy.visit('/contacts');
        cy.contains(shared_data.contact_name).should('not.exist');

      }
    );
  });
});
