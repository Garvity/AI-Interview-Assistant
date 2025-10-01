import { test, expect } from '@playwright/test'

test('landing renders on mobile and desktop', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('AI Interview Assistant')).toBeVisible()
  // Buttons for Interviewee and Interviewer should be visible
  await expect(page.getByRole('button', { name: 'Login' }).first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Register' }).first()).toBeVisible()
})
