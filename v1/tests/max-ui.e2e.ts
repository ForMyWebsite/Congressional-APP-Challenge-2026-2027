import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { emptyWorkspace } from '../src/domain/models';
import { addDays, todayKey } from '../src/domain/dates';
async function guest(page: Page) {
  await page.addInitScript(() => sessionStorage.setItem('acadia-guest', 'true'));
  await page.goto('/');
  await page.getByRole('heading', { name: 'Your next chapter starts here.' }).waitFor();
}
async function go(page: Page, name: string) {
  await page.getByRole('navigation').getByRole('button', { name, exact: true }).click();
}
test('welcome offers real provider sign-in and an honest guest path', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /A big future starts/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeDisabled();
  await page.screenshot({ path: 'test-results/max-welcome.png', fullPage: true });
  await page.getByRole('button', { name: 'Explore as a guest' }).click();
  await expect(page.getByRole('heading', { name: 'Your next chapter starts here.' })).toBeVisible();
});
test('school courses, recurring classes and four calendar views persist', async ({ page }) => {
  await guest(page);
  await go(page, 'School & Classes');
  await page.getByLabel('School name', { exact: true }).fill('My test school');
  await page.getByLabel('Course name', { exact: true }).fill('Physics');
  await page.getByLabel('Period', { exact: true }).fill('3');
  await page.getByLabel('Current grade (optional)', { exact: true }).fill('B+');
  await page.getByRole('button', { name: 'Add course', exact: true }).click();
  await page.getByRole('button', { name: 'Weekly classes & clubs', exact: true }).click();
  await page.getByLabel('Class or club name').fill('Physics · period 3');
  await page.getByLabel('Mon', { exact: true }).check();
  await page.getByRole('button', { name: 'Add weekly commitment' }).click();
  await go(page, 'Calendar');
  for (const view of ['Week', 'Year', 'Day', 'Month'])
    await page.getByRole('button', { name: view, exact: true }).click();
  await page.reload();
  await go(page, 'School & Classes');
  await expect(page.getByLabel('Grade for Physics')).toHaveValue('B+');
});
test('task coins cannot be farmed and feeding Max persists', async ({ page }) => {
  await guest(page);
  await go(page, 'Calendar');
  await page.getByRole('button', { name: 'Add task', exact: true }).click();
  await page.getByLabel('Task title').fill('Practice algebra');
  await page.getByRole('button', { name: 'Add to my calendar' }).click();
  await page.getByLabel('Complete Practice algebra').check();
  await page.getByLabel('Complete Practice algebra').uncheck();
  await page.getByLabel('Complete Practice algebra').check();
  await go(page, 'Max & Rewards');
  await expect(page.locator('.coin-pill')).toContainText('10 coins');
  await page.getByRole('button', { name: 'Feed Max · 5 coins' }).click();
  await expect(page.locator('.coin-pill')).toContainText('5 coins');
  await page.screenshot({ path: 'test-results/max-pet.png', fullPage: true });
  await page.reload();
  await go(page, 'Max & Rewards');
  await expect(page.locator('.coin-pill')).toContainText('5 coins');
});
test('Max chat and approval UI use a clearly mocked service in this test only', async ({
  page,
}) => {
  await page.route('**/api/max', async (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({
        json: { configured: true, guestAllowed: true, provider: 'OpenRouter' },
      });
    const body = route.request().postDataJSON();
    expect(body.consent).toBe(true);
    expect(body.context.courses).toEqual([]);
    await route.fulfill({
      json: {
        answer: 'A short practice session can help you prepare.',
        proposals: [
          {
            title: 'SAT practice block',
            date: addDays(todayKey(), 1),
            time: '17:00',
            minutes: 25,
            category: 'Personal',
          },
        ],
      },
    });
  });
  await guest(page);
  await go(page, 'Ask Max');
  await page.getByLabel('I agree to this AI data sharing.', { exact: false }).check();
  await page.getByLabel('Message Max', { exact: true }).fill('Help me plan SAT practice');
  await page.getByRole('button', { name: 'Send message to Max' }).click();
  await expect(page.getByText('A short practice session can help you prepare.')).toBeVisible();
  await page.getByRole('button', { name: 'Approve & add' }).click();
  await go(page, 'Calendar');
  await page.getByLabel('Choose a date').fill(addDays(todayKey(), 1));
  await expect(page.locator('.scheduled-tasks')).toContainText('SAT practice block');
  await go(page, 'Ask Max');
  await expect(page.getByText('A short practice session can help you prepare.')).toBeVisible();
});
test('new screens meet automated accessibility checks and unconfigured endpoints do not fake success', async ({
  page,
  request,
}) => {
  await page.goto('/');
  let result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(
    result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
  await page.getByRole('button', { name: 'Explore as a guest' }).click();
  for (const name of ['School & Classes', 'Ask Max', 'Max & Rewards', 'Reminders']) {
    await go(page, name);
    result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(
      result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
      name,
    ).toEqual([]);
  }
  expect((await request.get('/api/workspace')).status()).toBe(401);
  expect((await request.post('/api/max', { data: { question: 'hello' } })).status()).toBe(403);
});
test('screenshot extraction is an editable review, not an automatic import (mocked service)', async ({
  page,
}) => {
  await page.route('**/api/extract', (route) =>
    route.fulfill({
      json: {
        courses: [{ name: 'Chemistry', period: '2', grade: 'A-' }],
        assignments: [],
        notes: 'Review all fields.',
      },
    }),
  );
  await guest(page);
  await go(page, 'School & Classes');
  await page.getByRole('button', { name: 'Screenshot import', exact: true }).click();
  await page.getByLabel('Choose school screenshot').setInputFiles({
    name: 'test.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO/aVVEAAAAASUVORK5CYII=',
      'base64',
    ),
  });
  await page.getByLabel('I agree to send this image', { exact: false }).check();
  await page.getByRole('button', { name: 'Read screenshot with Max' }).click();
  await expect(page.getByRole('heading', { name: 'Review before importing' })).toBeVisible();
  await page.getByRole('button', { name: 'Approve reviewed import' }).click();
  await page.getByRole('button', { name: 'Classes & grades', exact: true }).click();
  await expect(page.getByLabel('Grade for Chemistry')).toHaveValue('A-');
});
test('v2 browser data upgrades without losing the guest profile', async ({ page }) => {
  const state = emptyWorkspace();
  state.profile.nickname = 'Taylor';
  await page.addInitScript((value) => {
    sessionStorage.setItem('acadia-guest', 'true');
    localStorage.setItem('acadia-workspace-v2', JSON.stringify({ ...value, version: 2 }));
  }, state);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'A little progress, Taylor.' })).toBeVisible();
});
