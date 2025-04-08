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
          console.log(`Narration script: "${script}" would be saved to ${outputPath}`);
          // In a real implementation, this would use a TTS service
          // For now we just log the script
          return true;
        },
        
        // Mock function for video/audio combination (will be implemented separately)
        combineVideoAndAudio({ videoPath, audioPath, outputPath }) {
          console.log(`Would combine video from ${videoPath} with audio from ${audioPath} to create ${outputPath}`);
          // In a real implementation, this would use ffmpeg or similar
          return true;
        }
      });
    },
    baseUrl: 'https://multisite.lwp/blank',
    video: true,  // Enable Cypress video recording
    videoCompression: 32  // Set video compression level
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
