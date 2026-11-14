import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();

When('they open the Lights screen', async ({ page }) => {
  await page.goto('/lights');
  await expect(page.getByTestId('theme-grid')).toBeVisible({ timeout: 30_000 });
});

Then(
  'the {string} room is listed with {int} lights',
  async ({ page }, room: string, count: number) => {
    const chip = page
      .getByTestId('target-picker')
      .getByRole('radio', { name: new RegExp(`^${room}`) });
    await expect(chip).toContainText(`${count}`);
  },
);

Then('the runner shows as {string}', async ({ page }, text: string) => {
  await expect(page.getByTestId('runner-status')).toContainText(text);
});

When('they choose the {string} theme', async ({ page }, themeId: string) => {
  await page.getByTestId(`theme-${themeId}`).click();
  await expect(page.getByTestId(`theme-${themeId}`)).toHaveAttribute('aria-checked', 'true');
});

When('they choose the {string} pattern', async ({ page }, patternId: string) => {
  await page.getByTestId(`pattern-${patternId}`).click();
});

When('they reload the app', async ({ page }) => {
  // Give the optimistic write a moment to land before re-reading from the backend.
  await page.waitForTimeout(1500);
  await page.reload();
  await expect(page.getByTestId('theme-grid')).toBeVisible({ timeout: 30_000 });
});

Then('the {string} theme is selected', async ({ page }, themeId: string) => {
  await expect(page.getByTestId(`theme-${themeId}`)).toHaveAttribute('aria-checked', 'true');
});

Then('the {string} pattern is selected', async ({ page }, patternId: string) => {
  await expect(page.getByTestId(`pattern-${patternId}`)).toHaveAttribute('aria-checked', 'true');
});

Then('the preview shows {int} lit bulbs', async ({ page }, count: number) => {
  await expect(page.locator('[data-testid="preview-bulb"][data-lit="true"]')).toHaveCount(count);
});

When('they turn the lights off', async ({ page }) => {
  await page.getByTestId('power-toggle').click();
  await expect(page.getByTestId('power-row')).toContainText('Lights are off');
});

When('they turn the lights on', async ({ page }) => {
  await page.getByTestId('power-toggle').click();
  await expect(page.getByTestId('power-row')).toContainText('Lights are on');
});
