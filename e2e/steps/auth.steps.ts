import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given } = createBdd();

/** Sign in as the seeded household editor and wait for the Lights screen to
 * render REAL data (the theme grid) — so later steps never race the session. */
Given('a household member is signed in', async ({ page }) => {
  const username = process.env.TEST_USERNAME;
  const password = process.env.TEST_PASSWORD;
  if (!username || !password) throw new Error('TEST_USERNAME / TEST_PASSWORD required for e2e');
  await page.goto('/signin');
  await page.getByTestId('signin-email').fill(username);
  await page.getByTestId('signin-password').fill(password);
  await page.getByTestId('signin-submit').click();
  await expect(page.getByTestId('theme-grid')).toBeVisible({ timeout: 30_000 });
});
