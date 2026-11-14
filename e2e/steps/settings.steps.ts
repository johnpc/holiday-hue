import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

When('they open Settings', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.getByTestId('appearance-segment')).toBeVisible({ timeout: 30_000 });
});

When('they pick the {string} appearance', async ({ page }, mode: string) => {
  await page.getByTestId(`appearance-${mode}`).click();
});

Then('the app is in {string} mode', async ({ page }, mode: string) => {
  await expect(page.locator('html')).toHaveAttribute('data-theme', mode);
});

Then('the runner card reports {string}', async ({ page }, text: string) => {
  await expect(page.getByTestId('runner-card')).toContainText(text);
});

When('they sign out', async ({ page }) => {
  await page.getByTestId('sign-out').click();
});

Then('they are on the sign-in screen', async ({ page }) => {
  await expect(page.getByTestId('signin-submit')).toBeVisible({ timeout: 30_000 });
});
