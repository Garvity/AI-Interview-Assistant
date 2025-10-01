import { test, expect } from '@playwright/test'

test('landing renders and routes are reachable', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('AI Interview Assistant')).toBeVisible()

  // Interviewee buttons are visible and navigate
  await expect(page.getByRole('button', { name: 'Login' }).first()).toBeVisible()
  await page.getByRole('button', { name: 'Login' }).first().click()
  await expect(page.getByText('Interviewee Login')).toBeVisible()

  // Back to landing and test Interviewee Register
  await page.goto('/')
  await page.getByRole('button', { name: 'Register' }).first().click()
  await expect(page.getByText('Interviewee Register')).toBeVisible()

  // Interviewer login button navigates
  await page.goto('/')
  // Select the Interviewer card's Login (second occurrence)
  const buttons = page.getByRole('button', { name: 'Login' })
  await buttons.nth(1).click()
  await expect(page.getByText('Interviewer Login')).toBeVisible()

  // Direct dashboard route should redirect to login when unauthenticated
  await page.goto('/interviewer')
  await expect(page.getByText('Interviewer Login')).toBeVisible()
})
