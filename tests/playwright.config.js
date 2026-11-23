import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'specs',
  outputDir: 'test-results',
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5076', trace: 'retain-on-failure' },
  webServer: {
    command: 'python -m http.server 5076 --bind 127.0.0.1 --directory ..',
    url: 'http://127.0.0.1:5076',
    reuseExistingServer: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
