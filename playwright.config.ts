import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:5173/MTXfinancialCybersecurity/',
    browserName: 'chromium',
    launchOptions: { executablePath: '/usr/local/bin/google-chrome' },
  },
  reporter: 'list',
})
