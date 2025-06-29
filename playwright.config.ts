import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'https://restcountries.com',
  },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
});
