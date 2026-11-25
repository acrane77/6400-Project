import { test, expect } from '@playwright/test'
import jsQR from 'jsqr'

test('Signup rejects incorrect passwords', async ({ page }) => {
    await page.goto('/account/signup')

    await page.locator('#email').fill('test@example.com')
    await page.locator('#username').fill('Test User')
    await page.locator('#password').fill('Test123456')
    await page.locator('#confirm-password').fill('Different123')

    await page.getByRole('button', {
        name: 'Sign Up',
        exact: true,
    }).click()
    await expect(
        page.getByText('Passwords do not Match')
    ).toBeVisible()
})

test('User can create an event and generate a QR code',
    async ({ page }) => {

    // Register an account
    await page.goto('/account/signup')

    await page.locator('#email').fill(
        `test-${Date.now()}@example.com`
    )
    await page.locator('#username').fill('Test User')
    await page.locator('#password').fill('Test123456')
    await page.locator('#confirm-password').fill('Test123456')

    await page.getByRole('button', {
        name: 'Sign Up',
        exact: true,
    }).click()
    
    // Confirms that the redirect happened
    await expect(page).toHaveURL(/\/events$/, {
        timeout: 15000,
    })
    await expect(
        page.getByRole('link', {
            name: 'My Events',
            exact: true,
        })
    ).toBeVisible()

    // Open event creation
    await page.getByRole('link', {
        name: 'My Events',
        exact: true,
    }).click()

    await page.getByRole('button', {
        name: 'Create an event',
        exact: true,
    }).click()

    // Select a category
    await page.locator('#category-picker').click()

    await page.getByRole('button', {
        name: 'Parties and Games',
        exact: true,
    }).click()

    await page.getByRole('button', {
        name: 'Board games',
        exact: true,
    }).click()

    // Complete the event form
    const title = `Test Event ${Date.now()}`

    const date = new Date(
        Date.now() + 7 * 86400000
    ).toISOString().slice(0, 10)

    await page.locator('#title').fill(title)
    await page.locator('#description').fill('Automated test event')
    await page.locator('#eventDate').fill(date)
    await page.locator('#eventTime').fill('13:00')
    await page.locator('#roomCode').fill('EN-2006')

    await page.getByRole('button', {
        name: 'Create Event',
        exact: true,
    }).click()

    await expect(
        page.getByRole('heading', { name: title, exact: true })
    ).toBeVisible()

    // Manage event and generate an invitation
    await page.getByRole('link', {
        name: 'Manage Event',
    }).click()

    await page.getByRole('button', {
        name: 'Generate Invitation Link',
    }).click()

    const link = page.locator('input[readonly]')

    await expect(link).toHaveValue(/\/events\/invite\//)

    const inviteUrl = await link.inputValue()

    // Decode the actual QR code rendered on the page
    const canvas = page.locator('canvas')

    await expect(canvas).toBeVisible()

    await expect.poll(async () => {
        return canvas.evaluate((element: HTMLCanvasElement) => {
            return element.width > 0 && element.height > 0
        })
    }).toBe(true)

    const image = await canvas.evaluate(
        (element: HTMLCanvasElement) => {
            const ctx = element.getContext('2d')!

            const imageData = ctx.getImageData(
                0, 0, element.width, element.height
            )

            return {
                pixels: Array.from(imageData.data),
                width: element.width,
                height: element.height,
            }
        }
    )

    const decoded = jsQR(
        new Uint8ClampedArray(image.pixels),
        image.width,
        image.height
    )

    expect(decoded?.data === inviteUrl).toBe(true)
})

test('Calendar can switch between month and week',
    async ({ page }) => {

    await page.goto('/events')

    await page.getByRole('button', {
        name: /^week$/i,
    }).click()

    await expect(
        page.getByRole('button', { name: /^week$/i })
    ).toHaveAttribute('aria-pressed', 'true')

    await page.getByRole('button', {
        name: /^month$/i,
    }).click()

    await expect(
        page.getByRole('button', { name: /^month$/i })
    ).toHaveAttribute('aria-pressed', 'true')
})
