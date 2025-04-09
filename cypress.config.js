const { defineConfig } = require("cypress");
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

        // Video handling tasks
        moveVideo({ from, to }) {
          try {
            // Make sure the destination directory exists
            const dir = path.dirname(to);
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
            }
            
            // Move the video file
            if (fs.existsSync(from)) {
              fs.renameSync(from, to);
              console.log(`Video moved from ${from} to ${to}`);
              return true;
            } else {
              console.error(`Source video does not exist: ${from}`);
              return false;
            }
          } catch (error) {
            console.error('Error moving video:', error);
            return false;
          }
        },
        
        // Mock function for text-to-speech (will be implemented separately)
        generateNarration({ script, outputPath }) {
          console.log(`Would save narration script to: ${outputPath}`);
          console.log(`Script content: ${script}`);
          // Note: This task is mocked for testing. The actual audio generation
          // happens later in the Node.js script, not during Cypress execution.
          return null;
        },
        
        // Mock function for video/audio combination (will be implemented separately)
        combineVideoAndAudio({ videoPath, audioPath, outputPath }) {
          console.log(`Would combine video (${videoPath}) with audio from ${audioPath} and save to ${outputPath}`);
          return null;
        }
      });

      // Add DT-specific configuration
      if (!config.env.dt) {
        config.env.dt = {};
      }
      config.env.dt.credentials = {
        admin: {
          username: process.env.DT_ADMIN_USERNAME || 'admin',
          password: process.env.DT_ADMIN_PASSWORD || 'admin'
        }
      };

      return config;
    },
    baseUrl: 'https://multisite.lwp/blank',
    video: true,  // Enable Cypress video recording
    videoCompression: 32,  // Set video compression level
    // Make sure videos don't include the Cypress UI
    videosFolder: 'cypress/videos',
    // Hide Cypress UI in videos
    experimentalStudio: false,
    experimentalMemoryManagement: true,
    trashAssetsBeforeRuns: false, // Don't delete videos between runs
    hideXHRInCommandLog: true,
    chromeWebSecurity: false,
    screenshotOnRunFailure: true,
    experimentalRunAllSpecs: false,
    numTestsKeptInMemory: 0, // Reduce memory usage
  },
  // Global settings for better test reliability
  defaultCommandTimeout: 15000,
  requestTimeout: 30000,
  viewportWidth: 1280,
  viewportHeight: 1024,
  // Authentication configuration
  dt: {
    credentials: {
      admin: {
        username: 'admin',
        password: 'pass'
      }
    }
  },
  // Hide Electron browser chrome (URL bar, etc.)
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
  // Completely hide electron
  watchForFileChanges: false,
  modifyObstructiveCode: false,
  // Set headless mode
  headless: true,
  autoHideMenuBar: true,
  // Use custom Electron flags to remove browser UI
  env: {
    electron: {
      width: 1280,
      height: 1024,
      autoHideMenuBar: true,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
      },
      // Hide browser chrome/frame
      frame: false,
      titleBarStyle: 'hidden',
    }
  }
});
