// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Auto-hide Cypress UI elements when recording videos
before(() => {
  if (Cypress.config('video')) {
    cy.hideCommandLog();
  }
});

// This helps with screenshots being fuzzy
Cypress.Screenshot.defaults({
  capture: 'viewport',
  scale: true,
  disableTimersAndAnimations: true,
});

// Add screenshot tasks
import { existsSync, mkdirSync, renameSync, writeFileSync } from 'fs';
import { dirname } from 'path';

// Ensures a directory exists, creating it if necessary
function ensureDirectoryExists(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}