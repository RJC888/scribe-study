import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    headless: true,
  },

  webServer: {
    command: 'npx serve -l 3000 frontend',
    port: 3000,
    timeout: 30000,
    reuseExistingServer: !process.env.CI
  }
});
