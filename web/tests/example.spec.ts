import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});

test('register and login flow', async ({ page }) => {
  await page.goto('https://local.bubbli.org/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByPlaceholder('Jay Smith').fill('test');
  await page.getByPlaceholder('Jay Smith').press('Tab');
  await page.getByPlaceholder('jsmith').fill('test');
  await page.getByPlaceholder('jsmith').press('Tab');
  await page.getByPlaceholder('jaysmith@example.com').fill('test11@example.com');
  await page.getByRole('button', { name: 'Next →' }).click();
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('testtest');
  await page.getByRole('button', { name: 'Complete' }).click();
  await page.getByText('??').click();
  await page.getByPlaceholder('Lorem ipsum dolor sit amet').click();
  await page.getByPlaceholder('Lorem ipsum dolor sit amet').fill('testtest');
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByText('??').click();
  await page.getByRole('button', { name: 'Log Out' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('test11@example.com');
  await page.getByRole('button', { name: 'Next →' }).click();
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('testtest');
  await page.getByRole('button', { name: 'Complete' }).click();
  await page.getByText('Content: testtest').click();
});

