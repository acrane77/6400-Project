import { defineConfig } from '@playwright/test'

export default defineConfig({
    testDir: './tests/e2e',
    timeout: 90000,
    workers: 1,

    use: {
        baseURL: 'http://127.0.0.1:3000',
        browserName: 'chromium',
    },

    webServer: {
        command: 'yarn start --hostname 127.0.0.1',
        url: 'http://127.0.0.1:3000',
        timeout: 120000,
        reuseExistingServer: false,
    },

    reporter: 'list',
})
