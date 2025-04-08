describe('Customizations Documentation Screenshots', () => {
  beforeEach(() => {
    // Disable uncaught exception handling
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });
    const dt_config = cy.config('dt');
    const username = dt_config.credentials.admin.username;
    const password = dt_config.credentials.admin.password;
    cy.session([username, password], () => {
    cy.dtLogin(username, password);
    });
    
    // Set a large viewport for all tests to prevent truncation
    cy.viewport(1280, 1024);
  });

  it('Should take screenshot of Customizations menu', () => {
    // Visit admin dashboard
    cy.visit('/wp-admin/index.php');
    
    // Take screenshot of the menu item
    cy.get('a[href*="page=dt_customizations"]').parent().parent().first().screenshot('customizations-menu');
    
    // Move the screenshot to the docs directory
    cy.task('moveScreenshot', {
      from: 'cypress/screenshots/customizations_screenshots.cy.js/customizations-menu.png',
      to: 'img/customizations/customizations-menu.png'
    });
  });

  it('Should take screenshot of record type settings', () => {
    // Visit the customizations page for contacts
    cy.visit('/wp-admin/admin.php?page=dt_customizations&post_type=contacts&tab=settings&a=1');
    
    // Wait for page to load
    cy.contains('Record Type Settings').should('be.visible');
    
    // Take screenshot of the settings tab
    cy.get('table.widefat.striped').screenshot('record-type-settings');
    
    // Move the screenshot
    cy.task('moveScreenshot', {
      from: 'cypress/screenshots/customizations_screenshots.cy.js/record-type-settings.png',
      to: 'img/customizations/record-type-settings.png'
    });
  });

  it('Should take screenshot of tiles example', () => {
    // Visit the customizations page for contacts, tiles tab
    cy.visit('/wp-admin/admin.php?page=dt_customizations&post_type=contacts&tab=tiles');
    
    // Wait for page to load
    cy.contains('Tile Rundown').should('be.visible');
    
    // Expand a tile to show fields
    cy.contains('.field-settings-table-tile-name', 'Details')
      .find('.expand-icon')
      .click();
    cy.wait(1000);
    
    // Take screenshot of the expanded tile
    cy.get('.field-settings-table').screenshot('tiles-example');
    
    // Move the screenshot
    cy.task('moveScreenshot', {
      from: 'cypress/screenshots/customizations_screenshots.cy.js/tiles-example.png',
      to: 'img/customizations/tiles-example.png'
    });
  });

  it('Should trigger and take screenshot of new record type dialog', () => {
    // Set extra large viewport for modal
    cy.viewport(1600, 1200);
    
    // Visit the customizations page
    cy.visit('/wp-admin/admin.php?page=dt_customizations');
    
    // Click the "New Record Type" button
    cy.get('#add_new_post_type').click();
    
    // Wait for modal to appear and fully render
    cy.get('.dt-admin-modal-box').should('be.visible');
    cy.wait(500);
    
    // Take screenshot of just the modal content box
    cy.get('.dt-admin-modal-box-content').screenshot('new-record-type-modal');
    
    // Move the screenshot
    cy.task('moveScreenshot', {
      from: 'cypress/screenshots/customizations_screenshots.cy.js/new-record-type-modal.png',
      to: 'img/customizations/new-record-type.png'
    });
    
    // Close the modal
    cy.get('.dt-admin-modal-box-close-button').click();
  });

  it('Should trigger and take screenshot of new tile dialog', () => {
    // Set extra large viewport for modal
    cy.viewport(1600, 1200);
    
    // Visit the customizations page for contacts, tiles tab
    cy.visit('/wp-admin/admin.php?page=dt_customizations&post_type=contacts&tab=tiles');
    
    // Click "add new tile" link
    cy.get('#add-new-tile-link').click();
    
    // Wait for modal to appear and fully render
    cy.get('.dt-admin-modal-box').should('be.visible');
    cy.wait(500);
    
    // Take screenshot of just the modal content box
    cy.get('.dt-admin-modal-box-content').screenshot('new-tile-modal');
    
    // Move the screenshot
    cy.task('moveScreenshot', {
      from: 'cypress/screenshots/customizations_screenshots.cy.js/new-tile-modal.png',
      to: 'img/customizations/new-tile.png'
    });
    
    // Close the modal
    cy.get('.dt-admin-modal-box-close-button').click();
  });

  it('Should trigger and take screenshot of new field dialog', () => {
    // Set extra large viewport for modal
    cy.viewport(1600, 1200);
    
    // Visit the customizations page for contacts, tiles tab
    cy.visit('/wp-admin/admin.php?page=dt_customizations&post_type=contacts&tab=tiles');
    
    // Expand a tile
    cy.contains('.field-settings-table-tile-name', 'Details')
      .find('.expand-icon')
      .click();
    cy.wait(1000);
    
    // Click "add new field" link within the expanded tile
    cy.contains('#details .add-new-field', 'add new field').click();
    
    // Wait for modal to appear and fully render
    cy.get('.dt-admin-modal-box').should('be.visible');
    cy.wait(500);
    
    // Take screenshot of just the modal content box
    cy.get('.dt-admin-modal-box-content').screenshot('new-field-modal');
    
    // Move the screenshot
    cy.task('moveScreenshot', {
      from: 'cypress/screenshots/customizations_screenshots.cy.js/new-field-modal.png',
      to: 'img/customizations/new-field.png'
    });
    
    // Close the modal
    cy.get('.dt-admin-modal-box-close-button').click();
  });

  it('Should take screenshot of field options', () => {
    // Set viewport large enough to see field options
    cy.viewport(1600, 1200);
    
    // Visit the customizations page for contacts, tiles tab
    cy.visit('/wp-admin/admin.php?page=dt_customizations&post_type=contacts&tab=tiles');
    
    // Expand the Status tile
    cy.contains('.field-settings-table-tile-name', 'Status')
      .find('.expand-icon')
      .click();
    cy.wait(500);
    
    // Expand the Status field to show options
    cy.contains('.field-settings-table-field-name', 'Status')
      .find('.expand-icon')
      .click();
    cy.wait(500);
    
    // Take screenshot of the field options including some context
    cy.get('#status').screenshot('field-options-context');
    
    // Move the screenshot
    cy.task('moveScreenshot', {
      from: 'cypress/screenshots/customizations_screenshots.cy.js/field-options-context.png',
        to: 'img/customizations/field-options.png'
    });
  });

  it('Should take screenshot of roles permissions', () => {
    // Visit the customizations page for contacts, roles tab
    cy.visit('/wp-admin/admin.php?page=dt_customizations&post_type=contacts&tab=roles');
    
    // Wait for the roles section to load
    cy.contains('Roles & Permissions').should('be.visible');
    
    // Take screenshot of the roles permissions table
    cy.get('table.widefat.striped').screenshot('role-permissions');
    
    // Move the screenshot
    cy.task('moveScreenshot', {
      from: 'cypress/screenshots/customizations_screenshots.cy.js/role-permissions.png',
      to: 'img/customizations/role-permissions.png'
    });
  });
}); 