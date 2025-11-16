import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    headless: true,
  },

  webServer: {
    command: 'npx serve frontend -l 3000',
    port: 3000,
    timeout: 20000,
    reuseExistingServer: !process.env.CI,
  },
});
