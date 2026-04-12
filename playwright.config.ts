import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load the .env file so Playwright has access to Firebase config
dotenv.config();

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:9003',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Run the local dev server and Firebase emulator before starting the tests
  webServer: {
    command: 'NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-app npm run dev -- --port 9003',
    url: 'http://localhost:9003',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
