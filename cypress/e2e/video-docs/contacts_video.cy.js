describe('Contacts Video Documentation', () => {
  beforeEach(() => {
    // Set a large viewport for better video quality
    cy.viewport(1280, 1024, { log: false });
    
    // Hide Cypress & browser UI elements 
    cy.hideCommandLog();
    
    // Additional UI cleanup
    cy.window({ log: false }).then(win => {
      // Hide all Cypress and Electron UI elements
      const style = win.document.createElement('style');
      style.innerHTML = `
        /* Hide all UI elements outside the app */
        body { margin: 0 !important; padding: 0 !important; }
        #__cypress, .__cypress-top-bar, .__cypress-header { display: none !important; }
        
        /* Remove any margins/padding from top elements */
        html, body { 
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        #spec-runner-header { display: none !important; }
        
        /* Force the app to take up the full viewport */
        .viewport-content { 
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
        }
      `;
      win.document.head.appendChild(style);
    });
    
    // Disable uncaught exception handling
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });
  });
  
  it('Creates a video guide for contacts with narration', () => {
    const seed = Math.floor(Math.random() * 100);
    const contactName = `Video Demo Contact [${seed}]`;
    
    // Authentication - get admin credentials from config
    const dt_config = cy.config('dt');
    const username = dt_config.credentials.admin.username;
    const password = dt_config.credentials.admin.password;
    
    // Step 1: Login and Introduction
    cy.dtLogin(username, password);
    cy.wait(2000);
    
    // Hide the WordPress admin bar
    cy.document().then(doc => {
      const adminBar = doc.getElementById('wpadminbar');
      if (adminBar) {
        adminBar.style.display = 'none';
      }
    });
    
    cy.task('generateNarration', {
      script: 'Welcome to Disciple.Tools. In this video, we will show you how to create and manage contacts.',
      outputPath: 'video-docs/audio/contacts-intro.mp3'
    });
    
    // Step 2: Navigate to Contacts List
    cy.visit('/contacts');
    cy.wait(2000);
    cy.task('generateNarration', {
      script: 'This is the contacts list page. Here you can see all your ministry connections organized by their current status.',
      outputPath: 'video-docs/audio/contacts-list-view.mp3'
    });
    cy.wait(3000); // Pause for narration
    
    // Step 3: Search functionality
    cy.task('generateNarration', {
      script: 'You can easily search for specific contacts using the search bar at the top. You can also filter contacts using various criteria.',
      outputPath: 'video-docs/audio/contacts-search.mp3'
    });
    cy.get('.search-input--desktop').type('example', { force: true }).clear({ force: true });
    cy.wait(3000); // Pause for narration
    
    // Step 4: Creating a new contact
    cy.task('generateNarration', {
      script: 'To create a new contact, click on the Add New button in the top right corner.',
      outputPath: 'video-docs/audio/contacts-add-new.mp3'
    });
    cy.wait(2000);
    cy.get('a.create-post-desktop').click({ force: true });
    cy.wait(2000);
    
    // Step 5: Filling out the contact form
    cy.task('generateNarration', {
      script: 'Fill in the contact information form. At minimum, you need to provide a name for your contact.',
      outputPath: 'video-docs/audio/contacts-fill-form.mp3'
    });
    
    // Fill out the name field
    cy.get('#name')
      .shadow()
      .within(() => {
        cy.get('input')
          .invoke('removeAttr', 'disabled')
          .invoke('val', contactName)
          .trigger('input')
          .trigger('change');
      });
    cy.wait(3000);
    
    // Step 6: Submitting the form
    cy.task('generateNarration', {
      script: 'When you\'ve filled in the necessary information, click the Create Contact button to save your new contact.',
      outputPath: 'video-docs/audio/contacts-submit-form.mp3'
    });
    cy.wait(2000);
    cy.get('button.js-create-post-button').click({ force: true });
    cy.wait(3000);
    
    // Step 7: Contact details page
    cy.task('generateNarration', {
      script: 'After creating a contact, you\'ll be taken to their details page. This page displays all information about the contact organized in tiles.',
      outputPath: 'video-docs/audio/contacts-detail-view.mp3'
    });
    cy.wait(3000);
    
    // Step 8: Contact tiles exploration
    cy.task('generateNarration', {
      script: 'Contact information is organized into tiles. The Contact Details tile shows basic information and status.',
      outputPath: 'video-docs/audio/contacts-tiles.mp3'
    });
    cy.wait(3000);
    
    // Scroll down to show more tiles
    cy.window().scrollTo(0, 300);
    cy.wait(2000);
    cy.task('generateNarration', {
      script: 'The Contact Information tile shows communication channels and location.',
      outputPath: 'video-docs/audio/contacts-communication.mp3'
    });
    cy.wait(3000);
    
    // Scroll down further
    cy.window().scrollTo(0, 600);
    cy.wait(2000);
    cy.task('generateNarration', {
      script: 'The Connections tile shows relationships to other records like groups or other contacts.',
      outputPath: 'video-docs/audio/contacts-connections.mp3'
    });
    cy.wait(3000);
    
    // Step 9: Updating contact information
    cy.window().scrollTo('top');
    cy.wait(1000);
    cy.task('generateNarration', {
      script: 'To update any contact information, simply click on the field you want to change, make your edits, and the system will automatically save your changes.',
      outputPath: 'video-docs/audio/contacts-update.mp3'
    });
    cy.wait(3000);
    
    // Step 10: Return to contacts list
    cy.task('generateNarration', {
      script: 'You can return to the contacts list by clicking on Contacts in the top navigation bar.',
      outputPath: 'video-docs/audio/contacts-return.mp3'
    });
    cy.visit('/contacts');
    cy.wait(3000);
    
    // Step 11: Conclusion
    cy.task('generateNarration', {
      script: 'This concludes our video guide on creating and managing contacts in Disciple.Tools. Remember that properly documenting contact information helps your team collaborate effectively.',
      outputPath: 'video-docs/audio/contacts-conclusion.mp3'
    });
    cy.wait(5000);
    
    // Combine all audio segments and video
    cy.task('combineVideoAndAudio', {
      videoPath: 'cypress/videos/contacts_video.cy.js.mp4',
      audioPath: 'video-docs/audio/',  // Directory containing all audio segments
      outputPath: 'video-docs/output/contacts-video.mp4'
    });
  });
}); 