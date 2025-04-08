const { defineConfig } = require("cypress");
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        moveScreenshot({ from, to }) {
          try {
            // Make sure the destination directory exists
            const dir = path.dirname(to);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
            
            // Move the file instead of copying it
            if (fs.existsSync(from)) {
              fs.renameSync(from, to);
              console.log(`Screenshot moved from ${from} to ${to}`);
              return true;
            } else {
              console.error(`Source file does not exist: ${from}`);
              return false;
            }
          } catch (error) {
            console.error('Error moving screenshot:', error);
            return false;
          }
        },
      });
    },
    baseUrl: 'https://multisite.lwp/blank',
  },
  // Global settings for better test reliability
  defaultCommandTimeout: 15000,
  requestTimeout: 30000,
  viewportWidth: 1280,
  viewportHeight: 800,
  // Authentication configuration
  dt: {
    credentials: {
      admin: {
        username: 'admin',
        password: 'pass'
      }
    }
  }
});
